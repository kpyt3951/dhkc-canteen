import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Coins,
  Calendar,
  UserCheck,
  Sparkles,
  MinusCircle
} from 'lucide-react';
import { Student, MilestoneSettings } from '../../types';
import { storage } from '../../services/storage';

interface StudentProfileModalProps {
  student: Student | null;
  onClose: () => void;
  onOpenAwardModal?: (student: Student) => void;
  isTeacherOrAdmin?: boolean;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student: initialStudent,
  onClose,
}) => {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(initialStudent);

  useEffect(() => {
    setCurrentStudent(initialStudent);
  }, [initialStudent]);

  if (!currentStudent) return null;

  const milestoneSettings: MilestoneSettings = storage.getMilestoneSettings();
  const targetCoins = milestoneSettings.targetCoins || 300;
  const progressPercent = Math.min(100, Math.round((currentStudent.totalCoins / targetCoins) * 100));
  const hasAchievedMilestone = currentStudent.totalCoins >= targetCoins;

  // Calculate distinct Plus (+) Marks and Minus (−) Penalty points
  const totalAwarded = (currentStudent.achievements || [])
    .filter((a) => a.coins > 0)
    .reduce((sum, a) => sum + a.coins, 0);

  const totalDeducted = (currentStudent.achievements || [])
    .filter((a) => a.coins < 0)
    .reduce((sum, a) => sum + Math.abs(a.coins), 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0d1627] rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-[#1b2b48] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-[#0b1220] border-b border-[#182742] text-white p-5 sm:p-6 shrink-0">
          <button
            onClick={onClose}
            aria-label="Close Profile"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#14223d] hover:bg-[#1a2d52] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Student Photo */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 overflow-hidden flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
              {currentStudent.photo ? (
                <img
                  src={currentStudent.photo}
                  alt={currentStudent.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display font-extrabold text-2xl text-amber-300">
                  {currentStudent.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div className="space-y-1 min-w-0 pr-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold tracking-wider uppercase border border-amber-500/30">
                <span>Class {currentStudent.mainClass}</span>
                {currentStudent.section && <span>• Section {currentStudent.section}</span>}
              </div>

              <h2 className="text-lg sm:text-2xl font-bold font-display text-white leading-tight truncate">
                {currentStudent.name}
              </h2>

              <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-400 font-mono">
                <span>
                  Roll: <strong className="text-amber-300">#{currentStudent.rollNo}</strong>
                </span>
                <span>•</span>
                <span>
                  Adm: <strong className="text-cyan-300">#{currentStudent.admissionNo}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-[#090f1d] text-slate-200">
          {/* Milestone celebration alert if reached target */}
          {hasAchievedMilestone && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-start gap-3 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 text-xl font-bold shadow-md">
                🎉
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                  {milestoneSettings.badgeText || '300 COINS ACHIEVEMENT UNLOCKED'}
                </h4>
                <p className="text-sm font-bold text-white mt-0.5">
                  {milestoneSettings.title}
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  {milestoneSettings.message}
                </p>
                {milestoneSettings.rewardDescription && (
                  <p className="text-xs font-medium text-amber-300 bg-[#0b1220] p-2 rounded-lg mt-2 border border-amber-500/30">
                    <strong>Reward:</strong> {milestoneSettings.rewardDescription}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Distinct Points Breakdown Cards: Plus, Minus, Net Balance, Weekly */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Total Awarded Plus Points */}
            <div className="p-3.5 rounded-2xl bg-[#0d1627] border border-emerald-500/30 shadow-md">
              <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
                <span className="font-semibold uppercase text-[10px] tracking-wider">Plus Marks</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="font-display font-black text-xl sm:text-2xl text-emerald-400">
                +{totalAwarded}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Awarded points</p>
            </div>

            {/* Total Minus Penalties */}
            <div className="p-3.5 rounded-2xl bg-[#0d1627] border border-rose-500/30 shadow-md">
              <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
                <span className="font-semibold uppercase text-[10px] tracking-wider">Minus Marks</span>
                <MinusCircle className="w-3.5 h-3.5" />
              </div>
              <div className="font-display font-black text-xl sm:text-2xl text-rose-400">
                −{totalDeducted}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Penalty deducted</p>
            </div>

            {/* Net Total Balance */}
            <div className="p-3.5 rounded-2xl bg-[#0d1627] border border-amber-500/30 shadow-md">
              <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
                <span className="font-semibold uppercase text-[10px] tracking-wider">Net Balance</span>
                <Coins className="w-3.5 h-3.5" />
              </div>
              <div className="font-display font-black text-xl sm:text-2xl text-white">
                {currentStudent.totalCoins}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Final official score</p>
            </div>

            {/* Weekly Marks */}
            <div className="p-3.5 rounded-2xl bg-[#0d1627] border border-[#1b2b48] shadow-md">
              <div className="flex items-center justify-between text-cyan-400 text-xs mb-1">
                <span className="font-semibold uppercase text-[10px] tracking-wider">This Week</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="font-display font-black text-xl sm:text-2xl text-cyan-300">
                +{currentStudent.weeklyCoins}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Current cycle</p>
            </div>
          </div>

          {/* 300 Coin Progress Bar */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#0d1627] border border-[#1b2b48]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">
                {targetCoins} Coin Target Milestone
              </span>
              <span className="font-mono font-bold text-amber-400">{progressPercent}%</span>
            </div>
            <div className="h-3 w-full bg-[#080e1b] rounded-full overflow-hidden p-0.5 border border-[#1b2b48]">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {hasAchievedMilestone
                ? 'Target achieved! Outstanding institutional dining discipline.'
                : `${targetCoins - currentStudent.totalCoins} more coins needed to unlock milestone.`}
            </p>
          </div>

          {/* Recent Achievements & Disciplinary History */}
          <div className="space-y-3">
            <h3 className="text-xs font-black font-display uppercase tracking-wider text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Verified History & Remarks ({currentStudent.achievements?.length || 0})
            </h3>

            {!currentStudent.achievements || currentStudent.achievements.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-[#1b2b48] bg-[#0d1627] text-slate-500">
                <p className="text-xs">No marks or remarks logged yet for this student.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Faculty and mentors award marks for dining etiquette, or deduct marks for infractions.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentStudent.achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`p-3.5 rounded-2xl border shadow-md space-y-2 ${
                      ach.coins < 0
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : 'bg-[#0d1627] border-[#1b2b48] text-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {ach.coins < 0 && <MinusCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                          <span>{ach.title}</span>
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-amber-400" />
                            {ach.teacherName}
                            {ach.teacherPosition ? ` (${ach.teacherPosition})` : ''}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            {ach.date}
                          </span>
                          {ach.teacherEmail && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-500">{ach.teacherEmail}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs shrink-0 border ${
                          ach.coins < 0
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {ach.coins >= 0 ? `+${ach.coins}` : ach.coins} Marks
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-[#080e1b] p-2.5 rounded-xl border border-[#182742]">
                      "{ach.remark}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0b1220] border-t border-[#182742] flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-slate-400">
            Points are institutional achievement marks only and cannot be converted to money.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#14223d] hover:bg-[#1a2d52] border border-[#1e3256] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
