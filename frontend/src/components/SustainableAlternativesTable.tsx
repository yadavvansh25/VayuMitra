import React from 'react';
import { SustainableAlternativeItem } from '../types';

/**
 * Props for SustainableAlternativesTable component.
 */
interface SustainableAlternativesTableProps {
  /** Array of quantified low-emission alternative lifestyle swaps */
  alternatives: SustainableAlternativeItem[];
}

/**
 * SustainableAlternativesTable renders quantified lifestyle and transport swaps
 * with explicit CO2 reductions and personal particulate exposure benefits.
 */
export const SustainableAlternativesTable: React.FC<SustainableAlternativesTableProps> = ({
  alternatives,
}) => {
  return (
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
            {alternatives.map((alt, idx) => (
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
  );
};
