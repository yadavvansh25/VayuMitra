"""Strict Pydantic v2 schemas for VayuMitra requests and structured responses.

This module defines validated request models and structured responses
with comprehensive type annotations, validation bounds, and field descriptions.
"""

from pydantic import BaseModel, Field, field_validator

from app.core.constants import (
    MAX_CITY_LENGTH,
    MAX_SENSITIVE_MEMBERS_COUNT,
    MAX_STRING_FIELD_LENGTH,
    MIN_CITY_LENGTH,
)


class UserProfileRequest(BaseModel):
    """User and household input parameters with strict validation constraints.

    Attributes:
        city: Locality or city name for geocoding and AQI lookups.
        home_type: Residential structural type (apartment, independent house, villa).
        sensitive_members: Identifiers of high-risk household occupants.
        commute_mode: Primary daily transport mode.
        cooking_fuel: Kitchen combustion or electrification energy source.
    """

    city: str = Field(
        ...,
        min_length=MIN_CITY_LENGTH,
        max_length=MAX_CITY_LENGTH,
        description="City name (e.g. 'Delhi', 'Gurugram')",
    )
    home_type: str = Field(
        default="apartment",
        max_length=MAX_STRING_FIELD_LENGTH,
        description="Home structure: 'apartment', 'independent_house', 'villa'",
    )
    sensitive_members: list[str] = Field(
        default_factory=list,
        max_length=MAX_SENSITIVE_MEMBERS_COUNT,
        description="List of sensitivities: 'kids', 'elderly', 'asthma', 'pregnant', 'pets'",
    )
    commute_mode: str = Field(
        default="two_wheeler",
        max_length=MAX_STRING_FIELD_LENGTH,
        description="Commute method: 'car', 'two_wheeler', 'public_transit', 'wfh', 'walk_bicycle'",
    )
    cooking_fuel: str = Field(
        default="lpg",
        max_length=MAX_STRING_FIELD_LENGTH,
        description="Primary cooking fuel: 'lpg', 'electric_induction', 'biomass', 'png', 'kerosene'",
    )

    @field_validator("city")
    @classmethod
    def clean_city(cls, v: str) -> str:
        """Sanitize city name and reject whitespace-only submissions.

        Args:
            v: Raw city input string.

        Returns:
            Stripped city string.

        Raises:
            ValueError: If the city string is blank or whitespace only.
        """
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("City name cannot be blank.")
        return cleaned

    @field_validator("sensitive_members")
    @classmethod
    def validate_sensitive_members(cls, v: list[str]) -> list[str]:
        """Sanitize items in sensitive members array and truncate individual items.

        Args:
            v: Raw sensitive member identifiers.

        Returns:
            Sanitized, non-empty sensitive member identifiers.
        """
        cleaned = []
        for item in v:
            item_str = str(item).strip()[:MAX_STRING_FIELD_LENGTH]
            if item_str:
                cleaned.append(item_str)
        return cleaned


class AQIData(BaseModel):
    """Real-time atmospheric and particulate matter metrics.

    Attributes:
        city: Human-readable location display name.
        latitude: Geocoded geographic latitude.
        longitude: Geocoded geographic longitude.
        pm2_5: PM2.5 particulate mass concentration in µg/m³.
        pm10: PM10 particulate mass concentration in µg/m³.
        us_aqi: US EPA Air Quality Index value (0-500 scale).
        category: Qualitative EPA severity category.
        dominant_pollutant: Primary air hazard (default: PM2.5).
        temperature: Ambient temperature in °C.
        relative_humidity: Relative atmospheric humidity percentage.
        wind_speed: Near-surface wind speed in km/h.
        is_fallback: Indicates if offline deterministic fallback was used.
    """

    city: str
    latitude: float
    longitude: float
    pm2_5: float = Field(description="PM2.5 particulate mass concentration in µg/m³")
    pm10: float = Field(description="PM10 particulate mass concentration in µg/m³")
    us_aqi: int = Field(description="US EPA Air Quality Index value (0-500)")
    category: str = Field(
        description="Good, Moderate, Unhealthy for Sensitive Groups, Unhealthy, Very Unhealthy, Severe / Hazardous"
    )
    dominant_pollutant: str = Field(default="PM2.5")
    temperature: float | None = Field(default=None, description="Ambient temperature in °C")
    relative_humidity: float | None = Field(default=None, description="Relative humidity in %")
    wind_speed: float | None = Field(default=None, description="Wind speed in km/h")
    is_fallback: bool = Field(default=False, description="Whether fallback mock data was used")


class DailyRoutineItem(BaseModel):
    """Diurnal ventilation and lifestyle activity block.

    Attributes:
        time_window: Clock duration for the action (e.g. '06:00 - 09:30').
        activity: Descriptive action title.
        ventilation_status: Recommended building air exchange state.
        instructions: Explicit tactical steps for windows, doors, and filters.
    """

    time_window: str = Field(description="e.g. '06:00 - 09:30'")
    activity: str = Field(description="Action title (e.g. 'Morning Smog Inversion Lock')")
    ventilation_status: str = Field(
        description="'SEAL_AND_PURIFY', 'STRICTLY_CLOSED', 'CONTROLLED_VENTILATION'"
    )
    instructions: str = Field(description="Explicit guidance on doors, windows, and filtration")


class IndoorHackItem(BaseModel):
    """Budget indoor clean-air adaptation and DIY mitigation.

    Attributes:
        title: Clean-air solution title.
        estimated_cost: Approximate setup cost in local currency.
        pm25_reduction_pct: Anticipated percentage reduction in room PM2.5.
        materials: Low-cost hardware requirements.
        steps: Step-by-step assembly and operation guidelines.
        scientific_rationale: Underlying fluid mechanics and aerosol science.
    """

    title: str = Field(description="Hack title (e.g. 'DIY Corsi-Rosenthal Box Filter')")
    estimated_cost: str = Field(description="Cost estimate in INR / USD")
    pm25_reduction_pct: float = Field(description="Estimated indoor PM2.5 reduction %")
    materials: list[str] = Field(description="Required low-cost hardware materials")
    steps: list[str] = Field(description="Step-by-step setup instructions")
    scientific_rationale: str = Field(description="Scientific mechanism behind this solution")


class SustainableAlternativeItem(BaseModel):
    """Quantified sustainable lifestyle replacement for high-emission habits.

    Attributes:
        current_habit: Baseline activity or commute method.
        sustainable_alternative: Recommended clean replacement.
        co2_saved_kg_day: Daily carbon dioxide emission reduction in kilograms.
        pm25_reduction_pct: Relative reduction in inhaled particulate exposure.
        health_benefit: Clinical and physiological improvement summary.
    """

    current_habit: str
    sustainable_alternative: str
    co2_saved_kg_day: float
    pm25_reduction_pct: float
    health_benefit: str


class ImpactMetrics(BaseModel):
    """Scientifically validated personal health and carbon reduction metrics.

    Attributes:
        baseline_pm25_ug_m3: Daily average inhaled PM2.5 without mitigation.
        mitigated_pm25_ug_m3: Daily average inhaled PM2.5 following VayuMitra protocol.
        pm25_inhalation_reduction_pct: Percentage reduction in personal exposure.
        daily_co2_saved_kg: Estimated daily CO2 reduction in kilograms.
        monthly_co2_saved_kg: Projected 30-day cumulative CO2 reduction.
        cigarette_equivalents_avoided_daily: Berkeley Earth equivalent cigarettes avoided.
    """

    baseline_pm25_ug_m3: float = Field(
        description="Estimated daily average PM2.5 inhalation without mitigation"
    )
    mitigated_pm25_ug_m3: float = Field(
        description="Estimated daily average PM2.5 inhalation with VayuMitra mitigations"
    )
    pm25_inhalation_reduction_pct: float = Field(
        description="Percentage reduction in personal inhaled PM2.5"
    )
    daily_co2_saved_kg: float = Field(description="Estimated kg CO2 reduction per day")
    monthly_co2_saved_kg: float = Field(description="Estimated kg CO2 reduction per 30-day month")
    cigarette_equivalents_avoided_daily: float = Field(
        description="Berkeley Earth equivalent cigarettes avoided per day"
    )


class ActionPlanResponse(BaseModel):
    """Comprehensive structured action plan generated for a household.

    Attributes:
        city: Target city or locality.
        aqi_data: Snapshot of atmospheric metrics used in generation.
        daily_routine: Chronological diurnal lifestyle schedule.
        indoor_hacks: Low-cost indoor filtration and adaptation guidelines.
        sustainable_alternatives: Quantified low-emission transport and energy shifts.
        impact_metrics: Scientifically calculated carbon and inhalation metrics.
        rwa_whatsapp_notice: Formatted circular for resident community groups.
        source: Plan generation engine identifier.
    """

    city: str
    aqi_data: AQIData
    daily_routine: list[DailyRoutineItem]
    indoor_hacks: list[IndoorHackItem]
    sustainable_alternatives: list[SustainableAlternativeItem]
    impact_metrics: ImpactMetrics
    rwa_whatsapp_notice: str = Field(
        description="Pre-formatted notice ready for WhatsApp with *bolding* and emojis"
    )
    source: str = Field(description="'gemini-2.5-flash' or 'deterministic-expert-engine'")
