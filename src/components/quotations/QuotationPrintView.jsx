import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  ShoppingCart, 
  Zap, 
  Droplets, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle,
  FileText,
  Languages
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { PRINT_TRANSLATIONS } from '../../utils/printTranslations';

export const QuotationPrintView = ({ quotation, onClose }) => {
  const { settings, convertQuotationToActiveBill } = useApp();
  const [printLanguage, setPrintLanguage] = useState('en'); // 'en' | 'ta' | 'bilingual'

  if (!quotation) return null;

  const t = PRINT_TRANSLATIONS[printLanguage] || PRINT_TRANSLATIONS.en;

  const handlePrint = () => {
    window.print();
  };

  const handleConvertToBill = () => {
    convertQuotationToActiveBill(quotation);
    onClose();
  };

  const items = quotation.items || [];
  const shop = quotation.shopDetails || settings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      
      {/* Modal Card */}
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200 max-h-[95vh]">
        
        {/* Top Control Bar (Screen Only) */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 no-print shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-black text-sm sm:text-base">Quotation #{quotation.quotationNumber}</h3>
              <p className="text-xs text-slate-400">Formal Price Estimate Proposal</p>
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

            {/* Convert to Bill Button */}
            <button
              onClick={handleConvertToBill}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              title="Convert this quotation directly into an active Counter Bill for billing"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Convert to Bill</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Quote</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-2 sm:p-6 overflow-y-auto flex-1 bg-slate-200/70 flex justify-center">
          
          <div className="w-full max-w-[210mm] bg-white p-6 rounded-lg shadow-sm border border-slate-300 text-black text-xs font-sans print:p-0 print:border-none print:shadow-none">
            
            {/* Compact Header */}
            <div className="border-b-2 border-black pb-2.5 mb-2.5">
              <div className="flex justify-between items-start gap-3">
                
                {/* Left: Logo & Shop Info */}
                <div className="flex items-start gap-2.5 min-w-0">
                  <img 
                    src="/smg-logo-transparent.png" 
                    alt="SMG" 
                    className="w-12 h-12 object-contain shrink-0 mt-0.5"
                  />
                  <div>
                    <h1 className="text-base font-black text-black tracking-tight uppercase leading-tight">
                      {shop.name || settings.shopName || "Sri Mahaganapathy Electricals and Hardware"}
                    </h1>
                    <p className="text-[10px] text-black font-semibold mt-0.5">
                      {printLanguage === 'ta'
                        ? 'மொத்த மற்றும் சில்லறை எலக்ட்ரிக்கல்ஸ், ஹார்டுவேர்ஸ்'
                        : printLanguage === 'bilingual'
                        ? 'மொத்த / சில்லறை எலக்ட்ரிக்கல்ஸ் & ஹார்டுவேர்ஸ் / Wholesale & Retail Electricals, Hardware Solutions'
                        : (shop.tagline || settings.tagline || 'Wholesale & Retail Electricals, Hardware Solutions')}
                    </p>
                    <p className="text-[10px] text-black mt-0.5">
                      📍 {shop.address || settings.address}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-black mt-0.5">
                      <span>📞 {shop.phone || settings.phone}</span>
                      {shop.gstin && <span>GSTIN: <strong className="font-mono">{shop.gstin}</strong></span>}
                    </div>
                  </div>
                </div>

                {/* Right: Quotation Metadata */}
                <div className="text-right shrink-0">
                  <div className="inline-block px-2.5 py-0.5 bg-black text-white font-black text-[10px] uppercase tracking-wider rounded">
                    {t.quotationTitle}
                  </div>
                  <div className="text-[10px] space-y-0.5 mt-1 text-black font-bold">
                    <p><span className="font-normal text-slate-700">{t.quoteNo}</span> <strong className="font-mono text-xs text-black">{quotation.quotationNumber}</strong></p>
                    <p><span className="font-normal text-slate-700">{t.date}</span> {formatDate(quotation.date)}</p>
                    {quotation.validUntil && (
                      <p><span className="font-normal text-slate-700">{t.validTill}</span> {formatDate(quotation.validUntil)}</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Client & Project Row */}
              <div className="mt-2 pt-1.5 border-t border-dashed border-black/50 flex justify-between items-center text-[11px]">
                <div>
                  <span className="font-normal text-slate-700">{t.client} </span>
                  <strong className="font-black text-black">{quotation.customerName || (printLanguage === 'ta' ? 'வாடிக்கையாளர்' : 'Prospective Client')}</strong>
                  {quotation.customerPhone && <span className="ml-2 font-mono font-bold">({quotation.customerPhone})</span>}
                </div>
                {quotation.siteLocation && (
                  <div className="text-right font-medium text-[10px]">
                    <span>{t.site} <strong>{quotation.siteLocation}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table - High Priority & High Contrast */}
            <div className="border border-black rounded overflow-hidden mb-3">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-black text-white font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-1.5 px-2 w-7 text-center">{t.sNo}</th>
                    <th className="py-1.5 px-2.5">{t.description}</th>
                    <th className="py-1.5 px-2 w-20">{t.sizeSpec}</th>
                    <th className="py-1.5 px-2 w-12 text-center">{t.qty}</th>
                    <th className="py-1.5 px-2 w-12 text-center">{t.unit}</th>
                    <th className="py-1.5 px-2 w-16 text-right">{t.rate}</th>
                    {quotation.isGstEstimate && <th className="py-1.5 px-2 w-12 text-right">{t.gst}</th>}
                    <th className="py-1.5 px-2.5 w-22 text-right">{t.amount}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/30">
                  {items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="py-1.5 px-2 text-center font-mono font-bold">{idx + 1}</td>
                      <td className="py-1.5 px-2.5">
                        <span className="font-black text-black">{item.name}</span>
                        {item.brand && <span className="text-[9px] text-slate-700 block">{printLanguage === 'ta' ? `பிராண்டு: ${item.brand}` : `Brand: ${item.brand}`}</span>}
                      </td>
                      <td className="py-1.5 px-2 font-black text-black">{item.size}</td>
                      <td className="py-1.5 px-2 text-center font-mono font-bold">{item.qty}</td>
                      <td className="py-1.5 px-2 text-center font-mono">{item.unit}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-semibold">{item.price?.toFixed(2)}</td>
                      {quotation.isGstEstimate && (
                        <td className="py-1.5 px-2 text-right font-mono">{item.gstRate || 18}%</td>
                      )}
                      <td className="py-1.5 px-2.5 text-right font-mono font-black text-black">
                        {item.lineTotal ? item.lineTotal.toFixed(2) : (item.price * item.qty).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary Section */}
            <div className="border border-black rounded p-3 space-y-3">
              
              <div className="grid grid-cols-12 gap-4">
                
                {/* Terms (7 cols) */}
                <div className="col-span-7 flex flex-col justify-between text-[10px] space-y-1.5">
                  <div>
                    <h5 className="font-black text-black uppercase tracking-wider text-[10px] mb-0.5">
                      {t.quotationTermsHeader}
                    </h5>
                    <ul className="text-black font-medium text-[9px] space-y-0.5 list-disc pl-3">
                      {t.quotationTerms(quotation.validityDays).map((term, i) => (
                        <li key={i}>{term}</li>
                      ))}
                      {quotation.notes && <li className="font-bold">{quotation.notes}</li>}
                    </ul>
                  </div>

                  {settings.upiId && (
                    <div className="pt-1.5 border-t border-dashed border-black/40 text-[10px] font-bold text-black">
                      <span>{t.upiId} </span>
                      <strong className="font-mono text-black font-black">{settings.upiId}</strong>
                    </div>
                  )}
                </div>

                {/* Totals (5 cols) */}
                <div className="col-span-5 space-y-1 text-[11px] font-bold border-l border-black pl-3">
                  <div className="flex justify-between text-black">
                    <span className="font-normal text-slate-800">{t.subtotal} ({items.length} {t.qty}):</span>
                    <span className="font-mono font-bold">{formatCurrency(quotation.subtotal)}</span>
                  </div>

                  {quotation.isGstEstimate && (
                    <div className="flex justify-between text-black">
                      <span className="font-normal text-slate-800">{t.estimatedGst}</span>
                      <span className="font-mono font-bold">{formatCurrency(quotation.totalTax)}</span>
                    </div>
                  )}

                  {quotation.discountAmount > 0 && (
                    <div className="flex justify-between text-black">
                      <span>{t.discountAmount}</span>
                      <span className="font-mono font-bold">- {formatCurrency(quotation.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1.5 px-2 bg-black text-white rounded text-xs font-black mt-1">
                    <span>{t.estimatedTotal}</span>
                    <span className="font-mono text-sm font-black">{formatCurrency(quotation.grandTotal)}</span>
                  </div>
                </div>

              </div>

              {/* Baseline Signature Row */}
              <div className="pt-2 border-t border-black flex justify-between items-end text-[10px]">
                <div className="text-black font-semibold">
                  <span>{t.thankYou}</span>
                </div>

                <div className="text-center min-w-[190px]">
                  <p className="text-[9px] font-bold uppercase text-black mb-4">
                    {t.forShop(shop.name || settings.shopName || 'Sri Mahaganapathy Electricals')}
                  </p>
                  <div className="border-t border-black pt-1">
                    <span className="font-black text-black text-[10px]">{t.authorizedSignatory}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
