import React, { useState } from 'react';
import { ProductCatalogGrid } from './ProductCatalogGrid';
import { CartTable } from './CartTable';
import { CheckoutModal } from './CheckoutModal';
import { InvoicePrintView } from './InvoicePrintView';
import { useApp } from '../../context/AppContext';

export const BillingScreen = () => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscountData, setCheckoutDiscountData] = useState({ overallDiscount: 0, overallDiscountType: 'percent' });
  const { activeInvoiceForPrint, setActiveInvoiceForPrint } = useApp();

  const handleOpenCheckout = (discountData) => {
    if (discountData) {
      setCheckoutDiscountData(discountData);
    }
    setIsCheckoutOpen(true);
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 h-[calc(100vh-4.5rem)] flex flex-col">
      
      {/* 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 2xl:grid-cols-12 gap-3.5 sm:gap-4 flex-1 overflow-hidden">
        
        {/* Left Side: Product Search, Category Filters, & Size Selector (7 cols on lg, 8 cols on 2xl) */}
        <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-8 h-full overflow-hidden flex flex-col">
          <ProductCatalogGrid />
        </div>

        {/* Right Side: Active Counter Bill & Fast Settle (5 cols on lg, 4 cols on 2xl) */}
        <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 h-full overflow-hidden flex flex-col">
          <CartTable onOpenCheckout={handleOpenCheckout} />
        </div>

      </div>

      {/* Checkout & Payment Settle Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialDiscount={checkoutDiscountData}
      />

      {/* Invoice Print & Download Modal */}
      {activeInvoiceForPrint && (
        <InvoicePrintView
          invoice={activeInvoiceForPrint}
          onClose={() => setActiveInvoiceForPrint(null)}
        />
      )}

    </div>
  );
};
