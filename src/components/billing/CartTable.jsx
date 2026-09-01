import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Receipt, 
  ShoppingBag, 
  Percent, 
  ArrowRight,
  Sparkles,
  RotateCcw,
  Tag,
  IndianRupee,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { getBrandTheme } from '../../utils/brandColorHelper';

export const CartTable = ({ onOpenCheckout, onPreviewBill }) => {
  const { cart, updateCartItem, removeFromCart, clearCart, settings } = useApp();

  const [overallDiscount, setOverallDiscount] = useState(0);
  const [overallDiscountType, setOverallDiscountType] = useState('percent'); // 'percent' or 'amount'

  // Subtotal calculations
  const totalBase = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalItemDiscount = cart.reduce((sum, item) => {
    const base = item.price * item.qty;
    return sum + (base * (item.discountPercent || 0)) / 100;
  }, 0);
  const taxableAmount = totalBase - totalItemDiscount;
  
  // Real-time tax calculation preserving each product's custom GST %
  const totalTax = cart.reduce((sum, item) => {
    const base = item.price * item.qty;
    const disc = (base * (item.discountPercent || 0)) / 100;
    const tax = ((base - disc) * (item.gstRate !== undefined ? item.gstRate : 18)) / 100;
    return sum + tax;
  }, 0);

  const netBeforeOverall = taxableAmount + totalTax;
  
  let overallDiscountAmt = 0;
  if (overallDiscountType === 'amount') {
    overallDiscountAmt = Math.min(netBeforeOverall, Math.max(0, Number(overallDiscount) || 0));
  } else {
    overallDiscountAmt = (netBeforeOverall * (Number(overallDiscount) || 0)) / 100;
  }

  const estimatedTotal = Math.round(netBeforeOverall - overallDiscountAmt);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
      
      {/* Bill Header */}
      <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Receipt className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="font-black text-base leading-tight">Active Counter Bill</h2>
            <p className="text-xs text-slate-300 font-semibold">
              {cart.length} item{cart.length !== 1 ? 's' : ''} added
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-rose-300 hover:text-white hover:bg-rose-900/80 px-2.5 py-1 rounded-md transition-colors"
            title="Clear all items from current bill"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Cart Items Table */}
      <div className="flex-1 overflow-y-auto p-2.5 divide-y divide-slate-200">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-base font-black text-slate-700">Bill is empty</h4>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-xs mt-1">
              Select products & sizes from the catalog to build this invoice.
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const lineBase = item.price * item.qty;
            const lineDiscount = (lineBase * (item.discountPercent || 0)) / 100;
            const lineTotal = lineBase - lineDiscount;
            const rawName = item.name || 'Item';
            const spec = (item.size || item.spec || item.specification || '').trim();
            const hasValidSpec = spec && !['standard', 'std', '-', 'default'].includes(spec.toLowerCase());
            const isSpecAlreadyInName = hasValidSpec && rawName.toLowerCase().includes(spec.toLowerCase());
            const fullItemTitle = (hasValidSpec && !isSpecAlreadyInName) ? `${spec} ${rawName}` : rawName;

            return (
              <div
                key={item.cartItemId}
                className="py-3 px-2.5 hover:bg-slate-50 rounded-xl transition-colors group flex flex-col gap-2.5"
              >
                {/* Top Row: Name, Size, Unit and Delete */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-snug">
                      {fullItemTitle}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {item.brand && (() => {
                        const brandTheme = getBrandTheme(item.brand, settings?.brandColors);
                        return (
                          <span 
                            className={`text-xs font-black px-2 py-0.5 rounded border shadow-2xs ${brandTheme.badge}`}
                            style={brandTheme.customStyle || {}}
                          >
                            🏷️ {item.brand}
                          </span>
                        );
                      })()}
                      <span className="text-xs font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                        Size: {item.size}
                      </span>
                      <span className="text-xs text-slate-600 font-bold">
                        Unit: {item.unit}
                      </span>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                        GST: {item.gstRate !== undefined ? item.gstRate : 18}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Bottom Row: Controls (Rate, Quantity Stepper, Item Disc %, Line Total) */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed border-slate-200">
                  
                  {/* Unit Rate Edit */}
                  <div className="flex items-center gap-1 text-sm font-bold">
                    <span className="text-slate-500 font-black">₹</span>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateCartItem(item.cartItemId, { price: Number(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 bg-slate-100 hover:bg-white focus:bg-white border border-slate-300 rounded-lg text-slate-950 font-black font-mono-numbers text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Edit selling price"
                    />
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-300 rounded-lg bg-slate-100 overflow-hidden">
                    <button
                      onClick={() => updateCartItem(item.cartItemId, { qty: Math.max(1, item.qty - 1) })}
                      className="px-2.5 py-1 text-slate-700 hover:bg-slate-200 transition-colors font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      value={item.qty}
                      onChange={(e) => updateCartItem(item.cartItemId, { qty: Number(e.target.value) || 1 })}
                      className="w-12 py-1 text-center font-black text-sm bg-white focus:outline-none font-mono-numbers"
                    />
                    <button
                      onClick={() => updateCartItem(item.cartItemId, { qty: item.qty + 1 })}
                      className="px-2.5 py-1 text-slate-700 hover:bg-slate-200 transition-colors font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Discount % */}
                  <div className="flex items-center gap-1" title="Item Discount %">
                    <span className="text-xs text-slate-600 font-bold">Disc:</span>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPercent || ''}
                        placeholder="0"
                        onChange={(e) => updateCartItem(item.cartItemId, { discountPercent: Number(e.target.value) || 0 })}
                        className="w-12 px-1.5 py-1 bg-slate-100 focus:bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-bold text-right focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono-numbers"
                      />
                      <span className="text-xs text-slate-400 font-bold absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[80px]">
                    <div className="text-sm font-black text-slate-900 font-mono-numbers">
                      {formatCurrency(lineTotal)}
                    </div>
                    {lineDiscount > 0 && (
                      <div className="text-xs text-emerald-700 font-bold">
                        -₹{lineDiscount.toFixed(1)}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Bill Footer & Totals */}
      {cart.length > 0 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          
          {/* Overall Discount Input Box */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5 text-blue-700 font-black">
                <Tag className="w-4 h-4" />
                <span>Overall Bill Discount:</span>
              </span>
              
              {/* % or ₹ toggle */}
              <div className="bg-slate-100 p-0.5 rounded-lg flex items-center gap-0.5 border border-slate-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setOverallDiscountType('percent')}
                  className={`px-2 py-0.5 rounded font-black transition-all ${
                    overallDiscountType === 'percent'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setOverallDiscountType('amount')}
                  className={`px-2 py-0.5 rounded font-black transition-all ${
                    overallDiscountType === 'amount'
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
                  max={overallDiscountType === 'percent' ? 100 : netBeforeOverall}
                  value={overallDiscount || ''}
                  onChange={(e) => setOverallDiscount(Math.max(0, Number(e.target.value) || 0))}
                  placeholder={overallDiscountType === 'percent' ? 'e.g. 5% overall discount' : 'e.g. ₹50 flat cash discount'}
                  className="w-full pl-3 pr-8 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-black font-mono-numbers focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs font-black text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {overallDiscountType === 'percent' ? '%' : '₹'}
                </span>
              </div>
              {overallDiscount > 0 && (
                <button
                  type="button"
                  onClick={() => setOverallDiscount(0)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 bg-rose-50 rounded-lg"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-bold">
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
              <span>Taxable Subtotal:</span>
              <span className="font-mono-numbers font-black">{formatCurrency(taxableAmount)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>GST Tax (Custom % calculated):</span>
              <span className="font-mono-numbers font-bold">{formatCurrency(totalTax)}</span>
            </div>

            {overallDiscountAmt > 0 && (
              <div className="flex justify-between text-emerald-700 font-black">
                <span>Overall Bill Discount ({overallDiscountType === 'percent' ? `${overallDiscount}%` : `₹${overallDiscount}`}):</span>
                <span className="font-mono-numbers">- {formatCurrency(overallDiscountAmt)}</span>
              </div>
            )}

            <div className="flex justify-between text-base sm:text-lg font-black text-slate-900 pt-2 border-t border-slate-300">
              <span>Grand Total:</span>
              <span className="text-blue-700 font-mono-numbers text-xl font-black">
                {formatCurrency(estimatedTotal)}
              </span>
            </div>
          </div>

          {/* Action Buttons: Preview & Checkout Settle */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                const nextSeq = (settings?.invoiceSequence || 100) + 1;
                const prefix = settings?.invoicePrefix || 'INV-';
                const invNumber = `${prefix}${new Date().getFullYear()}-${String(nextSeq).padStart(4, '0')} (DRAFT PREVIEW)`;
                
                const finalizedItems = cart.map((item) => {
                  const lineBase = item.price * item.qty;
                  const itemDiscount = (lineBase * (item.discountPercent || 0)) / 100;
                  const lineTaxable = lineBase - itemDiscount;
                  const itemTax = (lineTaxable * (item.gstRate !== undefined ? item.gstRate : 18)) / 100;
                  return {
                    ...item,
                    lineBase,
                    itemDiscount,
                    lineTaxable,
                    itemTax,
                    lineTotal: lineTaxable + itemTax
                  };
                });
                
                const roundOff = Number((estimatedTotal - (netBeforeOverall - overallDiscountAmt)).toFixed(2));

                const draftInvoice = {
                  invoiceNumber: invNumber,
                  date: new Date().toISOString(),
                  customerName: 'Walk-in / Draft Customer',
                  customerPhone: '',
                  customerGstin: '',
                  paymentMode: 'Cash',
                  items: finalizedItems,
                  totalItemsCount: cart.length,
                  subtotal: Number(taxableAmount.toFixed(2)),
                  totalTax: Number(totalTax.toFixed(2)),
                  discountOverall: overallDiscountType === 'percent' ? Number(overallDiscount) || 0 : (netBeforeOverall > 0 ? Number(((overallDiscountAmt / netBeforeOverall) * 100).toFixed(2)) : 0),
                  discountAmount: Number(overallDiscountAmt.toFixed(2)),
                  roundOff,
                  grandTotal: estimatedTotal,
                  isGstBill: true,
                  notes: '',
                  shopDetails: {
                    name: settings?.shopName,
                    phone: settings?.phone,
                    address: settings?.address,
                    gstin: settings?.gstin
                  }
                };
                if (onPreviewBill) {
                  onPreviewBill(draftInvoice, { overallDiscount, overallDiscountType, overallDiscountAmt });
                }
              }}
              className="w-1/3 py-3 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-300 hover:border-slate-400 font-black rounded-xl shadow-xs flex items-center justify-center gap-1.5 text-xs sm:text-sm transition-all active:scale-98"
              title="Preview Bill in Fullscreen before finalizing"
            >
              <Eye className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Preview</span>
            </button>

            <button
              onClick={() => onOpenCheckout({ overallDiscount, overallDiscountType, overallDiscountAmt })}
              className="flex-1 py-3 px-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-xs sm:text-base transition-all active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
