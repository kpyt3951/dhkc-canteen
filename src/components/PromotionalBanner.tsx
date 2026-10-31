import React from 'react';
import { Sparkles, Calendar, ArrowRight, Megaphone } from 'lucide-react';
import { PromotionalBanner } from '../types';

interface DynamicBannerProps {
  banners: PromotionalBanner[];
  onActionClick?: (banner: PromotionalBanner) => void;
}

export const DynamicPromotionalBannerSection: React.FC<DynamicBannerProps> = ({
  banners,
  onActionClick,
}) => {
  if (!banners || banners.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-900/90 via-stone-900 to-amber-950 text-white p-4 sm:p-5 shadow-lg border border-amber-500/30 group"
        >
          {/* Subtle background image if provided */}
          {banner.image && (
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none overflow-hidden">
              <img
                src={banner.image}
                alt=""
                className="w-full h-full object-cover object-center filter blur-xs group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-stone-900" />
            </div>
          )}

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                  <Megaphone className="w-3 h-3 text-amber-400" />
                  Special Program
                </span>
                {banner.endDate && (
                  <span className="text-[11px] text-stone-300 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    Valid until {banner.endDate}
                  </span>
                )}
              </div>

              <h4 className="text-base sm:text-lg font-bold font-display text-white tracking-tight leading-snug">
                {banner.title}
              </h4>

              <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed line-clamp-2">
                {banner.description}
              </p>
            </div>

            {banner.buttonText && (
              <button
                onClick={() => onActionClick && onActionClick(banner)}
                className="self-start sm:self-center shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                <span>{banner.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
