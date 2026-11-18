"""Deterministic expert action plan generator for zero-crash fallback resilience.

Constructs comprehensive, tailored winter smog action plans with time-blocked
ventilation routines, budget DIY hacks, and RWA WhatsApp notices when LLM is unavailable.
"""

from app.models.schemas import (
    ActionPlanResponse,
    AQIData,
    DailyRoutineItem,
    ImpactMetrics,
    IndoorHackItem,
    SustainableAlternativeItem,
    UserProfileRequest,
)
from app.services.impact_math import calculate_impact_metrics


def _parse_sensitivities(sensitive_members: list[str]) -> str:
    """Format vulnerable household member identifiers into natural language text.

    Args:
        sensitive_members: Raw string identifiers from profile.

    Returns:
        Comma-separated human readable description of vulnerable groups.
    """
    sens_notes = []
    for s in sensitive_members:
        clean = s.lower().strip()
        if "kid" in clean or "child" in clean:
            sens_notes.append("children (<12 yrs)")
        elif "elder" in clean or "senior" in clean:
            sens_notes.append("seniors (>60 yrs)")
        elif "asthma" in clean or "resp" in clean:
            sens_notes.append("asthma & respiratory patients")
        elif "preg" in clean:
            sens_notes.append("expectant mothers")

    return ", ".join(sens_notes) if sens_notes else "general residents"


def _build_daily_routine(aqi_data: AQIData, sens_str: str) -> list[DailyRoutineItem]:
    """Construct chronological 24-hour diurnal ventilation schedule.

    Args:
        aqi_data: Current atmospheric telemetry.
        sens_str: Descriptive string of vulnerable members.

    Returns:
        List of DailyRoutineItem schedule entries.
    """
    vent_status = "CONTROLLED_VENTILATION" if aqi_data.us_aqi < 240 else "STRICTLY_CLOSED"
    return [
        DailyRoutineItem(
            time_window="05:30 - 09:30",
            activity="Morning Radiative Inversion Lock",
            ventilation_status="SEAL_AND_PURIFY",
            instructions=(
                f"Keep all external doors, balcony glass, and windows strictly closed. "
                f"Suspend morning jogs and outdoor coaching. Ensure {sens_str} stay in a filtered room."
            ),
        ),
        DailyRoutineItem(
            time_window="09:30 - 12:00",
            activity="Rush Hour Commute Protection",
            ventilation_status="STRICTLY_CLOSED",
            instructions=(
                "Wear a certified, tightly sealed N95/FFP2 respirator before stepping onto streets. "
                "Keep vehicle AC on internal air recirculation mode."
            ),
        ),
        DailyRoutineItem(
            time_window="12:00 - 15:30",
            activity="Midday Thermal Window (Controlled Ventilation)",
            ventilation_status=vent_status,
            instructions=(
                "If outdoor AQI has dropped, open opposing windows for 15-20 minutes to flush indoor CO2. "
                "Perform damp wet-mopping using a microfiber mop to capture settled dust without resuspension."
            ),
        ),
        DailyRoutineItem(
            time_window="17:30 - 21:00",
            activity="Evening Rush & Secondary Inversion Descent",
            ventilation_status="STRICTLY_CLOSED",
            instructions=(
                "Seal all perimeter windows before sunset. Run kitchen exhaust 2 minutes before cooking "
                "and maintain for 5 minutes after. Do NOT burn incense sticks (agarbatti) or dhoop."
            ),
        ),
        DailyRoutineItem(
            time_window="21:00 - 05:30",
            activity="Overnight Deep Sleep Clean Air Chamber",
            ventilation_status="SEAL_AND_PURIFY",
            instructions=(
                "Keep bedroom doors closed with DIY box filter or HEPA purifier running in continuous medium mode. "
                "Maintain relative humidity around 45-55% to protect mucous airway linings."
            ),
        ),
    ]


def _build_indoor_hacks() -> list[IndoorHackItem]:
    """Assemble low-cost, high-CADR indoor air filtration and maintenance hacks.

    Returns:
        List of actionable IndoorHackItem instances.
    """
    return [
        IndoorHackItem(
            title="DIY Corsi-Rosenthal Box Air Filter",
            estimated_cost="₹1,200 - ₹1,800 ($14 - $22)",
            pm25_reduction_pct=82.0,
            materials=[
                "1 Standard 16-inch or 20-inch box fan (or square table fan)",
                "2 to 4 MERV 13 (or HEPA H11) HVAC pleated filters",
                "Cardboard bottom shroud",
                "Heavy-duty duct tape",
            ],
            steps=[
                "Tape the filters into a cube with airflow arrows pointing inward toward the center.",
                "Tape a flat cardboard panel to seal the bottom.",
                "Mount the fan on top blowing air upward, drawing dirty room air through the filter faces.",
                "Run continuously in your main living room or bedroom for high-CADR particulate capture.",
            ],
            scientific_rationale=(
                "MERV 13 filters capture sub-micron particles (0.1 - 2.5 µm) through impaction, interception, and diffusion, "
                "matching commercial purifiers at 1/5th the operational cost."
            ),
        ),
        IndoorHackItem(
            title="Saline Microfiber Wet-Mopping Protocol",
            estimated_cost="₹150 - ₹250 ($2 - $3)",
            pm25_reduction_pct=45.0,
            materials=[
                "Microfiber flat mop",
                "Bucket with lukewarm water",
                "A pinch of salt or mild detergent (breaks surface tension)",
            ],
            steps=[
                "Do NOT use traditional dry brooms (jhadu); dry sweeping resuspends up to 70% of settled soot into the air.",
                "Dampen the microfiber cloth and mop gently from the far corner towards the doorway.",
                "Rinse the mop frequently to avoid dragging captured particulate soot.",
                "Execute daily between 12 PM and 2 PM when indoor dust settles.",
            ],
            scientific_rationale="Capillary action in microfiber traps settled PM2.5 and PM10 particles electrostatically without aerosolization.",
        ),
        IndoorHackItem(
            title="Kitchen Exhaust Pre-Purge & Induction Habit",
            estimated_cost="₹0 (Behavioral)",
            pm25_reduction_pct=65.0,
            materials=["Existing kitchen exhaust fan or electric chimney", "Kitchen door or draft curtain"],
            steps=[
                "Turn ON the kitchen exhaust 2 minutes BEFORE lighting the stove or heating cooking oil.",
                "Keep the kitchen door closed to prevent aerosolized oils and nitrogen dioxide from flooding living areas.",
                "Keep exhaust running for 5 to 7 minutes after finishing cooking.",
                "Cover sautéing pans with lids when preparing tadka or frying spices.",
            ],
            scientific_rationale="Cooking oils produce volatile organic compounds (VOCs) and PM2.5 exceeding 400 µg/m³; pre-exhausting establishes negative pressure.",
        ),
        IndoorHackItem(
            title="Door Threshold Foam Weatherstripping",
            estimated_cost="₹200 - ₹400 ($3 - $5)",
            pm25_reduction_pct=38.0,
            materials=["Self-adhesive high-density foam weatherstrip tape", "Draft stopper cloth roll for door bottom"],
            steps=[
                "Clean the door and window frame rebate with a dry cloth.",
                "Affix foam tape along the rebate where the door meets the frame.",
                "Place a twin-draft fabric stopper under the main entrance door to block corridor smog draft.",
            ],
            scientific_rationale="Standard exterior doors have 1-2 cm gaps that admit hundreds of cubic meters of outdoor smog hourly via building stack effect.",
        ),
    ]


def _build_sustainable_alternatives(impact: ImpactMetrics) -> list[SustainableAlternativeItem]:
    """Generate quantified sustainable lifestyle replacements.

    Args:
        impact: Calculated carbon and inhalation reduction metrics.

    Returns:
        List of SustainableAlternativeItem instances.
    """
    return [
        SustainableAlternativeItem(
            current_habit="Solo petrol/diesel car or two-wheeler daily commute",
            sustainable_alternative="Shift to electric metro, verified carpooling, or negotiated WFH on severe smog days",
            co2_saved_kg_day=impact.daily_co2_saved_kg,
            pm25_reduction_pct=92.0,
            health_benefit="Cuts direct toxic tailpipe black carbon and benzene inhalation during traffic bottlenecks.",
        ),
        SustainableAlternativeItem(
            current_habit="Daily lighting of fragrant incense sticks (agarbatti) & dhoop cones",
            sustainable_alternative="Switch to ultrasonic essential oil diffuser (lavender/eucalyptus) or paused burning",
            co2_saved_kg_day=0.10,
            pm25_reduction_pct=40.0,
            health_benefit="Prevents inhaling particulate mass and polycyclic aromatic hydrocarbons equivalent to 2-3 cigarettes per stick.",
        ),
        SustainableAlternativeItem(
            current_habit="Dry leaf and garden waste burning in complex",
            sustainable_alternative="Decentralized society composting pit / microbial leaf compost enclosure",
            co2_saved_kg_day=1.85,
            pm25_reduction_pct=55.0,
            health_benefit="Eliminates dense ground-level carbon smoke plumes that trigger acute childhood asthma attacks.",
        ),
    ]


def _build_rwa_notice(city_name: str, aqi_data: AQIData, sens_str: str, reduction_pct: float) -> str:
    """Format an actionable WhatsApp and community notice board circular.

    Args:
        city_name: Locality or municipality name.
        aqi_data: Snapshot of air quality measurements.
        sens_str: Description of vulnerable resident groups.
        reduction_pct: Anticipated exposure reduction percentage.

    Returns:
        Formatted circular string with markdown emphasis and emojis.
    """
    return (
        f"🚨 *URGENT CLEAN AIR ADVISORY: {city_name.upper()}*\n"
        f"📊 *Current AQI:* {aqi_data.us_aqi} ({aqi_data.category}) | PM2.5: {aqi_data.pm2_5} µg/m³\n"
        f"⚠️ *Vulnerability Alert:* High risk for {sens_str}.\n\n"
        f"🛡️ *COMMUNITY RESOLUTION FOR RESIDENTS:*\n"
        f"1️⃣ *Zero Open Burning:* Absolute ban on dry-leaf and waste burning on society premises.\n"
        f"2️⃣ *Strict 3-Min Anti-Idling:* Drivers and delivery couriers must turn off engines at gates.\n"
        f"3️⃣ *Shield Security Guards:* Provide electric radiant heaters and N95 masks for night security.\n"
        f"4️⃣ *Seal Balconies:* Lock sliding doors during morning inversion (6 AM - 10 AM).\n\n"
        f"💡 *Household Impact:* Adopting indoor box filtration & N95 masks reduces personal PM2.5 intake by ~{reduction_pct}%!\n\n"
        f"🌿 *Issued via VayuMitra Clean Air Assistant* — Please circulate in society tower groups!"
    )


def generate_dynamic_fallback_plan(
    profile: UserProfileRequest, aqi_data: AQIData
) -> ActionPlanResponse:
    """Generate a fully populated deterministic action plan when LLM is unavailable.

    Args:
        profile: Household user configuration.
        aqi_data: Validated real-time atmospheric measurements.

    Returns:
        ActionPlanResponse matching all schema requirements with source identifier.
    """
    impact = calculate_impact_metrics(profile, aqi_data.pm2_5)
    city_name = aqi_data.city.split(",")[0].strip()
    sens_str = _parse_sensitivities(profile.sensitive_members)

    daily_routine = _build_daily_routine(aqi_data, sens_str)
    indoor_hacks = _build_indoor_hacks()
    sustainable_alternatives = _build_sustainable_alternatives(impact)
    whatsapp_notice = _build_rwa_notice(city_name, aqi_data, sens_str, impact.pm25_inhalation_reduction_pct)

    return ActionPlanResponse(
        city=city_name,
        aqi_data=aqi_data,
        daily_routine=daily_routine,
        indoor_hacks=indoor_hacks,
        sustainable_alternatives=sustainable_alternatives,
        impact_metrics=impact,
        rwa_whatsapp_notice=whatsapp_notice,
        source="deterministic-expert-engine",
    )
