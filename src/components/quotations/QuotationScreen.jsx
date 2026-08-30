import React, { useState } from 'react';
import { QuotationCatalogGrid } from './QuotationCatalogGrid';
import { QuotationCartTable } from './QuotationCartTable';
import { QuotationHistory } from './QuotationHistory';
import { QuotationPrintView } from './QuotationPrintView';
import { useApp } from '../../context/AppContext';
import { FileText, PlusCircle, History } from 'lucide-react';

export const QuotationScreen = () => {
  const [activeSubTab, setActiveSubTab] = useState('create'); // 'create' | 'history'
  const { quotations, activeQuotationForPrint, setActiveQuotationForPrint, editingQuotation } = useApp();
  const [selectedQuotationForView, setSelectedQuotationForView] = useState(null);

  React.useEffect(() => {
    if (editingQuotation) {
      setActiveSubTab('create');
    }
  }, [editingQuotation]);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 h-[calc(100vh-4.5rem)] flex flex-col">
      
      {/* Top Sub-Navigation Toggle */}
      <div className="flex items-center justify-between pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeSubTab === 'create'
                ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Quotation</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeSubTab === 'history'
                ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Quotation History</span>
            <span className="px-1.5 py-0.2 text-[11px] bg-slate-200 text-slate-800 rounded-full font-mono font-bold">
              {quotations.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeSubTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 2xl:grid-cols-12 gap-3.5 sm:gap-4 flex-1 overflow-hidden">
          
          {/* Left Side: Product Search, Category Filters, & Size Selector */}
          <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-8 h-full overflow-hidden flex flex-col">
            <QuotationCatalogGrid />
          </div>

          {/* Right Side: Active Quotation Table */}
          <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 h-full overflow-hidden flex flex-col">
            <QuotationCartTable />
          </div>

        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <QuotationHistory onSelectQuotation={(quo) => setSelectedQuotationForView(quo)} />
        </div>
      )}

      {/* Quotation Print Modal (for newly generated or selected from history) */}
      {(activeQuotationForPrint || selectedQuotationForView) && (
        <QuotationPrintView
          quotation={activeQuotationForPrint || selectedQuotationForView}
          onClose={() => {
            setActiveQuotationForPrint(null);
            setSelectedQuotationForView(null);
          }}
        />
      )}

    </div>
  );
};
