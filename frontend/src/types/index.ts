/** Strict TypeScript interfaces for VayuMitra matching backend models */

export interface UserProfileRequest {
  city: string;
  home_type: string;
  sensitive_members: string[];
  commute_mode: string;
  cooking_fuel: string;
}

export interface AQIData {
  city: string;
  latitude: number;
  longitude: number;
  pm2_5: number;
  pm10: number;
  us_aqi: number;
  category: string;
  dominant_pollutant: string;
  temperature?: number | null;
  relative_humidity?: number | null;
  wind_speed?: number | null;
  is_fallback: boolean;
}

export interface DailyRoutineItem {
  time_window: string;
  activity: string;
  ventilation_status: string;
  instructions: string;
}

export interface IndoorHackItem {
  title: string;
  estimated_cost: string;
  pm25_reduction_pct: number;
  materials: string[];
  steps: string[];
  scientific_rationale: string;
}

export interface SustainableAlternativeItem {
  current_habit: string;
  sustainable_alternative: string;
  co2_saved_kg_day: number;
  pm25_reduction_pct: number;
  health_benefit: string;
}

export interface ImpactMetrics {
  baseline_pm25_ug_m3: number;
  mitigated_pm25_ug_m3: number;
  pm25_inhalation_reduction_pct: number;
  daily_co2_saved_kg: number;
  monthly_co2_saved_kg: number;
  cigarette_equivalents_avoided_daily: number;
}

export interface ActionPlanResponse {
  city: string;
  aqi_data: AQIData;
  daily_routine: DailyRoutineItem[];
  indoor_hacks: IndoorHackItem[];
  sustainable_alternatives: SustainableAlternativeItem[];
  impact_metrics: ImpactMetrics;
  rwa_whatsapp_notice: string;
  source: string;
}
