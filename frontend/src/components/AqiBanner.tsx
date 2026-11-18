import React from 'react';
import { AQIData } from '../types';

interface AqiBannerProps {
  aqiData: AQIData | null;
  loading: boolean;
  onRefresh?: () => void;
}

export const AqiBanner: React.FC<AqiBannerProps> = ({ aqiData, loading, onRefresh }) => {
  if (loading && !aqiData) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse text-center space-y-3">
        <div className="h-5 w-48 bg-slate-200 rounded mx-auto"></div>
        <div className="h-12 w-32 bg-slate-200 rounded mx-auto"></div>
        <div className="h-8 w-64 bg-slate-200 rounded mx-auto"></div>
      </div>
    );
  }

  if (!aqiData) return null;

  // Accessible color & status icon configuration ensuring color is never the sole indicator
  const getSeverityConfig = (aqi: number) => {
    if (aqi <= 50) {
      return {
        badgeText: 'Good',
        bgColor: 'bg-emerald-900 text-emerald-50 border-emerald-700',
        badgeBg: 'bg-emerald-800 text-emerald-100',
        statusIcon: '✅',
        label: 'Air quality is satisfactory; safe for all outdoor activities.',
      };
    }
    if (aqi <= 100) {
      return {
        badgeText: 'Moderate',
        bgColor: 'bg-amber-900 text-amber-50 border-amber-700',
        badgeBg: 'bg-amber-800 text-amber-100',
        statusIcon: '⚠️',
        label: 'Acceptable air quality; unusually sensitive people should consider limiting prolonged outdoor exertion.',
      };
    }
    if (aqi <= 150) {
      return {
        badgeText: 'Unhealthy for Sensitive Groups',
        bgColor: 'bg-orange-900 text-orange-50 border-orange-700',
        badgeBg: 'bg-orange-800 text-orange-100',
        statusIcon: '⚠️',
        label: 'Members of sensitive groups (children, elderly, asthma) may experience health effects.',
      };
    }
    if (aqi <= 200) {
      return {
        badgeText: 'Unhealthy',
        bgColor: 'bg-red-950 text-red-50 border-red-800',
        badgeBg: 'bg-red-900 text-red-100',
        statusIcon: '⛔',
        label: 'Everyone may begin to experience adverse health effects; sensitive groups experience more serious effects.',
      };
    }
    if (aqi <= 300) {
      return {
        badgeText: 'Very Unhealthy',
        bgColor: 'bg-purple-950 text-purple-50 border-purple-800',
        badgeBg: 'bg-purple-900 text-purple-100',
        statusIcon: '🚨',
        label: 'Health alert: The risk of health effects is increased for all family members.',
      };
    }
    return {
      badgeText: 'Severe / Hazardous',
      bgColor: 'bg-rose-950 text-rose-50 border-rose-800',
      badgeBg: 'bg-rose-900 text-rose-100',
      statusIcon: '🛑',
      label: 'Emergency health warning: Entire population is more likely to be seriously affected. Seal windows immediately.',
    };
  };

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
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {aqiData.city}: {severity.badgeText} - {aqiData.us_aqi} AQI
              </h3>
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
