import React from 'react';
import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { DiningHallInfo } from '../types';
import { formatDateToReadable } from '../utils/imageHelper';
import { getTodayDateString } from '../data/initialData';

interface HeroSectionProps {
  diningInfo: DiningHallInfo;
  onExploreMenu: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ diningInfo, onExploreMenu }) => {
  const todayStr = getTodayDateString();
  const readableDate = formatDateToReadable(todayStr);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-stone-900 text-white shadow-xl mb-6">
      {/* Background Image with Dark Contrast Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={diningInfo.backgroundImage}
          alt="DHKC Dining Hall"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Measured dark gradient scrim for WCAG AA readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/75 to-stone-900/60" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 px-5 pt-8 pb-7 sm:px-8 sm:py-10 max-w-2xl">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Dining Portal</span>
          </div>

          <div className="inline-flex items-center gap-1 text-xs text-stone-300 font-medium bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{readableDate}</span>
          </div>
        </div>

        {/* Big Typography */}
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white mb-2 leading-tight">
          Welcome to <span className="text-amber-400">DHKC CANTEEN</span>
        </h1>

        <p className="text-sm sm:text-base text-stone-300 font-normal leading-relaxed mb-5 max-w-lg">
          Fresh, nutritious, and hygienic food schedule prepared daily for students, faculty, and resident scholars.
        </p>

        {/* Institutional meta info */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-stone-300 pb-5 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{diningInfo.canteenCode || 'Block-A Campus'}</span>
          </div>
          <span className="text-stone-600 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>5 Scheduled Shifts Daily</span>
          </div>
          {diningInfo.capacity && (
            <>
              <span className="text-stone-600 hidden sm:inline">·</span>
              <span className="text-stone-400">{diningInfo.capacity}</span>
            </>
          )}
        </div>

        {/* Quick jump CTA */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={onExploreMenu}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <span>View Today's Food</span>
            <span aria-hidden="true">→</span>
          </button>
          <span className="text-xs text-stone-400">Updated in real-time by kitchen admin</span>
        </div>
      </div>
    </section>
  );
};
