import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  X,
  CheckCircle2,
  Share2,
  Sparkles,
  Laptop,
  ShieldCheck,
  Link2,
  Copy,
  ExternalLink,
  Check,
  Edit3,
  MoreVertical
} from 'lucide-react';
import { storage } from '../services/storage';
import { api } from '../services/api';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState<'android' | 'ios' | 'pc'>('android');
  const [copied, setCopied] = useState(false);
  const [copySuccessToast, setCopySuccessToast] = useState(false);
  const [appLogo, setAppLogo] = useState(storage.getAppLogo());
  const [directUrl, setDirectUrl] = useState(storage.getDirectAppUrl());
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(storage.getDirectAppUrl());

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setAppLogo(storage.getAppLogo());
      setDirectUrl(storage.getDirectAppUrl());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const current = storage.getDirectAppUrl();
    setDirectUrl(current);
    setCustomUrlInput(current);

    if (isOpen) {
      api.getAppConfig().then((cfg) => {
        if (cfg?.sharedAppUrl) {
          const custom = localStorage.getItem('dhkc_custom_direct_url');
          if (!custom) {
            setDirectUrl(cfg.sharedAppUrl);
            setCustomUrlInput(cfg.sharedAppUrl);
          }
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    // Detect if already installed / running standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Install prompt error:', err);
    }
  };

  const handleCopyLink = async () => {
    const urlToCopy = directUrl || storage.getDirectAppUrl();
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setCopySuccessToast(true);
      setTimeout(() => {
        setCopied(false);
        setCopySuccessToast(false);
      }, 3000);
    } catch {
      // Fallback for clipboard
      try {
        const el = document.createElement('textarea');
        el.value = urlToCopy;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopied(true);
        setCopySuccessToast(true);
        setTimeout(() => {
          setCopied(false);
          setCopySuccessToast(false);
        }, 3000);
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between bg-[#111c34]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-amber-500/50 bg-[#0b1220] flex items-center justify-center shadow-md shrink-0">
              <img
                src={appLogo || '/logo.png'}
                alt="DHKC CANTEEN Logo"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                Install DHKC CANTEEN
                <span className="text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  APP
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Install directly on your phone or desktop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* ALWAYS PRESENT: Direct Standalone App Link Card (No AI Studio) */}
          <div className="p-4 rounded-2xl bg-[#091120] border border-[#203457] shadow-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                    <span>Direct App Installation Link</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                      Direct App Only (No AI Studio)
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Always available link supported to open & install the app directly on phones & PCs.
                  </p>
                </div>
              </div>
            </div>

            {/* Permanent Link Display Bar with Copy & Open actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#050a14] p-2 rounded-xl border border-[#1b2b48]">
              {isEditingUrl ? (
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="Enter custom direct app link..."
                  className="flex-1 bg-transparent px-2 py-1 text-xs font-mono text-amber-300 font-bold focus:outline-none"
                />
              ) : (
                <div
                  className="flex-1 min-w-0 px-2 py-1 text-xs font-mono text-amber-300 font-bold truncate select-all cursor-pointer"
                  onClick={handleCopyLink}
                  title="Click to copy direct app link"
                >
                  {directUrl}
                </div>
              )}

              <div className="flex items-center gap-1.5 shrink-0 justify-end">
                {isEditingUrl ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        storage.setDirectAppUrl(customUrlInput);
                        setDirectUrl(customUrlInput);
                        setIsEditingUrl(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomUrlInput(directUrl);
                        setIsEditingUrl(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#14223d] text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      title="Copy direct app link"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Direct Link'}</span>
                    </button>

                    <a
                      href={directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-[#14223d] hover:bg-[#1d325a] border border-[#223659] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Launch app directly in a clean browser tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Open App</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setCustomUrlInput(directUrl);
                        setIsEditingUrl(true);
                      }}
                      title="Configure custom app link"
                      className="p-1.5 rounded-lg bg-[#101b30] hover:bg-[#162544] border border-[#1e3256] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {copySuccessToast && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct app link copied! Paste this link into any browser to open and install the app directly without Google AI Studio.</span>
              </div>
            )}

            {/* Custom Domain and Automatic Update Notification */}
            <div className="p-3 rounded-xl bg-[#070e1c] border border-[#1e3256] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  Custom Institutional Domain: WWW.DHKC-CANTEEN.COM
                </span>
                <span className="text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                  DOMAIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                You can access this application through <strong className="text-white font-mono">WWW.DHKC-CANTEEN.COM</strong> or use the permanent direct link above.
              </p>
              <div className="pt-1 border-t border-[#14223d] flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Auto-Update Active: Installed apps on phones & PCs automatically receive and apply all latest updates!</span>
              </div>
            </div>
          </div>

          {/* Direct 1-Click Install Button if supported by browser */}
          {deferredPrompt && !isInstalled && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div>
                <p className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  1-Click Direct Installation
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Click the button below to add DHKC CANTEEN directly to your home screen.
                </p>
              </div>
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Install Now</span>
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold">App Already Installed!</p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  DHKC CANTEEN is installed on this device. You can launch it anytime from your home screen.
                </p>
              </div>
            </div>
          )}

          {/* Device Tabs: Android / iPhone / PC */}
          <div>
            <div className="flex items-center gap-1 p-1 bg-[#0b1220] rounded-xl border border-[#1e293b]">
              <button
                onClick={() => setActiveDeviceTab('android')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeDeviceTab === 'android'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
              <button
                onClick={() => setActiveDeviceTab('ios')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeDeviceTab === 'ios'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>
              <button
                onClick={() => setActiveDeviceTab('pc')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeDeviceTab === 'pc'
                    ? 'bg-amber-500 text-stone-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Desktop PC</span>
              </button>
            </div>
          </div>

          {/* Instructions: Android */}
          {activeDeviceTab === 'android' && (
            <div className="space-y-3 bg-[#0a101d] p-4 rounded-xl border border-[#1b2b48]">
              <div className="flex items-center gap-2 pb-2 border-b border-[#1b2b48]">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  How to Install on Android (Chrome Browser)
                </h3>
              </div>
              <ol className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-white">Open in Google Chrome</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Open this canteen portal link inside the Google Chrome browser on your Android phone.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1">
                      Tap the Menu Icon (<MoreVertical className="w-3.5 h-3.5 inline text-slate-300" /> three dots)
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Tap the three vertical dots located at the top-right corner of Google Chrome.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-white">Select "Install app" or "Add to Home screen"</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      From the menu options, tap <strong className="text-amber-300">"Install app"</strong> (or <strong className="text-amber-300">"Add to Home screen"</strong>).
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    4
                  </span>
                  <div>
                    <p className="font-semibold text-white">Confirm Installation</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Tap <strong className="text-white">"Install"</strong> in the popup. The DHKC CANTEEN app icon will now appear on your phone home screen just like a regular native app.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Instructions: iOS Safari */}
          {activeDeviceTab === 'ios' && (
            <div className="space-y-3 bg-[#0a101d] p-4 rounded-xl border border-[#1b2b48]">
              <div className="flex items-center gap-2 pb-2 border-b border-[#1b2b48]">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  How to Install on iPhone / iPad (Safari)
                </h3>
              </div>
              <ol className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-white">Open in Safari</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Open this portal link in Safari on your iPhone or iPad.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-white flex items-center gap-1">
                      Tap the Share Button (<Share2 className="w-3.5 h-3.5 inline text-slate-300" />)
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Tap the Share button at the bottom navigation bar of Safari.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-white">Tap "Add to Home Screen"</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Scroll down through the share options and tap <strong className="text-amber-300">"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    4
                  </span>
                  <div>
                    <p className="font-semibold text-white">Tap "Add"</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Tap <strong className="text-white">"Add"</strong> at the top-right corner. The app icon will appear immediately on your home screen.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Instructions: Desktop */}
          {activeDeviceTab === 'pc' && (
            <div className="space-y-3 bg-[#0a101d] p-4 rounded-xl border border-[#1b2b48]">
              <div className="flex items-center gap-2 pb-2 border-b border-[#1b2b48]">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  How to Install on Desktop PC / Laptop (Chrome / Edge)
                </h3>
              </div>
              <ol className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-white">Locate Address Bar Install Icon</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      In Chrome or Edge, look for the computer/install icon on the far right of the URL address bar.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-white">Click "Install"</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Click <strong className="text-amber-300">"Install DHKC CANTEEN"</strong> when prompted. The application will launch in its own dedicated, clean window.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Key Advantages */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-[#0b1220] border border-[#1e293b] flex items-center gap-2 text-[11px] text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant 1-tap launch from phone screen</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0b1220] border border-[#1e293b] flex items-center gap-2 text-[11px] text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Full-screen app view without browser bars</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1e293b] bg-[#111c34] flex items-center justify-between gap-3">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-[#1b2b48] hover:bg-[#23375d] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{copied ? 'Direct Link Copied!' : 'Copy Direct App Link'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
