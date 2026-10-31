import React, { useState } from 'react';
import { X, Trophy, Medal, Coins, Search, Sparkles } from 'lucide-react';
import { Student } from '../../types';
import { storage } from '../../services/storage';

interface WeeklyLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent: (student: Student) => void;
}

export const WeeklyLeaderboardModal: React.FC<WeeklyLeaderboardModalProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
}) => {
  const [filterClass, setFilterClass] = useState<string>('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const winnerSettings = storage.getWinnerSettings();
  let rankedStudents = storage.getWeeklyLeaderboard(50);

  if (filterClass !== 'all') {
    rankedStudents = rankedStudents.filter((s) => s.mainClass === filterClass);
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    rankedStudents = rankedStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        String(s.admissionNo).includes(q) ||
        String(s.rollNo).includes(q)
    );
  }

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <span className="text-xl">🥇</span>;
      case 1:
        return <span className="text-xl">🥈</span>;
      case 2:
        return <span className="text-xl">🥉</span>;
      default:
        return (
          <span className="w-6 h-6 rounded-full bg-[#101b30] border border-[#1e3256] text-slate-300 font-mono text-xs font-bold flex items-center justify-center">
            #{index + 1}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b1220] rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#1b2b48] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0d1627] via-[#101b30] to-[#15223c] text-white shrink-0 flex items-center justify-between border-b border-[#182742]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white leading-tight">
                Weekly Dining Hall Leaderboard
              </h2>
              <p className="text-xs text-slate-400">
                Ranked by coins earned in the current weekly cycle ({winnerSettings.weekStartDate} to {winnerSettings.weekEndDate})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-[#101b30] hover:bg-[#162544] border border-[#1e3256] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-3 bg-[#080e1b] border-b border-[#182742] shrink-0 flex flex-wrap items-center justify-between gap-2">
          {/* Class filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
            {['all', 'S1', 'S2', 'S3', 'S4', 'S5', 'SS1'].map((c) => (
              <button
                key={c}
                onClick={() => setFilterClass(c)}
                className={`px-3 py-1 rounded-xl font-bold uppercase transition-all cursor-pointer ${
                  filterClass === c
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow-xs ring-1 ring-amber-400'
                    : 'bg-[#101b30] text-slate-300 border border-[#1e3256] hover:bg-[#162544] hover:text-white'
                }`}
              >
                {c === 'all' ? 'All Classes' : c}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-40 sm:w-48">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              className="w-full text-xs px-3 py-1.5 bg-[#070d18] border border-[#223659] rounded-xl focus:outline-none focus:border-amber-400 text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Ranked Students List */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2 bg-[#090f1d]">
          {rankedStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-medium">No students match this filter.</p>
            </div>
          ) : (
            rankedStudents.map((st, idx) => (
              <button
                key={st.id}
                onClick={() => onSelectStudent(st)}
                className={`w-full p-3 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 group cursor-pointer ${
                  idx === 0
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-500/10 hover:border-amber-400'
                    : idx === 1
                    ? 'bg-[#101b30] border-[#223659] hover:border-slate-400'
                    : idx === 2
                    ? 'bg-[#121929] border-[#223659] hover:border-amber-600/50'
                    : 'bg-[#0d1627] border-[#1b2b48] hover:border-amber-500/60 hover:bg-[#111e35]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Badge */}
                  <div className="w-8 flex justify-center shrink-0">
                    {getRankBadge(idx)}
                  </div>

                  {/* Student Photo */}
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-amber-500/30">
                    {st.photo ? (
                      <img src={st.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{st.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                      {st.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium truncate">
                      Class {st.mainClass}
                      {st.section ? ` (${st.section})` : ''} · Roll #{st.rollNo} · Adm #{st.admissionNo}
                    </p>
                  </div>
                </div>

                {/* Coins */}
                <div className="text-right shrink-0">
                  <div className="text-sm font-display font-extrabold text-amber-400 flex items-center gap-1 justify-end">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+{st.weeklyCoins}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Total: {st.totalCoins}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#070d18] border-t border-[#182742] text-center text-[11px] text-slate-400 shrink-0">
          Weekly leaderboard resets at the start of each institutional weekly cycle. Lifetime coins are permanently preserved.
        </div>
      </div>
    </div>
  );
};
