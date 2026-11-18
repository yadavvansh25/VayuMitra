import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../src/App';
import { AQIData, ActionPlanResponse } from '../src/types';

const mockAqiResponse: AQIData = {
  city: 'Delhi',
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
  is_fallback: false,
};

const mockPlanResponse: ActionPlanResponse = {
  city: 'Delhi',
  aqi_data: mockAqiResponse,
  daily_routine: [
    {
      time_window: '05:30 - 09:30',
      activity: 'Morning Radiative Inversion Lock',
      ventilation_status: 'SEAL_AND_PURIFY',
      instructions: 'Keep all external doors sealed.',
    },
    {
      time_window: '12:00 - 15:30',
      activity: 'Midday Thermal Window',
      ventilation_status: 'CONTROLLED_VENTILATION',
      instructions: 'Open opposing windows for 15 minutes if AQI dips.',
    },
  ],
  indoor_hacks: [
    {
      title: 'DIY Corsi-Rosenthal Box Air Filter',
      estimated_cost: '₹1,200 - ₹1,800',
      pm25_reduction_pct: 82.0,
      materials: ['Box fan', 'MERV 13 filters', 'Duct tape'],
      steps: ['Tape filters to fan', 'Seal bottom cardboard'],
      scientific_rationale: 'High CADR particulate capture',
    },
  ],
  sustainable_alternatives: [
    {
      current_habit: 'Solo petrol car commute',
      sustainable_alternative: 'Electric metro rail',
      co2_saved_kg_day: 3.2,
      pm25_reduction_pct: 90.0,
      health_benefit: 'Cuts roadside tailpipe soot inhalation',
    },
  ],
  impact_metrics: {
    baseline_pm25_ug_m3: 210.0,
    mitigated_pm25_ug_m3: 45.0,
    pm25_inhalation_reduction_pct: 78.5,
    daily_co2_saved_kg: 3.2,
    monthly_co2_saved_kg: 96.0,
    cigarette_equivalents_avoided_daily: 7.5,
  },
  rwa_whatsapp_notice: '🚨 *URGENT CLEAN AIR ADVISORY: DELHI*\n📊 *Current AQI:* 335',
  source: 'deterministic-expert-engine',
};

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/v1/aqi/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAqiResponse),
        });
      }
      if (url.includes('/api/v1/generate-plan')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPlanResponse),
        });
      }
      return Promise.reject(new Error(`Unhandled mock URL: ${url}`));
    })
  );
});

describe('VayuMitra Frontend Components & Accessibility Tests', () => {
  it('1. Renders semantic header, navigation, and high-contrast branding with WCAG 2.1 AA landmarks', async () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /Main Navigation/i })).toBeInTheDocument();
    expect(screen.getByText(/Skip to main content/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/VayuMitra/i);
    expect(screen.getAllByText(/Vayu/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mitra/i).length).toBeGreaterThan(0);

    // Await async initial AQI fetch resolution
    await waitFor(() => {
      expect(screen.getByText(/Severe \/ Hazardous - 335 AQI/i)).toBeInTheDocument();
    });
  });

  it('2. Renders accessible ProfileForm with default City "Delhi" and accessibility attributes', async () => {
    render(<App />);

    // Await async initial AQI fetch resolution
    await waitFor(() => {
      expect(screen.getByText(/Severe \/ Hazardous - 335 AQI/i)).toBeInTheDocument();
    });

    // Check city input by its accessible label
    const cityInput = screen.getByLabelText(/City or Locality/i);
    expect(cityInput).toBeInTheDocument();
    expect(cityInput).toHaveValue('Delhi');

    // Check Home Architecture select
    const homeSelect = screen.getByLabelText(/Home Architecture Type/i);
    expect(homeSelect).toBeInTheDocument();

    // Check Sensitive Family Members checkboxes
    const kidsCheckbox = screen.getByRole('checkbox', { name: /Children \(< 12 yrs\)/i });
    const elderlyCheckbox = screen.getByRole('checkbox', { name: /Seniors \(> 60 yrs\)/i });
    const asthmaCheckbox = screen.getByRole('checkbox', { name: /Asthma \/ Respiratory/i });

    expect(kidsCheckbox).toBeInTheDocument();
    expect(elderlyCheckbox).toBeInTheDocument();
    expect(asthmaCheckbox).toBeInTheDocument();

    // Toggle a checkbox
    fireEvent.click(elderlyCheckbox);
    expect(elderlyCheckbox).toBeChecked();

    // Check Commute and Cooking Fuel selects
    expect(screen.getByLabelText(/Primary Commute Mode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cooking and Heating Fuel Source/i)).toBeInTheDocument();
  });

  it('3. Renders AqiBanner with explicit severity text labels, status icons, and numerical telemetry', async () => {
    render(<App />);

    await waitFor(() => {
      // Must display explicit severity text paired with AQI number (not just color)
      expect(screen.getByText(/Severe \/ Hazardous - 335 AQI/i)).toBeInTheDocument();
      expect(screen.getByText(/PM2.5 \(Fine Soot\)/i)).toBeInTheDocument();
      expect(screen.getByText(/PM10 \(Coarse Dust\)/i)).toBeInTheDocument();
      expect(screen.getByText(/285/)).toBeInTheDocument();
    });
  });

  it('4. Submits profile and renders ActionPlanView with aria-live="polite", impact cards, routine, hacks, and WhatsApp notice', async () => {
    render(<App />);

    const submitBtn = screen.getByRole('button', { name: /Generate Clean Air Action Plan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      // 1. Check aria-live region
      const liveRegion = screen.getByRole('region', { name: /Clean Air Action Plan Results/i });
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');

      // 2. Impact Summary Cards
      expect(screen.getByText(/Inhaled PM2.5 Exposure Cut/i)).toBeInTheDocument();
      expect(screen.getByText(/78.5%/)).toBeInTheDocument();
      expect(screen.getByText(/Cigarette Equivalents Avoided/i)).toBeInTheDocument();
      expect(screen.getByText(/7.5/)).toBeInTheDocument();

      // 3. Time-Blocked Ventilation Schedule
      expect(screen.getByText(/Morning Radiative Inversion Lock/i)).toBeInTheDocument();
      expect(screen.getByText(/Midday Thermal Window/i)).toBeInTheDocument();

      // 4. Budget Indoor Air Hacks
      expect(screen.getByText(/DIY Corsi-Rosenthal Box Air Filter/i)).toBeInTheDocument();

      // 5. Sustainable Alternatives
      expect(screen.getByText(/Solo petrol car commute/i)).toBeInTheDocument();
      expect(screen.getByText(/Electric metro rail/i)).toBeInTheDocument();

      // 6. RWA WhatsApp Notice Box
      expect(screen.getByText(/RWA \/ Apartment Community Notice Box/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Copy for WhatsApp/i })).toBeInTheDocument();
    });
  });

  it('5. Allows copying the RWA WhatsApp notice with confirmation feedback', async () => {
    // Mock navigator.clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<App />);

    const submitBtn = screen.getByRole('button', { name: /Generate Clean Air Action Plan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Copy for WhatsApp/i })).toBeInTheDocument();
    });

    const copyBtn = screen.getByRole('button', { name: /Copy for WhatsApp/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
      expect(screen.getByText(/Copied to Clipboard!/i)).toBeInTheDocument();
    });
  });

  it('6. Allows switching cities via hotspot quick-select buttons with aria-pressed state', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Severe \/ Hazardous - 335 AQI/i)).toBeInTheDocument();
    });

    const gurugramBtn = screen.getByRole('button', { name: /Select hotspot Gurugram/i });
    expect(gurugramBtn).toBeInTheDocument();
    expect(gurugramBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(gurugramBtn);

    await waitFor(() => {
      const cityInput = screen.getByLabelText(/City or Locality/i);
      expect(cityInput).toHaveValue('Gurugram');
    });
  });

  it('7. Displays accessible role="alert" banner on network or API failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/v1/generate-plan')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ detail: 'Simulated backend error' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAqiResponse),
        });
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Severe \/ Hazardous - 335 AQI/i)).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /Generate Clean Air Action Plan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('aria-live', 'assertive');
      expect(screen.getByText(/Simulated backend error/i)).toBeInTheDocument();
    });
  });
});
