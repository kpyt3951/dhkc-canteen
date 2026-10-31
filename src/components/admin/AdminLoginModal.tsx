import React, { useState } from 'react';
import { Lock, X, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { storage } from '../../services/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const valid = storage.verifyAdminPassword(password);
      setIsSubmitting(false);

      if (valid) {
        setPassword('');
        setError(null);
        onSuccess();
      } else {
        setError('Incorrect password. Please verify dining hall administrator credentials.');
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display tracking-tight text-stone-900 dark:text-white">
            Admin Authentication
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-[260px]">
            Enter the dining hall administrator password to manage menus, team, and schedules.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter password..."
                autoFocus
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 pr-10 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting ? 'Authenticating...' : 'Access Admin Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
