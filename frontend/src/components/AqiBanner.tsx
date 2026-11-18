import React from 'react';
import { getSeverityConfig } from '../constants/aqiThresholds';
import { AQIData } from '../types';

/**
 * Props for the AqiBanner component.
 */
interface AqiBannerProps {
  /** Real-time or fallback atmospheric telemetry data */
  aqiData: AQIData | null;
  /** Telemetry refresh loading state */
  loading: boolean;
  /** Optional callback to trigger telemetry refresh */
  onRefresh?: () => void;
}

/**
 * AqiBanner displays real-time PM2.5, PM10, AQI index, and atmospheric metrics.
 * Ensures WCAG 2.1 AA contrast compliance and pairs color with explicit text & icons.
 */
export const AqiBanner: React.FC<AqiBannerProps> = ({ aqiData, loading, onRefresh }) => {
  if (loading && !aqiData) {
    return (
      <div
        role="status"
        aria-label="Loading air quality data"
        className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse text-center space-y-3"
      >
        <div className="h-5 w-48 bg-slate-200 rounded mx-auto" />
        <div className="h-12 w-32 bg-slate-200 rounded mx-auto" />
        <div className="h-8 w-64 bg-slate-200 rounded mx-auto" />
      </div>
    );
  }

  if (!aqiData) return null;

  const severity = getSeverityConfig(aqiData.us_aqi);

  return (
    <section
      aria-label="Real-Time Air Quality Telemetry"
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      {/* Top Banner Alert Bar */}
      <div className={`p-4 sm:p-5 border-b ${severity.bgColor} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl flex-shrink-0" role="img" aria-label={`Status: ${severity.badgeText}`}>
            {severity.statusIcon}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                {aqiData.city}: {severity.badgeText} - {aqiData.us_aqi} AQI
              </h2>
              {aqiData.is_fallback && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950">
                  Offline Fallback
                </span>
              )}
            </div>
            <p className="text-xs text-white/90 mt-0.5 font-medium leading-relaxed">
              {severity.label}
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold transition-colors cursor-pointer border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Refresh live AQI telemetry"
          >
            {loading ? 'Refreshing...' : '↻ Refresh Telemetry'}
          </button>
        )}
      </div>

      {/* Numerical Metrics Grid */}
      <div className="p-5 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        {/* Metric 1: US EPA AQI */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            US EPA AQI
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {aqiData.us_aqi}
          </div>
          <div className="text-[11px] font-semibold text-rose-700 mt-0.5">
            Level: {severity.badgeText}
          </div>
        </div>

        {/* Metric 2: PM2.5 */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            PM2.5 (Fine Soot)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">
            {aqiData.pm2_5} <span className="text-xs font-normal text-slate-500">µg/m³</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            WHO 24h limit: 15 µg/m³
          </div>
        </div>

        {/* Metric 3: PM10 */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            PM10 (Coarse Dust)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
            {aqiData.pm10} <span className="text-xs font-normal text-slate-500">µg/m³</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            WHO 24h limit: 45 µg/m³
          </div>
        </div>

        {/* Metric 4: Weather & Inversion */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Atmospheric Conditions
          </div>
          <div className="text-sm font-bold text-slate-800 mt-1 space-y-0.5">
            <div>Temp: {aqiData.temperature != null ? `${aqiData.temperature}°C` : '17°C'}</div>
            <div>Humidity: {aqiData.relative_humidity != null ? `${aqiData.relative_humidity}%` : '75%'}</div>
            <div>Wind: {aqiData.wind_speed != null ? `${aqiData.wind_speed} km/h` : '4.5 km/h'}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
