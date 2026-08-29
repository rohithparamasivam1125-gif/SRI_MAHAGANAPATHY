import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Clock, 
  Receipt, 
  Percent, 
  Printer, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

export const CheckoutModal = ({ isOpen, onClose, initialDiscount = null }) => {
  const { cart, processCheckout, settings } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [overallDiscountType, setOverallDiscountType] = useState('percent'); // 'percent' or 'amount'
  const [isGstBill, setIsGstBill] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialDiscount) {
      if (initialDiscount.overallDiscount !== undefined) {
        setOverallDiscount(initialDiscount.overallDiscount);
      }
      if (initialDiscount.overallDiscountType) {
        setOverallDiscountType(initialDiscount.overallDiscountType);
      }
    }
  }, [initialDiscount, isOpen]);

  if (!isOpen) return null;

  // Real-time calculations preserving each product's custom GST %
  const totalBase = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalItemDiscount = cart.reduce((sum, item) => {
    const base = item.price * item.qty;
    return sum + (base * (item.discountPercent || 0)) / 100;
  }, 0);
  const taxableSubtotal = totalBase - totalItemDiscount;
  const totalTax = isGstBill ? cart.reduce((sum, item) => {
    const base = item.price * item.qty;
    const disc = (base * (item.discountPercent || 0)) / 100;
    const tax = ((base - disc) * (item.gstRate !== undefined ? item.gstRate : 18)) / 100;
    return sum + tax;
  }, 0) : 0;

  const netBeforeOverall = taxableSubtotal + totalTax;
  let overallDiscountAmount = 0;
  if (overallDiscountType === 'amount') {
    overallDiscountAmount = Math.min(netBeforeOverall, Math.max(0, Number(overallDiscount) || 0));
  } else {
    overallDiscountAmount = (netBeforeOverall * (Number(overallDiscount) || 0)) / 100;
  }
  const grandTotal = Math.round(netBeforeOverall - overallDiscountAmount);

  const handleSubmitBill = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await processCheckout({
        customerName,
        customerPhone,
        paymentMode,
        notes,
        discountOverall: overallDiscountType === 'percent' ? Number(overallDiscount) || 0 : 0,
        discountType: overallDiscountType,
        discountAmountDirect: overallDiscountType === 'amount' ? Number(overallDiscount) || 0 : 0,
        isGstBill
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (_) {}

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in no-print">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base leading-tight">Complete Billing & Print</h3>
              <p className="text-xs text-slate-400">Total {cart.length} items in cart</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmitBill} className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer Name / Contractor
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh / Walk-in"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium font-mono-numbers"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Cash', label: 'Cash', icon: Banknote, color: 'text-emerald-600' },
                { id: 'UPI', label: 'UPI / GPay', icon: QrCode, color: 'text-sky-600' },
                { id: 'Card', label: 'Card / POS', icon: CreditCard, color: 'text-indigo-600' },
                { id: 'Credit', label: 'Credit (Khata)', icon: Clock, color: 'text-amber-600' },
              ].map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMode === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMode(pm.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-blue-600' : pm.color}`} />
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bill Settings (GST vs Non-GST, Extra Overall Discount) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* Overall Discount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Overall Bill Discount
                </label>
                <div className="bg-slate-100 p-0.5 rounded-lg flex items-center gap-0.5 border border-slate-200 text-[10px]">
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
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={overallDiscountType === 'percent' ? 100 : netBeforeOverall}
                  placeholder={overallDiscountType === 'percent' ? 'e.g. 5%' : 'e.g. ₹50'}
                  value={overallDiscount || ''}
                  onChange={(e) => setOverallDiscount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono-numbers focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
                <span className="text-xs font-black text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {overallDiscountType === 'percent' ? '%' : '₹'}
                </span>
              </div>
            </div>

            {/* GST Invoice Toggle */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors">
                <input
                  type="checkbox"
                  checked={isGstBill}
                  onChange={(e) => setIsGstBill(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block leading-tight">
                    Include GST Breakdown
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {isGstBill ? 'Print standard Tax Invoice' : 'Non-GST Retail Bill / Estimate'}
                  </span>
                </div>
              </label>
            </div>

          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Remarks / Delivery Site Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Delivery at Site 4 / Advance ₹500 received"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Bill Calculation Box */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Subtotal ({cart.length} items):</span>
              <span className="font-mono-numbers">{formatCurrency(taxableSubtotal)}</span>
            </div>

            {isGstBill && (
              <div className="flex justify-between text-xs text-slate-300">
                <span>Total GST / Tax:</span>
                <span className="font-mono-numbers">{formatCurrency(totalTax)}</span>
              </div>
            )}

            {overallDiscountAmount > 0 && (
              <div className="flex justify-between text-xs text-emerald-400">
                <span>Overall Discount ({overallDiscount}%):</span>
                <span className="font-mono-numbers">- {formatCurrency(overallDiscountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-700">
              <span className="text-sm font-bold text-slate-200">Net Amount to Pay:</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono-numbers">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving to Firebase...' : 'Save & Print Invoice'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
