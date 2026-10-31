import React, { useState } from 'react';
import {
  HeartHandshake,
  QrCode,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Edit2,
  Sparkles
} from 'lucide-react';
import { storage } from '../services/storage';
import { DonationSettings } from '../types';

interface DonateBarProps {
  onOpenDonateModal: () => void;
  isAdmin?: boolean;
  onOpenAdminDonationSettings?: () => void;
}

export const DonateBar: React.FC<DonateBarProps> = ({
  onOpenDonateModal,
  isAdmin = false,
  onOpenAdminDonationSettings,
}) => {
  const [isQrExpanded, setIsQrExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const donationSettings: DonationSettings = storage.getDonationSettings();
  const upiId = donationSettings.upiId || 'canteen.welfare@dhkc';
  const title = donationSettings.title || 'DHKC Canteen Dining Hall Welfare Fund';

  const handleCopyUpi = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-950 via-stone-900 to-stone-900 text-white shadow-xl border-2 border-amber-500/35 backdrop-blur-md transition-all">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Bar Container */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Icon + Title + Short Info */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/25 to-rose-500/25 border border-amber-500/40 text-rose-400 flex items-center justify-center shrink-0 shadow-md">
            <HeartHandshake className="w-6 h-6 text-amber-300" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider">
                Dining Welfare
              </span>
              <h3 className="text-base sm:text-lg font-extrabold font-display text-white tracking-tight leading-tight truncate">
                Donate (Dining Welfare QR)
              </h3>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed max-w-xl">
              {title} · Voluntary support for student meal subsidies and clean kitchen infrastructure.
            </p>

            {/* UPI ID quick copy pill */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-stone-300 font-mono text-[11px]">
                <span className="text-amber-400 font-semibold">UPI:</span>
                <span className="font-bold text-white selection:bg-amber-500">{upiId}</span>
                <button
                  onClick={handleCopyUpi}
                  className="ml-1 p-0.5 hover:text-amber-300 text-stone-400 transition-colors"
                  title="Copy UPI ID"
                  aria-label="Copy UPI ID"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {copied && (
                <span className="text-[11px] text-emerald-400 font-semibold animate-in fade-in">
                  Copied to clipboard!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
          {/* Toggle QR code view right on home screen */}
          <button
            onClick={() => setIsQrExpanded((prev) => !prev)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            aria-expanded={isQrExpanded}
          >
            <QrCode className="w-4 h-4" />
            <span>{isQrExpanded ? 'Hide QR' : 'Scan QR Code'}</span>
            {isQrExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Open full modal for detailed bank/UPI information */}
          <button
            onClick={onOpenDonateModal}
            className="px-3 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open full donation information"
          >
            <span>Full Details</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </button>

          {/* Admin Edit Shortcut */}
          {isAdmin && onOpenAdminDonationSettings && (
            <button
              onClick={onOpenAdminDonationSettings}
              className="px-3 py-2 rounded-xl bg-stone-800/90 hover:bg-amber-950 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Admin: customize donation QR and details"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit QR</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Expandable QR Display */}
      {isQrExpanded && (
        <div className="relative z-10 border-t border-amber-500/25 bg-black/40 p-5 sm:p-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left max-w-xl mx-auto">
            {/* QR Visual */}
            <div className="shrink-0 p-3 bg-white rounded-2xl shadow-2xl border-2 border-amber-400/40">
              {donationSettings.qrImage ? (
                <img
                  src={donationSettings.qrImage}
                  alt="Official Dining Welfare QR Code"
                  className="w-44 h-44 object-contain"
                />
              ) : (
                <div className="w-44 h-44 flex flex-col items-center justify-center p-3 text-stone-800 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                  <QrCode className="w-16 h-16 text-amber-600 mb-2" />
                  <p className="text-[11px] font-bold text-stone-900 leading-tight">
                    DHKC CANTEEN
                  </p>
                  <p className="text-[10px] text-stone-500 font-mono mt-0.5 truncate max-w-full">
                    {upiId}
                  </p>
                  <span className="mt-2 text-[9px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    UPI Active
                  </span>
                </div>
              )}
            </div>

            {/* Instructions & Details */}
            <div className="space-y-3 min-w-0">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1 justify-center sm:justify-start">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Official Institutional UPI
                </span>
                <h4 className="text-base font-bold text-white">
                  {donationSettings.accountName || 'DHKC Dining Welfare & Infrastructure Fund'}
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {donationSettings.instructions ||
                    'Open any UPI app (Google Pay, PhonePe, Paytm, BHIM) and scan the QR code to contribute.'}
                </p>
              </div>

              {/* Quick Copy Box */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-stone-900/90 border border-stone-700 max-w-xs mx-auto sm:mx-0">
                <div className="text-left">
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-semibold">
                    UPI ID
                  </span>
                  <code className="text-xs font-mono font-bold text-amber-300">
                    {upiId}
                  </code>
                </div>
                <button
                  onClick={handleCopyUpi}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-stone-950" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-stone-950" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-stone-400 italic">
                * Note your name and section in the payment note for administrative acknowledgement.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
