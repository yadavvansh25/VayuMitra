import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ProfileForm } from './components/ProfileForm';
import { AqiBanner } from './components/AqiBanner';
import { ActionPlanView } from './components/ActionPlanView';
import { UserProfileRequest, AQIData, ActionPlanResponse } from './types';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:8000/api/v1' : '/api/v1');

const DEFAULT_PROFILE: UserProfileRequest = {
  city: 'Delhi',
  home_type: 'apartment',
  sensitive_members: ['kids', 'asthma'],
  commute_mode: 'two_wheeler',
  cooking_fuel: 'lpg',
};

export const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfileRequest>(DEFAULT_PROFILE);
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [plan, setPlan] = useState<ActionPlanResponse | null>(null);
  const [loadingAqi, setLoadingAqi] = useState<boolean>(false);
  const [loadingPlan, setLoadingPlan] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch AQI for a given city
  const fetchAQI = useCallback(async (cityName: string) => {
    setLoadingAqi(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/aqi/${encodeURIComponent(cityName)}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch air quality for ${cityName} (Status ${res.status})`);
      }
      const data: AQIData = await res.json();
      setAqiData(data);
      return data;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown network error';
      console.warn('AQI fetch notice:', errMsg);
      // Fallback data if backend is offline or network fails
      const fallback: AQIData = {
        city: cityName || 'Delhi',
        latitude: 28.6139,
        longitude: 77.209,
        pm2_5: 285.0,
        pm10: 420.0,
        us_aqi: 335,
        category: 'Severe / Hazardous',
        dominant_pollutant: 'PM2.5',
        temperature: 16.5,
        relative_humidity: 78.0,
        wind_speed: 4.2,
        is_fallback: true,
      };
      setAqiData(fallback);
      return fallback;
    } finally {
      setLoadingAqi(false);
    }
  }, []);

  // Generate full action plan via POST /api/v1/generate-plan
  const generatePlan = useCallback(
    async (overrideProfile?: UserProfileRequest) => {
      const active = overrideProfile || profile;
      setLoadingPlan(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/generate-plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(active),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.detail || `Server returned error status ${res.status}`);
        }

        const data: ActionPlanResponse = await res.json();
        setPlan(data);
        setAqiData(data.aqi_data);
        return data;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Could not generate action plan. Please check server status.';
        console.error('Plan generation error:', errMsg);
        setError(errMsg);
        return null;
      } finally {
        setLoadingPlan(false);
      }
    },
    [profile]
  );

  // Initial load for default city ("Delhi")
  useEffect(() => {
    fetchAQI(DEFAULT_PROFILE.city);
  }, [fetchAQI]);

  // Handle city quick select from Navbar with debouncing guard
  const handleCityQuickSelect = async (cityName: string) => {
    if (loadingPlan) return;
    const updated = { ...profile, city: cityName };
    setProfile(updated);
    await fetchAQI(cityName);
    generatePlan(updated);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingPlan) return; // Prevent duplicate concurrent submissions
    fetchAQI(profile.city);
    generatePlan();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* WCAG 2.1 AA Skip-to-content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* 1. Accessible Navbar */}
      <Navbar
        currentCity={profile.city}
        onCityQuickSelect={handleCityQuickSelect}
      />

      {/* Main Container */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Alert Banner */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-sm font-semibold flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-800 hover:text-rose-950 font-bold underline text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
              aria-label="Dismiss alert"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2. Real-Time AQI Banner */}
        <AqiBanner
          aqiData={aqiData}
          loading={loadingAqi}
          onRefresh={() => fetchAQI(profile.city)}
        />

        {/* 3. Household Profile Form */}
        <ProfileForm
          profile={profile}
          setProfile={setProfile}
          onSubmit={handleFormSubmit}
          loading={loadingPlan}
        />

        {/* 4. Action Plan View Results (aria-live="polite" with aria-busy state) */}
        <div
          id="action-plan-container"
          aria-live="polite"
          aria-busy={loadingPlan}
          className="transition-opacity duration-200"
        >
          {plan && <ActionPlanView plan={plan} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} VayuMitra. Open-Source Clean Air & Smog Navigation Engine.</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Powered by FastAPI, Open-Meteo Air Quality Telemetry, and Google Gemini 2.5 Flash.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
