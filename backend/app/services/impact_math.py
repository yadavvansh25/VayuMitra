"""Deterministic mathematical engine for personal health and carbon reduction impact.

This module models 24-hour time-weighted microenvironmental particulate inhalation
(Home, Workplace, Commute) and computes transport emissions savings according to
IPCC/EPA factors and Berkeley Earth cigarette equivalence.
"""

from typing import Final

from app.core.constants import (
    BERKELEY_EARTH_PM25_PER_CIGARETTE,
    BUILDING_INFILTRATION_FACTORS,
    CO2_EMISSIONS_KG_PER_KM,
    COMMUTE_EXPOSURE_MULTIPLIERS,
    COOKING_EMISSIONS_UG_M3,
)
from app.models.schemas import ImpactMetrics, UserProfileRequest

DEFAULT_ROUND_TRIP_KM: Final[float] = 25.0
HOURS_HOME: Final[float] = 15.0
HOURS_WORK: Final[float] = 7.0
HOURS_COMMUTE: Final[float] = 2.0
TOTAL_DAY_HOURS: Final[float] = 24.0


def calculate_commute_co2_savings(commute_mode: str, round_trip_km: float = DEFAULT_ROUND_TRIP_KM) -> float:
    """Calculate daily carbon dioxide emissions saved in kg.

    Estimates CO2 reductions achieved by switching from fossil-fuel transport
    to electric public transit or telecommuting.

    Args:
        commute_mode: Current baseline mode ('car', 'two_wheeler', 'wfh', etc.).
        round_trip_km: Estimated daily round-trip commute distance.

    Returns:
        Estimated daily kilograms of CO2 emissions saved (bounded to min 0.65 kg).
    """
    mode = commute_mode.lower().strip()
    if mode == "car":
        delta_factor = CO2_EMISSIONS_KG_PER_KM["car"] - CO2_EMISSIONS_KG_PER_KM["public_transit"]
        savings = round_trip_km * delta_factor
    elif mode == "two_wheeler":
        savings = round_trip_km * (CO2_EMISSIONS_KG_PER_KM["two_wheeler"] - 0.020)
    else:
        savings = 0.85

    return round(max(0.65, savings), 2)


def _get_home_baseline(ambient_pm25: float, home_type: str, cooking_fuel: str) -> tuple[float, float]:
    """Calculate baseline home infiltration and cooking particulate concentrations.

    Args:
        ambient_pm25: Ambient outdoor PM2.5 concentration in µg/m³.
        home_type: Residential structural design key.
        cooking_fuel: Fuel type for kitchen cooking.

    Returns:
        Tuple of (indoor_ambient_pm25, cooking_addon_pm25).
    """
    infiltration = BUILDING_INFILTRATION_FACTORS.get(home_type, 0.75)
    indoor_ambient = ambient_pm25 * infiltration
    cooking_addon = COOKING_EMISSIONS_UG_M3.get(cooking_fuel, 20.0)
    return indoor_ambient, cooking_addon


def _time_weight_exposure(home: float, work: float, commute: float) -> float:
    """Compute 24-hour time-weighted average PM2.5 exposure.

    Args:
        home: Average concentration during 15h home microenvironment.
        work: Average concentration during 7h workplace microenvironment.
        commute: Average concentration during 2h commute microenvironment.

    Returns:
        24-hour weighted concentration in µg/m³.
    """
    return ((home * HOURS_HOME) + (work * HOURS_WORK) + (commute * HOURS_COMMUTE)) / TOTAL_DAY_HOURS


def calculate_pm25_inhalation_reduction(
    ambient_pm25: float,
    home_type: str = "apartment",
    sensitive_members: list[str] | None = None,
    commute_mode: str = "two_wheeler",
    cooking_fuel: str = "lpg",
    ventilation_hours_midday: float = 2.0,
) -> tuple[float, float, float]:
    """Calculate personal inhaled PM2.5 reduction using time-weighted microenvironments.

    Args:
        ambient_pm25: Ambient outdoor PM2.5 concentration in µg/m³.
        home_type: Architecture structure ('apartment', 'independent_house', 'villa').
        sensitive_members: High-risk group members in the household.
        commute_mode: Mode of travel ('two_wheeler', 'car', 'public_transit', 'wfh').
        cooking_fuel: Cooking fuel category ('lpg', 'png', 'electric_induction', etc.).
        ventilation_hours_midday: Midday ventilation window duration.

    Returns:
        Tuple of (baseline_pm25_ug_m3, mitigated_pm25_ug_m3, reduction_percentage).
    """
    indoor_ambient, cooking_addon = _get_home_baseline(ambient_pm25, home_type.lower(), cooking_fuel.lower())
    baseline_home = indoor_ambient + cooking_addon

    commute_multiplier = COMMUTE_EXPOSURE_MULTIPLIERS.get(commute_mode.lower(), 1.0)
    baseline_commute = ambient_pm25 * commute_multiplier
    baseline_work = ambient_pm25 * 0.65

    baseline_weighted = _time_weight_exposure(baseline_home, baseline_work, baseline_commute)

    # Mitigated state with DIY filtration and N95 protection
    mitigated_home = (indoor_ambient * 0.22) + (cooking_addon * 0.25)
    mitigated_commute = baseline_commute * 0.08
    mitigated_work = baseline_work * 0.70

    mitigated_weighted = _time_weight_exposure(mitigated_home, mitigated_work, mitigated_commute)
    mitigated_weighted = max(10.0, min(baseline_weighted * 0.80, mitigated_weighted))

    reduction_pct = ((baseline_weighted - mitigated_weighted) / max(1.0, baseline_weighted)) * 100.0

    return (
        round(baseline_weighted, 1),
        round(mitigated_weighted, 1),
        round(min(92.0, max(15.0, reduction_pct)), 1),
    )


def calculate_impact_metrics(profile: UserProfileRequest, ambient_pm25: float) -> ImpactMetrics:
    """Generate structured personal health and carbon reduction metrics.

    Args:
        profile: Validated household profile request.
        ambient_pm25: Current outdoor PM2.5 concentration in µg/m³.

    Returns:
        ImpactMetrics instance populated with validated deterministic values.
    """
    base_pm25, mit_pm25, red_pct = calculate_pm25_inhalation_reduction(
        ambient_pm25=ambient_pm25,
        home_type=profile.home_type,
        sensitive_members=profile.sensitive_members,
        commute_mode=profile.commute_mode,
        cooking_fuel=profile.cooking_fuel,
        ventilation_hours_midday=2.0,
    )

    daily_co2 = calculate_commute_co2_savings(profile.commute_mode, round_trip_km=DEFAULT_ROUND_TRIP_KM)
    monthly_co2 = round(daily_co2 * 30.0, 1)

    delta_pm25 = max(0.0, base_pm25 - mit_pm25)
    cigs_avoided = round(delta_pm25 / BERKELEY_EARTH_PM25_PER_CIGARETTE, 1)

    return ImpactMetrics(
        baseline_pm25_ug_m3=base_pm25,
        mitigated_pm25_ug_m3=mit_pm25,
        pm25_inhalation_reduction_pct=red_pct,
        daily_co2_saved_kg=daily_co2,
        monthly_co2_saved_kg=monthly_co2,
        cigarette_equivalents_avoided_daily=cigs_avoided,
    )
