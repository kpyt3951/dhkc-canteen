import React from 'react';
import { AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';
import { DiningReminder } from '../types';

interface DiningRemindersProps {
  reminders: DiningReminder[];
}

export const DiningReminders: React.FC<DiningRemindersProps> = ({ reminders }) => {
  const activeReminders = reminders.filter((r) => r.active);
  if (activeReminders.length === 0) return null;

  return (
    <div className="mb-6 p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
        <h3 className="text-xs font-bold font-display uppercase tracking-wider text-amber-900">
          Dining Hall Etiquette & Reminders
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {activeReminders.map((rem) => (
          <div
            key={rem.id}
            className={`p-2.5 rounded-2xl flex items-start gap-2.5 text-xs transition-colors ${
              rem.priority === 'high'
                ? 'bg-amber-100/70 border border-amber-300 text-amber-950 font-medium'
                : 'bg-white border border-stone-200 text-stone-700'
            }`}
          >
            {rem.priority === 'high' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed">{rem.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
