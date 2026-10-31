import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getOffsetDateString, getTodayDateString } from '../data/initialData';
import { formatDateToReadable } from '../utils/imageHelper';

interface DateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  availableDates?: string[];
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const todayStr = getTodayDateString();
  const yesterdayStr = getOffsetDateString(-1);
  const tomorrowStr = getOffsetDateString(1);
  const dayAfterTomorrowStr = getOffsetDateString(2);

  const quickDates = [
    { label: 'Yesterday', date: yesterdayStr },
    { label: 'Today', date: todayStr },
    { label: 'Tomorrow', date: tomorrowStr },
    { label: '+2 Days', date: dayAfterTomorrowStr },
  ];

  const handleStepDay = (step: number) => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const cur = new Date(y, m - 1, d);
      cur.setDate(cur.getDate() + step);
      const ny = cur.getFullYear();
      const nm = String(cur.getMonth() + 1).padStart(2, '0');
      const nd = String(cur.getDate()).padStart(2, '0');
      onSelectDate(`${ny}-${nm}-${nd}`);
    } catch {
      onSelectDate(todayStr);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-stone-200/90 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Step Arrows & Selected Date Display */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStepDay(-1)}
            aria-label="Previous day"
            className="w-9 h-9 rounded-xl border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold font-display text-stone-900">
              {formatDateToReadable(selectedDate)}
            </span>
            {selectedDate === todayStr && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                Today
              </span>
            )}
          </div>

          <button
            onClick={() => handleStepDay(1)}
            aria-label="Next day"
            className="w-9 h-9 rounded-xl border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick buttons & calendar picker */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {quickDates.map((q) => {
              const isSelected = selectedDate === q.date;
              return (
                <button
                  key={q.date}
                  onClick={() => onSelectDate(q.date)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  {q.label}
                </button>
              );
            })}
          </div>

          {/* Native HTML5 Calendar Picker Input */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) onSelectDate(e.target.value);
              }}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
