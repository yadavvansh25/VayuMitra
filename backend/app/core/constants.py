"""Application-wide constants, physical parameters, and environmental emission factors.

This module consolidates all numerical thresholds, physical constants,
epidemiological factors, and default fallback values to eliminate magic numbers.
"""

from typing import Final

# ==============================================================================
# EPIDEMIOLOGICAL & ENVIRONMENTAL FACTORS
# ==============================================================================

# Berkeley Earth epidemiological conversion factor:
# 22 µg/m³ of 24-hour continuous PM2.5 exposure is equivalent to 1 cigarette.
BERKELEY_EARTH_PM25_PER_CIGARETTE: Final[float] = 22.0

# IPCC & EPA transport CO2 emissions (kg CO2 per passenger-kilometer)
CO2_EMISSIONS_KG_PER_KM: Final[dict[str, float]] = {
    "car": 0.175,          # Average petrol/diesel passenger vehicle
    "two_wheeler": 0.048,  # 100-150cc scooter / motorbike
    "public_transit": 0.038,  # Electric metro / compressed natural gas bus
    "wfh": 0.0,
    "walk_bicycle": 0.0,
}

# Roadside particulate exposure multipliers relative to ambient PM2.5
COMMUTE_EXPOSURE_MULTIPLIERS: Final[dict[str, float]] = {
    "two_wheeler": 1.85,    # Direct respiration of vehicular exhaust plumes
    "walk_bicycle": 1.70,   # Elevated ventilation rate roadside
    "public_transit": 0.95, # Cabin with moderate filtration
    "car": 0.50,            # Vehicle cabin with AC recirculating air
    "wfh": 0.0,             # Zero outdoor transit exposure
}

# Building envelope particulate infiltration factors (fraction of outdoor PM2.5)
BUILDING_INFILTRATION_FACTORS: Final[dict[str, float]] = {
    "apartment": 0.70,         # High-rise stack effect
    "independent_house": 0.82,  # Ground-level thermal drafts & dust
    "villa": 0.80,             # Perimeter ground drafts
}

# Internal cooking emissions contribution to indoor air (µg/m³)
COOKING_EMISSIONS_UG_M3: Final[dict[str, float]] = {
    "lpg": 20.0,
    "png": 18.0,
    "electric_induction": 5.0,
    "biomass": 85.0,
    "kerosene": 65.0,
}

# ==============================================================================
# US EPA AIR QUALITY INDEX (AQI) BREAKPOINTS
# ==============================================================================

# Breakpoints format: (PM2.5 low, PM2.5 high, AQI index low, AQI index high)
US_EPA_PM25_BREAKPOINTS: Final[list[tuple[float, float, int, int]]] = [
    (0.0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 350.4, 301, 400),
    (350.5, 500.4, 401, 500),
]

# Health category labels by upper AQI index boundary
AQI_CATEGORY_THRESHOLDS: Final[list[tuple[int, str]]] = [
    (50, "Good"),
    (100, "Moderate"),
    (150, "Unhealthy for Sensitive Groups"),
    (200, "Unhealthy"),
    (300, "Very Unhealthy"),
]
AQI_CATEGORY_SEVERE: Final[str] = "Severe / Hazardous"

# ==============================================================================
# GEOGRAPHICAL TELEMETRY FALLBACKS
# ==============================================================================

# Telemetry defaults when live Open-Meteo API connection is unavailable
FALLBACK_CITIES: Final[dict[str, dict[str, float]]] = {
    "delhi": {
        "lat": 28.6139,
        "lon": 77.2090,
        "pm25": 285.0,
        "pm10": 420.0,
        "temp": 16.5,
        "humidity": 78.0,
        "wind": 4.2,
    },
    "new delhi": {
        "lat": 28.6139,
        "lon": 77.2090,
        "pm25": 285.0,
        "pm10": 420.0,
        "temp": 16.5,
        "humidity": 78.0,
        "wind": 4.2,
    },
    "gurugram": {
        "lat": 28.4595,
        "lon": 77.0266,
        "pm25": 265.0,
        "pm10": 390.0,
        "temp": 17.0,
        "humidity": 74.0,
        "wind": 5.0,
    },
    "noida": {
        "lat": 28.5355,
        "lon": 77.3910,
        "pm25": 295.0,
        "pm10": 440.0,
        "temp": 16.0,
        "humidity": 80.0,
        "wind": 3.8,
    },
    "mumbai": {
        "lat": 19.0760,
        "lon": 72.8777,
        "pm25": 115.0,
        "pm10": 180.0,
        "temp": 26.0,
        "humidity": 65.0,
        "wind": 11.5,
    },
    "bengaluru": {
        "lat": 12.9716,
        "lon": 77.5946,
        "pm25": 42.0,
        "pm10": 78.0,
        "temp": 22.0,
        "humidity": 58.0,
        "wind": 9.0,
    },
    "lahore": {
        "lat": 31.5204,
        "lon": 74.3587,
        "pm25": 310.0,
        "pm10": 460.0,
        "temp": 17.5,
        "humidity": 82.0,
        "wind": 3.0,
    },
}

# ==============================================================================
# INPUT VALIDATION BOUNDS
# ==============================================================================

MAX_CITY_LENGTH: Final[int] = 100
MIN_CITY_LENGTH: Final[int] = 2
MAX_STRING_FIELD_LENGTH: Final[int] = 50
MAX_SENSITIVE_MEMBERS_COUNT: Final[int] = 20
MAX_USER_INPUT_LENGTH: Final[int] = 200

# Cache configurations
DEFAULT_CACHE_TTL_SECONDS: Final[int] = 900  # 15 minutes
DEFAULT_CACHE_MAX_SIZE: Final[int] = 1024
