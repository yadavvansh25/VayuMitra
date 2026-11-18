import React from 'react';
import { UserProfileRequest } from '../types';

interface ProfileFormProps {
  profile: UserProfileRequest;
  setProfile: React.Dispatch<React.SetStateAction<UserProfileRequest>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  setProfile,
  onSubmit,
  loading,
}) => {
  const toggleSensitivity = (member: string) => {
    setProfile((prev) => {
      const exists = prev.sensitive_members.includes(member);
      const updated = exists
        ? prev.sensitive_members.filter((m) => m !== member)
        : [...prev.sensitive_members, member];
      return { ...prev, sensitive_members: updated };
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-7">
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm font-bold" aria-hidden="true">
            1
          </span>
          Household & Lifestyle Profiler
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Customize ventilation hours and low-emission routines for your family's exact health needs.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6" aria-label="Household Profile Form">
        {/* City Input */}
        <div>
          <label htmlFor="city-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            City or Locality <span className="text-rose-600" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <input
              id="city-input"
              type="text"
              required
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              placeholder="e.g. Delhi, Gurugram, Mumbai, Lahore"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:border-teal-600 transition-shadow"
              aria-required="true"
              aria-label="City or Locality name"
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Used to query live Open-Meteo PM2.5, PM10, and hourly diurnal curves.
          </span>
        </div>

        {/* Home Type */}
        <div>
          <label htmlFor="home-type-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Home Architecture
          </label>
          <select
            id="home-type-select"
            value={profile.home_type}
            onChange={(e) => setProfile({ ...profile, home_type: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 transition-shadow"
            aria-label="Home Architecture Type"
          >
            <option value="apartment">Apartment / High-Rise Flat (Stack ventilation)</option>
            <option value="independent_house">Independent Ground House (Direct dust infiltration)</option>
            <option value="villa">Villa / Low-Rise (Perimeter drafts)</option>
          </select>
        </div>

        {/* Sensitive Family Members */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Vulnerable Family Members (Select all that apply)
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {[
              { id: 'kids', label: 'Children (< 12 yrs)', icon: '👶' },
              { id: 'elderly', label: 'Seniors (> 60 yrs)', icon: '👵' },
              { id: 'asthma', label: 'Asthma / Respiratory', icon: '🫁' },
            ].map((item) => {
              const isChecked = profile.sensitive_members.includes(item.id);
              return (
                <label
                  key={item.id}
                  htmlFor={`sensitivity-${item.id}`}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'border-teal-600 bg-teal-50/80 text-teal-950 font-bold ring-1 ring-teal-600'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 font-medium'
                  }`}
                >
                  <input
                    id={`sensitivity-${item.id}`}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSensitivity(item.id)}
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer accent-teal-600"
                    aria-label={item.label}
                  />
                  <span className="text-sm flex items-center gap-1.5">
                    <span aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Commute Mode */}
        <div>
          <label htmlFor="commute-mode-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Primary Daily Commute
          </label>
          <select
            id="commute-mode-select"
            value={profile.commute_mode}
            onChange={(e) => setProfile({ ...profile, commute_mode: e.target.value })}
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
            onChange={(e) => setProfile({ ...profile, cooking_fuel: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 transition-shadow"
            aria-label="Cooking and Heating Fuel Source"
          >
            <option value="lpg">LPG Cylinder / Gas Stove</option>
            <option value="png">Piped Natural Gas (PNG)</option>
            <option value="electric_induction">Electric Induction / Ceramic Cooktop (Zero indoor combustion)</option>
            <option value="biomass">Biomass / Firewood Chulha</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-extrabold text-base shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Generate Clean Air Action Plan"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-5 h-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Analyzing Smog & Synthesizing Action Plan...</span>
              </>
            ) : (
              <>
                <span>Generate Clean Air Action Plan</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
