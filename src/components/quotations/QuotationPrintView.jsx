import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, 
  Printer, 
  FileText, 
  Languages, 
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  RotateCcw,
  Tag,
  Percent,
  LayoutList,
  User,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { PRINT_TRANSLATIONS } from '../../utils/printTranslations';
import { paginateBillItems } from '../../utils/billPaginator';
import { getBrandTheme } from '../../utils/brandColorHelper';

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
    isGstEstimate: q.isGstEstimate !== undefined ? q.isGstEstimate : true,
    items: Array.isArray(q.items) ? q.items.map((item) => ({
      name: item.name || 'Item',
      brand: item.brand || '',
      size: item.size || '',
      qty: Number(item.qty) || 1,
      unit: item.unit || 'Pcs',
      price: Number(item.price) || 0,
      discountPercent: Number(item.discountPercent) || 0,
      gstRate: item.gstRate !== undefined ? Number(item.gstRate) : 18,
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
  const { 
    settings, 
    convertQuotationToActiveBill,
    quotationCart,
    updateQuotationCartItem,
    removeFromQuotationCart,
    clearQuotationCart,
    editingQuotation
  } = useApp();

  const [activeTab, setActiveTab] = useState(isDraft ? 'workspace' : 'paper');
  const [printLanguage, setPrintLanguage] = useState('en');
  const handleSave = onConfirmAndSave || onConfirmSave;

  if (!quotation && (!isDraft || quotationCart.length === 0)) return null;

  // Active items: in draft mode use live quotationCart, otherwise use saved quotation.items
  const items = isDraft ? quotationCart : (quotation?.items || []);
  const t = PRINT_TRANSLATIONS[printLanguage] || PRINT_TRANSLATIONS.en;
  const pageCount = paginateBillItems(items).length;
  const shop = quotation?.shopDetails || settings;

  // Real-time calculations for draft workspace & paper preview
  const isGstEstimate = quotation?.isGstEstimate !== undefined ? quotation.isGstEstimate : true;
  const totalBase = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0);
  const totalItemDiscount = items.reduce((sum, item) => {
    const base = Number(item.price || 0) * Number(item.qty || 1);
    return sum + (base * (Number(item.discountPercent) || 0)) / 100;
  }, 0);
  
  const rawTaxable = totalBase - totalItemDiscount;
  const taxableAmount = isDraft 
    ? rawTaxable 
    : (quotation?.subtotal !== undefined ? Number(quotation.subtotal) : rawTaxable);
  
  const rawTax = items.reduce((sum, item) => {
    if (!isGstEstimate) return sum;
    const base = Number(item.price || 0) * Number(item.qty || 1);
    const disc = (base * (Number(item.discountPercent) || 0)) / 100;
    const tax = ((base - disc) * (item.gstRate !== undefined ? Number(item.gstRate) : 18)) / 100;
    return sum + tax;
  }, 0);

  const totalTax = isDraft 
    ? rawTax 
    : (quotation?.totalTax !== undefined ? Number(quotation.totalTax) : rawTax);

  const netBeforeOverall = rawTaxable + rawTax;
  const overallDiscount = Number(quotation?.discountOverall || 0);
  const overallDiscountAmt = quotation?.discountAmount !== undefined 
    ? Number(quotation.discountAmount) 
    : (netBeforeOverall * overallDiscount) / 100;

  const discountAmt = overallDiscountAmt;
  const discountPct = overallDiscount;
  const isDiscountVisible = isDraft 
    ? true 
    : (quotation?.showDiscount !== false);

  const grandTotal = isDraft ? Math.round(netBeforeOverall - overallDiscountAmt) : (quotation?.grandTotal || 0);

  const handlePrint = () => window.print();

  const handleConvertToBill = () => {
    convertQuotationToActiveBill(quotation);
    onClose();
  };

  return (
    <div className="fixed inset-0 w-screen h-screen z-50 bg-slate-900/90 backdrop-blur-xs flex flex-col overflow-hidden animate-fade-in modal-fullscreen-container">
      
      {/* ============================================================
          TOP UNIFIED CONTROL BAR
          ============================================================ */}
      <div className="no-print bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 shadow-lg">
        
        {/* Left: Title & Mode Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white tracking-tight">
                  {isDraft ? (editingQuotation ? `Edit Quotation #${editingQuotation.quotationNumber}` : 'Active Quotation') : 'Price Quotation'}
                </h3>
                {isDraft ? (
                  <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Fullscreen Workspace
                  </span>
                ) : (
                  <span className="text-sky-400 font-mono font-black text-xs sm:text-sm">
                    #{quotation?.quotationNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {items.length} item{items.length !== 1 ? 's' : ''} • Client: <strong className="text-white">{quotation?.customerName || 'Prospective Client'}</strong> • Estimated: <strong className="text-white font-mono">{formatCurrency(grandTotal)}</strong>
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs for Draft */}
          {isDraft && (
            <div className="bg-slate-800/90 p-1 rounded-xl flex items-center gap-1 border border-slate-700/80 ml-2">
              <button
                type="button"
                onClick={() => setActiveTab('workspace')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                  activeTab === 'workspace'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                <span>Quotation Table</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paper')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                  activeTab === 'paper'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Paper Preview ({pageCount}P)</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Controls when viewing paper preview */}
          {activeTab === 'paper' && (
            <>
              {/* Language Toggle */}
              <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700 text-xs">
                <span className="text-slate-400 pl-2 pr-1 flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase hidden sm:inline">Lang:</span>
                </span>
                {['en', 'ta', 'bilingual'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setPrintLanguage(lang)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                      printLanguage === lang ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'Bilingual'}
                  </button>
                ))}
              </div>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                title="Print Quotation or Save as PDF"
              >
                <Printer className="w-4 h-4" />
                <span>{isDraft ? 'Print Draft' : 'Print Quotation'}</span>
              </button>
            </>
          )}

          {/* Non-draft: Convert to Active Bill */}
          {!isDraft && (
            <button
              onClick={handleConvertToBill}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95"
              title="Load items from this quotation directly into Counter Billing Cart"
            >
              <span>Convert to Bill</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Back to Edit / Catalog */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black rounded-xl border border-slate-700 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </button>

          {/* Draft: Primary Confirm & Save Button */}
          {isDraft && handleSave && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-sky-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <span>{editingQuotation ? 'Update Quotation' : 'Save & Record Quotation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Close for non-draft */}
          {!isDraft && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ============================================================
          MAIN BODY AREA
          ============================================================ */}
      <div className="flex-1 overflow-hidden flex flex-col bg-slate-100">
        
        {/* VIEW 1: FULLSCREEN INTERACTIVE QUOTATION WORKSPACE */}
        {isDraft && activeTab === 'workspace' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Info Banner */}
            <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-slate-900 font-black">
                  <User className="w-3.5 h-3.5 text-sky-600" />
                  {quotation?.customerName || 'Walk-in / Prospective Client'}
                </span>
                {quotation?.customerPhone && (
                  <span className="flex items-center gap-1 text-slate-600 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {quotation.customerPhone}
                  </span>
                )}
                {quotation?.siteLocation && (
                  <span className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Site: {quotation.siteLocation}
                  </span>
                )}
                <span className="flex items-center gap-1 text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Validity: {quotation?.validityDays || 15} Days
                </span>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearQuotationCart}
                  className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  title="Remove all items from current quotation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Items</span>
                </button>
              )}
            </div>

            {/* Main Interactive Table */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400">
                  <div className="w-20 h-20 rounded-3xl bg-slate-200 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-black text-slate-700">Quotation is empty</h4>
                  <p className="text-sm text-slate-500 font-semibold max-w-sm mt-1 mb-4">
                    Add products from the catalog to build this quotation.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    ← Back to Catalog
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white font-black text-xs uppercase tracking-wider">
                          <th className="py-3 px-3 w-12 text-center">#</th>
                          <th className="py-3 px-4 min-w-[240px]">Product Description</th>
                          <th className="py-3 px-3 w-28">Brand</th>
                          <th className="py-3 px-3 w-24 text-center">HSN</th>
                          <th className="py-3 px-3 w-20 text-center">Unit</th>
                          {isGstEstimate && <th className="py-3 px-3 w-20 text-center">GST %</th>}
                          <th className="py-3 px-4 w-36 text-right">Estimated Rate (₹)</th>
                          <th className="py-3 px-4 w-44 text-center">Quantity</th>
                          <th className="py-3 px-3 w-28 text-right">Disc %</th>
                          <th className="py-3 px-4 w-32 text-right">Line Total (₹)</th>
                          <th className="py-3 px-3 w-14 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-sm">
                        {items.map((item, idx) => {
                          const lineBase = Number(item.price || 0) * Number(item.qty || 1);
                          const lineDisc = (lineBase * (Number(item.discountPercent) || 0)) / 100;
                          const lineTaxable = lineBase - lineDisc;
                          const itemGst = item.gstRate !== undefined ? Number(item.gstRate) : 18;
                          const itemTax = isGstEstimate ? (lineTaxable * itemGst) / 100 : 0;
                          const lineTotal = lineTaxable + itemTax;

                          const rawName = item.name || 'Item';
                          const spec = (item.size || item.spec || item.specification || '').trim();
                          const hasValidSpec = spec && !['standard', 'std', '-', 'default'].includes(spec.toLowerCase());
                          const isSpecAlreadyInName = hasValidSpec && rawName.toLowerCase().includes(spec.toLowerCase());
                          const fullItemTitle = (hasValidSpec && !isSpecAlreadyInName) ? `${spec} ${rawName}` : rawName;
                          const brandTheme = item.brand ? getBrandTheme(item.brand, settings?.brandColors) : null;

                          return (
                            <tr 
                              key={item.cartItemId || idx}
                              className="hover:bg-sky-50/40 transition-colors group"
                            >
                              <td className="py-3 px-3 text-center font-mono font-bold text-slate-500 text-xs">
                                {idx + 1}
                              </td>

                              <td className="py-3 px-4">
                                <div className="font-black text-slate-900 text-sm leading-snug">
                                  {fullItemTitle}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {item.size && (
                                    <span className="text-[11px] font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                      Size: {item.size}
                                    </span>
                                  )}
                                  {item.category && (
                                    <span className="text-[11px] text-slate-500 font-semibold">
                                      {item.category}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                {item.brand ? (
                                  <span 
                                    className={`inline-block text-xs font-black px-2.5 py-1 rounded-lg border shadow-2xs ${brandTheme.badge}`}
                                    style={brandTheme.customStyle || {}}
                                  >
                                    🏷️ {item.brand}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400 font-semibold">-</span>
                                )}
                              </td>

                              {/* HSN */}
                              <td className="py-3 px-3 text-center">
                                {isDraft ? (
                                  <input
                                    type="text"
                                    value={item.hsnCode || ''}
                                    onChange={(e) => updateQuotationCartItem(item.cartItemId, { hsnCode: e.target.value })}
                                    placeholder="HSN"
                                    className="w-20 px-1.5 py-1 text-center bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    title="Edit HSN code"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-xs text-slate-700">{item.hsnCode || '-'}</span>
                                )}
                              </td>

                              <td className="py-3 px-3 text-center">
                                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                  {item.unit || 'Pcs'}
                                </span>
                              </td>

                              {isGstEstimate && (
                                <td className="py-3 px-3 text-center">
                                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                                    {itemGst}%
                                  </span>
                                </td>
                              )}

                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <span className="text-slate-400 font-black text-xs">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={item.price}
                                    onChange={(e) => updateQuotationCartItem(item.cartItemId, { price: Number(e.target.value) || 0 })}
                                    className="w-24 px-2.5 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-slate-950 font-black font-mono-numbers text-sm text-right focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    title="Edit rate"
                                  />
                                </div>
                              </td>

                              <td className="py-3 px-4 text-center">
                                <div className="inline-flex items-center border border-slate-300 rounded-lg bg-slate-50 overflow-hidden shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => updateQuotationCartItem(item.cartItemId, { qty: Math.max(1, (Number(item.qty) || 1) - 1) })}
                                    className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors font-black cursor-pointer"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <input
                                    type="number"
                                    step="any"
                                    min="0.1"
                                    value={item.qty}
                                    onChange={(e) => updateQuotationCartItem(item.cartItemId, { qty: Number(e.target.value) || 1 })}
                                    className="w-14 py-1.5 text-center font-black text-sm bg-white focus:outline-none font-mono-numbers"
                                    title="Edit quantity"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateQuotationCartItem(item.cartItemId, { qty: (Number(item.qty) || 1) + 1 })}
                                    className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors font-black cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>

                              <td className="py-3 px-3 text-right">
                                <div className="relative inline-block">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={item.discountPercent || ''}
                                    placeholder="0"
                                    onChange={(e) => updateQuotationCartItem(item.cartItemId, { discountPercent: Number(e.target.value) || 0 })}
                                    className="w-16 pl-2 pr-6 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-xs font-bold text-right focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono-numbers"
                                    title="Item discount %"
                                  />
                                  <span className="text-xs text-slate-400 font-black absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                    %
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="text-sm font-black text-slate-900 font-mono-numbers">
                                  {formatCurrency(lineTotal)}
                                </div>
                                {lineDisc > 0 && (
                                  <div className="text-[11px] text-emerald-700 font-bold">
                                    -₹{lineDisc.toFixed(1)}
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeFromQuotationCart(item.cartItemId)}
                                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Remove this item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Summary Bar */}
            {items.length > 0 && (
              <div className="bg-white border-t-2 border-slate-300 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xl">
                
                {/* Subtotals */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-700 font-bold">
                  <div>
                    <span className="text-slate-500">Taxable Subtotal:</span>{' '}
                    <span className="font-mono-numbers font-black text-slate-900">{formatCurrency(taxableAmount)}</span>
                  </div>
                  {isGstEstimate && (
                    <div>
                      <span className="text-slate-500">Total GST:</span>{' '}
                      <span className="font-mono-numbers font-black text-slate-900">{formatCurrency(totalTax)}</span>
                    </div>
                  )}
                  {overallDiscountAmt > 0 && (
                    <div className="text-emerald-700 font-black">
                      <span>Discount ({overallDiscount}%):</span>{' '}
                      <span className="font-mono-numbers">- {formatCurrency(overallDiscountAmt)}</span>
                    </div>
                  )}
                </div>

                {/* Grand Total & Primary Save */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-black block leading-none">Estimated Total</span>
                    <span className="text-2xl sm:text-3xl font-black text-sky-700 font-mono-numbers leading-tight">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>

                  {handleSave && (
                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-sm font-black rounded-xl shadow-lg shadow-sky-600/30 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>{editingQuotation ? 'Update Quotation' : 'Save & Record Quotation'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* VIEW 2: PAPER PRINT PREVIEW (A4) */}
        {(!isDraft || activeTab === 'paper') && (
          <div className="flex-1 overflow-y-auto bg-slate-200/80 py-6 px-3 sm:px-6 flex flex-col items-center print-scroll-canvas">
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
                          <strong className="font-mono text-xs text-black">
                            {isDraft ? (quotation?.quotationNumber || 'DRAFT PREVIEW') : quotation?.quotationNumber}
                          </strong>
                        </p>
                        <p><span className="font-normal text-slate-700">{t.date}</span> {formatDate(quotation?.date || new Date().toISOString())}</p>
                        {quotation?.validUntil && (
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
                          {quotation?.customerName || (printLanguage === 'ta' ? 'வாடிக்கையாளர்' : 'Prospective Client')}
                        </strong>
                        {quotation?.customerPhone && (
                          <span className="ml-1.5 font-mono font-bold">({quotation.customerPhone})</span>
                        )}
                      </div>
                      {quotation?.customerGstin && (
                        <span className="font-mono text-[10px] font-bold bg-slate-100 text-black px-1.5 py-0.5 rounded border border-black/30">
                          GSTIN: <strong className="font-black">{quotation.customerGstin}</strong>
                        </span>
                      )}
                    </div>
                    {quotation?.siteLocation && (
                      <div className="text-right font-medium text-[10px]">
                        <span>{t.site} <strong>{quotation.siteLocation}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="border border-black rounded mb-2 overflow-visible">
                  <table className="w-full text-left border-collapse text-[10.5px]">
                    <thead>
                      <tr className="bg-black text-white font-bold text-[9.5px] uppercase tracking-wider">
                        <th className="py-1 px-2 w-7 text-center">{t.sNo}</th>
                        <th className="py-1 px-2 w-28">{t.sizeSpec}</th>
                        <th className="py-1 px-2.5">{t.description}</th>
                        <th className="py-1 px-2 w-16 text-center">{t.hsn || 'HSN'}</th>
                        <th className="py-1 px-2 w-12 text-center">{t.qty}</th>
                        <th className="py-1 px-2 w-12 text-center">{t.unit}</th>
                        <th className="py-1 px-2 w-16 text-right">{t.rate}</th>
                        {isDiscountVisible && <th className="py-1 px-2 w-14 text-right">{t.discount}</th>}
                        {isGstEstimate && <th className="py-1 px-2 w-12 text-right">{t.gst}</th>}
                        <th className="py-1 px-2.5 w-22 text-right">{t.amount}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/30">
                      {items.map((item, idx) => {
                        const itemBase = Number(item.price || 0) * Number(item.qty || 1);
                        const itemDisc = (itemBase * (Number(item.discountPercent) || 0)) / 100;
                        const itemTaxable = itemBase - itemDisc;
                        const itemGst = item.gstRate !== undefined ? Number(item.gstRate) : 18;
                        const itemTax = isGstEstimate ? (itemTaxable * itemGst) / 100 : 0;
                        const itemLineTotal = itemTaxable + itemTax;

                        return (
                          <tr
                            key={idx}
                            className={`print-item-row ${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
                          >
                            <td className="py-1 px-2 text-center font-mono font-bold">{idx + 1}</td>
                            <td className="py-1 px-2 font-black text-black leading-tight">{item.size || '-'}</td>
                            <td className="py-1 px-2.5">
                              <span className="font-black text-black leading-tight">{item.name}</span>
                              {item.brand && (
                                <span className="text-[8.5px] text-slate-700 block leading-tight mt-0.5">
                                  {printLanguage === 'ta' ? `பிராண்டு: ${item.brand}` : `Brand: ${item.brand}`}
                                </span>
                              )}
                            </td>
                            <td className="py-1 px-2 text-center font-mono font-semibold text-black">{item.hsnCode || '-'}</td>
                            <td className="py-1 px-2 text-center font-mono font-bold">{item.qty}</td>
                            <td className="py-1 px-2 text-center font-mono">{item.unit || 'Pcs'}</td>
                            <td className="py-1 px-2 text-right font-mono font-semibold">
                              {Number(item.price || 0).toFixed(2)}
                            </td>
                            {isDiscountVisible && (
                              <td className="py-1 px-2 text-right font-mono">{item.discountPercent ? `${item.discountPercent}%` : '-'}</td>
                            )}
                            {isGstEstimate && (
                              <td className="py-1 px-2 text-right font-mono">{itemGst}%</td>
                            )}
                            <td className="py-1 px-2.5 text-right font-mono font-black text-black">
                              {itemLineTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* TOTALS, TERMS & SIGNATURE BLOCK */}
                <div className="print-totals-block border border-black rounded p-3 space-y-3">
                  <div className="grid grid-cols-12 gap-4">
                    
                    {/* Terms */}
                    <div className="col-span-7 flex flex-col justify-between text-[10px] space-y-1.5">
                      <div>
                        <h5 className="font-black text-black uppercase tracking-wider text-[10px] mb-0.5">
                          {t.quotationTermsHeader}
                        </h5>
                        <ul className="text-black font-medium text-[9px] space-y-0.5 list-disc pl-3">
                          {(typeof t.quotationTerms === 'function'
                            ? t.quotationTerms(quotation?.validityDays || 15)
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

                    {/* Totals Box */}
                    <div className="col-span-5 space-y-1 text-[11px] font-bold border-l border-black pl-3">
                      <div className="flex justify-between text-black">
                        <span className="font-normal text-slate-800">{isGstEstimate ? (t.taxableAmount || 'Taxable Value:') : t.subtotal}</span>
                        <span className="font-mono font-bold">
                          {formatCurrency(!isDiscountVisible && discountAmt > 0 ? (taxableAmount - discountAmt) : taxableAmount)}
                        </span>
                      </div>
                      {isGstEstimate && totalTax > 0 && (
                        <>
                          <div className="flex justify-between text-black">
                            <span className="font-normal text-slate-800">{t.cgstTax || 'CGST:'}</span>
                            <span className="font-mono font-bold">{formatCurrency(totalTax / 2)}</span>
                          </div>
                          <div className="flex justify-between text-black">
                            <span className="font-normal text-slate-800">{t.sgstTax || 'SGST:'}</span>
                            <span className="font-mono font-bold">{formatCurrency(totalTax / 2)}</span>
                          </div>
                        </>
                      )}
                      {isDiscountVisible && discountAmt > 0 && (
                        <div className="flex justify-between text-black">
                          <span>{t.discountAmount || 'Discount'} {discountPct > 0 ? `(${discountPct}%)` : ''}:</span>
                          <span className="font-mono font-bold">- {formatCurrency(discountAmt)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-1.5 px-2 bg-black text-white rounded text-xs font-black mt-1">
                        <span>{t.grandTotal}</span>
                        <span className="font-mono text-sm font-black">{formatCurrency(grandTotal)}</span>
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

                  {/* Software watermark */}
                  <div className="text-center text-[7.5px] text-slate-500 font-semibold pt-1 border-t border-dotted border-black/20">
                    Software Designed by RR Software Solutions
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export const QuotationPrintView = (props) => (
  <PrintErrorBoundary onClose={props.onClose}>
    <QuotationPrintViewInner {...props} />
  </PrintErrorBoundary>
);

