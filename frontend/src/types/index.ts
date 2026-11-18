/**
 * @fileoverview Strict TypeScript interfaces for VayuMitra matching backend Pydantic models.
 */

/**
 * Household user and environmental lifestyle parameters.
 */
export interface UserProfileRequest {
  /** Locality or city name for geocoding */
  city: string;
  /** Building architecture ('apartment', 'independent_house', 'villa') */
  home_type: string;
  /** List of vulnerable occupant identifiers ('kids', 'elderly', 'asthma') */
  sensitive_members: string[];
  /** Primary transport method ('two_wheeler', 'car', 'public_transit', 'wfh') */
  commute_mode: string;
  /** Primary kitchen fuel ('lpg', 'png', 'electric_induction', 'biomass') */
  cooking_fuel: string;
}

/**
 * Real-time atmospheric metrics and particulate matter measurements.
 */
export interface AQIData {
  /** Geographic location label */
  city: string;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** PM2.5 particulate mass concentration in µg/m³ */
  pm2_5: number;
  /** PM10 particulate mass concentration in µg/m³ */
  pm10: number;
  /** US EPA Air Quality Index value (0-500 scale) */
  us_aqi: number;
  /** Health advisory category description */
  category: string;
  /** Primary atmospheric hazard identifier */
  dominant_pollutant: string;
  /** Ambient air temperature in °C */
  temperature?: number | null;
  /** Relative humidity percentage */
  relative_humidity?: number | null;
  /** Near-surface wind speed in km/h */
  wind_speed?: number | null;
  /** Whether fallback telemetry was utilized */
  is_fallback: boolean;
}

/**
 * Diurnal ventilation and lifestyle activity block.
 */
export interface DailyRoutineItem {
  /** Clock time window for the action */
  time_window: string;
  /** Activity title */
  activity: string;
  /** Ventilation status: 'SEAL_AND_PURIFY', 'STRICTLY_CLOSED', 'CONTROLLED_VENTILATION' */
  ventilation_status: string;
  /** Tactical indoor and window management guidance */
  instructions: string;
}

/**
 * Budget DIY indoor clean air adaptation hack.
 */
export interface IndoorHackItem {
  /** Hack title */
  title: string;
  /** Estimated hardware investment */
  estimated_cost: string;
  /** Anticipated indoor PM2.5 reduction percentage */
  pm25_reduction_pct: number;
  /** Required hardware materials */
  materials: string[];
  /** Step-by-step assembly instructions */
  steps: string[];
  /** Underlying aerosol physics and fluid dynamics rationale */
  scientific_rationale: string;
}

/**
 * Quantified sustainable lifestyle alternative to reduce emissions and inhalation.
 */
export interface SustainableAlternativeItem {
  /** High-emission baseline habit */
  current_habit: string;
  /** Recommended low-carbon alternative */
  sustainable_alternative: string;
  /** Daily CO2 emissions reduction in kilograms */
  co2_saved_kg_day: number;
  /** Inhaled PM2.5 exposure reduction percentage */
  pm25_reduction_pct: number;
  /** Clinical and physiological health benefit */
  health_benefit: string;
}

/**
 * Scientifically validated personal health and carbon reduction impact metrics.
 */
export interface ImpactMetrics {
  /** Baseline daily inhaled PM2.5 in µg/m³ */
  baseline_pm25_ug_m3: number;
  /** Mitigated daily inhaled PM2.5 in µg/m³ */
  mitigated_pm25_ug_m3: number;
  /** Personal PM2.5 inhalation reduction percentage */
  pm25_inhalation_reduction_pct: number;
  /** Daily CO2 reduction in kilograms */
  daily_co2_saved_kg: number;
  /** Projected 30-day CO2 reduction in kilograms */
  monthly_co2_saved_kg: number;
  /** Berkeley Earth equivalent cigarettes avoided per day */
  cigarette_equivalents_avoided_daily: number;
}

/**
 * Complete structured action plan returned by backend engine.
 */
export interface ActionPlanResponse {
  /** Target locality */
  city: string;
  /** Atmospheric snapshot */
  aqi_data: AQIData;
  /** Chronological diurnal lifestyle schedule */
  daily_routine: DailyRoutineItem[];
  /** Practical low-cost indoor hacks */
  indoor_hacks: IndoorHackItem[];
  /** Quantified low-emission transport and energy shifts */
  sustainable_alternatives: SustainableAlternativeItem[];
  /** Validated impact metrics */
  impact_metrics: ImpactMetrics;
  /** Formatted WhatsApp community circular */
  rwa_whatsapp_notice: string;
  /** Engine identifier */
  source: string;
}
