import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Receipt, 
  Check, 
  Share2,
  Zap,
  Droplets,
  Languages
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { PRINT_TRANSLATIONS } from '../../utils/printTranslations';

export const InvoicePrintView = ({ invoice, onClose }) => {
  const { settings, processCheckout } = useApp();
  const [printFormat, setPrintFormat] = useState('A4'); // 'A4' or 'Thermal'
  const [printLanguage, setPrintLanguage] = useState('en'); // 'en' | 'ta' | 'bilingual'
  const [isSaving, setIsSaving] = useState(false);

  if (!invoice) return null;

  const t = PRINT_TRANSLATIONS[printLanguage] || PRINT_TRANSLATIONS.en;

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      await processCheckout({
        customerName: invoice.customerName,
        customerPhone: invoice.customerPhone,
        paymentMode: invoice.paymentMode,
        notes: invoice.notes,
        discountOverall: invoice.rawOverallDiscount || 0,
        discountType: invoice.rawOverallDiscountType || 'percent',
        discountAmountDirect: invoice.rawOverallDiscountType === 'amount' ? (invoice.rawOverallDiscount || 0) : 0,
        isGstBill: invoice.isGstBill
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      
      {/* Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm">
                Invoice Preview: <span className="text-amber-300 font-mono-numbers">{invoice.invoiceNumber}</span>
              </h3>
              <p className="text-xs text-slate-400">Ready to print or save as PDF</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Language Toggle: English / தமிழ் / Bilingual */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700 text-xs">
              <span className="text-slate-400 pl-2 pr-1 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold uppercase">Lang:</span>
              </span>
              <button
                onClick={() => setPrintLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  printLanguage === 'en'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setPrintLanguage('ta')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  printLanguage === 'ta'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setPrintLanguage('bilingual')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                  printLanguage === 'bilingual'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bilingual (இருமொழி)
              </button>
            </div>

            {/* Format Toggle */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700 text-xs">
              <button
                onClick={() => setPrintFormat('A4')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  printFormat === 'A4'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                A4 Invoice
              </button>
              <button
                onClick={() => setPrintFormat('Thermal')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  printFormat === 'Thermal'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Thermal (80mm)
              </button>
            </div>

            {invoice.isUnsavedPreview ? (
              <>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Confirm & Save Bill'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  <span>Back to Edit</span>
                </button>
              </>
            ) : (
              <>
                {/* Print Button */}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Bill</span>
                </button>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {invoice.isUnsavedPreview && (
          <div className="no-print bg-amber-50 border-y border-amber-200 px-4 py-2 text-center text-xs font-bold text-amber-800 flex items-center justify-center gap-2">
            <span>⚠️ This is a DRAFT PREVIEW. The invoice has NOT been saved to the database.</span>
          </div>
        )}

        {/* Invoice Body Printable Area */}
        <div className="p-2 sm:p-6 overflow-y-auto max-h-[82vh] bg-slate-200/70 flex justify-center">
          
          {printFormat === 'A4' ? (
            /* ========================================================
               A4 TAX INVOICE FORMAT (OPTIMIZED FOR B&W PRINTERS)
               ======================================================== */
            <div className="w-full max-w-[210mm] bg-white p-6 rounded-lg shadow-sm border border-slate-300 text-black text-xs font-sans print:p-0 print:border-none print:shadow-none">
              
              {/* Compact Header: Logo + Shop Details on Left, Invoice & Customer Info on Right */}
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
                      <p><span className="font-normal text-slate-700">{t.invoiceNo}</span> <strong className="font-mono text-xs text-black">{invoice.invoiceNumber}</strong></p>
                      <p><span className="font-normal text-slate-700">{t.date}</span> {formatDate(invoice.date)}</p>
                      <p><span className="font-normal text-slate-700">{t.mode}</span> {invoice.paymentMode?.toUpperCase() || 'CASH'}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Row */}
                <div className="mt-2 pt-1.5 border-t border-dashed border-black/50 flex justify-between items-center text-[11px]">
                  <div>
                    <span className="font-normal text-slate-700">{t.billedTo} </span>
                    <strong className="font-black text-black">{invoice.customerName || (printLanguage === 'ta' ? 'வாடிக்கையாளர்' : 'Walk-in Customer')}</strong>
                    {invoice.customerPhone && <span className="ml-2 font-mono font-bold">({invoice.customerPhone})</span>}
                  </div>
                  {invoice.notes && (
                    <div className="text-right font-medium text-[10px] italic">
                      <span>{t.site} {invoice.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table - Maximum Priority & High-Contrast Lines */}
              <div className="border border-black rounded overflow-hidden mb-3">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-black text-white font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-1.5 px-2 w-7 text-center">{t.sNo}</th>
                      <th className="py-1.5 px-2.5">{t.description}</th>
                      <th className="py-1.5 px-2 w-20">{t.sizeSpec}</th>
                      <th className="py-1.5 px-2 w-14 text-center">{t.hsn}</th>
                      <th className="py-1.5 px-2 w-12 text-center">{t.qty}</th>
                      <th className="py-1.5 px-2 w-16 text-right">{t.rate}</th>
                      <th className="py-1.5 px-2 w-14 text-right">{t.discount}</th>
                      {invoice.isGstBill && <th className="py-1.5 px-2 w-12 text-right">{t.gst}</th>}
                      <th className="py-1.5 px-2.5 w-22 text-right">{t.amount}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/30">
                    {invoice.items?.map((item, index) => (
                      <tr key={index} className={index % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="py-1.5 px-2 text-center font-mono font-bold">{index + 1}</td>
                        <td className="py-1.5 px-2.5">
                          <span className="font-black text-black">{item.name}</span>
                          {item.brand && <span className="text-[9px] text-slate-700 block">{printLanguage === 'ta' ? `பிராண்டு: ${item.brand}` : `Brand: ${item.brand}`}</span>}
                        </td>
                        <td className="py-1.5 px-2 font-black text-black">{item.size}</td>
                        <td className="py-1.5 px-2 text-center font-mono">{item.hsnCode || '-'}</td>
                        <td className="py-1.5 px-2 text-center font-mono font-bold">{item.qty} {item.unit}</td>
                        <td className="py-1.5 px-2 text-right font-mono font-semibold">{Number(item.price).toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-right font-mono">{item.discountPercent ? `${item.discountPercent}%` : '-'}</td>
                        {invoice.isGstBill && <td className="py-1.5 px-2 text-right font-mono">{item.gstRate || 0}%</td>}
                        <td className="py-1.5 px-2.5 text-right font-mono font-black text-black">
                          {Number(item.lineTotal || (item.price * item.qty)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Perfectly Aligned Bottom Summary Section */}
              <div className="border border-black rounded p-3 space-y-3">
                
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
                      <span className="font-normal text-slate-800">{t.subtotal}</span>
                      <span className="font-mono font-bold">{formatCurrency(invoice.subtotal)}</span>
                    </div>

                    {invoice.isGstBill && invoice.totalTax > 0 && (
                      <div className="flex justify-between text-black">
                        <span className="font-normal text-slate-800">{t.gstTax}</span>
                        <span className="font-mono font-bold">{formatCurrency(invoice.totalTax)}</span>
                      </div>
                    )}

                    {invoice.discountAmount > 0 && (
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

                {/* Footer Baseline Signature Row */}
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
          ) : (
            /* ========================================================
               THERMAL RECEIPT FORMAT (80mm)
               ======================================================== */
            <div className="w-[80mm] bg-white p-4 rounded-lg shadow-xs border border-black text-black font-mono text-xs">
              <div className="text-center border-b border-dashed border-black pb-2 mb-2 flex flex-col items-center">
                <img 
                  src="/smg-logo-transparent.png" 
                  alt="SMG" 
                  className="w-12 h-12 object-contain mb-1"
                />
                <h2 className="font-black text-sm uppercase leading-tight">
                  {settings.shopName || 'SRI MAHAGANAPATHY'}
                </h2>
                <p className="text-[10px] text-black font-bold">{settings.phone}</p>
                {settings.gstin && <p className="text-[9px] text-black font-bold">GSTIN: {settings.gstin}</p>}
                <div className="border-t border-dashed border-black mt-1 pt-1 text-[10px] w-full text-left font-bold">
                  <p>Bill: {invoice.invoiceNumber}</p>
                  <p>{formatDate(invoice.date)}</p>
                  <p>Cust: {invoice.customerName || 'Walk-in'}</p>
                </div>
              </div>

              {/* Items */}
              <div className="border-b border-dashed border-black pb-2 mb-2">
                <div className="flex justify-between font-black text-[10px] uppercase border-b border-black pb-1 mb-1">
                  <span>Item</span>
                  <span>Qty x Rate = Amt</span>
                </div>
                {invoice.items?.map((item, idx) => (
                  <div key={idx} className="mb-1 text-[11px]">
                    <div className="font-black truncate text-black">{item.name} ({item.size})</div>
                    <div className="flex justify-between text-[10px] text-black font-bold">
                      <span>{item.qty} {item.unit} @ ₹{item.price}</span>
                      <span>₹{Number(item.lineTotal || (item.price * item.qty)).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-xs border-b border-dashed border-black pb-2 mb-2 font-bold">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.isGstBill && (
                  <div className="flex justify-between text-[10px]">
                    <span>GST Tax:</span>
                    <span>{formatCurrency(invoice.totalTax)}</span>
                  </div>
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

      </div>

    </div>
  );
};
