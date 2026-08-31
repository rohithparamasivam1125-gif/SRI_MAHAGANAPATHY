import React, { useState } from 'react';
import { QuotationCatalogGrid } from './QuotationCatalogGrid';
import { QuotationCartTable } from './QuotationCartTable';
import { QuotationHistory } from './QuotationHistory';
import { QuotationPrintView } from './QuotationPrintView';
import { useApp } from '../../context/AppContext';
import { FileText, PlusCircle, History, Edit3 } from 'lucide-react';

export const QuotationScreen = () => {
  const [activeSubTab, setActiveSubTab] = useState('create'); // 'create' | 'history'
  const { quotations, activeQuotationForPrint, setActiveQuotationForPrint, editingQuotation, loadQuotationForEdit } = useApp();
  const [selectedQuotationForView, setSelectedQuotationForView] = useState(null);
  const [draftQuotationForPreview, setDraftQuotationForPreview] = useState(null);
  const [draftSaveFn, setDraftSaveFn] = useState(null);

  const handlePreviewQuotation = (draftQuo, saveCallback) => {
    setDraftQuotationForPreview(draftQuo);
    if (saveCallback) {
      setDraftSaveFn(() => saveCallback);
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 h-[calc(100vh-4.5rem)] flex flex-col">
      
      {/* Top Sub-Navigation Toggle */}
      <div className="no-print flex items-center justify-between pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeSubTab === 'create'
                ? editingQuotation 
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' 
                  : 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            {editingQuotation ? <Edit3 className="w-4 h-4 text-amber-200" /> : <PlusCircle className="w-4 h-4" />}
            <span>{editingQuotation ? `Editing #${editingQuotation.quotationNumber}` : 'Create New Quotation'}</span>
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

      {/* Main View Area (Hidden when printing modal) */}
      {activeSubTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 2xl:grid-cols-12 gap-3.5 sm:gap-4 flex-1 overflow-hidden no-print">
          
          {/* Left Side: Product Search, Category Filters, & Size Selector */}
          <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-8 h-full overflow-hidden flex flex-col">
            <QuotationCatalogGrid />
          </div>

          {/* Right Side: Active Quotation Table */}
          <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 h-full overflow-hidden flex flex-col">
            <QuotationCartTable onPreviewQuotation={handlePreviewQuotation} />
          </div>

        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-print">
          <QuotationHistory 
            onSelectQuotation={(quo) => setSelectedQuotationForView(quo)}
            onEditQuotation={(quo) => {
              loadQuotationForEdit(quo);
              setActiveSubTab('create');
            }}
          />
        </div>
      )}

      {/* Draft Quotation Fullscreen Preview Modal (Before Saving) */}
      {draftQuotationForPreview && (
        <QuotationPrintView
          quotation={draftQuotationForPreview}
          isDraft={true}
          onConfirmSave={() => {
            if (draftSaveFn) {
              draftSaveFn();
            }
            setDraftQuotationForPreview(null);
          }}
          onClose={() => setDraftQuotationForPreview(null)}
        />
      )}

      {/* Quotation Print Modal (for saved quotations or selected from history) */}
      {(activeQuotationForPrint || selectedQuotationForView) && (
        <QuotationPrintView
          quotation={activeQuotationForPrint || selectedQuotationForView}
          isDraft={false}
          onClose={() => {
            setActiveQuotationForPrint(null);
            setSelectedQuotationForView(null);
          }}
        />
      )}

    </div>
  );
};
