/**
 * @fileoverview US EPA AQI thresholds, accessible WCAG color mappings, and status icons.
 * Ensures state is never communicated through color alone.
 */

export interface AQISeverityConfig {
  badgeText: string;
  bgColor: string;
  badgeBg: string;
  statusIcon: string;
  label: string;
}

/**
 * Returns accessible severity styling and status icons for a given AQI score.
 *
 * @param aqi - Numerical US EPA AQI value (0-500)
 * @returns AQISeverityConfig with contrast-compliant CSS classes and labels
 */
export function getSeverityConfig(aqi: number): AQISeverityConfig {
  if (aqi <= 50) {
    return {
      badgeText: 'Good',
      bgColor: 'bg-emerald-900 text-emerald-50 border-emerald-700',
      badgeBg: 'bg-emerald-800 text-emerald-100',
      statusIcon: '✅',
      label: 'Air quality is satisfactory; safe for all outdoor activities.',
    };
  }
  if (aqi <= 100) {
    return {
      badgeText: 'Moderate',
      bgColor: 'bg-amber-900 text-amber-50 border-amber-700',
      badgeBg: 'bg-amber-800 text-amber-100',
      statusIcon: '⚠️',
      label: 'Acceptable air quality; unusually sensitive individuals should limit prolonged outdoor exertion.',
    };
  }
  if (aqi <= 150) {
    return {
      badgeText: 'Unhealthy for Sensitive Groups',
      bgColor: 'bg-orange-900 text-orange-50 border-orange-700',
      badgeBg: 'bg-orange-800 text-orange-100',
      statusIcon: '⚠️',
      label: 'Members of sensitive groups (children, seniors, asthma) may experience health effects.',
    };
  }
  if (aqi <= 200) {
    return {
      badgeText: 'Unhealthy',
      bgColor: 'bg-red-950 text-red-50 border-red-800',
      badgeBg: 'bg-red-900 text-red-100',
      statusIcon: '⛔',
      label: 'Everyone may begin to experience adverse health effects; sensitive groups experience serious effects.',
    };
  }
  if (aqi <= 300) {
    return {
      badgeText: 'Very Unhealthy',
      bgColor: 'bg-purple-950 text-purple-50 border-purple-800',
      badgeBg: 'bg-purple-900 text-purple-100',
      statusIcon: '🚨',
      label: 'Health alert: Risk of serious health effects is substantially increased for all family members.',
    };
  }
  return {
    badgeText: 'Severe / Hazardous',
    bgColor: 'bg-rose-950 text-rose-50 border-rose-800',
    badgeBg: 'bg-rose-900 text-rose-100',
    statusIcon: '🛑',
    label: 'Emergency health warning: Entire population is likely affected. Keep windows strictly sealed.',
  };
}

export const POPULAR_CITIES = ['Delhi', 'Gurugram', 'Noida', 'Mumbai', 'Lahore'] as const;
