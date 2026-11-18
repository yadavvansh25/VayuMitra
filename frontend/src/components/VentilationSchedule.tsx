import React from 'react';
import { DailyRoutineItem } from '../types';

/**
 * Props for VentilationSchedule component.
 */
interface VentilationScheduleProps {
  /** Array of chronological diurnal routine items */
  dailyRoutine: DailyRoutineItem[];
}

/**
 * Maps ventilation status identifier to WCAG-compliant badge styles and icons.
 */
function getVentilationBadge(status: string): { label: string; color: string; icon: string } {
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
}

/**
 * VentilationSchedule renders time-blocked daily ventilation guidance
 * matching diurnal boundary-layer atmospheric inversions.
 */
export const VentilationSchedule: React.FC<VentilationScheduleProps> = ({ dailyRoutine }) => {
  return (
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
        {dailyRoutine.map((item, idx) => {
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
  );
};
