import React from 'react';
import { ActionPlanResponse } from '../types';
import { ImpactCards } from './ImpactCards';
import { IndoorHacksList } from './IndoorHacksList';
import { RwaNoticeBox } from './RwaNoticeBox';
import { SustainableAlternativesTable } from './SustainableAlternativesTable';
import { VentilationSchedule } from './VentilationSchedule';

/**
 * Props for ActionPlanView component.
 */
interface ActionPlanViewProps {
  /** Complete action plan object returned from backend */
  plan: ActionPlanResponse;
}

/**
 * ActionPlanView orchestrates the display of quantified impact metrics,
 * time-blocked ventilation schedules, budget indoor hacks, and community circulars.
 */
export const ActionPlanView: React.FC<ActionPlanViewProps> = ({ plan }) => {
  return (
    <div
      aria-live="polite"
      className="space-y-8 animate-fade-in"
      role="region"
      aria-label="Clean Air Action Plan Results"
    >
      {/* 1. Quantified Household Impact Cards */}
      <ImpactCards plan={plan} />

      {/* 2. Diurnal Ventilation Schedule */}
      <VentilationSchedule dailyRoutine={plan.daily_routine} />

      {/* 3. Practical Budget Indoor Hacks */}
      <IndoorHacksList indoorHacks={plan.indoor_hacks} />

      {/* 4. Sustainable Daily Lifestyle Alternatives */}
      <SustainableAlternativesTable alternatives={plan.sustainable_alternatives} />

      {/* 5. Hyperlocal Community & RWA Notice Box */}
      <RwaNoticeBox noticeText={plan.rwa_whatsapp_notice} />
    </div>
  );
};
