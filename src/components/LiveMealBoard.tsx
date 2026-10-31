import React, { useState, useEffect } from 'react';
import { Clock, UtensilsCrossed, Sparkles, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { FoodItem, MealCategoryConfig, MEAL_CATEGORIES } from '../types';
import { storage } from '../services/storage';

interface LiveMealBoardProps {
  todayItems: FoodItem[];
  onSelectCategory?: (catId: string) => void;
}

export const LiveMealBoard: React.FC<LiveMealBoardProps> = ({ todayItems, onSelectCategory }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [categories, setCategories] = useState<MealCategoryConfig[]>(storage.getMealCategories());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setCategories(storage.getMealCategories());
    });
    return unsub;
  }, []);

  // Helper to parse HH:mm to minutes from start of day
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentSeconds = currentTime.getSeconds();

  // Determine current, next, and meal statuses
  let currentServingMeal: { config: MealCategoryConfig; minutesLeft: number } | null = null;
  let nextUpcomingMeal: { config: MealCategoryConfig; minutesUntilStart: number } | null = null;

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const start = toMinutes(cat.startTime);
    const end = toMinutes(cat.endTime);

    if (currentMinutes >= start && currentMinutes < end) {
      currentServingMeal = {
        config: cat,
        minutesLeft: end - currentMinutes
      };
    } else if (currentMinutes < start && !nextUpcomingMeal) {
      nextUpcomingMeal = {
        config: cat,
        minutesUntilStart: start - currentMinutes
      };
    }
  }

  // If no next meal found today (past dinner), wrap around to tomorrow's first meal (morning tea)
  if (!currentServingMeal && !nextUpcomingMeal && categories.length > 0) {
    const firstMeal = categories[0];
    const startTomorrow = 24 * 60 - currentMinutes + toMinutes(firstMeal.startTime);
    nextUpcomingMeal = {
      config: firstMeal,
      minutesUntilStart: startTomorrow
    };
  }

  const formatCountdown = (totalMinutes: number) => {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const secs = 59 - currentSeconds;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs < 10 ? `0${secs}` : secs}s`;
    }
    return `${mins}m ${secs < 10 ? `0${secs}` : secs}s`;
  };

  const activeItems = currentServingMeal
    ? todayItems.filter((item) => item.mealCategory === currentServingMeal?.config.id)
    : nextUpcomingMeal
    ? todayItems.filter((item) => item.mealCategory === nextUpcomingMeal?.config.id)
    : [];

  return (
    <div className="rounded-3xl bg-linear-to-br from-stone-900 via-stone-900 to-stone-950 text-white p-5 sm:p-6 shadow-xl border border-stone-800 mb-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <h2 className="text-xs font-bold tracking-widest text-amber-400 uppercase font-mono">
              Live Dining Board
            </h2>
            <p className="text-[11px] text-stone-400">
              Campus Time:{' '}
              <span className="font-mono text-stone-200">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800/80 border border-stone-700 text-xs font-medium text-stone-300">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>5 Daily Shifts</span>
        </div>
      </div>

      {/* Core Live Status Display */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
        {/* CURRENT MEAL / STATUS */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Current Status
              </span>
              {currentServingMeal ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> NOW SERVING
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  BETWEEN SHIFTS
                </span>
              )}
            </div>

            {currentServingMeal ? (
              <>
                <h3 className="text-xl font-bold font-display text-white">
                  {currentServingMeal.config.name}
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  Scheduled:{' '}
                  <span className="font-mono font-medium text-amber-300">
                    {currentServingMeal.config.defaultTime}
                  </span>
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xs text-stone-400">Ends in:</span>
                  <span className="font-mono text-lg font-extrabold text-emerald-400 tracking-tight">
                    {formatCountdown(currentServingMeal.minutesLeft)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold font-display text-white">
                  Kitchen Prep in Progress
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Chefs are preparing fresh ingredients for the upcoming meal shift.
                </p>
              </>
            )}
          </div>

          {currentServingMeal && onSelectCategory && (
            <button
              onClick={() => onSelectCategory(currentServingMeal.config.id)}
              className="mt-4 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start group transition-colors"
            >
              <span>View serving items ({activeItems.length})</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* NEXT UPCOMING MEAL */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Next Shift
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                UPCOMING
              </span>
            </div>

            {nextUpcomingMeal ? (
              <>
                <h3 className="text-xl font-bold font-display text-white">
                  {nextUpcomingMeal.config.name}
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  Scheduled:{' '}
                  <span className="font-mono font-medium text-amber-300">
                    {nextUpcomingMeal.config.defaultTime}
                  </span>
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xs text-stone-400">Starts in:</span>
                  <span className="font-mono text-lg font-extrabold text-amber-400 tracking-tight">
                    {formatCountdown(nextUpcomingMeal.minutesUntilStart)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-stone-400">All shifts completed for today.</p>
            )}
          </div>

          {nextUpcomingMeal && onSelectCategory && (
            <button
              onClick={() => onSelectCategory(nextUpcomingMeal.config.id)}
              className="mt-4 text-xs font-semibold text-stone-300 hover:text-white flex items-center gap-1 self-start group transition-colors"
            >
              <span>Preview upcoming menu</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Mini Active Items ticker/pills */}
      {activeItems.length > 0 && (
        <div className="relative z-10 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            On Today's Counter:
          </span>
          {activeItems.map((item) => (
            <span
              key={item.id}
              className="text-xs px-2.5 py-1 rounded-lg bg-stone-800 text-amber-200 border border-stone-700/80 font-medium truncate max-w-[200px]"
            >
              {item.foodName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
