"""Async Open-Meteo AQI and Geocoding service with resilient fallback dictionary.

Fetches real-time particulate matter (PM2.5, PM10) and weather data,
interpolates US EPA AQI, and provides deterministic fallbacks when offline.
"""

import logging

import httpx

from app.core.cache import aqi_cache, compute_cache_key
from app.core.config import get_settings
from app.core.constants import FALLBACK_CITIES
from app.models.schemas import AQIData
from app.services.aqi_calc import calculate_us_aqi, get_aqi_category

logger = logging.getLogger(__name__)
settings = get_settings()

_shared_client: httpx.AsyncClient | None = None


def get_shared_client() -> httpx.AsyncClient:
    """Return a shared singleton httpx.AsyncClient with explicit timeouts.

    Returns:
        Shared or newly instantiated httpx.AsyncClient instance.
    """
    global _shared_client
    if _shared_client is None or _shared_client.is_closed:
        _shared_client = httpx.AsyncClient(timeout=httpx.Timeout(8.0, connect=3.0))
    return _shared_client


async def close_shared_client() -> None:
    """Close the shared httpx.AsyncClient during application shutdown."""
    global _shared_client
    if _shared_client is not None and not _shared_client.is_closed:
        await _shared_client.aclose()
        _shared_client = None


def get_fallback_aqi(city: str) -> AQIData:
    """Generate deterministic, reliable fallback data when remote APIs are unavailable.

    Args:
        city: Requested city or locality name.

    Returns:
        AQIData populated from curated regional meteorological baselines.
    """
    clean_city = city.lower().strip()
    match = FALLBACK_CITIES.get(clean_city, FALLBACK_CITIES["delhi"])

    pm25 = match["pm25"]
    us_aqi = calculate_us_aqi(pm25)

    return AQIData(
        city=city.title(),
        latitude=match["lat"],
        longitude=match["lon"],
        pm2_5=pm25,
        pm10=match["pm10"],
        us_aqi=us_aqi,
        category=get_aqi_category(us_aqi),
        dominant_pollutant="PM2.5",
        temperature=match.get("temp"),
        relative_humidity=match.get("humidity"),
        wind_speed=match.get("wind"),
        is_fallback=True,
    )


async def geocode_city(city: str, client: httpx.AsyncClient) -> tuple[float, float, str] | None:
    """Geocode city name to latitude and longitude using Open-Meteo Geocoding API.

    Args:
        city: City or locality search string.
        client: Active async HTTP client.

    Returns:
        Tuple of (latitude, longitude, display_name) or None if not found/error.
    """
    try:
        url = settings.OPEN_METEO_GEOCODING_URL
        params = {"name": city, "count": 1, "language": "en", "format": "json"}
        resp = await client.get(url, params=params, timeout=5.0)
        if resp.status_code == 200:
            results = resp.json().get("results")
            if results and len(results) > 0:
                top = results[0]
                name = top.get("name", city)
                country = top.get("country", "")
                return float(top["latitude"]), float(top["longitude"]), f"{name}, {country}".strip(", ")
    except (httpx.HTTPError, KeyError, ValueError) as exc:
        logger.warning(f"Geocoding exception for {city}: {exc}")
    return None


async def _fetch_telemetry(lat: float, lon: float, client: httpx.AsyncClient) -> dict:
    """Fetch concurrent air quality and meteorological metrics from Open-Meteo.

    Args:
        lat: Latitude coordinate.
        lon: Longitude coordinate.
        client: Active async HTTP client.

    Returns:
        Dictionary containing extracted telemetry parameters.
    """
    aq_params = {"latitude": lat, "longitude": lon, "current": "pm10,pm2_5,us_aqi"}
    w_params = {"latitude": lat, "longitude": lon, "current": "temperature_2m,relative_humidity_2m,wind_speed_10m"}

    aq_resp = await client.get(settings.OPEN_METEO_AQI_URL, params=aq_params)
    w_resp = await client.get(settings.OPEN_METEO_WEATHER_URL, params=w_params)

    data = {}
    if aq_resp.status_code == 200:
        data["aq"] = aq_resp.json().get("current", {})
    if w_resp.status_code == 200:
        data["weather"] = w_resp.json().get("current", {})
    return data


async def get_city_aqi(city: str, client: httpx.AsyncClient | None = None) -> AQIData:
    """Fetch real-time air quality data for a city with 15-minute caching.

    Args:
        city: City name to look up.
        client: Optional explicit HTTP client (uses shared client if None).

    Returns:
        Structured AQIData with live or fallback measurements.
    """
    clean_city = city.strip()
    cache_key = compute_cache_key("city_aqi", clean_city.lower())
    cached: AQIData | None = aqi_cache.get(cache_key)
    if cached is not None:
        return cached

    http_client = client or get_shared_client()
    geo = await geocode_city(clean_city, http_client)
    lat, lon, display_name = geo if geo else (28.6139, 77.2090, clean_city.title())

    try:
        telemetry = await _fetch_telemetry(lat, lon, http_client)
        if "aq" in telemetry:
            aq = telemetry["aq"]
            pm25 = float(aq.get("pm2_5") or 75.0)
            pm10 = float(aq.get("pm10") or 120.0)
            us_aqi = int(aq.get("us_aqi") or calculate_us_aqi(pm25))
            w = telemetry.get("weather", {})

            result = AQIData(
                city=display_name,
                latitude=lat,
                longitude=lon,
                pm2_5=round(pm25, 1),
                pm10=round(pm10, 1),
                us_aqi=us_aqi,
                category=get_aqi_category(us_aqi),
                temperature=round(w["temperature_2m"], 1) if "temperature_2m" in w else None,
                relative_humidity=round(w["relative_humidity_2m"], 1) if "relative_humidity_2m" in w else None,
                wind_speed=round(w["wind_speed_10m"], 1) if "wind_speed_10m" in w else None,
                is_fallback=False,
            )
            aqi_cache.set(cache_key, result)
            return result
    except (httpx.HTTPError, KeyError, ValueError, TypeError) as exc:
        logger.warning(f"Live Open-Meteo fetch failed for {clean_city}: {exc}")

    fallback_result = get_fallback_aqi(clean_city)
    aqi_cache.set(cache_key, fallback_result)
    return fallback_result
