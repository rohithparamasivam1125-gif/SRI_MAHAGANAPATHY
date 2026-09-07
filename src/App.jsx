import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BillingScreen } from './components/billing/BillingScreen';
import { QuotationScreen } from './components/quotations/QuotationScreen';
import { ProductList } from './components/products/ProductList';
import { InvoiceHistory } from './components/invoices/InvoiceHistory';
import { DashboardStats } from './components/dashboard/DashboardStats';
import { GSTReportsView } from './components/reports/GSTReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminPortal } from './components/admin/AdminPortal';
import { AppLockScreen } from './components/admin/AppLockScreen';
import { MobilePortal } from './components/mobile/MobilePortal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function App() {
  const { currentTab, setCurrentTab, toastMessage, appStatus } = useApp();
  const [currentRoute, setCurrentRoute] = useState(() => {
    const p = window.location.pathname.toLowerCase();
    const h = window.location.hash.toLowerCase();
    if (p === '/admin' || p.startsWith('/admin/') || h === '#/admin' || h === '#admin') return 'admin';
    if (p === '/mobile' || p.startsWith('/mobile/') || h === '#/mobile' || h === '#mobile') return 'mobile';
    return 'main';
  });

  // Listen to navigation / URL route changes
  useEffect(() => {
    const checkRoute = () => {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      if (p === '/admin' || p.startsWith('/admin/') || h === '#/admin' || h === '#admin') {
        setCurrentRoute('admin');
      } else if (p === '/mobile' || p.startsWith('/mobile/') || h === '#/mobile' || h === '#mobile') {
        setCurrentRoute('mobile');
      } else {
        setCurrentRoute('main');
      }
    };

    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  // 1. If viewing the Admin Panel (/admin)
  if (currentRoute === 'admin') {
    return <AdminPortal />;
  }

  // 2. If viewing the Mobile Portal (/mobile)
  if (currentRoute === 'mobile') {
    return (
      <>
        {appStatus?.isLocked && <AppLockScreen />}
        <MobilePortal />
        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 animate-slide-up no-print">
            <div
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
                toastMessage.type === 'error'
                  ? 'bg-rose-900 text-white border-rose-700'
                  : toastMessage.type === 'info'
                  ? 'bg-blue-900 text-white border-blue-700'
                  : 'bg-emerald-900 text-white border-emerald-700'
              }`}
            >
              {toastMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : toastMessage.type === 'info' ? (
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{toastMessage.message}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  // 3. Normal Client Application
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Remote Lockout Overlay if software is blocked for payment dues */}
      {appStatus?.isLocked && <AppLockScreen />}

      {/* Top Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        <ErrorBoundary fallbackTitle="Could not load this page">
          {currentTab === 'billing' && <BillingScreen />}
          {currentTab === 'quotations' && <QuotationScreen />}
          {currentTab === 'products' && <ProductList />}
          {currentTab === 'invoices' && <InvoiceHistory />}
          {currentTab === 'dashboard' && <DashboardStats />}
          {currentTab === 'gst-reports' && <GSTReportsView />}
          {currentTab === 'settings' && <SettingsView />}
        </ErrorBoundary>
      </main>

      {/* Software Watermark & Developer Credit Footer */}
      <footer className="no-print bg-slate-900/90 backdrop-blur-xs border-t border-slate-800 py-2.5 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sri Mahaganapathy Electricals & Hardware POS ERP</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-[11px] text-slate-300">
            <span>Designed & Developed by</span>
            <span className="px-2.5 py-0.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 font-black tracking-wide">
              RR Software Solutions
            </span>
          </div>
        </div>
      </footer>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-up no-print">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
              toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : toastMessage.type === 'info'
                ? 'bg-blue-900 text-white border-blue-700'
                : 'bg-emerald-900 text-white border-emerald-700'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : toastMessage.type === 'info' ? (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
