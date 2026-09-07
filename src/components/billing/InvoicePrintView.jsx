import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Receipt, 
  Languages, 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Edit3, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  RotateCcw, 
  Tag, 
  Percent, 
  Layers, 
  LayoutList,
  Hash,
  Check
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { PRINT_TRANSLATIONS } from '../../utils/printTranslations';
import { paginateBillItems } from '../../utils/billPaginator';
import { getBrandTheme } from '../../utils/brandColorHelper';

export const InvoicePrintView = ({ 
  invoice, 
  onClose, 
  isDraft = false, 
  onProceedToCheckout = null,
  discountData = null,
  onUpdateDiscountData = null 
}) => {
  const { 
    settings, 
    loadInvoiceForEdit, 
    updateInvoiceNumberOnly,
    cart, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    editingInvoice 
  } = useApp();
  
  // Tab mode in Draft: 'workspace' (interactive full table) | 'paper' (A4/Thermal printable preview)
  const [activeTab, setActiveTab] = useState(isDraft ? 'workspace' : 'paper');
  const [printFormat, setPrintFormat] = useState('A4');
  const [printLanguage, setPrintLanguage] = useState('en');

  // Quick edit bill number state for saved invoices
  const [isEditingSavedNumber, setIsEditingSavedNumber] = useState(false);
  const [savedBillNumberInput, setSavedBillNumberInput] = useState(invoice?.invoiceNumber || '');
  const [isSavingNumber, setIsSavingNumber] = useState(false);

  useEffect(() => {
    if (invoice?.invoiceNumber) {
      setSavedBillNumberInput(invoice.invoiceNumber);
    }
  }, [invoice]);

  const handleSaveBillNumberInline = async () => {
    if (!savedBillNumberInput.trim() || !invoice) return;
    setIsSavingNumber(true);
    try {
      await updateInvoiceNumberOnly(invoice.id || invoice.invoiceNumber, savedBillNumberInput.trim());
      setIsEditingSavedNumber(false);
    } catch (_) {}
    finally {
      setIsSavingNumber(false);
    }
  };

  // Local overall discount management for draft mode
  const [overallDiscount, setOverallDiscount] = useState(discountData?.overallDiscount || 0);
  const [overallDiscountType, setOverallDiscountType] = useState(discountData?.overallDiscountType || 'percent');

  useEffect(() => {
    if (discountData) {
      if (discountData.overallDiscount !== undefined) setOverallDiscount(discountData.overallDiscount);
      if (discountData.overallDiscountType) setOverallDiscountType(discountData.overallDiscountType);
    }
  }, [discountData]);

  const handleDiscountChange = (val, type = overallDiscountType) => {
    setOverallDiscount(val);
    setOverallDiscountType(type);
    if (onUpdateDiscountData) {
      onUpdateDiscountData({ overallDiscount: val, overallDiscountType: type });
    }
  };

  const handleDiscountTypeToggle = (type) => {
    setOverallDiscountType(type);
    if (onUpdateDiscountData) {
      onUpdateDiscountData({ overallDiscount, overallDiscountType: type });
    }
  };

  if (!invoice && (!isDraft || cart.length === 0)) return null;

  // Active items: in draft mode use live cart, otherwise use saved invoice.items
  const items = isDraft ? cart : (invoice?.items || []);
  const t = PRINT_TRANSLATIONS[printLanguage] || PRINT_TRANSLATIONS.en;
  const pageCount = paginateBillItems(items).length;

  // Calculations for workspace & print views
  const totalBase = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0);
  const totalItemDiscount = items.reduce((sum, item) => {
    const base = Number(item.price || 0) * Number(item.qty || 1);
    return sum + (base * (Number(item.discountPercent) || 0)) / 100;
  }, 0);
  
  const rawTaxable = totalBase - totalItemDiscount;
  const taxableAmount = isDraft 
    ? rawTaxable 
    : (invoice?.subtotal !== undefined ? Number(invoice.subtotal) : rawTaxable);
  
  const rawTax = items.reduce((sum, item) => {
    const base = Number(item.price || 0) * Number(item.qty || 1);
    const disc = (base * (Number(item.discountPercent) || 0)) / 100;
    const tax = ((base - disc) * (item.gstRate !== undefined ? Number(item.gstRate) : 18)) / 100;
    return sum + tax;
  }, 0);

  const totalTax = isDraft 
    ? rawTax 
    : (invoice?.totalTax !== undefined ? Number(invoice.totalTax) : rawTax);

  const netBeforeOverall = rawTaxable + rawTax;
  
  let overallDiscountAmt = 0;
  if (overallDiscountType === 'amount') {
    overallDiscountAmt = Math.min(netBeforeOverall, Math.max(0, Number(overallDiscount) || 0));
  } else {
    overallDiscountAmt = (netBeforeOverall * (Number(overallDiscount) || 0)) / 100;
  }

  // Unified discount amount and percentage (works for both draft and saved invoices)
  const discountAmt = isDraft 
    ? overallDiscountAmt 
    : Number(invoice?.discountAmount || 0);

  const discountPct = isDraft
    ? (overallDiscountType === 'percent' ? Number(overallDiscount || 0) : (netBeforeOverall > 0 ? (overallDiscountAmt / netBeforeOverall) * 100 : 0))
    : Number(invoice?.discountOverall || (invoice?.discountType === 'percent' ? invoice?.discountOverall : 0) || 0);

  const isDiscountVisible = isDraft 
    ? true 
    : (invoice?.showDiscount !== false);

  const grandTotal = isDraft 
    ? Math.round(netBeforeOverall - overallDiscountAmt) 
    : Number(invoice?.grandTotal || 0);

  const handlePrint = () => window.print();

  const handleProceed = () => {
    if (onProceedToCheckout) {
      onProceedToCheckout({ overallDiscount, overallDiscountType, overallDiscountAmt });
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen z-50 bg-slate-900/90 backdrop-blur-xs flex flex-col overflow-hidden animate-fade-in modal-fullscreen-container">
      
      {/* ============================================================
          TOP UNIFIED CONTROL TOOLBAR
          ============================================================ */}
      <div className="no-print bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 shadow-lg">
        
        {/* Left: Title & Mode Toggle Tabs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white tracking-tight">
                  {isDraft ? (editingInvoice ? `Edit Bill #${editingInvoice.invoiceNumber}` : 'Active Counter Bill') : 'Tax Invoice'}
                </h3>
                {isDraft ? (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Fullscreen Workspace
                  </span>
                ) : (
                  isEditingSavedNumber ? (
                    <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-blue-400">
                      <input
                        type="text"
                        value={savedBillNumberInput}
                        onChange={(e) => setSavedBillNumberInput(e.target.value.toUpperCase())}
                        className="px-2 py-0.5 bg-slate-950 text-white font-mono font-bold text-xs rounded border border-slate-700 w-32 uppercase focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSaveBillNumberInline}
                        disabled={isSavingNumber || !savedBillNumberInput.trim()}
                        className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs cursor-pointer"
                        title="Save new number"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSavedBillNumberInput(invoice?.invoiceNumber || '');
                          setIsEditingSavedNumber(false);
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingSavedNumber(true)}
                      className="group flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-400 font-mono font-black text-xs transition-colors cursor-pointer"
                      title="Click to quickly change this saved bill number"
                    >
                      <span>#{invoice?.invoiceNumber}</span>
                      <Hash className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    </button>
                  )
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {items.length} product{items.length !== 1 ? 's' : ''} added • Grand Total: <strong className="text-white font-mono">{formatCurrency(grandTotal)}</strong>
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
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                <span>Active Bill Table</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paper')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                  activeTab === 'paper'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Paper Preview ({pageCount}P)</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions & Controls */}
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
                      printLanguage === lang ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'Bilingual'}
                  </button>
                ))}
              </div>

              {/* Format Toggle */}
              <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700 text-xs">
                {['A4', 'Thermal'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setPrintFormat(fmt)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      printFormat === fmt ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {fmt === 'A4' ? 'A4 Bill' : 'Thermal (80mm)'}
                  </button>
                ))}
              </div>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                title="Send to physical printer or save as PDF"
              >
                <Printer className="w-4 h-4" />
                <span>{isDraft ? 'Print Draft' : 'Print Bill'}</span>
              </button>
            </>
          )}

          {/* Back to Edit / Catalog */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black rounded-xl border border-slate-700 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>

          {/* Primary CTA for Draft: Proceed to Checkout / Pay & Settle */}
          {isDraft && onProceedToCheckout && (
            <button
              onClick={handleProceed}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <span>{editingInvoice ? 'Update & Save Bill' : 'Pay & Settle'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Saved Invoice Edit Button */}
          {!isDraft && (
            <button
              onClick={() => {
                onClose();
                loadInvoiceForEdit(invoice);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Edit this invoice in Counter Billing"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Bill</span>
            </button>
          )}

          {/* Close button for non-draft */}
          {!isDraft && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close window"
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
        
        {/* VIEW 1: FULLSCREEN INTERACTIVE BILL WORKSPACE */}
        {isDraft && activeTab === 'workspace' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Table Header Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Bill Items List ({items.length})
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  • Edit selling prices, quantities, and item discounts in real-time
                </span>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  title="Remove all items from current bill"
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
                  <h4 className="text-lg font-black text-slate-700">Your bill is empty</h4>
                  <p className="text-sm text-slate-500 font-semibold max-w-sm mt-1 mb-4">
                    Add products from the catalog to build and edit your bill.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    ← Back to Product Catalog
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white font-black text-xs uppercase tracking-wider">
                          <th className="py-3 px-3 w-12 text-center">#</th>
                          <th className="py-3 px-4 min-w-[240px]">Product & Specification</th>
                          <th className="py-3 px-3 w-28">Brand</th>
                          <th className="py-3 px-3 w-24 text-center">HSN</th>
                          <th className="py-3 px-3 w-20 text-center">Unit</th>
                          <th className="py-3 px-3 w-20 text-center">GST %</th>
                          <th className="py-3 px-4 w-36 text-right">Selling Rate (₹)</th>
                          <th className="py-3 px-4 w-44 text-center">Quantity</th>
                          <th className="py-3 px-3 w-28 text-right">Item Disc %</th>
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
                          const itemTax = (lineTaxable * itemGst) / 100;
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
                              className="hover:bg-blue-50/40 transition-colors group"
                            >
                              {/* S.No */}
                              <td className="py-3 px-3 text-center font-mono font-bold text-slate-500 text-xs">
                                {idx + 1}
                              </td>

                              {/* Product & Size */}
                              <td className="py-3 px-4">
                                <div className="font-black text-slate-900 text-sm leading-snug">
                                  {fullItemTitle}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {item.size && (
                                    <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
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

                              {/* Brand */}
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
                                    onChange={(e) => updateCartItem(item.cartItemId, { hsnCode: e.target.value })}
                                    placeholder="HSN"
                                    className="w-20 px-1.5 py-1 text-center bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    title="Edit HSN code"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-xs text-slate-700">{item.hsnCode || '-'}</span>
                                )}
                              </td>

                              {/* Unit */}
                              <td className="py-3 px-3 text-center">
                                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                  {item.unit || 'Pcs'}
                                </span>
                              </td>

                              {/* GST Rate */}
                              <td className="py-3 px-3 text-center">
                                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                                  {itemGst}%
                                </span>
                              </td>

                              {/* Selling Rate (Editable) */}
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <span className="text-slate-400 font-black text-xs">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={item.price}
                                    onChange={(e) => updateCartItem(item.cartItemId, { price: Number(e.target.value) || 0 })}
                                    className="w-24 px-2.5 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-slate-950 font-black font-mono-numbers text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    title="Edit unit selling price"
                                  />
                                </div>
                              </td>

                              {/* Quantity Stepper (Editable) */}
                              <td className="py-3 px-4 text-center">
                                <div className="inline-flex items-center border border-slate-300 rounded-lg bg-slate-50 overflow-hidden shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => updateCartItem(item.cartItemId, { qty: Math.max(1, (Number(item.qty) || 1) - 1) })}
                                    className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors font-black cursor-pointer"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <input
                                    type="number"
                                    step="any"
                                    min="0.1"
                                    value={item.qty}
                                    onChange={(e) => updateCartItem(item.cartItemId, { qty: Number(e.target.value) || 1 })}
                                    className="w-14 py-1.5 text-center font-black text-sm bg-white focus:outline-none font-mono-numbers"
                                    title="Edit quantity"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateCartItem(item.cartItemId, { qty: (Number(item.qty) || 1) + 1 })}
                                    className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors font-black cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>

                              {/* Item Discount % (Editable) */}
                              <td className="py-3 px-3 text-right">
                                <div className="relative inline-block">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={item.discountPercent || ''}
                                    placeholder="0"
                                    onChange={(e) => updateCartItem(item.cartItemId, { discountPercent: Number(e.target.value) || 0 })}
                                    className="w-16 pl-2 pr-6 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-xs font-bold text-right focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono-numbers"
                                    title="Item discount percentage"
                                  />
                                  <span className="text-xs text-slate-400 font-black absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                    %
                                  </span>
                                </div>
                              </td>

                              {/* Line Total */}
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

                              {/* Delete Action */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.cartItemId)}
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

            {/* Bottom Floating/Docked Summary Bar */}
            {items.length > 0 && (
              <div className="bg-white border-t-2 border-slate-300 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xl">
                
                {/* Left: Overall Bill Discount Controls */}
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="flex items-center gap-1 text-xs font-black text-blue-700">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Bill Discount:</span>
                  </span>

                  <div className="bg-slate-200 p-0.5 rounded-lg flex items-center gap-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleDiscountTypeToggle('percent')}
                      className={`px-2 py-0.5 rounded font-black text-xs transition-all ${
                        overallDiscountType === 'percent'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDiscountTypeToggle('amount')}
                      className={`px-2 py-0.5 rounded font-black text-xs transition-all ${
                        overallDiscountType === 'amount'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ₹ Flat
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={overallDiscountType === 'percent' ? 100 : netBeforeOverall}
                      value={overallDiscount || ''}
                      onChange={(e) => handleDiscountChange(Math.max(0, Number(e.target.value) || 0))}
                      placeholder={overallDiscountType === 'percent' ? '0%' : '₹0'}
                      className="w-24 pl-2 pr-6 py-1 bg-white border border-slate-300 rounded-lg text-xs font-black font-mono-numbers focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-black text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      {overallDiscountType === 'percent' ? '%' : '₹'}
                    </span>
                  </div>

                  {overallDiscount > 0 && (
                    <button
                      type="button"
                      onClick={() => handleDiscountChange(0)}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-bold px-1.5 py-0.5 bg-rose-50 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Middle: Subtotal & Tax Breakdown */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-700 font-bold">
                  <div>
                    <span className="text-slate-500">Taxable Subtotal:</span>{' '}
                    <span className="font-mono-numbers font-black text-slate-900">{formatCurrency(taxableAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Total GST:</span>{' '}
                    <span className="font-mono-numbers font-black text-slate-900">{formatCurrency(totalTax)}</span>
                  </div>
                  {overallDiscountAmt > 0 && (
                    <div className="text-emerald-700 font-black">
                      <span>Discount:</span>{' '}
                      <span className="font-mono-numbers">- {formatCurrency(overallDiscountAmt)}</span>
                    </div>
                  )}
                </div>

                {/* Right: Grand Total & Proceed Button */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-black block leading-none">Grand Total</span>
                    <span className="text-2xl sm:text-3xl font-black text-blue-700 font-mono-numbers leading-tight">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceed}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{editingInvoice ? 'Update & Save Bill' : 'Pay & Settle'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* VIEW 2: PAPER PRINT PREVIEW (A4 / THERMAL) */}
        {(!isDraft || activeTab === 'paper') && (
          <div className="flex-1 overflow-y-auto bg-slate-200/80 py-6 px-3 sm:px-6 flex flex-col items-center print-scroll-canvas">
            {printFormat === 'A4' ? (
              
              /* ============================================================
                 SINGLE CONTINUOUS A4 DOCUMENT
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
                            {settings?.shopName || invoice?.shopDetails?.name || 'SRI MAHAGANAPATHY ELECTRICALS AND HARDWARE'}
                          </h1>
                          <p className="text-[10px] text-black font-semibold mt-0.5">
                            {printLanguage === 'ta' 
                              ? 'மொத்த மற்றும் சில்லறை எலக்ட்ரிக்கல்ஸ், ஹார்டுவேர்ஸ்'
                              : printLanguage === 'bilingual'
                              ? 'மொத்த / சில்லறை எலக்ட்ரிக்கல்ஸ் & ஹார்டுவேர்ஸ் / Wholesale & Retail Electricals, Hardware Solutions'
                              : (settings?.tagline || 'Wholesale & Retail Electricals, Hardware Solutions')}
                          </p>
                          <p className="text-[10px] text-black mt-0.5">
                            📍 {settings?.address || invoice?.shopDetails?.address}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-black mt-0.5">
                            <span>📞 {settings?.phone || invoice?.shopDetails?.phone}</span>
                            {settings?.gstin && <span>GSTIN: <strong className="font-mono">{settings?.gstin}</strong></span>}
                          </div>
                        </div>
                      </div>

                      {/* Right: Invoice Type, Number & Date */}
                      <div className="text-right shrink-0">
                        <div className="inline-block px-2.5 py-0.5 bg-black text-white font-black text-[10px] uppercase tracking-wider rounded">
                          {invoice?.isGstBill !== false ? t.taxInvoice : t.cashBill}
                        </div>
                        <div className="text-[10px] space-y-0.5 mt-1 text-black font-bold">
                          <p>
                            <span className="font-normal text-slate-700">{t.invoiceNo}</span>{' '}
                            <strong className="font-mono text-xs text-black">
                              {isDraft ? (invoice?.invoiceNumber || 'DRAFT PREVIEW') : invoice?.invoiceNumber}
                            </strong>
                          </p>
                          <p><span className="font-normal text-slate-700">{t.date}</span> {formatDate(invoice?.date || new Date().toISOString())}</p>
                          <p><span className="font-normal text-slate-700">{t.mode}</span> {invoice?.paymentMode?.toUpperCase() || 'CASH'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Row */}
                    <div className="mt-2 pt-1.5 border-t border-dashed border-black/50 flex flex-wrap justify-between items-center text-[11px] gap-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <div>
                          <span className="font-normal text-slate-700">{t.billedTo} </span>
                          <strong className="font-black text-black">
                            {invoice?.customerName || (printLanguage === 'ta' ? 'வாடிக்கையாளர்' : 'Walk-in / Draft Customer')}
                          </strong>
                          {invoice?.customerPhone && <span className="ml-1.5 font-mono font-bold">({invoice?.customerPhone})</span>}
                        </div>
                        {invoice?.customerGstin && (
                          <span className="font-mono text-[10px] font-bold bg-slate-100 text-black px-1.5 py-0.5 rounded border border-black/30">
                            GSTIN: <strong className="font-black">{invoice?.customerGstin}</strong>
                          </span>
                        )}
                      </div>
                      {invoice?.notes && (
                        <div className="text-right font-medium text-[10px] italic">
                          <span>{t.site} {invoice?.notes}</span>
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
                          <th className="py-1 px-2 w-14 text-center">{t.qty}</th>
                          <th className="py-1 px-2 w-16 text-right">{t.rate}</th>
                          {isDiscountVisible && <th className="py-1 px-2 w-14 text-right">{t.discount}</th>}
                          <th className="py-1 px-2 w-12 text-right">{t.gst}</th>
                          <th className="py-1 px-2.5 w-22 text-right">{t.amount}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/30">
                        {items.map((item, idx) => {
                          const itemLineBase = Number(item.price || 0) * Number(item.qty || 1);
                          const itemLineDisc = (itemLineBase * (Number(item.discountPercent) || 0)) / 100;
                          const itemLineTaxable = itemLineBase - itemLineDisc;
                          const itemLineGstRate = item.gstRate !== undefined ? Number(item.gstRate) : 18;
                          const itemLineTax = (itemLineTaxable * itemLineGstRate) / 100;
                          const calculatedLineTotal = itemLineTaxable + itemLineTax;

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
                              <td className="py-1 px-2 text-center font-mono font-bold">{item.qty} {item.unit || 'Pcs'}</td>
                              <td className="py-1 px-2 text-right font-mono font-semibold">{Number(item.price).toFixed(2)}</td>
                              {isDiscountVisible && (
                                <td className="py-1 px-2 text-right font-mono">{item.discountPercent ? `${item.discountPercent}%` : '-'}</td>
                              )}
                              <td className="py-1 px-2 text-right font-mono">{itemLineGstRate}%</td>
                              <td className="py-1 px-2.5 text-right font-mono font-black text-black">
                                {calculatedLineTotal.toFixed(2)}
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
                        {settings?.upiId && (
                          <div className="pt-1.5 border-t border-dashed border-black/40 text-[10px] font-bold text-black">
                            <span>{t.upiId} </span>
                            <strong className="font-mono text-black font-black">{settings.upiId}</strong>
                          </div>
                        )}
                      </div>

                      {/* Totals Table (5 cols) */}
                      <div className="col-span-5 space-y-1 text-[11px] font-bold border-l border-black pl-3">
                        <div className="flex justify-between text-black">
                          <span className="font-normal text-slate-800">{t.taxableAmount || 'Taxable Value:'}</span>
                          <span className="font-mono font-bold">
                            {formatCurrency(!isDiscountVisible && discountAmt > 0 ? (taxableAmount - discountAmt) : taxableAmount)}
                          </span>
                        </div>
                        {totalTax > 0 && (
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

                    {/* Footer Signature Row */}
                    <div className="pt-2 border-t border-black flex justify-between items-end text-[10px]">
                      <div className="text-black font-semibold">
                        <span>{t.thankYou}</span>
                      </div>
                      <div className="text-center min-w-[190px]">
                        <p className="text-[9px] font-bold uppercase text-black mb-4">
                          {t.forShop(settings?.shopName || 'Sri Mahaganapathy Electricals')}
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

            ) : (

              /* ============================================================
                 THERMAL RECEIPT FORMAT (80mm)
                 ============================================================ */
              <div className="w-[80mm] bg-white p-4 rounded-lg shadow-xl border border-black text-black font-mono text-xs my-auto">
                <div className="text-center border-b border-dashed border-black pb-2 mb-2 flex flex-col items-center">
                  <img src="/smg-logo-transparent.png" alt="SMG" className="w-12 h-12 object-contain mb-1" />
                  <h2 className="font-black text-sm uppercase leading-tight">
                    {settings?.shopName || 'SRI MAHAGANAPATHY'}
                  </h2>
                  <p className="text-[10px] text-black font-bold">{settings?.phone}</p>
                  {settings?.gstin && <p className="text-[9px] text-black font-bold">GSTIN: {settings.gstin}</p>}
                  <div className="border-t border-dashed border-black mt-1 pt-1 text-[10px] w-full text-left font-bold space-y-0.5">
                    <p>Bill: {invoice?.invoiceNumber || 'DRAFT'}</p>
                    <p>{formatDate(invoice?.date || new Date().toISOString())}</p>
                    <p>Cust: {invoice?.customerName || 'Walk-in'}</p>
                    {invoice?.customerPhone && <p>Ph: {invoice.customerPhone}</p>}
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
                        <span>₹{Number((item.price * item.qty) * (1 - (item.discountPercent || 0)/100) * (1 + (item.gstRate !== undefined ? item.gstRate : 18)/100)).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-xs border-b border-dashed border-black pb-2 mb-2 font-bold">
                  <div className="flex justify-between">
                    <span>Taxable Subtotal:</span>
                    <span>{formatCurrency(!isDiscountVisible && discountAmt > 0 ? (taxableAmount - discountAmt) : taxableAmount)}</span>
                  </div>
                  {totalTax > 0 && (
                    <div className="flex justify-between text-[10px]">
                      <span>GST Tax:</span>
                      <span>{formatCurrency(totalTax)}</span>
                    </div>
                  )}
                  {isDiscountVisible && discountAmt > 0 && (
                    <div className="flex justify-between text-[10px]">
                      <span>Discount {discountPct > 0 ? `(${discountPct}%)` : ''}:</span>
                      <span>- {formatCurrency(discountAmt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black pt-1 border-t border-black">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <div className="text-center text-[9px] text-black font-bold space-y-0.5">
                  <p>Thank you for your business!</p>
                  <p>Visit Again</p>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

