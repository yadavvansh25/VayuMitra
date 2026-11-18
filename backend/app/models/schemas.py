"""Strict Pydantic v2 schemas for VayuMitra requests and structured responses."""


from pydantic import BaseModel, Field, field_validator


class UserProfileRequest(BaseModel):
    """User and household input parameters with strict validation."""
    city: str = Field(..., min_length=2, max_length=100, description="City name (e.g. 'Delhi', 'Gurugram')")
    home_type: str = Field(
        default="apartment",
        max_length=50,
        description="Home structure: 'apartment', 'independent_house', 'villa'",
    )
    sensitive_members: list[str] = Field(
        default_factory=list,
        max_length=20,
        description="List of sensitivities: 'kids', 'elderly', 'asthma', 'pregnant', 'pets'",
    )
    commute_mode: str = Field(
        default="two_wheeler",
        max_length=50,
        description="Commute method: 'car', 'two_wheeler', 'public_transit', 'wfh', 'walk_bicycle'",
    )
    cooking_fuel: str = Field(
        default="lpg",
        max_length=50,
        description="Primary cooking fuel: 'lpg', 'electric_induction', 'biomass', 'png', 'kerosene'",
    )

    @field_validator("city")
    @classmethod
    def clean_city(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("City name cannot be blank.")
        return cleaned

    @field_validator("sensitive_members")
    @classmethod
    def validate_sensitive_members(cls, v: list[str]) -> list[str]:
        cleaned = []
        for item in v:
            item_str = str(item).strip()[:50]
            if item_str:
                cleaned.append(item_str)
        return cleaned


class AQIData(BaseModel):
    """Real-time atmospheric and particulate matter metrics."""
    city: str
    latitude: float
    longitude: float
    pm2_5: float = Field(description="PM2.5 particulate mass concentration in µg/m³")
    pm10: float = Field(description="PM10 particulate mass concentration in µg/m³")
    us_aqi: int = Field(description="US EPA Air Quality Index value (0-500)")
    category: str = Field(description="Good, Moderate, Unhealthy for Sensitive Groups, Unhealthy, Very Unhealthy, Severe / Hazardous")
    dominant_pollutant: str = Field(default="PM2.5")
    temperature: float | None = Field(default=None, description="Ambient temperature in °C")
    relative_humidity: float | None = Field(default=None, description="Relative humidity in %")
    wind_speed: float | None = Field(default=None, description="Wind speed in km/h")
    is_fallback: bool = Field(default=False, description="Whether fallback mock data was used")


class DailyRoutineItem(BaseModel):
    """Diurnal ventilation and activity block."""
    time_window: str = Field(description="e.g. '06:00 - 09:30'")
    activity: str = Field(description="Action title (e.g. 'Morning Smog Inversion Lock')")
    ventilation_status: str = Field(description="'SEAL_AND_PURIFY', 'STRICTLY_CLOSED', 'CONTROLLED_VENTILATION'")
    instructions: str = Field(description="Explicit guidance on doors, windows, and filtration")


class IndoorHackItem(BaseModel):
    """Budget indoor clean-air solutions."""
    title: str = Field(description="Hack title (e.g. 'DIY Corsi-Rosenthal Box Filter')")
    estimated_cost: str = Field(description="Cost estimate in INR / USD")
    pm25_reduction_pct: float = Field(description="Estimated indoor PM2.5 reduction %")
    materials: list[str] = Field(description="Required low-cost hardware materials")
    steps: list[str] = Field(description="Step-by-step setup instructions")
    scientific_rationale: str = Field(description="Scientific mechanism behind this solution")


class SustainableAlternativeItem(BaseModel):
    """Quantified sustainable lifestyle replacement."""
    current_habit: str
    sustainable_alternative: str
    co2_saved_kg_day: float
    pm25_reduction_pct: float
    health_benefit: str


class ImpactMetrics(BaseModel):
    """Scientifically validated personal health and carbon reduction metrics."""
    baseline_pm25_ug_m3: float = Field(description="Estimated daily average PM2.5 inhalation without mitigation")
    mitigated_pm25_ug_m3: float = Field(description="Estimated daily average PM2.5 inhalation with VayuMitra mitigations")
    pm25_inhalation_reduction_pct: float = Field(description="Percentage reduction in personal inhaled PM2.5")
    daily_co2_saved_kg: float = Field(description="Estimated kg CO2 reduction per day")
    monthly_co2_saved_kg: float = Field(description="Estimated kg CO2 reduction per 30-day month")
    cigarette_equivalents_avoided_daily: float = Field(description="Berkeley Earth equivalent cigarettes avoided per day")


class ActionPlanResponse(BaseModel):
    """Comprehensive structured action plan."""
    city: str
    aqi_data: AQIData
    daily_routine: list[DailyRoutineItem]
    indoor_hacks: list[IndoorHackItem]
    sustainable_alternatives: list[SustainableAlternativeItem]
    impact_metrics: ImpactMetrics
    rwa_whatsapp_notice: str = Field(description="Pre-formatted notice ready for WhatsApp with *bolding* and emojis")
    source: str = Field(description="'gemini-2.5-flash' or 'deterministic-expert-engine'")
