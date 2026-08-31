import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BillingScreen } from './components/billing/BillingScreen';
import { QuotationScreen } from './components/quotations/QuotationScreen';
import { ProductList } from './components/products/ProductList';
import { InvoiceHistory } from './components/invoices/InvoiceHistory';
import { DashboardStats } from './components/dashboard/DashboardStats';
import { GSTReportsView } from './components/reports/GSTReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function App() {
  const { currentTab, toastMessage } = useApp();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'billing' && <BillingScreen />}
        {currentTab === 'quotations' && <QuotationScreen />}
        {currentTab === 'products' && <ProductList />}
        {currentTab === 'invoices' && <InvoiceHistory />}
        {currentTab === 'dashboard' && <DashboardStats />}
        {currentTab === 'gst-reports' && <GSTReportsView />}
        {currentTab === 'settings' && <SettingsView />}
      </main>

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
