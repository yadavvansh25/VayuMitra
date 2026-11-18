import React, { useState } from 'react';
import { ActionPlanResponse } from '../types';

interface ActionPlanViewProps {
  plan: ActionPlanResponse;
}

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({ plan }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyWhatsApp = async () => {
    try {
      await navigator.clipboard.writeText(plan.rwa_whatsapp_notice);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getVentilationBadge = (status: string) => {
    switch (status) {
      case 'SEAL_AND_PURIFY':
        return { label: 'Seal & Purify', color: 'bg-rose-100 text-rose-900 border-rose-300', icon: '🔒' };
      case 'STRICTLY_CLOSED':
        return { label: 'Strictly Closed', color: 'bg-amber-100 text-amber-900 border-amber-300', icon: '🛑' };
      case 'CONTROLLED_VENTILATION':
        return { label: 'Controlled Flush (15m)', color: 'bg-teal-100 text-teal-900 border-teal-300', icon: '💨' };
      default:
        return { label: 'Monitor Ambient', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: '👁️' };
    }
  };

  return (
    <div
      aria-live="polite"
      className="space-y-8 animate-fade-in"
      role="region"
      aria-label="Clean Air Action Plan Results"
    >
      {/* 1. Impact Summary Cards */}
      <section aria-label="Quantified Health and Environmental Impact">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm font-bold" aria-hidden="true">
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

      {/* 2. Time-Blocked Ventilation Schedule */}
      <section aria-label="Time-Blocked Ventilation Schedule" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="pb-3 border-b border-slate-200">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>Time-Blocked Ventilation Schedule</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Diurnal Inversion Model
            </span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Safe vs unsafe windows to open windows or run air cleaners based on winter temperature inversions.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          {plan.daily_routine.map((item, idx) => {
            const badge = getVentilationBadge(item.ventilation_status);
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                      {item.time_window}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {item.activity}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-700 pl-0 sm:pl-1 leading-relaxed">
                    {item.instructions}
                  </p>
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto flex-shrink-0 ${badge.color}`}
                >
                  <span aria-hidden="true">{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Budget Indoor Air Hacks */}
      <section aria-label="Budget Indoor Air Hacks" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="pb-3 border-b border-slate-200">
          <h3 className="text-lg font-black text-slate-900">
            Budget Indoor Air Hacks & Low-Cost Tips
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Proven low-cost DIY adaptations that drastically cut particulate infiltration without commercial air purifiers.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {plan.indoor_hacks.map((hack, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Est. {hack.estimated_cost}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    ~{hack.pm25_reduction_pct}% PM2.5 Cut
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {hack.title}
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {hack.scientific_rationale}
                </p>

                {/* Materials & Steps */}
                <div className="mt-3 pt-3 border-t border-slate-200 text-xs">
                  <div className="font-bold text-slate-700 mb-1">Materials:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                    {hack.materials.map((m, mIdx) => (
                      <li key={mIdx}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  How to implement:
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-700">
                  {hack.steps.map((st, stIdx) => (
                    <li key={stIdx}>{st}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Sustainable Alternatives */}
      <section aria-label="Sustainable Lifestyle Alternatives" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="pb-3 border-b border-slate-200">
          <h3 className="text-lg font-black text-slate-900">
            Sustainable Alternatives & Low-Emission Daily Swaps
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Targeted habit changes that protect family respiratory health while reducing carbon footprint.
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3">Current Habit</th>
                <th className="py-2.5 px-3">Sustainable Swap</th>
                <th className="py-2.5 px-3">Health & Environmental Benefit</th>
                <th className="py-2.5 px-3 text-center">CO₂ Saved</th>
                <th className="py-2.5 px-3 text-center">PM2.5 Drop</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plan.sustainable_alternatives.map((alt, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-semibold text-rose-800">
                    {alt.current_habit}
                  </td>
                  <td className="py-3 px-3 font-bold text-teal-900">
                    {alt.sustainable_alternative}
                  </td>
                  <td className="py-3 px-3 text-slate-600 leading-relaxed">
                    {alt.health_benefit}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-indigo-700 whitespace-nowrap">
                    -{alt.co2_saved_kg_day} kg/d
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full font-extrabold bg-emerald-100 text-emerald-800 text-[11px]">
                      -{alt.pm25_reduction_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. RWA / Community Notice Box */}
      <section aria-label="RWA Community WhatsApp Notice" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>RWA / Apartment Community Notice Box</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                WhatsApp Ready
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Copy-paste formatted clean-air notices into apartment tower and society WhatsApp groups.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
              copied
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
            }`}
            aria-label="Copy for WhatsApp"
          >
            {copied ? (
              <>
                <span aria-hidden="true">✓</span>
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">📋</span>
                <span>Copy for WhatsApp</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4">
          <label htmlFor="whatsapp-notice-preview" className="sr-only">
            WhatsApp Formatted Community Notice
          </label>
          <textarea
            id="whatsapp-notice-preview"
            readOnly
            value={plan.rwa_whatsapp_notice}
            rows={8}
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 leading-relaxed focus-visible:outline-none resize-none shadow-inner"
            aria-label="Pre-formatted WhatsApp Notice Content"
          />
        </div>
      </section>
    </div>
  );
};
