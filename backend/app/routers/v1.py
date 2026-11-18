"""API v1 routers: /health, /aqi/{city}, and /generate-plan with SlowAPI rate limiting."""

import logging
from datetime import UTC, datetime

from app.core.cache import aqi_cache, plan_cache
from app.core.config import get_settings
from app.core.security import detect_prompt_injection, limiter, sanitize_input
from app.models.schemas import ActionPlanResponse, AQIData, UserProfileRequest
from app.services.aqi_service import get_city_aqi
from app.services.gemini_service import generate_action_plan
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter(prefix=settings.API_V1_STR, tags=["VayuMitra API v1"])


class HealthStatus(BaseModel):
    status: str
    project: str
    version: str
    gemini_configured: bool
    gemini_model: str
    aqi_cache_size: int
    plan_cache_size: int
    timestamp: str


@router.get("/health", response_model=HealthStatus)
@limiter.limit("60/minute")
async def health_check(request: Request) -> HealthStatus:
    """Return system health status and configuration."""
    return HealthStatus(
        status="healthy",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        gemini_configured=bool(settings.GEMINI_API_KEY.strip()),
        gemini_model=settings.GEMINI_MODEL,
        aqi_cache_size=aqi_cache.size(),
        plan_cache_size=plan_cache.size(),
        timestamp=datetime.now(UTC).isoformat(),
    )


@router.get("/aqi/{city}", response_model=AQIData)
@limiter.limit("60/minute")
async def get_aqi_by_city(city: str, request: Request) -> AQIData:
    """Fetch real-time PM2.5, PM10, and US AQI for any city via Open-Meteo."""
    clean_city = sanitize_input(city, max_length=100)
    if not clean_city or len(clean_city) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid city name of at least 2 characters is required.",
        )
    return await get_city_aqi(clean_city)


@router.post("/generate-plan", response_model=ActionPlanResponse)
@limiter.limit("30/minute")
async def create_action_plan(
    profile: UserProfileRequest, request: Request
) -> ActionPlanResponse:
    """
    Generate structured GenAI action plan and indoor hacks
    tailored to the user's location, home type, commute, and sensitivities.
    """
    # Prompt injection check
    if detect_prompt_injection(profile.city):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid input detected. Please provide a standard city or locality name.",
        )

    # Sanitize user inputs
    profile.city = sanitize_input(profile.city, max_length=100)
    profile.home_type = sanitize_input(profile.home_type, max_length=50)
    profile.commute_mode = sanitize_input(profile.commute_mode, max_length=50)
    profile.cooking_fuel = sanitize_input(profile.cooking_fuel, max_length=50)
    profile.sensitive_members = [
        sanitize_input(s, max_length=50) for s in profile.sensitive_members
    ]

    # Fetch live or cached AQI telemetry for the city
    aqi_data = await get_city_aqi(profile.city)

    # Generate plan via Gemini or robust dynamic fallback engine
    return await generate_action_plan(profile, aqi_data)
