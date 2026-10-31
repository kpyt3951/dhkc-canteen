import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Clock,
  Heart,
  MessageSquare,
  Award,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  UtensilsCrossed
} from 'lucide-react';
import { FoodItem, MealCategoryConfig } from '../types';
import { storage } from '../services/storage';

interface DailySpecialHighlightProps {
  specialItems: FoodItem[];
  mealConfigs: MealCategoryConfig[];
  onOpenComments: (food: FoodItem) => void;
  isAdmin?: boolean;
  onEditFood?: (food: FoodItem) => void;
  onDeleteFood?: (food: FoodItem) => void;
}

export const DailySpecialHighlight: React.FC<DailySpecialHighlightProps> = ({
  specialItems,
  mealConfigs,
  onOpenComments,
  isAdmin = false,
  onEditFood,
  onDeleteFood,
}) => {
  // ALL HOOKS CALLED AT TOP LEVEL UNCONDITIONALLY (Rules of Hooks)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likeState, setLikeState] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const hasSpecials = Boolean(specialItems && specialItems.length > 0);
  const safeIndex = hasSpecials ? currentIndex % specialItems.length : 0;
  const currentSpecial = hasSpecials ? specialItems[safeIndex] : null;

  useEffect(() => {
    if (currentSpecial) {
      setLikeState(storage.isFoodLiked(currentSpecial.id));
      setLikeCount(currentSpecial.likes || 0);
    }
  }, [currentSpecial?.id, currentSpecial?.likes]);

  // Early return ONLY after all hooks are executed
  if (!hasSpecials || !currentSpecial) {
    return null;
  }

  // Lookup shift config for category name and timing
  const shiftConfig = mealConfigs.find((c) => c.id === currentSpecial.mealCategory);
  const shiftName = shiftConfig ? shiftConfig.name : currentSpecial.mealCategory;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = storage.toggleLike(currentSpecial.id);
    setLikeState(result.liked);
    setLikeCount(result.newCount);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? specialItems.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % specialItems.length);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-amber-950/90 via-stone-900 to-amber-900/90 text-white p-5 sm:p-6 shadow-2xl border-2 border-amber-500/40 backdrop-blur-md">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar with Special Badge & Pagination */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider shadow-xs">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Daily Special Highlight</span>
          </div>
        </div>

        {/* Multi-special selector if more than 1 item has speciality */}
        {specialItems.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-amber-300/80">
              {safeIndex + 1} of {specialItems.length} specials
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                aria-label="Previous Daily Special"
                className="w-7 h-7 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors border border-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Daily Special"
                className="w-7 h-7 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors border border-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Special Highlight Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left Side: Dish info + Speciality Callout */}
        <div className="space-y-2.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-0.5 rounded-lg bg-stone-800 text-amber-300 font-bold border border-amber-500/30 text-[11px]">
              {shiftName}
            </span>
            <span className="text-stone-300 flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3 h-3 text-amber-400" />
              {currentSpecial.time}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight leading-tight">
            {currentSpecial.foodName}
          </h2>

          {/* DYNAMIC SPECIALITY HIGHLIGHT BOX */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/35 backdrop-blur-xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Speciality Note</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-100 font-medium leading-relaxed italic">
              "{currentSpecial.speciality}"
            </p>
          </div>

          {/* Description */}
          {currentSpecial.description && (
            <p className="text-xs text-stone-300 leading-relaxed line-clamp-2">
              {currentSpecial.description}
            </p>
          )}

          {/* Sponsored By if available */}
          {currentSpecial.sponsoredBy && (
            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sponsored by: {currentSpecial.sponsoredBy}</span>
            </div>
          )}
        </div>

        {/* Right Side: Dish Image thumbnail & Quick Actions */}
        <div className="flex flex-row md:flex-col items-center sm:items-end justify-between w-full md:w-auto gap-3 shrink-0">
          {currentSpecial.image ? (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl shrink-0 bg-stone-900 group">
              <img
                src={currentSpecial.image}
                alt={currentSpecial.foodName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-stone-900/80 border border-amber-500/20 flex flex-col items-center justify-center text-amber-400 text-xs shrink-0 p-2 text-center">
              <UtensilsCrossed className="w-7 h-7 mb-1 opacity-70" />
              <span className="text-[10px] text-stone-400">Featured Dish</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border ${
                likeState
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300 border-white/10'
              }`}
              aria-label={`Like ${currentSpecial.foodName}`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  likeState ? 'fill-rose-400 text-rose-400' : 'text-stone-400'
                }`}
              />
              <span className="font-mono text-xs">{likeCount}</span>
            </button>

            <button
              onClick={() => onOpenComments(currentSpecial)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
              <span>Feedback</span>
            </button>

            {isAdmin && onEditFood && (
              <button
                onClick={() => onEditFood(currentSpecial)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center gap-1 transition-all shadow-xs"
                title="Customize this special item"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Customize</span>
              </button>
            )}

            {isAdmin && onDeleteFood && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFood(currentSpecial);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 transition-all shadow-xs"
                title="Delete this special item from Today's Food"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
