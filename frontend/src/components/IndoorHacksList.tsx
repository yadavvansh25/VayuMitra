import React from 'react';
import { IndoorHackItem } from '../types';

/**
 * Props for IndoorHacksList component.
 */
interface IndoorHacksListProps {
  /** Array of budget clean air hack recommendations */
  indoorHacks: IndoorHackItem[];
}

/**
 * IndoorHacksList renders practical, low-cost indoor particulate mitigation
 * strategies (e.g. DIY Corsi-Rosenthal box filter, saline mopping).
 */
export const IndoorHacksList: React.FC<IndoorHacksListProps> = ({ indoorHacks }) => {
  return (
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
        {indoorHacks.map((hack, idx) => (
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
  );
};
