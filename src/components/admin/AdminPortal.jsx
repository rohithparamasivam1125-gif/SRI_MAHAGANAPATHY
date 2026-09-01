import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  KeyRound, 
  Power, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

const ADMIN_PIN = '9087';

export const AdminPortal = () => {
  const { appStatus, toggleAppLock, settings } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const isLocked = Boolean(appStatus?.isLocked);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN || pinInput.trim() === 'admin123') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid Admin PIN. Please try again.');
    }
  };

  const handleToggle = async () => {
    try {
      setIsUpdating(true);
      await toggleAppLock(!isLocked);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // PIN Login View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center">
          
          <div className="w-20 h-20 bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl mx-auto flex items-center justify-center mb-6 text-blue-400">
            <KeyRound className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">Admin Control Panel</h1>
          <p className="text-sm text-slate-400 mt-1 mb-8">
            {settings?.shopName || 'Sri Mahaganapathy Billing System'}
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Enter Master Admin PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="••••"
                autoFocus
                className="w-full px-4 py-3.5 bg-slate-900 border border-slate-600 rounded-xl text-white text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 font-bold text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">
                {pinError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all text-base mt-2 cursor-pointer"
            >
              Authorize & Access Admin
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/60 flex items-center justify-center">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Billing Application</span>
            </a>
          </div>

        </div>
      </div>
    );
  }

  // Admin Controls View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Admin Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Power className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-lg text-white leading-tight">Admin System Control</h1>
              <p className="text-xs text-slate-400">{settings?.shopName || 'Sri Mahaganapathy Electricals'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-all"
            >
              <span>Open Client App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Control Panel */}
      <main className="max-w-4xl w-full mx-auto p-6 sm:p-10 flex-1 flex flex-col justify-center">
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Status Indicator Banner */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 border"
              style={{
                backgroundColor: isLocked ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                borderColor: isLocked ? '#f43f5e' : '#10b981',
                color: isLocked ? '#fb7185' : '#34d399',
              }}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${isLocked ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
              <span>{isLocked ? 'CURRENT STATUS: BLOCKED / HALTED' : 'CURRENT STATUS: ACTIVE & RUNNING'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Software Access Control
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mt-2">
              Toggle this master switch to instantly lock or unlock the billing software across all devices for payment dues.
            </p>
          </div>

          {/* Master Big Toggle Switch */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center max-w-xl mx-auto shadow-inner">
            
            <div className="flex items-center justify-center mb-6">
              {isLocked ? (
                <div className="w-24 h-24 rounded-full bg-rose-500/20 border-4 border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Lock className="w-12 h-12" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-4 border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Unlock className="w-12 h-12" />
                </div>
              )}
            </div>

            <p className="text-xs uppercase font-black tracking-widest text-slate-400 mb-4">
              Master Kill-Switch
            </p>

            {/* Toggle Button */}
            <button
              onClick={handleToggle}
              disabled={isUpdating}
              className={`w-full py-5 px-8 rounded-2xl font-black text-lg sm:text-xl transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer ${
                isLocked
                  ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white ring-4 ring-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white ring-4 ring-rose-500/20'
              } ${isUpdating ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span>Updating System Status...</span>
                </>
              ) : isLocked ? (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  <span>CLICK TO UNBLOCK (MAKE APP ACTIVE)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-6 h-6" />
                  <span>CLICK TO BLOCK (HALT SOFTWARE)</span>
                </>
              )}
            </button>

            {appStatus?.updatedAt && (
              <p className="text-xs text-slate-500 font-semibold mt-4">
                Last Status Update: {new Date(appStatus.updatedAt).toLocaleString('en-IN')}
              </p>
            )}

          </div>

          {/* Client Lock Message Preview */}
          <div className="mt-10 pt-8 border-t border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Lockout Message Displayed on Client Screen</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  English Notice
                </span>
                <p className="text-sm font-semibold text-slate-200">
                  Contact Admin: The app is blocked due to payment due. Make a payment to continue to use the app.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 block mb-1">
                  தமிழ் அறிவிப்பு
                </span>
                <p className="text-sm font-semibold text-slate-200">
                  நிர்வாகியைத் தொடர்பு கொள்ளவும்: கட்டண நிலுவை காரணமாக இந்த மென்பொருள் முடக்கப்பட்டுள்ளது. செயலியைத் தொடர்ந்து பயன்படுத்த கட்டணத்தைச் செலுத்தவும்.
                </p>
              </div>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
};
