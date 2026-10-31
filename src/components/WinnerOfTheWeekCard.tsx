import React from 'react';
import { Trophy, Award, Sparkles, ChevronRight, Coins } from 'lucide-react';
import { Student } from '../types';

interface WinnerOfTheWeekCardProps {
  winner: Student | null;
  customMessage?: string;
  onViewStudentProfile: (student: Student) => void;
  onOpenLeaderboard: () => void;
}

export const WinnerOfTheWeekCard: React.FC<WinnerOfTheWeekCardProps> = ({
  winner,
  customMessage,
  onViewStudentProfile,
  onOpenLeaderboard,
}) => {
  if (!winner) return null;

  return (
    <div className="mb-6 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-4 sm:p-5 shadow-xs relative overflow-hidden">
      {/* Decorative background watermark */}
      <div className="absolute -right-4 -bottom-4 text-amber-500/5 pointer-events-none">
        <Trophy className="w-36 h-36" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Trophy + Student Info */}
        <div className="flex items-center gap-3.5">
          {/* Winner Photo / Avatar */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 overflow-hidden flex items-center justify-center shadow-inner">
              {winner.photo ? (
                <img
                  src={winner.photo}
                  alt={winner.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display font-extrabold text-xl text-amber-700">
                  {winner.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
              👑
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 text-[10px] font-extrabold tracking-wider uppercase border border-amber-500/30 inline-flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-600" />
                Winner of the Week
              </span>
              <span className="text-[11px] font-bold text-stone-500">
                Class {winner.mainClass}
                {winner.section ? ` (${winner.section})` : ''} · Roll #{winner.rollNo}
              </span>
            </div>

            <h3 className="text-lg font-bold font-display text-stone-900 tracking-tight">
              {winner.name}
            </h3>

            <p className="text-xs text-stone-600 line-clamp-1 max-w-md">
              {customMessage || 'Highest weekly dining hall discipline & etiquette points.'}
            </p>
          </div>
        </div>

        {/* Right: Coins badge + CTAs */}
        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-amber-300 shadow-xs flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-600" />
            <div className="text-right">
              <div className="font-display font-extrabold text-base text-amber-700 leading-none">
                +{winner.weeklyCoins}
              </div>
              <div className="text-[9px] uppercase tracking-wider font-semibold text-stone-400">
                Weekly Coins
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onViewStudentProfile(winner)}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-xs active:scale-95"
            >
              Profile
            </button>
            <button
              onClick={onOpenLeaderboard}
              title="View Weekly Leaderboard"
              className="px-2.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs border border-stone-200 transition-colors shadow-xs"
            >
              Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
