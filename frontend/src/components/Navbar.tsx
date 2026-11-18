import React from 'react';
import { POPULAR_CITIES } from '../constants/aqiThresholds';

/**
 * Props for the Navbar component.
 */
interface NavbarProps {
  /** Currently selected city name */
  currentCity?: string;
  /** Callback invoked when a user clicks a city hotspot quick-select */
  onCityQuickSelect?: (city: string) => void;
}

/**
 * Navbar renders semantic `<header>` and `<nav>` landmarks, brand identity,
 * regional hotspot buttons, and live system status indicators.
 */
export const Navbar: React.FC<NavbarProps> = ({ currentCity, onCityQuickSelect }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <nav
        aria-label="Main Navigation"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4"
      >
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-sm"
            aria-hidden="true"
          >
            VM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-tight text-white m-0 p-0 leading-tight">
                Vayu<span className="text-teal-400">Mitra</span>
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-bold rounded-full bg-teal-900/80 text-teal-300 border border-teal-700/60">
                Smog Action Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Clean Air & Winter Smog Assistant for Urban Homes
            </p>
          </div>
        </div>

        {/* Popular Cities Hotspots */}
        {onCityQuickSelect && (
          <div className="hidden md:flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">Hotspots:</span>
            {POPULAR_CITIES.map((c) => {
              const isSelected = currentCity?.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onCityQuickSelect(c)}
                  aria-pressed={isSelected}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 cursor-pointer ${
                    isSelected
                      ? 'bg-teal-500 text-slate-950 shadow-xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                  aria-label={`Select hotspot ${c}`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}

        {/* Live System Indicator */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300"
            role="status"
            aria-live="polite"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="hidden sm:inline">Telemetry:</span>
            <span className="font-semibold text-emerald-400">Open-Meteo Active</span>
          </div>
        </div>
      </nav>
    </header>
  );
};
