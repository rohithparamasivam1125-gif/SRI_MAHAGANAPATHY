import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  FileText, 
  ShoppingBag, 
  RotateCcw, 
  Printer, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  Sparkles,
  Percent,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

export const QuotationCartTable = () => {
  const { 
    quotationCart, 
    updateQuotationCartItem, 
    removeFromQuotationCart, 
    clearQuotationCart,
    processQuotation,
    editingQuotation,
    setEditingQuotation,
    setActiveQuotationForPrint,
    settings
  } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [validityDays, setValidityDays] = useState(15);
  const [discountOverall, setDiscountOverall] = useState(0);
  const [discountOverallType, setDiscountOverallType] = useState('percent'); // 'percent' or 'amount'
  const [isGstEstimate, setIsGstEstimate] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (editingQuotation) {
      setCustomerName(editingQuotation.customerName || '');
      setCustomerPhone(editingQuotation.customerPhone || '');
      setSiteLocation(editingQuotation.siteLocation || '');
      setValidityDays(editingQuotation.validityDays || 15);
      setDiscountOverall(editingQuotation.discountOverall || 0);
      setDiscountOverallType(editingQuotation.discountType || 'percent');
      setIsGstEstimate(editingQuotation.isGstEstimate !== false);
      setNotes(editingQuotation.notes || '');
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setSiteLocation('');
      setValidityDays(15);
      setDiscountOverall(0);
      setDiscountOverallType('percent');
      setIsGstEstimate(true);
      setNotes('');
    }
  }, [editingQuotation]);

  // Calculations preserving custom product GST %
  const totalBase = quotationCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalItemDiscount = quotationCart.reduce((sum, item) => {
    const base = item.price * item.qty;
    return sum + (base * (item.discountPercent || 0)) / 100;
  }, 0);
  const taxableAmount = totalBase - totalItemDiscount;
  const totalTax = quotationCart.reduce((sum, item) => {
    if (!isGstEstimate) return sum;
    const base = item.price * item.qty;
    const disc = (base * (item.discountPercent || 0)) / 100;
    const tax = ((base - disc) * (item.gstRate !== undefined ? item.gstRate : 18)) / 100;
    return sum + tax;
  }, 0);

  const netBeforeOverall = taxableAmount + totalTax;
  let overallDiscountAmt = 0;
  if (discountOverallType === 'amount') {
    overallDiscountAmt = Math.min(netBeforeOverall, Math.max(0, Number(discountOverall) || 0));
  } else {
    overallDiscountAmt = (netBeforeOverall * (Number(discountOverall) || 0)) / 100;
  }
  const estimatedTotal = Math.round(netBeforeOverall - overallDiscountAmt);

  const handlePreviewQuotation = () => {
    if (quotationCart.length === 0) return;

    let subtotal = 0;
    let totalTax = 0;

    const finalizedItems = quotationCart.map((item) => {
      const lineBase = item.price * item.qty;
      const itemDiscount = (lineBase * (item.discountPercent || 0)) / 100;
      const lineTaxable = lineBase - itemDiscount;
      const itemTax = isGstEstimate ? (lineTaxable * (item.gstRate !== undefined ? item.gstRate : 18)) / 100 : 0;
      const lineTotal = lineTaxable + itemTax;

      subtotal += lineTaxable;
      totalTax += itemTax;

      return {
        ...item,
        lineBase,
        itemDiscount,
        lineTaxable,
        itemTax,
        lineTotal
      };
    });

    const netBeforeOverall = subtotal + totalTax;
    let finalOverallDiscount = 0;
    let finalDiscountPercent = 0;

    if (discountOverallType === 'amount') {
      finalOverallDiscount = Math.min(netBeforeOverall, Math.max(0, Number(discountOverall) || 0));
      finalDiscountPercent = netBeforeOverall > 0 ? Number(((finalOverallDiscount / netBeforeOverall) * 100).toFixed(2)) : 0;
    } else {
      finalDiscountPercent = Number(discountOverall) || 0;
      finalOverallDiscount = (netBeforeOverall * finalDiscountPercent) / 100;
    }

    const grandTotal = Math.round(netBeforeOverall - finalOverallDiscount);
    const roundOff = Number((grandTotal - (netBeforeOverall - finalOverallDiscount)).toFixed(2));

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + Number(validityDays || 15));

    const tempQuotation = {
      isUnsavedPreview: true,
      isEdit: !!editingQuotation,
      id: editingQuotation?.id || null,
      quotationNumber: editingQuotation?.quotationNumber || `QUO-TEMP`,
      date: editingQuotation?.date || new Date().toISOString(),
      validUntil: validUntilDate.toISOString(),
      validityDays: Number(validityDays || 15),
      customerName: customerName.trim() || 'Prospective Client',
      customerPhone: customerPhone.trim() || '',
      siteLocation: siteLocation ? siteLocation.trim() : '',
      items: finalizedItems,
      totalItemsCount: quotationCart.length,
      subtotal: Number(subtotal.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      discountOverall: finalDiscountPercent,
      discountAmount: Number(finalOverallDiscount.toFixed(2)),
      rawOverallDiscount: Number(discountOverall) || 0,
      rawOverallDiscountType: discountOverallType,
      roundOff,
      grandTotal,
      isGstEstimate,
      notes: notes || '',
      status: editingQuotation?.status || 'Active',
      shopDetails: {
        name: settings.shopName,
        phone: settings.phone,
        address: settings.address,
        gstin: settings.gstin
      }
    };

    setActiveQuotationForPrint(tempQuotation);
  };

  const handleGenerateQuotation = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (quotationCart.length === 0) return;

    setIsSubmitting(true);
    try {
      await processQuotation({
        customerName,
        customerPhone,
        siteLocation,
        validityDays: Number(validityDays) || 15,
        discountOverall: discountOverallType === 'percent' ? Number(discountOverall) || 0 : 0,
        discountType: discountOverallType,
        discountAmountDirect: discountOverallType === 'amount' ? Number(discountOverall) || 0 : 0,
        isGstEstimate,
        notes,
        isEdit: !!editingQuotation,
        quotationId: editingQuotation?.id || null,
        originalQuotationNumber: editingQuotation?.quotationNumber || null,
        originalDate: editingQuotation?.date || null
      });
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setSiteLocation('');
      setNotes('');
      setDiscountOverall(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
      
      {/* Header */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-sky-400" />
          <div>
            <h2 className="font-black text-base leading-tight">Quotation Draft Builder</h2>
            <p className="text-xs text-slate-300 font-semibold">
              {quotationCart.length} item{quotationCart.length !== 1 ? 's' : ''} in proposal
            </p>
          </div>
        </div>

        {quotationCart.length > 0 && (
          <button
            onClick={clearQuotationCart}
            className="flex items-center gap-1 text-xs font-bold text-rose-300 hover:text-white hover:bg-rose-900/80 px-2.5 py-1 rounded-md transition-colors"
            title="Clear all items from quotation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {editingQuotation && (
        <div className="mx-3 mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
          <span className="font-bold">✏️ Editing Quotation: {editingQuotation.quotationNumber}</span>
          <button
            type="button"
            onClick={() => {
              setEditingQuotation(null);
              clearQuotationCart();
            }}
            className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-black rounded-lg transition-colors"
          >
            Cancel Edit
          </button>
        </div>
      )}

      {/* Customer Info Mini-Form */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Client / Contractor Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              placeholder="Client Phone Number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Site / Project Location (e.g. Site 4)"
              value={siteLocation}
              onChange={(e) => setSiteLocation(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-500 shrink-0">Valid:</span>
            <input
              type="number"
              min="1"
              max="90"
              value={validityDays}
              onChange={(e) => setValidityDays(Number(e.target.value) || 15)}
              className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black font-mono-numbers text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-[11px] text-slate-500 font-bold">days</span>
          </div>
        </div>
      </div>

      {/* Cart Items Table */}
      <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-200">
        {quotationCart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <ShoppingBag className="w-7 h-7 text-slate-400" />
            </div>
            <h4 className="text-sm font-black text-slate-700">Quotation is empty</h4>
            <p className="text-xs text-slate-500 font-semibold max-w-xs mt-1">
              Select items from the catalog on the left to prepare an estimate proposal.
            </p>
          </div>
        ) : (
          quotationCart.map((item) => {
            const lineBase = item.price * item.qty;
            const lineDiscount = (lineBase * (item.discountPercent || 0)) / 100;
            const lineTotal = lineBase - lineDiscount;

            return (
              <div
                key={item.cartItemId}
                className="py-2.5 px-2 hover:bg-slate-50 rounded-xl transition-colors flex flex-col gap-2"
              >
                {/* Top: Name & Size & Delete */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                      {item.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-black text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">
                        {item.size}
                      </span>
                      <span className="text-[11px] text-slate-600 font-bold">
                        {item.unit}
                      </span>
                      <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                        GST: {item.gstRate !== undefined ? item.gstRate : 18}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromQuotationCart(item.cartItemId)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom: Rate, Quantity, Item Disc, Line Total */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-dashed border-slate-200">
                  
                  {/* Rate */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-slate-400">₹</span>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateQuotationCartItem(item.cartItemId, { price: Number(e.target.value) || 0 })}
                      className="w-18 px-1.5 py-0.5 bg-slate-100 hover:bg-white focus:bg-white border border-slate-300 rounded text-slate-950 font-black font-mono-numbers text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      title="Quotation rate"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center border border-slate-300 rounded-lg bg-slate-100 overflow-hidden">
                    <button
                      onClick={() => updateQuotationCartItem(item.cartItemId, { qty: Math.max(1, item.qty - 1) })}
                      className="px-2 py-0.5 text-slate-700 hover:bg-slate-200 transition-colors font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      value={item.qty}
                      onChange={(e) => updateQuotationCartItem(item.cartItemId, { qty: Number(e.target.value) || 1 })}
                      className="w-11 py-0.5 text-center font-black text-xs bg-white focus:outline-none font-mono-numbers"
                    />
                    <button
                      onClick={() => updateQuotationCartItem(item.cartItemId, { qty: item.qty + 1 })}
                      className="px-2 py-0.5 text-slate-700 hover:bg-slate-200 transition-colors font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Discount */}
                  <div className="flex items-center gap-1" title="Discount %">
                    <span className="text-[11px] text-slate-500 font-bold">Disc:</span>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPercent || ''}
                        placeholder="0"
                        onChange={(e) => updateQuotationCartItem(item.cartItemId, { discountPercent: Number(e.target.value) || 0 })}
                        className="w-11 px-1 py-0.5 bg-slate-100 focus:bg-white border border-slate-300 rounded text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono-numbers"
                      />
                      <span className="text-[10px] text-slate-400 font-bold absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-right min-w-[75px]">
                    <div className="text-xs sm:text-sm font-black text-slate-900 font-mono-numbers">
                      {formatCurrency(lineTotal)}
                    </div>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Bill Footer & Totals */}
      {quotationCart.length > 0 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          
          {/* Overall Proposal Discount Input */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5 text-blue-700 font-black">
                <Tag className="w-4 h-4" />
                <span>Overall Proposal Discount:</span>
              </span>
              
              {/* % or ₹ toggle */}
              <div className="bg-slate-100 p-0.5 rounded-lg flex items-center gap-0.5 border border-slate-200 text-[10px]">
                <button
                  type="button"
                  onClick={() => setDiscountOverallType('percent')}
                  className={`px-2 py-0.5 rounded font-black transition-all ${
                    discountOverallType === 'percent'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountOverallType('amount')}
                  className={`px-2 py-0.5 rounded font-black transition-all ${
                    discountOverallType === 'amount'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ₹ Flat
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max={discountOverallType === 'percent' ? 100 : netBeforeOverall}
                  value={discountOverall || ''}
                  onChange={(e) => setDiscountOverall(Math.max(0, Number(e.target.value) || 0))}
                  placeholder={discountOverallType === 'percent' ? 'e.g. 5% overall discount' : 'e.g. ₹100 flat discount'}
                  className="w-full pl-3 pr-8 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-black font-mono-numbers focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs font-black text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {discountOverallType === 'percent' ? '%' : '₹'}
                </span>
              </div>
              {discountOverall > 0 && (
                <button
                  type="button"
                  onClick={() => setDiscountOverall(0)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 bg-rose-50 rounded-lg"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700 font-bold">
            <div className="flex justify-between">
              <span>Gross Base Total:</span>
              <span className="font-mono-numbers font-black">{formatCurrency(totalBase)}</span>
            </div>

            {totalItemDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-black">
                <span>Item Level Discounts:</span>
                <span className="font-mono-numbers">- {formatCurrency(totalItemDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Estimated Subtotal:</span>
              <span className="font-mono-numbers font-black">{formatCurrency(taxableAmount)}</span>
            </div>

            {/* GST Option Checkbox */}
            <div className="flex items-center justify-between py-1 border-y border-dashed border-slate-200">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isGstEstimate}
                  onChange={(e) => setIsGstEstimate(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-black text-slate-800">Include GST Breakdown (Custom % computed)</span>
              </label>
              {isGstEstimate && (
                <span className="font-mono-numbers font-bold text-slate-600">
                  +{formatCurrency(totalTax)}
                </span>
              )}
            </div>

            {overallDiscountAmt > 0 && (
              <div className="flex justify-between text-emerald-700 font-black">
                <span>Overall Discount ({discountOverallType === 'percent' ? `${discountOverall}%` : `₹${discountOverall}`}):</span>
                <span className="font-mono-numbers">- {formatCurrency(overallDiscountAmt)}</span>
              </div>
            )}

            <div className="flex justify-between text-base sm:text-lg font-black text-slate-900 pt-1">
              <span>Total Estimated Amount:</span>
              <span className="text-blue-800 font-mono-numbers text-xl font-black">
                {formatCurrency(estimatedTotal)}
              </span>
            </div>
          </div>

          {/* Settle / Print / Preview Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePreviewQuotation}
              className="w-1/3 py-3 px-3 border border-blue-600 hover:bg-blue-50 text-blue-700 font-bold rounded-xl text-xs sm:text-sm transition-colors"
            >
              Preview Proposal
            </button>
            <button
              type="button"
              onClick={handleGenerateQuotation}
              disabled={isSubmitting}
              className="w-2/3 py-3 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm transition-all disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Saving...'
                  : editingQuotation
                  ? 'Save Changes'
                  : 'Generate & Print'}
              </span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
