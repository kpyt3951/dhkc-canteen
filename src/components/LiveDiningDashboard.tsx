import React, { useState, useEffect } from 'react';
import {
  Coffee,
  UtensilsCrossed,
  Salad,
  CupSoda,
  Moon,
  Disc,
  GlassWater,
  Shield,
  Layers,
  Lock,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { FoodItem, MealCategoryConfig, MealCategory } from '../types';
import { storage } from '../services/storage';

interface LiveDiningDashboardProps {
  todayItems: FoodItem[];
  mealConfigs: MealCategoryConfig[];
  onOpenAdminDashboard?: () => void;
}

// Convert 24h time "HH:mm" to minutes from start of day
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const isPM = /pm/i.test(timeStr);
  const isAM = /am/i.test(timeStr);
  const clean = timeStr.replace(/[^0-9:]/g, '');
  const [hStr, mStr] = clean.split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

// Format 24h "HH:mm" to 12h "hh:mm AM/PM"
function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  if (/am|pm/i.test(timeStr)) return timeStr;
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10) || 0;
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const hDisplay = String(h).padStart(2, '0');
  const mDisplay = String(m).padStart(2, '0');
  return `${hDisplay}:${mDisplay} ${ampm}`;
}

function formatCountdown(totalSecs: number): string {
  if (totalSecs <= 0) return '00 : 00 : 00';
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${String(hrs).padStart(2, '0')} : ${String(mins).padStart(2, '0')} : ${String(secs).padStart(2, '0')}`;
}

export const LiveDiningDashboard: React.FC<LiveDiningDashboardProps> = ({
  todayItems,
  mealConfigs
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Equipment & tracking stats
  const [plateCount, setPlateCount] = useState(storage.getPlateCount());
  const [glassCount, setGlassCount] = useState(storage.getGlassCount());
  const [tableEquipment, setTableEquipment] = useState(storage.getTableEquipment());
  const [reminders, setReminders] = useState(storage.getReminders());

  // Clock tick every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Subscribe to storage changes for live equipment & reminders updates
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setPlateCount(storage.getPlateCount());
      setGlassCount(storage.getGlassCount());
      setTableEquipment(storage.getTableEquipment());
      setReminders(storage.getReminders());
    });
    return unsub;
  }, []);

  // Safe percentage calculation for Plates
  const totalPlates = plateCount.total || 0;
  const availablePlates = plateCount.available || 0;
  const missingPlates = plateCount.missing || 0;
  const availablePlatePercentage =
    totalPlates > 0
      ? Math.min(100, Math.max(0, Math.round((availablePlates / totalPlates) * 100)))
      : 0;

  // Safe percentage calculation for Glasses
  const totalGlasses = glassCount.total || 0;
  const availableGlasses = glassCount.available || 0;
  const missingGlasses = glassCount.missing || 0;
  const availableGlassPercentage =
    totalGlasses > 0
      ? Math.min(100, Math.max(0, Math.round((availableGlasses / totalGlasses) * 100)))
      : 0;

  // Equipment stats for Jugs and other table items
  const jugsItem = tableEquipment.find((i) => i.name.toLowerCase().includes('jug')) || {
    totalQuantity: 26,
    availableQuantity: 26
  };
  const locksOrTrays = tableEquipment.find(
    (i) => i.name.toLowerCase().includes('tray') || i.name.toLowerCase().includes('lock')
  ) || {
    totalQuantity: 25,
    availableQuantity: 3
  };

  // 5 Canonical meal definitions
  const mealDefinitions: Array<{
    id: MealCategory;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultFood: string;
  }> = [
    {
      id: 'morning_tea',
      name: 'MORNING TEA & SNACKS',
      icon: Coffee,
      defaultFood: 'Tea & Biscuits'
    },
    {
      id: 'breakfast',
      name: 'BREAKFAST',
      icon: UtensilsCrossed,
      defaultFood: 'Paratha & Egg'
    },
    {
      id: 'lunch',
      name: 'LUNCH',
      icon: Salad,
      defaultFood: 'Rice & Dal'
    },
    {
      id: 'evening_tea',
      name: 'EVENING TEA & SNACKS',
      icon: CupSoda,
      defaultFood: 'Tea & Snacks'
    },
    {
      id: 'dinner',
      name: 'DINNER',
      icon: Moon,
      defaultFood: 'Rice & Curry'
    }
  ];

  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const nowSeconds = currentTime.getSeconds();

  // Compute status and food for all 5 rows
  const fiveRows = mealDefinitions.map((def) => {
    const config = mealConfigs.find((c) => c.id === def.id) || {
      startTime: '07:00',
      endTime: '08:00',
      defaultTime: '07:00 AM - 08:00 AM'
    };

    const startMin = parseTimeToMinutes(config.startTime);
    const endMin = parseTimeToMinutes(config.endTime);

    let status: 'UPCOMING' | 'NOW SERVING' | 'SERVED';
    if (nowMinutes < startMin) {
      status = 'UPCOMING';
    } else if (nowMinutes >= startMin && nowMinutes <= endMin) {
      status = 'NOW SERVING';
    } else {
      status = 'SERVED';
    }

    // Get food item for this meal category today
    const items = todayItems.filter((i) => i.mealCategory === def.id);
    let foodName = def.defaultFood;
    if (items.length > 0) {
      foodName = items.map((i) => i.foodName).join(' • ');
    }

    const timeRange = `${formatTime12h(config.startTime)}-${formatTime12h(config.endTime)}`;

    return {
      ...def,
      config,
      startMin,
      endMin,
      status,
      foodName,
      timeRange
    };
  });

  // Determine active hero card state:
  // 1. Currently Serving Meal
  // 2. Next Upcoming Meal
  // 3. Or Day Finished -> Next Morning Meal
  let heroState: {
    badgeText: string;
    badgeType: 'serving' | 'upnext' | 'closed';
    categoryName: string;
    foodName: string;
    timeRange: string;
    timerLabel: string;
    secondsRemaining: number;
    scheduledText: string;
  };

  const currentServingRow = fiveRows.find((r) => r.status === 'NOW SERVING');
  const nextUpcomingRow = fiveRows.find((r) => r.status === 'UPCOMING');

  if (currentServingRow) {
    const secsLeft = currentServingRow.endMin * 60 - (nowMinutes * 60 + nowSeconds);
    heroState = {
      badgeText: 'NOW SERVING',
      badgeType: 'serving',
      categoryName: currentServingRow.name,
      foodName: currentServingRow.foodName,
      timeRange: currentServingRow.timeRange,
      timerLabel: 'CLOSES IN',
      secondsRemaining: Math.max(0, secsLeft),
      scheduledText: `serving until ${formatTime12h(currentServingRow.config.endTime)}`
    };
  } else if (nextUpcomingRow) {
    const secsLeft = nextUpcomingRow.startMin * 60 - (nowMinutes * 60 + nowSeconds);
    heroState = {
      badgeText: 'BETWEEN MEALS • UP NEXT',
      badgeType: 'upnext',
      categoryName: nextUpcomingRow.name,
      foodName: nextUpcomingRow.foodName,
      timeRange: nextUpcomingRow.timeRange,
      timerLabel: 'OPENS IN',
      secondsRemaining: Math.max(0, secsLeft),
      scheduledText: `scheduled ${formatTime12h(nextUpcomingRow.config.startTime)}`
    };
  } else {
    // All meals completed for today; countdown to tomorrow's Morning Tea
    const firstMeal = fiveRows[0];
    const secsUntilMidnight = 24 * 60 * 60 - (nowMinutes * 60 + nowSeconds);
    const secsTomorrow = secsUntilMidnight + firstMeal.startMin * 60;
    heroState = {
      badgeText: 'BETWEEN MEALS • UP NEXT',
      badgeType: 'closed',
      categoryName: firstMeal.name,
      foodName: firstMeal.foodName,
      timeRange: firstMeal.timeRange,
      timerLabel: 'OPENS IN',
      secondsRemaining: Math.max(0, secsTomorrow),
      scheduledText: `scheduled tomorrow ${formatTime12h(firstMeal.config.startTime)}`
    };
  }

  // Day of week in English
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayOfWeekName = days[currentTime.getDay()];

  // Active reminders for notice ticker
  const activeReminders = reminders.filter((r) => r.active);
  const tickerText =
    activeReminders.length > 0
      ? activeReminders.map((r) => r.text).join('   •   ')
      : 'Return your plate & glass after every meal. Keep the hall clean. 💙   •   Do not waste food. Take only what you can eat.   •   Maintain dining hall queue discipline.';

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ===================== HERO CARD (BETWEEN MEALS / NOW SERVING) ===================== */}
      <div className="bg-[#10192d] border border-[#1b2b48] rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Top Status Pill Badge */}
          <div className="flex items-center">
            {heroState.badgeType === 'serving' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-xs font-bold tracking-wider shadow-lg shadow-emerald-950/40">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                {heroState.badgeText}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0d2238] border border-cyan-800 text-cyan-300 text-xs font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                {heroState.badgeText}
              </span>
            )}
          </div>

          {/* Subtitle: Today • [Meal Category] • [Timing] */}
          <p className="text-xs sm:text-sm font-medium text-slate-300 tracking-wide">
            Today &nbsp;•&nbsp; {heroState.categoryName} &nbsp;•&nbsp;{' '}
            <span className="font-mono text-slate-200">{heroState.timeRange}</span>
          </p>

          {/* Food Item Name (Plain text English, Large & Bold) */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {heroState.foodName}
          </h1>

          {/* Countdown & Scheduled Time Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-slate-400 font-mono">
                {heroState.timerLabel}
              </span>
              <div className="bg-[#052920] border border-emerald-500/40 text-emerald-400 font-mono font-black px-3.5 py-1.5 rounded-lg tracking-widest text-base sm:text-xl shadow-inner select-none">
                {formatCountdown(heroState.secondsRemaining)}
              </div>
            </div>

            <span className="text-xs sm:text-sm text-slate-400 font-mono">
              {heroState.scheduledText}
            </span>
          </div>
        </div>
      </div>

      {/* ===================== METRICS ROW (3-CARD GRID) ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* CARD 1: LIVE PLATES WITH PROGRESS BAR */}
        <div className="bg-[#10192d] border border-[#1b2b48] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Disc className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white">
                    LIVE PLATES
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    TOTAL: <span className="font-bold text-slate-200">{totalPlates}</span>
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                {availablePlatePercentage}%
              </span>
            </div>

            {/* Big available number */}
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
                {availablePlates}
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold font-mono">
                AVAILABLE
              </span>
            </div>

            {/* Horizontal Percentage Progress Bar */}
            <div className="mt-3 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${availablePlatePercentage}%` }}
              />
            </div>
          </div>

          {/* Sub-status: TOTAL, AVAILABLE, MISSING */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono font-semibold">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              AVAILABLE {availablePlates}
            </span>
            <span className="text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
              MISSING {missingPlates}
            </span>
          </div>
        </div>

        {/* CARD 2: GLASSES WITH PROGRESS BAR */}
        <div className="bg-[#10192d] border border-[#1b2b48] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <GlassWater className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white">
                    LIVE GLASSES
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    TOTAL: <span className="font-bold text-slate-200">{totalGlasses}</span>
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                {availableGlassPercentage}%
              </span>
            </div>

            {/* Big available number */}
            <div className="mt-3.5 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
                {availableGlasses}
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold font-mono">
                AVAILABLE
              </span>
            </div>

            {/* Horizontal Percentage Progress Bar */}
            <div className="mt-3 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${availableGlassPercentage}%` }}
              />
            </div>
          </div>

          {/* Sub-status: AVAILABLE & MISSING */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono font-semibold">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              AVAILABLE {availableGlasses}
            </span>
            <span className="text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
              MISSING {missingGlasses}
            </span>
          </div>
        </div>

        {/* CARD 3: TABLE EQUIPMENT (JUGS & LOCKS) */}
        <div className="bg-[#10192d] border border-[#1b2b48] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Table Equipment</h3>
                <p className="text-[11px] text-slate-400">Jugs & Locks</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium flex items-center gap-2">
                  <GlassWater className="w-3.5 h-3.5 text-slate-400" /> Jugs
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {jugsItem.availableQuantity} / {jugsItem.totalQuantity}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Locks
                </span>
                <span className="text-xs font-mono font-bold text-rose-400">
                  {locksOrTrays.availableQuantity} / {locksOrTrays.totalQuantity}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            Updated live from equipment counter
          </div>
        </div>
      </div>

      {/* ===================== TODAY'S FOOD — EXACTLY 5 ROWS ===================== */}
      <div className="bg-[#10192d] border border-[#1b2b48] rounded-2xl p-4 sm:p-6 shadow-2xl">
        {/* Section Header */}
        <div className="flex items-center gap-2 pb-4 mb-1 border-b border-[#1b2b48]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase font-mono text-white">
            TODAY'S FOOD — {dayOfWeekName}
          </h2>
        </div>

        {/* Exactly 5 horizontal rows, plain text English food name, automatic status */}
        <div className="divide-y divide-[#1b2b48]/70">
          {fiveRows.map((row) => (
            <div
              key={row.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left Column: Meal Name & Time */}
              <div className="flex items-center gap-3 sm:w-1/3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-800/90 border border-slate-700/60 text-amber-400 flex items-center justify-center shrink-0">
                  <row.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                    {row.name}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    {row.timeRange}
                  </p>
                </div>
              </div>

              {/* Middle Column: Plain Text Food Item Name (NO images, thumbnails, or upload buttons) */}
              <div className="sm:w-1/3 text-left">
                <span className="text-sm sm:text-base font-semibold text-slate-100 tracking-wide">
                  {row.foodName}
                </span>
              </div>

              {/* Right Column: Automatic Serving Status */}
              <div className="sm:w-1/3 flex sm:justify-end items-center">
                {row.status === 'NOW SERVING' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-[11px] font-bold tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-950/50">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    NOW SERVING
                  </span>
                )}
                {row.status === 'UPCOMING' && (
                  <span className="px-3 py-1 rounded-full bg-[#0d2238] border border-cyan-800 text-cyan-300 text-[11px] font-bold tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    UPCOMING
                  </span>
                )}
                {row.status === 'SERVED' && (
                  <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-400 text-[11px] font-semibold tracking-wider">
                    SERVED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================== BOTTOM NOTICE TICKER ===================== */}
      <div className="bg-[#10192d] border border-[#1b2b48] rounded-xl p-3 flex items-center gap-3 overflow-hidden shadow-lg">
        <div className="shrink-0 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black tracking-wider flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>NOTICE</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap text-xs text-slate-300 flex-1">
          <div className="animate-marquee inline-block font-medium">
            {tickerText}
          </div>
        </div>
      </div>

      {/* Institutional clean footer note */}
      <div className="pt-2 pb-6 text-center text-xs text-slate-500">
        DHKC CANTEEN · Central Dining Hall Portal · 5 Shifts Schedule
      </div>
    </div>
  );
};
