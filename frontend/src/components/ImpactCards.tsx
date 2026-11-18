import React from 'react';
import { ActionPlanResponse } from '../types';

/**
 * Props for ImpactCards component.
 */
interface ImpactCardsProps {
  /** Complete action plan containing calculated impact metrics and AQI data */
  plan: ActionPlanResponse;
}

/**
 * ImpactCards displays quantified household metrics: PM2.5 reduction %,
 * cigarettes avoided, and CO2 emissions saved.
 */
export const ImpactCards: React.FC<ImpactCardsProps> = ({ plan }) => {
  return (
    <section aria-label="Quantified Health and Environmental Impact">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm font-bold"
            aria-hidden="true"
          >
            2
          </span>
          Quantified Household Impact
        </h2>
        <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
          Source: {plan.source}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: PM2.5 Inhalation Exposure Reduction */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-800">
            Inhaled PM2.5 Exposure Cut
          </div>
          <div className="text-4xl font-black text-teal-700 mt-2">
            {plan.impact_metrics.pm25_inhalation_reduction_pct}%
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Reduces personal exposure from{' '}
            <strong className="text-rose-700">{plan.impact_metrics.baseline_pm25_ug_m3}</strong> down to{' '}
            <strong className="text-teal-700">{plan.impact_metrics.mitigated_pm25_ug_m3} µg/m³</strong>.
          </p>
        </div>

        {/* Card 2: Cigarettes Avoided */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-900">
            Cigarette Equivalents Avoided
          </div>
          <div className="text-4xl font-black text-rose-600 mt-2">
            {plan.impact_metrics.cigarette_equivalents_avoided_daily}{' '}
            <span className="text-sm font-bold text-rose-900/60">/ day</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Based on Berkeley Earth epidemiology (22 µg/m³ 24h PM2.5 exposure ≈ 1 cigarette).
          </p>
        </div>

        {/* Card 3: Daily CO2 Saved */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-900">
            Daily CO₂ Emissions Saved
          </div>
          <div className="text-4xl font-black text-indigo-600 mt-2">
            {plan.impact_metrics.daily_co2_saved_kg}{' '}
            <span className="text-sm font-bold text-indigo-900/60">kg/day</span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            ~<strong>{plan.impact_metrics.monthly_co2_saved_kg} kg CO₂</strong> saved per month via clean commute shifts.
          </p>
        </div>

        {/* Card 4: Action Status */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/50 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            City Navigation Status
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {plan.city}
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Telemetry indexed at <strong>{plan.aqi_data.us_aqi} US AQI</strong> ({plan.aqi_data.category}).
          </p>
        </div>
      </div>
    </section>
  );
};
