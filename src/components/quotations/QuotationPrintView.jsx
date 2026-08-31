import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, 
  Printer, 
  FileText, 
  Languages, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { PRINT_TRANSLATIONS } from '../../utils/printTranslations';
import { paginateBillItems } from '../../utils/billPaginator';

// ── Firestore Timestamp → ISO string helper ──────────────────────────────────
const toSafeString = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (val && typeof val.toDate === 'function') return val.toDate().toISOString();
  if (val && val.seconds) return new Date(val.seconds * 1000).toISOString();
  return String(val);
};

// Sanitize a quotation loaded from Firestore so nothing can crash the view
const sanitizeQuotation = (q) => {
  if (!q) return null;
  return {
    ...q,
    date: toSafeString(q.date) || new Date().toISOString(),
    validUntil: toSafeString(q.validUntil) || null,
    customerName: q.customerName || 'Prospective Client',
    customerPhone: q.customerPhone || '',
    customerGstin: q.customerGstin || '',
    siteLocation: q.siteLocation || '',
    quotationNumber: q.quotationNumber || 'DRAFT',
    subtotal: Number(q.subtotal) || 0,
    totalTax: Number(q.totalTax) || 0,
    discountAmount: Number(q.discountAmount) || 0,
    discountOverall: Number(q.discountOverall) || 0,
    grandTotal: Number(q.grandTotal) || 0,
    isGstEstimate: q.isGstEstimate !== undefined ? q.isGstEstimate : false,
    items: Array.isArray(q.items) ? q.items.map((item) => ({
      name: item.name || 'Item',
      brand: item.brand || '',
      size: item.size || '',
      qty: Number(item.qty) || 1,
      unit: item.unit || 'Pcs',
      price: Number(item.price) || 0,
      gstRate: Number(item.gstRate) || 18,
      lineTotal: Number(item.lineTotal) || (Number(item.price) * Number(item.qty)),
    })) : [],
    shopDetails: q.shopDetails || {},
  };
};

// ── Error Boundary to prevent full page crash ───────────────────────────────
class PrintErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 max-w-md text-center shadow-xl">
            <p className="text-rose-700 font-black text-lg mb-2">Could not load quotation preview</p>
            <p className="text-rose-500 text-sm font-medium mb-4">{String(this.state.error)}</p>
            <button
              onClick={this.props.onClose}
              className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const QuotationPrintViewInner = ({ 
  quotation: rawQuotation, 
  onClose, 
  isDraft = false, 
  onConfirmAndSave = null,
  onConfirmSave = null
}) => {
  const quotation = sanitizeQuotation(rawQuotation);
  const { settings, convertQuotationToActiveBill } = useApp();
  const [printLanguage, setPrintLanguage] = useState('en');
  const handleSave = onConfirmAndSave || onConfirmSave;

  if (!quotation) return null;

  const t = PRINT_TRANSLATIONS[printLanguage] || PRINT_TRANSLATIONS.en;
  const items = quotation.items || [];
  // Used only for page-count badge in toolbar
  const pageCount = paginateBillItems(items).length;
  const shop = quotation.shopDetails || settings;

  const handlePrint = () => window.print();

  const handleConvertToBill = () => {
    convertQuotationToActiveBill(quotation);
    onClose();
  };

  return (
    <div className="fixed inset-0 w-screen h-screen z-50 bg-slate-100 flex flex-col overflow-hidden animate-fade-in modal-fullscreen-container">
      
      {/* Top Full-Width Control Bar (Screen Only - Light Theme) */}
      <div className="no-print bg-white border-b border-slate-200 text-slate-900 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 shadow-xs">
        
        {/* Left: Title & Metadata */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-black text-sm sm:text-base text-slate-900 tracking-tight">
                {isDraft ? 'Draft Quotation Fullscreen Preview' : 'Official Price Quotation / Estimate'}
              </h3>
              {isDraft ? (
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Draft Preview
                </span>
              ) : (
                <span className="text-sky-700 font-mono font-black text-xs sm:text-sm">
                  #{quotation.quotationNumber}
                </span>
              )}
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-bold">
                {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {isDraft
                ? `Total ${items.length} items • Verify rates & client specifications before generating`
                : `${formatDate(quotation.date)} • Client: ${quotation.customerName || 'Walk-in'}`}
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

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
            title="Print Quotation or Save as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>{isDraft ? 'Print Draft' : 'Print Quotation'}</span>
          </button>

          {/* Non-draft: Convert to Active Bill */}
          {!isDraft && (
            <button
              onClick={handleConvertToBill}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95"
              title="Load items from this quotation directly into Counter Billing Cart"
            >
              <span>Convert to Bill</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Draft: Back to Edit */}
          {isDraft && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit</span>
            </button>
          )}

          {/* Draft: Confirm & Save */}
          {isDraft && handleSave && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-black rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <span>Confirm & Save</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Close (non-draft) */}
          {!isDraft && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors ml-1"
              title="Close preview"
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

        {/* ============================================================
            SINGLE CONTINUOUS A4 DOCUMENT
            All items in one table — browser handles print page breaks
            ============================================================ */}
        <div className="w-full max-w-[210mm] bg-white rounded-lg shadow-xl border border-slate-300 print:border-none print:shadow-none print:rounded-none text-black text-xs font-sans print-document">
          <div className="p-6 sm:p-8 print-document-inner">

            {/* FULL BRANDING & QUOTATION HEADER */}
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
                      {shop.name || settings.shopName || 'Sri Mahaganapathy Electricals and Hardware'}
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
                      {(shop.gstin || settings.gstin) && (
                        <span>GSTIN: <strong className="font-mono">{shop.gstin || settings.gstin}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quotation Metadata */}
                <div className="text-right shrink-0">
                  <div className="inline-block px-2.5 py-0.5 bg-black text-white font-black text-[10px] uppercase tracking-wider rounded">
                    {t.quotationTitle}
                  </div>
                  <div className="text-[10px] space-y-0.5 mt-1 text-black font-bold">
                    <p>
                      <span className="font-normal text-slate-700">{t.quoteNo}</span>{' '}
                      <strong className="font-mono text-xs text-black">{quotation.quotationNumber}</strong>
                    </p>
                    <p><span className="font-normal text-slate-700">{t.date}</span> {formatDate(quotation.date)}</p>
                    {quotation.validUntil && (
                      <p><span className="font-normal text-slate-700">{t.validTill}</span> {formatDate(quotation.validUntil)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Client & Project Row */}
              <div className="mt-2 pt-1.5 border-t border-dashed border-black/50 flex flex-wrap justify-between items-center text-[11px] gap-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <div>
                    <span className="font-normal text-slate-700">{t.client} </span>
                    <strong className="font-black text-black">
                      {quotation.customerName || (printLanguage === 'ta' ? 'வாடிக்கையாளர்' : 'Prospective Client')}
                    </strong>
                    {quotation.customerPhone && (
                      <span className="ml-1.5 font-mono font-bold">({quotation.customerPhone})</span>
                    )}
                  </div>
                  {quotation.customerGstin && (
                    <span className="font-mono text-[10px] font-bold bg-slate-100 text-black px-1.5 py-0.5 rounded border border-black/30">
                      GSTIN: <strong className="font-black">{quotation.customerGstin}</strong>
                    </span>
                  )}
                </div>
                {quotation.siteLocation && (
                  <div className="text-right font-medium text-[10px]">
                    <span>{t.site} <strong>{quotation.siteLocation}</strong></span>
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
                    <th className="py-1 px-2 w-12 text-center">{t.qty}</th>
                    <th className="py-1 px-2 w-12 text-center">{t.unit}</th>
                    <th className="py-1 px-2 w-16 text-right">{t.rate}</th>
                    {quotation.isGstEstimate && <th className="py-1 px-2 w-12 text-right">{t.gst}</th>}
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
                      <td className="py-1 px-2 text-center font-mono font-bold">{item.qty}</td>
                      <td className="py-1 px-2 text-center font-mono">{item.unit}</td>
                      <td className="py-1 px-2 text-right font-mono font-semibold">
                        {Number(item.price || 0).toFixed(2)}
                      </td>
                      {quotation.isGstEstimate && (
                        <td className="py-1 px-2 text-right font-mono">{item.gstRate || 18}%</td>
                      )}
                      <td className="py-1 px-2.5 text-right font-mono font-black text-black">
                        {item.lineTotal
                          ? Number(item.lineTotal).toFixed(2)
                          : (Number(item.price || 0) * Number(item.qty || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTALS, TERMS & SIGNATURE BLOCK */}
            <div className="print-totals-block border border-black rounded p-3 space-y-3">
              <div className="grid grid-cols-12 gap-4">
                
                {/* Terms (7 cols) */}
                <div className="col-span-7 flex flex-col justify-between text-[10px] space-y-1.5">
                  <div>
                    <h5 className="font-black text-black uppercase tracking-wider text-[10px] mb-0.5">
                      {t.quotationTermsHeader}
                    </h5>
                    <ul className="text-black font-medium text-[9px] space-y-0.5 list-disc pl-3">
                      {(typeof t.quotationTerms === 'function'
                        ? t.quotationTerms(quotation.validityDays || 15)
                        : Array.isArray(t.quotationTerms)
                        ? t.quotationTerms
                        : []
                      ).map((term, i) => (
                        <li key={i}>{term}</li>
                      ))}
                    </ul>
                  </div>
                  {(shop.upiId || settings.upiId) && (
                    <div className="pt-1.5 border-t border-dashed border-black/40 text-[10px] font-bold text-black">
                      <span>{t.upiId} </span>
                      <strong className="font-mono text-black font-black">{shop.upiId || settings.upiId}</strong>
                    </div>
                  )}
                </div>

                {/* Totals Box (5 cols) */}
                <div className="col-span-5 space-y-1 text-[11px] font-bold border-l border-black pl-3">
                  <div className="flex justify-between text-black">
                    <span className="font-normal text-slate-800">{quotation.isGstEstimate ? (t.taxableAmount || 'Taxable Value:') : t.subtotal}</span>
                    <span className="font-mono font-bold">
                      {formatCurrency(quotation.showDiscount === false ? (quotation.subtotal - (quotation.discountAmount || 0)) : quotation.subtotal)}
                    </span>
                  </div>
                  {quotation.isGstEstimate && (quotation.totalTax > 0 || quotation.cgstAmount > 0) && (
                    <>
                      <div className="flex justify-between text-black">
                        <span className="font-normal text-slate-800">{t.cgstTax || 'CGST:'}</span>
                        <span className="font-mono font-bold">{formatCurrency(quotation.cgstAmount ?? (quotation.totalTax / 2))}</span>
                      </div>
                      <div className="flex justify-between text-black">
                        <span className="font-normal text-slate-800">{t.sgstTax || 'SGST:'}</span>
                        <span className="font-mono font-bold">{formatCurrency(quotation.sgstAmount ?? (quotation.totalTax / 2))}</span>
                      </div>
                    </>
                  )}
                  {quotation.showDiscount !== false && quotation.discountAmount > 0 && (
                    <div className="flex justify-between text-black">
                      <span>{t.discountAmount} ({quotation.discountOverall}%):</span>
                      <span className="font-mono font-bold">- {formatCurrency(quotation.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1.5 px-2 bg-black text-white rounded text-xs font-black mt-1">
                    <span>{t.grandTotal}</span>
                    <span className="font-mono text-sm font-black">{formatCurrency(quotation.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Signatory */}
              <div className="pt-2 border-t border-black flex justify-between items-end text-[10px]">
                <div className="text-black font-semibold">
                  <span>{t.thankYou}</span>
                </div>
                <div className="text-center min-w-[190px]">
                  <p className="text-[9px] font-bold uppercase text-black mb-4">
                    {t.forShop(shop.name || settings.shopName || 'Sri Mahaganapathy')}
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

      {/* Bottom Sticky Action Footer (Draft mode only) */}
      {isDraft && (
        <div className="no-print bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Total:</span>
            <span className="text-xl font-black text-blue-700 font-mono-numbers">
              {formatCurrency(quotation.grandTotal)}
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
              <span>Back to Edit Quotation</span>
            </button>

            {handleSave && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
              >
                <span>Confirm & Save Quotation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export const QuotationPrintView = (props) => (
  <PrintErrorBoundary onClose={props.onClose}>
    <QuotationPrintViewInner {...props} />
  </PrintErrorBoundary>
);
