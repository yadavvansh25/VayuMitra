import React from 'react';
import { UserProfileRequest } from '../types';

/**
 * Props for LifestyleSelectors component.
 */
interface LifestyleSelectorsProps {
  /** Current household user profile configuration */
  profile: UserProfileRequest;
  /** Callback invoked on field update */
  onChange: <K extends keyof UserProfileRequest>(key: K, value: UserProfileRequest[K]) => void;
}

/**
 * LifestyleSelectors renders accessible dropdown controls for
 * Home Architecture, Commute Mode, and Kitchen Cooking Fuel.
 */
export const LifestyleSelectors: React.FC<LifestyleSelectorsProps> = ({ profile, onChange }) => {
  return (
    <>
      {/* Home Type */}
      <div>
        <label htmlFor="home-type-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Home Architecture
        </label>
        <select
          id="home-type-select"
          value={profile.home_type}
          onChange={(e) => onChange('home_type', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 transition-shadow"
          aria-label="Home Architecture Type"
        >
          <option value="apartment">Apartment / High-Rise Flat (Stack ventilation)</option>
          <option value="independent_house">Independent Ground House (Direct dust infiltration)</option>
          <option value="villa">Villa / Low-Rise (Perimeter drafts)</option>
        </select>
      </div>

      {/* Commute Mode */}
      <div>
        <label htmlFor="commute-mode-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Primary Daily Commute
        </label>
        <select
          id="commute-mode-select"
          value={profile.commute_mode}
          onChange={(e) => onChange('commute_mode', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 transition-shadow"
          aria-label="Primary Commute Mode"
        >
          <option value="two_wheeler">Two-Wheeler (Motorbike / Scooter - Direct exhaust exposure)</option>
          <option value="car">Car (Petrol / Diesel cabin with AC)</option>
          <option value="public_transit">Public Transit (Metro / Bus)</option>
          <option value="wfh">Work From Home (WFH - Zero commute)</option>
        </select>
      </div>

      {/* Cooking / Heating Fuel */}
      <div>
        <label htmlFor="cooking-fuel-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          Kitchen Cooking & Heating Fuel
        </label>
        <select
          id="cooking-fuel-select"
          value={profile.cooking_fuel}
          onChange={(e) => onChange('cooking_fuel', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 transition-shadow"
          aria-label="Cooking and Heating Fuel Source"
        >
          <option value="lpg">LPG Cylinder / Gas Stove</option>
          <option value="png">Piped Natural Gas (PNG)</option>
          <option value="electric_induction">Electric Induction / Ceramic Cooktop (Zero indoor combustion)</option>
          <option value="biomass">Biomass / Firewood Chulha</option>
        </select>
      </div>
    </>
  );
};
