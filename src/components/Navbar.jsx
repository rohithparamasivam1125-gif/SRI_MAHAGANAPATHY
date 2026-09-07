import React from 'react';
import { 
  Zap, 
  Droplets, 
  ShoppingCart, 
  Package, 
  ReceiptText, 
  BarChart3, 
  Settings, 
  Database, 
  Sparkles, 
  FileText,
  FileSpreadsheet,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    cart, 
    quotationCart,
    settings, 
    products, 
    isFirebaseConnected, 
    seedStarterProducts 
  } = useApp();

  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalQuotationItems = (quotationCart || []).reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentTab('billing')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <img 
              src="/smg-logo-transparent.png" 
              alt="Sri Mahaganapathy" 
              className="h-11 w-11 object-contain shrink-0 group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg text-slate-900 tracking-tight leading-none">
                  {settings.shopName || 'Sri Mahaganapathy Electricals and Hardware'}
                </span>
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  POS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                {settings.tagline || 'Wholesale & Retail Electricals, Hardware Solutions'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setCurrentTab('billing')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm sm:text-base font-bold transition-all ${
                currentTab === 'billing'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span>Counter Billing</span>
              {totalCartItems > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs sm:text-sm bg-blue-600 text-white rounded-full font-mono-numbers font-bold">
                  {totalCartItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('quotations')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm sm:text-base font-bold transition-all ${
                currentTab === 'quotations'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              <span>Quotations</span>
              {totalQuotationItems > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs sm:text-sm bg-indigo-600 text-white rounded-full font-mono-numbers font-bold">
                  {totalQuotationItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('products')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm sm:text-base font-bold transition-all ${
                currentTab === 'products'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              <span>Products & Sizes</span>
              <span className="text-xs sm:text-sm text-slate-500 font-bold font-mono-numbers">({products.length})</span>
            </button>

            <button
              onClick={() => setCurrentTab('invoices')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm sm:text-base font-bold transition-all ${
                currentTab === 'invoices'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ReceiptText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              <span>Bills & Invoices</span>
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm sm:text-base font-bold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setCurrentTab('settings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm sm:text-base font-bold transition-all ${
                currentTab === 'settings'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Shop Settings & Database Sync"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Right Status Badges & Quick Action */}
          <div className="flex items-center gap-3">

            {/* Quick Seed Button if database is fresh/empty */}
            {products.length === 0 && (
              <button
                onClick={seedStarterProducts}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors animate-pulse"
                title="Populate common Electrical & Plumbing items directly into Firebase"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Seed Starter Catalog</span>
              </button>
            )}

            {/* Storage Sync Badge */}
            <div 
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold border bg-rose-50 text-rose-700 border-rose-200 shadow-xs"
              title="Local 40-Day Temporary Cache Storage"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <Database className="w-4 h-4 text-rose-600" />
              <span className="font-bold hidden sm:inline">
                Not synced to storage
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
