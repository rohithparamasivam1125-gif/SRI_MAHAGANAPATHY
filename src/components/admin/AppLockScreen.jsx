import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export const AppLockScreen = () => {
  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border-4 border-rose-500 overflow-hidden text-center p-8 sm:p-12 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header Icon */}
        <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-rose-100 border-4 border-rose-200 flex items-center justify-center mb-6 shadow-inner">
          <ShieldAlert className="w-14 h-14 sm:w-16 sm:h-16 text-rose-600 animate-pulse" />
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm font-black uppercase tracking-wider mb-6">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Access Suspended / பயன்பாடு நிறுத்தப்பட்டது</span>
        </div>

        {/* English Notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 mb-5 text-left">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
            English Notice
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            Contact Admin: The app is blocked due to payment due. Make a payment to continue to use the app.
          </p>
        </div>

        {/* Tamil Notice */}
        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 sm:p-6 text-left">
          <p className="text-xs font-black uppercase tracking-wider text-rose-700 mb-1">
            தமிழ் அறிவிப்பு
          </p>
          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            நிர்வாகியைத் தொடர்பு கொள்ளவும்: கட்டண நிலுவை காரணமாக இந்த மென்பொருள் முடக்கப்பட்டுள்ளது. செயலியைத் தொடர்ந்து பயன்படுத்த கட்டணத்தைச் செலுத்தவும்.
          </p>
        </div>

      </div>
    </div>
  );
};
