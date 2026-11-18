"""Pure calculation functions for Air Quality Index (AQI) values and categories.

Implements US EPA piecewise linear interpolation for PM2.5 concentrations
and maps numerical AQI scores to qualitative health categories.
"""

from app.core.constants import (
    AQI_CATEGORY_SEVERE,
    AQI_CATEGORY_THRESHOLDS,
    US_EPA_PM25_BREAKPOINTS,
)


def calculate_us_aqi(pm25: float) -> int:
    """Calculate US EPA AQI from PM2.5 concentration using piecewise linear interpolation.

    Formula:
        I = ((I_high - I_low) / (C_high - C_low)) * (C - C_low) + I_low

    Args:
        pm25: Particulate mass concentration in µg/m³.

    Returns:
        Integer AQI value bounded between 0 and 500.
    """
    if pm25 <= 0.0:
        return 0
    if pm25 >= 500.4:
        return 500

    for c_low, c_high, i_low, i_high in US_EPA_PM25_BREAKPOINTS:
        if c_low <= pm25 <= c_high:
            scale = (i_high - i_low) / (c_high - c_low)
            return round(scale * (pm25 - c_low) + i_low)

    return 500


def get_aqi_category(us_aqi: int) -> str:
    """Map a numerical US EPA AQI index score to its qualitative advisory category.

    Args:
        us_aqi: Numerical AQI value (0-500 scale).

    Returns:
        Standard health category string description.
    """
    for max_score, label in AQI_CATEGORY_THRESHOLDS:
        if us_aqi <= max_score:
            return label
    return AQI_CATEGORY_SEVERE
