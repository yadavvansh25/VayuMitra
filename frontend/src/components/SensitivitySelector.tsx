import React from 'react';

/**
 * Definition of a sensitivity option for profiling high-risk household members.
 */
export interface SensitivityOption {
  id: string;
  label: string;
  icon: string;
}

export const SENSITIVITY_OPTIONS: SensitivityOption[] = [
  { id: 'kids', label: 'Children (< 12 yrs)', icon: '👶' },
  { id: 'elderly', label: 'Seniors (> 60 yrs)', icon: '👵' },
  { id: 'asthma', label: 'Asthma / Respiratory', icon: '🫁' },
];

/**
 * Props for SensitivitySelector component.
 */
interface SensitivitySelectorProps {
  /** Array of active sensitivity identifiers selected by user */
  selectedMembers: string[];
  /** Callback triggered when a sensitivity checkbox is toggled */
  onToggle: (memberId: string) => void;
}

/**
 * SensitivitySelector allows users to declare high-risk household members
 * with accessible focus rings and explicit state indicators.
 */
export const SensitivitySelector: React.FC<SensitivitySelectorProps> = ({
  selectedMembers,
  onToggle,
}) => {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-bold uppercase tracking-wider text-slate-700">
        Vulnerable Family Members (Select all that apply)
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {SENSITIVITY_OPTIONS.map((item) => {
          const isChecked = selectedMembers.includes(item.id);
          return (
            <label
              key={item.id}
              htmlFor={`sensitivity-${item.id}`}
              aria-pressed={isChecked}
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
                onChange={() => onToggle(item.id)}
                aria-checked={isChecked}
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
  );
};
