import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Shield,
  LogOut,
  UtensilsCrossed,
  Sparkles,
  GraduationCap,
  Award,
  ChefHat,
  HeartHandshake,
  Download
} from 'lucide-react';
import { storage } from '../services/storage';

interface HeaderProps {
  onOpenClasses: () => void;
  onOpenAdminLogin: () => void;
  onOpenAdminDashboard: () => void;
  onOpenTeacherRemarks: () => void;
  onOpenTeacherPortal?: () => void;
  onOpenCookLogin: () => void;
  onOpenDonate: () => void;
  onOpenInstall?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenClasses,
  onOpenAdminLogin,
  onOpenAdminDashboard,
  onOpenTeacherRemarks,
  onOpenTeacherPortal,
  onOpenCookLogin,
  onOpenDonate,
  onOpenInstall,
  setActiveTab,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(storage.isAdminLoggedIn());
  const [isCook, setIsCook] = useState(storage.isCookLoggedIn());
  const [appLogo, setAppLogo] = useState(storage.getAppLogo());
  const [diningInfo, setDiningInfo] = useState(storage.getDiningHallInfo());
  const [now, setNow] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setIsAdmin(storage.isAdminLoggedIn());
      setIsCook(storage.isCookLoggedIn());
      setAppLogo(storage.getAppLogo());
      setDiningInfo(storage.getDiningHallInfo());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdminLogout = () => {
    storage.adminLogout();
    setIsAdmin(false);
    setDropdownOpen(false);
  };

  // Clock format: 08:04:47 AM
  const clockString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Date format: THU, 08 OCT IST
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dayStr = days[now.getDay()];
  const dateNum = String(now.getDate()).padStart(2, '0');
  const monthStr = months[now.getMonth()];
  const dateString = `${dayStr}, ${dateNum} ${monthStr} IST`;

  return (
    <header className="sticky top-0 z-40 bg-[#0b1220]/95 backdrop-blur-md text-white border-b border-[#1b2b48] transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Brand Wordmark with official DHKC CANTEEN logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-amber-500/70 shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform shrink-0 bg-[#0b1220] flex items-center justify-center p-0.5">
            <img
              src={appLogo || '/logo.png'}
              alt="DHKC CANTEEN Logo"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.png';
              }}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
                {diningInfo.appName || 'DHKC CANTEEN'}
              </span>
              {isAdmin && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Admin
                </span>
              )}
              {isCook && !isAdmin && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Cook
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <p className="text-[10px] sm:text-[11px] text-cyan-400 font-mono tracking-widest uppercase font-semibold">
                LIVE DINING BOARD
              </p>
            </div>
          </div>
        </button>

        {/* Right: Gold Digital Clock + Date + Install button + Three-dot menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Digital Clock in gold/amber font matching reference video */}
          <div className="text-right hidden sm:block">
            <div className="text-base sm:text-lg font-mono font-extrabold text-amber-400 tracking-wider leading-none">
              {clockString}
            </div>
            <div className="text-[10px] font-mono text-slate-400 tracking-wider uppercase mt-0.5">
              {dateString}
            </div>
          </div>



          {/* Three-dot menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Options menu"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu adhering strictly to items 1-5 */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#10192d] border border-[#1b2b48] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Mobile time display inside menu */}
                <div className="sm:hidden px-4 py-2 border-b border-[#1b2b48] text-right bg-black/20">
                  <div className="text-sm font-mono font-extrabold text-amber-400 tracking-wider">
                    {clockString}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    {dateString}
                  </div>
                </div>

                {/* 1. Classes */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenClasses();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#16233f] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span>Classes & Students (S1 - SS1)</span>
                </button>

                {/* 2. Admin Login / Admin Dashboard */}
                {isAdmin ? (
                  <>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenAdminDashboard();
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-amber-400 hover:bg-[#16233f] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Dashboard (Full Access)</span>
                    </button>
                    <button
                      onClick={handleAdminLogout}
                      className="w-full text-left px-3.5 py-2 text-[11px] font-medium text-rose-400 hover:bg-[#16233f] flex items-center gap-2.5 transition-colors pl-9 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Exit Admin Session</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenAdminLogin();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#16233f] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-amber-500/80" />
                    <span>Admin Login</span>
                  </button>
                )}

                {/* 3. Student's Remarks Portal */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    if (onOpenTeacherPortal) {
                      onOpenTeacherPortal();
                    } else {
                      onOpenTeacherRemarks();
                    }
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-amber-300 hover:text-white hover:bg-[#16233f] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Student's Remarks Portal</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    /teacher
                  </span>
                </button>

                {/* 4. Cook's Login */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenCookLogin();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#16233f] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <ChefHat className="w-4 h-4 text-amber-400" />
                  <span>Cook's Login & Menu Update</span>
                </button>

                {/* 5. Donate */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenDonate();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#16233f] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <HeartHandshake className="w-4 h-4 text-rose-400" />
                  <span>Donate (Dining Welfare QR)</span>
                </button>

                {/* 6. Install App (Last item in menu) */}
                {onOpenInstall && (
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenInstall();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#16233f] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Install App</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

