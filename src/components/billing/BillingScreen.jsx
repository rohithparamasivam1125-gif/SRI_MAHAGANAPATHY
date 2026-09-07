import React, { useState } from 'react';
import { Edit3, X, AlertCircle } from 'lucide-react';
import { ProductCatalogGrid } from './ProductCatalogGrid';
import { CartTable } from './CartTable';
import { CheckoutModal } from './CheckoutModal';
import { InvoicePrintView } from './InvoicePrintView';
import { useApp } from '../../context/AppContext';

export const BillingScreen = () => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscountData, setCheckoutDiscountData] = useState({ overallDiscount: 0, overallDiscountType: 'percent' });
  const [draftInvoiceForPreview, setDraftInvoiceForPreview] = useState(null);
  const { 
    activeInvoiceForPrint, 
    setActiveInvoiceForPrint, 
    cart, 
    clearCart, 
    showToast,
    editingInvoice,
    cancelInvoiceEdit 
  } = useApp();

  const handleOpenCheckout = (discountData) => {
    if (discountData) {
      setCheckoutDiscountData(discountData);
    }
    setIsCheckoutOpen(true);
  };

  const handlePreviewBill = (draftInvoice, discountData) => {
    if (discountData) {
      setCheckoutDiscountData(discountData);
    }
    setDraftInvoiceForPreview(draftInvoice);
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 h-[calc(100vh-4.5rem)] flex flex-col">
      
      {/* Active Edit Mode Banner */}
      {editingInvoice && (
        <div className="mb-3 p-3 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-2 border-amber-500/80 text-amber-950 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in shadow-xs shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-950">
                  EDITING SAVED INVOICE: #{editingInvoice.invoiceNumber}
                </span>
                <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full border border-amber-300">
                  {editingInvoice.customerName || 'Walk-in Customer'}
                </span>
              </div>
              <p className="text-[11px] text-amber-900 font-bold">
                Modify products, sizes, quantities, or discounts, then click "Update & Save Bill" to save your edits.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={cancelInvoiceEdit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 text-xs font-black rounded-xl border border-amber-300 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-slate-600" />
            <span>Cancel Edit Mode</span>
          </button>
        </div>
      )}

      {/* 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 2xl:grid-cols-12 gap-3.5 sm:gap-4 flex-1 overflow-hidden no-print">
        
        {/* Left Side: Product Search, Category Filters, & Size Selector (7 cols on lg, 8 cols on 2xl) */}
        <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-8 h-full overflow-hidden flex flex-col">
          <ProductCatalogGrid />
        </div>

        {/* Right Side: Active Counter Bill & Fast Settle (5 cols on lg, 4 cols on 2xl) */}
        <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 h-full overflow-hidden flex flex-col">
          <CartTable 
            onOpenCheckout={handleOpenCheckout} 
            onPreviewBill={handlePreviewBill}
          />
        </div>

      </div>

      {/* Checkout & Payment Settle Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialDiscount={checkoutDiscountData}
      />

      {/* Draft Invoice Fullscreen Preview Modal (Before Saving) */}
      {draftInvoiceForPreview && (
        <InvoicePrintView
          invoice={draftInvoiceForPreview}
          isDraft={true}
          discountData={checkoutDiscountData}
          onUpdateDiscountData={setCheckoutDiscountData}
          onProceedToCheckout={(discountOverrides) => {
            const data = discountOverrides || checkoutDiscountData;
            setCheckoutDiscountData(data);
            setDraftInvoiceForPreview(null);
            handleOpenCheckout(data);
          }}
          onClose={() => setDraftInvoiceForPreview(null)}
        />
      )}

      {/* Invoice Print & Download Modal (After Saving) */}
      {activeInvoiceForPrint && (
        <InvoicePrintView
          invoice={activeInvoiceForPrint}
          isDraft={false}
          onClose={() => setActiveInvoiceForPrint(null)}
        />
      )}

    </div>
  );
};
