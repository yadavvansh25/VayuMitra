"""Deterministic mathematical calculator for CO2 savings and personal PM2.5 inhalation reduction."""


from app.models.schemas import ImpactMetrics, UserProfileRequest

# Berkeley Earth equivalent: 1 cigarette/day ≈ 22 ug/m3 24h average exposure
BERKELEY_EARTH_PM25_PER_CIGARETTE = 22.0

# IPCC & EPA CO2 emissions factors (kg CO2 per passenger-km)
CO2_EMISSION_PER_KM = {
    "car": 0.175,           # Average petrol/diesel passenger car
    "two_wheeler": 0.048,   # 100-150cc scooter / motorbike
    "public_transit": 0.038,# Bus / electric metro per passenger-km
    "wfh": 0.0,
    "walk_bicycle": 0.0,
}

# Roadside particulate concentration multiplier relative to ambient PM2.5
COMMUTE_EXPOSURE_FACTORS = {
    "two_wheeler": 1.85,    # Direct exposure to tailpipe plumes
    "walk_bicycle": 1.70,   # Elevated breathing rate roadside
    "public_transit": 0.95, # Bus / metro cabin
    "car": 0.50,            # Vehicle cabin with AC filter
    "wfh": 0.0,
}


def calculate_commute_co2_savings(commute_mode: str, round_trip_km: float = 25.0) -> float:
    """
    Calculate deterministic daily CO2 emissions saved in kg by shifting
    to electric public transit or carpooling/WFH.
    """
    mode = commute_mode.lower().strip()
    if mode == "car":
        # Shifting from solo car to transit saves (0.175 - 0.038) kg CO2/km
        savings = round_trip_km * (CO2_EMISSION_PER_KM["car"] - CO2_EMISSION_PER_KM["public_transit"])
    elif mode == "two_wheeler":
        # Shifting from two-wheeler to electric transit saves (0.048 - 0.020) kg CO2/km
        savings = round_trip_km * 0.028
    else:
        # Base lifestyle and anti-idling efficiency savings
        savings = 0.85

    return round(max(0.65, savings), 2)


def calculate_pm25_inhalation_reduction(
    ambient_pm25: float,
    home_type: str = "apartment",
    sensitive_members: list[str] | None = None,
    commute_mode: str = "two_wheeler",
    cooking_fuel: str = "lpg",
    ventilation_hours_midday: float = 2.0,
) -> tuple[float, float, float]:
    """
    Calculate (baseline_pm25_ug_m3, mitigated_pm25_ug_m3, reduction_percentage).
    Based on time-weighted microenvironments (15h Home, 7h Workplace, 2h Commute).
    """
    sensitive_members = sensitive_members or []
    home_type = home_type.lower()
    commute_mode = commute_mode.lower()
    cooking_fuel = cooking_fuel.lower()

    # 1. Baseline Indoor Home Exposure
    # Building envelope infiltration: 0.70 for apartments, 0.82 for houses
    infiltration = 0.70 if "apartment" in home_type else 0.82
    indoor_ambient = ambient_pm25 * infiltration

    # Cooking source additions
    cooking_addon = 20.0 if "lpg" in cooking_fuel else (85.0 if "biomass" in cooking_fuel else 5.0)
    baseline_home = indoor_ambient + cooking_addon

    # 2. Baseline Commute Exposure
    commute_factor = COMMUTE_EXPOSURE_FACTORS.get(commute_mode, 1.0)
    baseline_commute = ambient_pm25 * commute_factor

    # 3. Baseline Work/School Exposure
    baseline_work = ambient_pm25 * 0.65

    # 24h Time-Weighted Baseline Exposure
    baseline_weighted = (
        (baseline_home * 15.0) +
        (baseline_work * 7.0) +
        (baseline_commute * 2.0)
    ) / 24.0

    # 4. Mitigated Exposure (With VayuMitra protocol)
    # - Midday controlled ventilation + DIY Box filter drops indoor PM2.5 by ~75%
    mitigated_home = (indoor_ambient * 0.22) + (cooking_addon * 0.25)
    # - N95 mask on commute eliminates 92% of particulate inhalation
    mitigated_commute = baseline_commute * 0.08
    mitigated_work = baseline_work * 0.70

    mitigated_weighted = (
        (mitigated_home * 15.0) +
        (mitigated_work * 7.0) +
        (mitigated_commute * 2.0)
    ) / 24.0

    # Ensure bounds
    mitigated_weighted = max(10.0, min(baseline_weighted * 0.80, mitigated_weighted))
    reduction_pct = ((baseline_weighted - mitigated_weighted) / max(1.0, baseline_weighted)) * 100.0

    return (
        round(baseline_weighted, 1),
        round(mitigated_weighted, 1),
        round(min(92.0, max(15.0, reduction_pct)), 1),
    )


def calculate_impact_metrics(
    profile: UserProfileRequest, ambient_pm25: float
) -> ImpactMetrics:
    """Calculate full deterministic ImpactMetrics model."""
    base_pm25, mit_pm25, red_pct = calculate_pm25_inhalation_reduction(
        ambient_pm25=ambient_pm25,
        home_type=profile.home_type,
        sensitive_members=profile.sensitive_members,
        commute_mode=profile.commute_mode,
        cooking_fuel=profile.cooking_fuel,
        ventilation_hours_midday=2.0,
    )

    daily_co2 = calculate_commute_co2_savings(profile.commute_mode, round_trip_km=25.0)
    monthly_co2 = round(daily_co2 * 30.0, 1)

    # Berkeley Earth cigarette equivalence avoided
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
