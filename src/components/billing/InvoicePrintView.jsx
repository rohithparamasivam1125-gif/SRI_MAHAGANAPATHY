import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Receipt, 
  Languages,
  ArrowLeft,
  ArrowRight,
  FileText
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { PRINT_TRANSLATIONS } from '../../utils/printTranslations';
import { paginateBillItems } from '../../utils/billPaginator';

export const InvoicePrintView = ({ invoice, onClose, isDraft = false, onProceedToCheckout = null }) => {
  const { settings } = useApp();
  const [printFormat, setPrintFormat] = useState('A4');
  const [printLanguage, setPrintLanguage] = useState('en');

  if (!invoice) return null;

  const t = PRINT_TRANSLATIONS[printLanguage] || PRINT_TRANSLATIONS.en;
  const items = invoice.items || [];
  // Used only for page-count badge in toolbar
  const pageCount = paginateBillItems(items).length;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 w-screen h-screen z-50 bg-slate-100 flex flex-col overflow-hidden animate-fade-in modal-fullscreen-container">
      
      {/* Top Full-Width Light Control Toolbar (Hidden when printing) */}
      <div className="no-print bg-white border-b border-slate-200 text-slate-900 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 shadow-xs">
        
        {/* Left: Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-black text-sm sm:text-base text-slate-900 tracking-tight">
                {isDraft ? 'Draft Bill Fullscreen Preview' : 'Tax Invoice'}
              </h3>
              {isDraft ? (
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Provisional Preview
                </span>
              ) : (
                <span className="text-blue-700 font-mono font-black text-xs sm:text-sm">
                  #{invoice.invoiceNumber}
                </span>
              )}
              {printFormat === 'A4' && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-bold">
                  {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {isDraft 
                ? `Total ${items.length} items • Review all sizes & rates before saving`
                : `${formatDate(invoice.date)} • ${invoice.customerName || 'Walk-in'}`}
            </p>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Language Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs">
            <span className="text-slate-500 pl-2 pr-1 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[10px] font-bold uppercase hidden sm:inline">Lang:</span>
            </span>
            {['en', 'ta', 'bilingual'].map((lang) => (
              <button
                key={lang}
                onClick={() => setPrintLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  printLanguage === lang ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'Bilingual (இருமொழி)'}
              </button>
            ))}
          </div>

          {/* Format Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs">
            {['A4', 'Thermal'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setPrintFormat(fmt)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  printFormat === fmt ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fmt === 'A4' ? 'A4 Bill' : 'Thermal (80mm)'}
              </button>
            ))}
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
            title="Send to physical printer or save as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>{isDraft ? 'Print Draft' : 'Print Bill'}</span>
          </button>

          {/* Back to Edit (Draft mode) */}
          {isDraft && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit</span>
            </button>
          )}

          {/* Proceed to Checkout (Draft mode) */}
          {isDraft && onProceedToCheckout && (
            <button
              onClick={onProceedToCheckout}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-black rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Close (non-draft) */}
          {!isDraft && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors ml-1"
              title="Close window"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ============================================================
          MAIN SCROLL CANVAS
          ============================================================ */}
      <div className="flex-1 overflow-y-auto bg-slate-200/80 py-6 px-3 sm:px-6 flex flex-col items-center print-scroll-canvas">

        {printFormat === 'A4' ? (

          /* ============================================================
             SINGLE CONTINUOUS A4 DOCUMENT
             All items in one table — browser handles print page breaks
             No paginator splitting = no missing items
             ============================================================ */
          <div className="w-full max-w-[210mm] bg-white rounded-lg shadow-xl border border-slate-300 print:border-none print:shadow-none print:rounded-none text-black text-xs font-sans print-document">
            <div className="p-6 sm:p-8 print-document-inner">

              {/* FULL BRANDING & INVOICE HEADER */}
              <div className="border-b-2 border-black pb-2.5 mb-2.5">
                <div className="flex justify-between items-start gap-3">
                  
                  {/* Left: Logo & Shop Details */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <img 
                      src="/smg-logo-transparent.png" 
                      alt="SMG" 
                      className="w-12 h-12 object-contain shrink-0 mt-0.5"
                    />
                    <div>
                      <h1 className="text-base font-black text-black tracking-tight uppercase leading-tight">
                        {settings.shopName || invoice.shopDetails?.name || 'SRI MAHAGANAPATHY ELECTRICALS AND HARDWARE'}
                      </h1>
                      <p className="text-[10px] text-black font-semibold mt-0.5">
                        {printLanguage === 'ta' 
                          ? 'மொத்த மற்றும் சில்லறை எலக்ட்ரிக்கல்ஸ், ஹார்டுவேர்ஸ்'
                          : printLanguage === 'bilingual'
                          ? 'மொத்த / சில்லறை எலக்ட்ரிக்கல்ஸ் & ஹார்டுவேர்ஸ் / Wholesale & Retail Electricals, Hardware Solutions'
                          : (settings.tagline || 'Wholesale & Retail Electricals, Hardware Solutions')}
                      </p>
                      <p className="text-[10px] text-black mt-0.5">
                        📍 {settings.address || invoice.shopDetails?.address}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-black mt-0.5">
                        <span>📞 {settings.phone || invoice.shopDetails?.phone}</span>
                        {settings.gstin && <span>GSTIN: <strong className="font-mono">{settings.gstin}</strong></span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Invoice Type, Number & Date */}
                  <div className="text-right shrink-0">
                    <div className="inline-block px-2.5 py-0.5 bg-black text-white font-black text-[10px] uppercase tracking-wider rounded">
                      {invoice.isGstBill ? t.taxInvoice : t.cashBill}
                    </div>
                    <div className="text-[10px] space-y-0.5 mt-1 text-black font-bold">
                      <p>
                        <span className="font-normal text-slate-700">{t.invoiceNo}</span>{' '}
                        <strong className="font-mono text-xs text-black">{invoice.invoiceNumber}</strong>
                      </p>
                      <p><span className="font-normal text-slate-700">{t.date}</span> {formatDate(invoice.date)}</p>
                      <p><span className="font-normal text-slate-700">{t.mode}</span> {invoice.paymentMode?.toUpperCase() || 'CASH'}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Row */}
                <div className="mt-2 pt-1.5 border-t border-dashed border-black/50 flex flex-wrap justify-between items-center text-[11px] gap-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <div>
                      <span className="font-normal text-slate-700">{t.billedTo} </span>
                      <strong className="font-black text-black">
                        {invoice.customerName || (printLanguage === 'ta' ? 'வாடிக்கையாளர்' : 'Walk-in Customer')}
                      </strong>
                      {invoice.customerPhone && <span className="ml-1.5 font-mono font-bold">({invoice.customerPhone})</span>}
                    </div>
                    {invoice.customerGstin && (
                      <span className="font-mono text-[10px] font-bold bg-slate-100 text-black px-1.5 py-0.5 rounded border border-black/30">
                        GSTIN: <strong className="font-black">{invoice.customerGstin}</strong>
                      </span>
                    )}
                  </div>
                  {invoice.notes && (
                    <div className="text-right font-medium text-[10px] italic">
                      <span>{t.site} {invoice.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ITEMS TABLE — ALL items, browser auto-breaks pages */}
              <div className="border border-black rounded mb-2 overflow-visible">
                <table className="w-full text-left border-collapse text-[10.5px]">
                  <thead>
                    <tr className="bg-black text-white font-bold text-[9.5px] uppercase tracking-wider">
                      <th className="py-1 px-2 w-7 text-center">{t.sNo}</th>
                      <th className="py-1 px-2 w-28">{t.sizeSpec}</th>
                      <th className="py-1 px-2.5">{t.description}</th>
                      <th className="py-1 px-2 w-14 text-center">{t.qty}</th>
                      <th className="py-1 px-2 w-16 text-right">{t.rate}</th>
                      {invoice.showDiscount !== false && <th className="py-1 px-2 w-14 text-right">{t.discount}</th>}
                      {invoice.isGstBill && <th className="py-1 px-2 w-12 text-right">{t.gst}</th>}
                      <th className="py-1 px-2.5 w-22 text-right">{t.amount}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/30">
                    {items.map((item, idx) => (
                      <tr
                        key={idx}
                        className={`print-item-row ${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
                      >
                        <td className="py-1 px-2 text-center font-mono font-bold">{idx + 1}</td>
                        <td className="py-1 px-2 font-black text-black leading-tight">{item.size}</td>
                        <td className="py-1 px-2.5">
                          <span className="font-black text-black leading-tight">{item.name}</span>
                          {item.brand && (
                            <span className="text-[8.5px] text-slate-700 block leading-tight mt-0.5">
                              {printLanguage === 'ta' ? `பிராண்டு: ${item.brand}` : `Brand: ${item.brand}`}
                            </span>
                          )}
                        </td>
                        <td className="py-1 px-2 text-center font-mono font-bold">{item.qty} {item.unit}</td>
                        <td className="py-1 px-2 text-right font-mono font-semibold">{Number(item.price).toFixed(2)}</td>
                        {invoice.showDiscount !== false && (
                          <td className="py-1 px-2 text-right font-mono">{item.discountPercent ? `${item.discountPercent}%` : '-'}</td>
                        )}
                        {invoice.isGstBill && <td className="py-1 px-2 text-right font-mono">{item.gstRate || 0}%</td>}
                        <td className="py-1 px-2.5 text-right font-mono font-black text-black">
                          {Number(item.lineTotal || (item.price * item.qty)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TOTALS, TERMS & SIGNATURE BLOCK */}
              <div className="print-totals-block border border-black rounded p-3 space-y-3">
                <div className="grid grid-cols-12 gap-4">
                  
                  {/* Terms & Conditions (7 cols) */}
                  <div className="col-span-7 flex flex-col justify-between text-[10px] space-y-1.5">
                    <div>
                      <h5 className="font-black text-black uppercase tracking-wider text-[10px] mb-0.5">
                        {t.termsHeader}
                      </h5>
                      <ul className="text-black font-medium text-[9px] space-y-0.5 list-disc pl-3">
                        {t.billTerms.map((term, i) => (
                          <li key={i}>{term}</li>
                        ))}
                      </ul>
                    </div>
                    {settings.upiId && (
                      <div className="pt-1.5 border-t border-dashed border-black/40 text-[10px] font-bold text-black">
                        <span>{t.upiId} </span>
                        <strong className="font-mono text-black font-black">{settings.upiId}</strong>
                      </div>
                    )}
                  </div>

                  {/* Totals Table (5 cols) */}
                  <div className="col-span-5 space-y-1 text-[11px] font-bold border-l border-black pl-3">
                    <div className="flex justify-between text-black">
                      <span className="font-normal text-slate-800">{invoice.isGstBill ? (t.taxableAmount || 'Taxable Value:') : t.subtotal}</span>
                      <span className="font-mono font-bold">
                        {formatCurrency(invoice.showDiscount === false ? (invoice.subtotal - (invoice.discountAmount || 0)) : invoice.subtotal)}
                      </span>
                    </div>
                    {invoice.isGstBill && (invoice.totalTax > 0 || invoice.cgstAmount > 0) && (
                      <>
                        <div className="flex justify-between text-black">
                          <span className="font-normal text-slate-800">{t.cgstTax || 'CGST:'}</span>
                          <span className="font-mono font-bold">{formatCurrency(invoice.cgstAmount ?? (invoice.totalTax / 2))}</span>
                        </div>
                        <div className="flex justify-between text-black">
                          <span className="font-normal text-slate-800">{t.sgstTax || 'SGST:'}</span>
                          <span className="font-mono font-bold">{formatCurrency(invoice.sgstAmount ?? (invoice.totalTax / 2))}</span>
                        </div>
                      </>
                    )}
                    {invoice.showDiscount !== false && invoice.discountAmount > 0 && (
                      <div className="flex justify-between text-black">
                        <span>{t.discountAmount} ({invoice.discountOverall}%):</span>
                        <span className="font-mono font-bold">- {formatCurrency(invoice.discountAmount)}</span>
                      </div>
                    )}
                    {invoice.roundOff !== 0 && (
                      <div className="flex justify-between text-[10px] text-slate-700">
                        <span className="font-normal">{t.roundOff}</span>
                        <span className="font-mono">{invoice.roundOff > 0 ? `+₹${invoice.roundOff}` : `-₹${Math.abs(invoice.roundOff)}`}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1.5 px-2 bg-black text-white rounded text-xs font-black mt-1">
                      <span>{t.grandTotal}</span>
                      <span className="font-mono text-sm font-black">{formatCurrency(invoice.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Signature Row */}
                <div className="pt-2 border-t border-black flex justify-between items-end text-[10px]">
                  <div className="text-black font-semibold">
                    <span>{t.thankYou}</span>
                  </div>
                  <div className="text-center min-w-[190px]">
                    <p className="text-[9px] font-bold uppercase text-black mb-4">
                      {t.forShop(settings.shopName || 'Sri Mahaganapathy Electricals')}
                    </p>
                    <div className="border-t border-black pt-1">
                      <span className="font-black text-black text-[10px]">{t.authorizedSignatory}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        ) : (

          /* ============================================================
             THERMAL RECEIPT FORMAT (80mm) — unchanged
             ============================================================ */
          <div className="w-[80mm] bg-white p-4 rounded-lg shadow-xl border border-black text-black font-mono text-xs my-auto">
            <div className="text-center border-b border-dashed border-black pb-2 mb-2 flex flex-col items-center">
              <img src="/smg-logo-transparent.png" alt="SMG" className="w-12 h-12 object-contain mb-1" />
              <h2 className="font-black text-sm uppercase leading-tight">
                {settings.shopName || 'SRI MAHAGANAPATHY'}
              </h2>
              <p className="text-[10px] text-black font-bold">{settings.phone}</p>
              {settings.gstin && <p className="text-[9px] text-black font-bold">GSTIN: {settings.gstin}</p>}
              <div className="border-t border-dashed border-black mt-1 pt-1 text-[10px] w-full text-left font-bold space-y-0.5">
                <p>Bill: {invoice.invoiceNumber}</p>
                <p>{formatDate(invoice.date)}</p>
                <p>Cust: {invoice.customerName || 'Walk-in'}</p>
                {invoice.customerPhone && <p>Ph: {invoice.customerPhone}</p>}
                {invoice.customerGstin && <p>Cust GSTIN: {invoice.customerGstin}</p>}
              </div>
            </div>

            <div className="border-b border-dashed border-black pb-2 mb-2">
              <div className="flex justify-between font-black text-[10px] uppercase border-b border-black pb-1 mb-1">
                <span>Item</span>
                <span>Qty x Rate = Amt</span>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="mb-1 text-[11px]">
                  <div className="font-black truncate text-black">{item.name} ({item.size})</div>
                  <div className="flex justify-between text-[10px] text-black font-bold">
                    <span>{item.qty} {item.unit} @ ₹{item.price}</span>
                    <span>₹{Number(item.lineTotal || (item.price * item.qty)).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs border-b border-dashed border-black pb-2 mb-2 font-bold">
              <div className="flex justify-between">
                <span>{invoice.isGstBill ? 'Taxable Subtotal:' : 'Subtotal:'}</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.isGstBill && (invoice.totalTax > 0 || invoice.cgstAmount > 0) && (
                <>
                  <div className="flex justify-between text-[10px]">
                    <span>CGST:</span>
                    <span>{formatCurrency(invoice.cgstAmount ?? (invoice.totalTax / 2))}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>SGST:</span>
                    <span>{formatCurrency(invoice.sgstAmount ?? (invoice.totalTax / 2))}</span>
                  </div>
                </>
              )}
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span>Discount:</span>
                  <span>- {formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-1 border-t border-black">
                <span>TOTAL:</span>
                <span>{formatCurrency(invoice.grandTotal)}</span>
              </div>
              {settings.upiId && (
                <div className="text-center text-[10px] pt-1">
                  UPI: <strong>{settings.upiId}</strong>
                </div>
              )}
            </div>

            <div className="text-center text-[9px] text-black font-bold">
              <p>Thank you for your business!</p>
              <p>Visit Again</p>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Sticky Action Footer (Draft mode only) */}
      {isDraft && (
        <div className="no-print bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Grand Total:</span>
            <span className="text-xl font-black text-blue-700 font-mono-numbers">
              {formatCurrency(invoice.grandTotal)}
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              ({items.length} items • {pageCount} {pageCount === 1 ? 'page' : 'pages'})
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit Bill</span>
            </button>

            {onProceedToCheckout && (
              <button
                onClick={onProceedToCheckout}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
