import React, { useState } from 'react';
import { X, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';
import { Student } from '../../types';
import { storage } from '../../services/storage';

interface ClassesDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent: (student: Student) => void;
}

export const ClassesDirectoryModal: React.FC<ClassesDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
}) => {
  const [admissionNoInput, setAdmissionNoInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const query = admissionNoInput.trim();
    if (!query) {
      setErrorMsg('Please enter your Admission Number or Username.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    // Look up student by admission number or roll number
    const allStudents = storage.getAllStudents();
    const found = allStudents.find(
      (s) =>
        String(s.admissionNo).trim().toLowerCase() === query.toLowerCase() ||
        String(s.rollNo).trim() === query ||
        s.name.trim().toLowerCase() === query.toLowerCase()
    );

    setIsLoading(false);

    if (found) {
      onSelectStudent(found);
      onClose();
    } else {
      setErrorMsg(`No record found for Admission No "${query}". Please verify your registered institutional admission number.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-white text-slate-800 rounded-3xl max-w-4xl w-full max-h-[94vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Portal"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT PANEL: Campus Program Advertisement Poster or Institutional Welcome */}
        <div className="relative md:w-1/2 min-h-[220px] md:min-h-[460px] bg-gradient-to-br from-stone-900 via-slate-900 to-amber-950 overflow-hidden flex flex-col justify-between p-6 sm:p-8 text-white">
          {(() => {
            const ad = storage.getAdvertisement();
            if (ad && ad.active && ad.posterImage) {
              return (
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold tracking-wider uppercase mb-3">
                      Campus Event & Notice
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                      {ad.title}
                    </h3>
                    {ad.description && (
                      <p className="text-xs text-stone-300 mt-1 line-clamp-2">
                        {ad.description}
                      </p>
                    )}
                  </div>

                  {/* Poster Image */}
                  <div className="my-3 rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl bg-black/40 flex-1 max-h-[300px] flex items-center justify-center">
                    <img
                      src={ad.posterImage}
                      alt={ad.title}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>

                  <div className="text-[10px] text-amber-300/80 font-medium">
                    Darul Huda Islamic University · Campus Life
                  </div>
                </div>
              );
            }

            // Default Institutional Welcome when no advertisement poster is active
            const diningInfo = storage.getDiningHallInfo();
            const currentLogo = diningInfo.appLogo || '/logo.png';
            return (
              <div className="relative z-10 flex flex-col h-full justify-between text-center items-center py-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/10 p-2.5 shadow-2xl border border-amber-500/30 flex items-center justify-center backdrop-blur-md">
                  <img
                    src={currentLogo}
                    alt="DHKC Emblem"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/logo.png';
                    }}
                    className="w-full h-full object-contain rounded-2xl"
                  />
                </div>

                <div className="space-y-1.5 my-auto">
                  <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                    {diningInfo.appName || 'DHKC CANTEEN'}
                  </h1>
                  <p className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">
                    Students' Dining & Etiquette Portal
                  </p>
                  <p className="text-xs text-stone-300 max-w-xs mx-auto leading-relaxed pt-2">
                    Official verified dining hall discipline, conduct marks, and live meal board.
                  </p>
                </div>

                <div className="text-[10px] text-stone-400 font-medium">
                  Classes S1 to SS1 · Darul Huda Islamic University
                </div>
              </div>
            );
          })()}
        </div>

        {/* RIGHT PANEL: DHKC CANTEEN Students' Portal Login */}
        <div className="md:w-1/2 p-6 sm:p-10 flex flex-col justify-center bg-white space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#006877] font-sans">
              Welcome to<br />
              <span className="text-[#00525e]">DHKC CANTEEN STUDENTS' PORTAL</span>
            </h2>

            {/* Dynamic App Logo matching Home Screen / Canteen Settings */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 p-1.5 border border-slate-200 flex items-center justify-center shadow-xs">
              <img
                src={storage.getDiningHallInfo().appLogo || '/logo.png'}
                alt="DHKC Canteen Logo"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Please enter your institutional Admission Number to securely open and view your personal dining etiquette & remarks profile.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-tight">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto w-full">
            {/* Username / Admission Number field */}
            <div className="relative">
              <div className="flex items-center gap-2 border-b-2 border-slate-300 focus-within:border-[#00707a] py-2 transition-colors">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={admissionNoInput}
                  onChange={(e) => setAdmissionNoInput(e.target.value)}
                  placeholder="Admission No / Username"
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Password field (Optional or PIN) */}
            <div className="relative">
              <div className="flex items-center gap-2 border-b-2 border-slate-300 focus-within:border-[#00707a] py-2 transition-colors">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Enter your registered institutional Admission Number to view your profile.
              </span>
            </div>

            {/* Login Button (Reference Image deep teal style) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-lg bg-[#00707a] hover:bg-[#005a63] text-white font-bold text-sm tracking-wider uppercase transition-colors shadow-md shadow-[#00707a]/25 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? 'Verifying...' : 'LOGIN'}
              </button>
            </div>
          </form>

          <div className="text-center text-[11px] text-slate-400 pt-2 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Protected Private Records · Individual Student Access Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};
