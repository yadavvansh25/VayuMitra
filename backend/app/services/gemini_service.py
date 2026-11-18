"""Structured GenAI Action Plan Engine using google-genai SDK with reliable dynamic fallback.

Coordinates 15-minute caching, prompt composition, Gemini 2.5 Flash structured
response schemas, and seamless fallback to deterministic expert action plans.
"""

import json
import logging

from google import genai
from google.genai import types

from app.core.cache import compute_cache_key, plan_cache
from app.core.config import get_settings
from app.models.schemas import ActionPlanResponse, AQIData, UserProfileRequest
from app.services.fallback_plan import generate_dynamic_fallback_plan
from app.services.prompt_builder import build_gemini_prompt

logger = logging.getLogger(__name__)
settings = get_settings()


async def generate_action_plan(
    profile: UserProfileRequest, aqi_data: AQIData
) -> ActionPlanResponse:
    """Generate structured action plan via Gemini 2.5 Flash with resilient offline fallback.

    Args:
        profile: Validated household profile request.
        aqi_data: Real-time atmospheric metrics.

    Returns:
        Structured ActionPlanResponse instance from Gemini or deterministic engine.
    """
    cache_key = compute_cache_key("plan_response", profile.model_dump())
    cached: ActionPlanResponse | None = plan_cache.get(cache_key)
    if cached is not None:
        return cached

    api_key = settings.GEMINI_API_KEY.strip()
    if not api_key:
        logger.info("No GEMINI_API_KEY found. Utilizing dynamic expert fallback engine.")
        plan = generate_dynamic_fallback_plan(profile, aqi_data)
        plan_cache.set(cache_key, plan)
        return plan

    try:
        prompt = build_gemini_prompt(profile, aqi_data)
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ActionPlanResponse,
                temperature=0.25,
            ),
        )

        if response.text:
            parsed = json.loads(response.text)
            plan = ActionPlanResponse.model_validate(parsed)
            plan.source = f"{settings.GEMINI_MODEL} (structured output)"
            plan_cache.set(cache_key, plan)
            return plan

    except Exception as exc:  # noqa: BLE001 - Resilient fallback ensures 0 downtime on any LLM or network failure
        logger.warning(f"Gemini API generation failed ({exc}). Falling back to dynamic expert plan.")

    fallback_plan = generate_dynamic_fallback_plan(profile, aqi_data)
    plan_cache.set(cache_key, fallback_plan)
    return fallback_plan
