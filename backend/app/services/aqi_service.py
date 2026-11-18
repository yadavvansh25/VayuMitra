"""Async Open-Meteo AQI and Geocoding service with resilient fallback dictionary."""

import logging

import httpx
from app.core.cache import aqi_cache, compute_cache_key
from app.core.config import get_settings
from app.models.schemas import AQIData

logger = logging.getLogger(__name__)
settings = get_settings()

# US EPA PM2.5 Breakpoints (ug/m3 -> AQI)
PM25_BREAKPOINTS = [
    (0.0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 350.4, 301, 400),
    (350.5, 500.4, 401, 500),
]


def calculate_us_aqi(pm25: float) -> int:
    """Calculate US EPA AQI from PM2.5 concentration using piecewise linear interpolation."""
    if pm25 <= 0:
        return 0
    if pm25 >= 500.4:
        return 500
    for c_low, c_high, i_low, i_high in PM25_BREAKPOINTS:
        if c_low <= pm25 <= c_high:
            return round(((i_high - i_low) / (c_high - c_low)) * (pm25 - c_low) + i_low)
    return 500


def get_aqi_category(us_aqi: int) -> str:
    """Return health category corresponding to US EPA AQI."""
    if us_aqi <= 50:
        return "Good"
    elif us_aqi <= 100:
        return "Moderate"
    elif us_aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif us_aqi <= 200:
        return "Unhealthy"
    elif us_aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Severe / Hazardous"


# Reliable fallback dictionary for major cities if Open-Meteo times out or fails
FALLBACK_CITIES = {
    "delhi": {"lat": 28.6139, "lon": 77.2090, "pm25": 285.0, "pm10": 420.0, "temp": 16.5, "humidity": 78.0, "wind": 4.2},
    "new delhi": {"lat": 28.6139, "lon": 77.2090, "pm25": 285.0, "pm10": 420.0, "temp": 16.5, "humidity": 78.0, "wind": 4.2},
    "gurugram": {"lat": 28.4595, "lon": 77.0266, "pm25": 265.0, "pm10": 390.0, "temp": 17.0, "humidity": 74.0, "wind": 5.0},
    "noida": {"lat": 28.5355, "lon": 77.3910, "pm25": 295.0, "pm10": 440.0, "temp": 16.0, "humidity": 80.0, "wind": 3.8},
    "mumbai": {"lat": 19.0760, "lon": 72.8777, "pm25": 115.0, "pm10": 180.0, "temp": 26.0, "humidity": 65.0, "wind": 11.5},
    "bengaluru": {"lat": 12.9716, "lon": 77.5946, "pm25": 42.0, "pm10": 78.0, "temp": 22.0, "humidity": 58.0, "wind": 9.0},
    "kolkata": {"lat": 22.5726, "lon": 88.3639, "pm25": 190.0, "pm10": 260.0, "temp": 21.0, "humidity": 72.0, "wind": 5.5},
    "lahore": {"lat": 31.5204, "lon": 74.3587, "pm25": 340.0, "pm10": 480.0, "temp": 15.0, "humidity": 82.0, "wind": 3.2},
    "new york": {"lat": 40.7128, "lon": -74.0060, "pm25": 22.0, "pm10": 38.0, "temp": 9.0, "humidity": 60.0, "wind": 15.0},
    "london": {"lat": 51.5074, "lon": -0.1278, "pm25": 18.0, "pm10": 32.0, "temp": 8.0, "humidity": 82.0, "wind": 14.0},
}


def get_fallback_aqi(city: str) -> AQIData:
    """Generate deterministic, reliable fallback data."""
    clean_city = city.lower().strip()
    match = FALLBACK_CITIES.get(clean_city)
    if match:
        lat = match["lat"]
        lon = match["lon"]
        pm25 = match["pm25"]
        pm10 = match["pm10"]
        temp = match["temp"]
        hum = match["humidity"]
        wind = match["wind"]
    else:
        lat = 28.6139
        lon = 77.2090
        pm25 = 175.0
        pm10 = 260.0
        temp = 18.0
        hum = 70.0
        wind = 5.0

    us_aqi = calculate_us_aqi(pm25)
    category = get_aqi_category(us_aqi)

    return AQIData(
        city=city.title(),
        latitude=lat,
        longitude=lon,
        pm2_5=pm25,
        pm10=pm10,
        us_aqi=us_aqi,
        category=category,
        dominant_pollutant="PM2.5",
        temperature=temp,
        relative_humidity=hum,
        wind_speed=wind,
        is_fallback=True,
    )


_shared_client: httpx.AsyncClient | None = None


def get_shared_client() -> httpx.AsyncClient:
    """Return a shared singleton httpx.AsyncClient with explicit timeouts."""
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


async def geocode_city(city: str, client: httpx.AsyncClient) -> tuple[float, float, str] | None:
    """Geocode city name to latitude and longitude using Open-Meteo Geocoding API."""
    try:
        url = settings.OPEN_METEO_GEOCODING_URL
        resp = await client.get(url, params={"name": city, "count": 1, "language": "en", "format": "json"}, timeout=5.0)
        if resp.status_code == 200:
            data = resp.json()
            results = data.get("results")
            if results and len(results) > 0:
                top = results[0]
                lat = float(top["latitude"])
                lon = float(top["longitude"])
                name = top.get("name", city)
                country = top.get("country", "")
                display = f"{name}, {country}".strip(", ")
                return lat, lon, display
    except (httpx.HTTPError, KeyError, ValueError) as e:
        logger.warning(f"Geocoding exception for {city}: {e}")
    return None


async def get_city_aqi(city: str, client: httpx.AsyncClient | None = None) -> AQIData:
    """
    Fetch real-time air quality data for a city using Open-Meteo.
    Uses 15-minute in-memory caching and falls back gracefully if API is offline.
    """
    clean_city = city.strip()
    cache_key = compute_cache_key("city_aqi", clean_city.lower())
    cached: AQIData | None = aqi_cache.get(cache_key)
    if cached is not None:
        return cached

    http_client = client or get_shared_client()

    # Step 1: Geocoding
    geo = await geocode_city(clean_city, http_client)
    if geo:
        lat, lon, display_name = geo
    else:
        match = FALLBACK_CITIES.get(clean_city.lower())
        if match:
            lat, lon = match["lat"], match["lon"]
        else:
            lat, lon = 28.6139, 77.2090
        display_name = clean_city.title()

    try:
        # Step 2: Fetch Air Quality
        aq_params = {
            "latitude": lat,
            "longitude": lon,
            "current": "pm10,pm2_5,us_aqi",
        }
        aq_resp = await http_client.get(settings.OPEN_METEO_AQI_URL, params=aq_params)

        # Step 3: Fetch Weather
        w_params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m",
        }
        w_resp = await http_client.get(settings.OPEN_METEO_WEATHER_URL, params=w_params)

        if aq_resp.status_code == 200:
            aq_current = aq_resp.json().get("current", {})
            pm25 = float(aq_current.get("pm2_5") or 75.0)
            pm10 = float(aq_current.get("pm10") or 120.0)
            us_aqi = aq_current.get("us_aqi")
            if us_aqi is None or us_aqi == 0:
                us_aqi = calculate_us_aqi(pm25)
            else:
                us_aqi = int(us_aqi)

            temp = None
            hum = None
            wind = None
            if w_resp.status_code == 200:
                w_current = w_resp.json().get("current", {})
                temp = w_current.get("temperature_2m")
                hum = w_current.get("relative_humidity_2m")
                wind = w_current.get("wind_speed_10m")

            result = AQIData(
                city=display_name,
                latitude=lat,
                longitude=lon,
                pm2_5=round(pm25, 1),
                pm10=round(pm10, 1),
                us_aqi=us_aqi,
                category=get_aqi_category(us_aqi),
                dominant_pollutant="PM2.5",
                temperature=round(temp, 1) if temp is not None else None,
                relative_humidity=round(hum, 1) if hum is not None else None,
                wind_speed=round(wind, 1) if wind is not None else None,
                is_fallback=False,
            )
            aqi_cache.set(cache_key, result)
            return result
    except (httpx.HTTPError, KeyError, ValueError, TypeError) as exc:
        logger.warning(f"Live Open-Meteo AQI fetch error for {clean_city}: {exc}. Using fallback dictionary.")

    fallback_result = get_fallback_aqi(clean_city)
    aqi_cache.set(cache_key, fallback_result)
    return fallback_result
