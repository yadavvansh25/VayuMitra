import React from 'react';
import { UserProfileRequest } from '../types';
import { LifestyleSelectors } from './LifestyleSelectors';
import { SensitivitySelector } from './SensitivitySelector';

/**
 * Props for ProfileForm component.
 */
interface ProfileFormProps {
  /** Current household user profile configuration */
  profile: UserProfileRequest;
  /** State setter for profile updates */
  setProfile: React.Dispatch<React.SetStateAction<UserProfileRequest>>;
  /** Form submission handler */
  onSubmit: (e: React.FormEvent) => void;
  /** Loading state while action plan is generating */
  loading: boolean;
}

/**
 * ProfileForm collects location, housing structure, commute mode,
 * cooking fuel, and sensitivities to tailor clean air action plans.
 */
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

  const handleFieldChange = <K extends keyof UserProfileRequest>(
    key: K,
    value: UserProfileRequest[K]
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-7">
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-sm font-bold"
            aria-hidden="true"
          >
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
              onChange={(e) => handleFieldChange('city', e.target.value)}
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

        {/* Sensitive Family Members Subcomponent */}
        <SensitivitySelector
          selectedMembers={profile.sensitive_members}
          onToggle={toggleSensitivity}
        />

        {/* Housing, Commute, and Fuel Selectors */}
        <LifestyleSelectors
          profile={profile}
          onChange={handleFieldChange}
        />

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
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
