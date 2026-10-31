import React, { useState } from 'react';
import { X, HeartHandshake, QrCode, Copy, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { DonationSettings } from '../types';
import { storage } from '../services/storage';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const donationSettings: DonationSettings = storage.getDonationSettings();

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    if (donationSettings.upiId) {
      navigator.clipboard.writeText(donationSettings.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200/90 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white shrink-0 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white leading-tight">
                Institutional Donation
              </h2>
              <p className="text-xs text-stone-300">
                Support student meals and dining hall infrastructure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-center flex-1">
          {/* Title & Description */}
          <div className="space-y-1.5">
            <h3 className="text-base font-bold font-display text-stone-900">
              {donationSettings.title || 'DHKC Dining Welfare Fund'}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
              {donationSettings.description ||
                'Contributions directly assist subsidized student dining, kitchen hygiene modernization, and clean water systems.'}
            </p>
          </div>

          {/* QR Code Card - only shown if QR exists */}
          {donationSettings.qrImage ? (
            <div className="p-4 rounded-3xl bg-amber-500/5 border-2 border-dashed border-amber-500/30 inline-block shadow-inner">
              <div className="w-52 h-52 bg-white rounded-2xl p-2 border border-stone-200 flex items-center justify-center shadow-md mx-auto">
                <img
                  src={donationSettings.qrImage}
                  alt="Official Donation UPI QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[11px] font-bold text-amber-900 mt-2 flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5" />
                Scan using any UPI App (GPay / PhonePe / Paytm)
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-stone-500 text-xs">
              <p className="font-semibold text-stone-700">Official Donation QR</p>
              <p className="mt-1 text-[11px]">
                The administrator will upload the official UPI QR code shortly. You can still contribute via the institutional UPI ID below.
              </p>
            </div>
          )}

          {/* UPI ID Copy Block */}
          {donationSettings.upiId && (
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                Official Institutional UPI ID
              </span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono font-bold text-stone-900">
                  {donationSettings.upiId}
                </code>
                <button
                  onClick={handleCopyUpi}
                  className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-100 flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-stone-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              {donationSettings.accountName && (
                <p className="text-[11px] text-stone-500">
                  Account: <strong>{donationSettings.accountName}</strong>
                </p>
              )}
            </div>
          )}

          {/* Instructions */}
          {donationSettings.instructions && (
            <p className="text-[11px] text-stone-500 bg-amber-50 p-3 rounded-xl border border-amber-200/80 text-left">
              <strong>Instructions:</strong> {donationSettings.instructions}
            </p>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct institutional transfer • Non-commercial</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
