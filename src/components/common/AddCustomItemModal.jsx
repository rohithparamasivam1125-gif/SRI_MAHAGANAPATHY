import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Sparkles, Tag, Layers, Check, Calculator, AlertCircle } from 'lucide-react';
import { formatCurrency, capitalizeInput } from '../../utils/formatters';

const POPULAR_UNITS = ['Kg', 'Grams', 'Pcs', 'Mtr', 'Box', 'Set', 'Pkt', 'Roll', 'Bundle', 'Ltr', 'Feet'];
const GST_PRESETS = [0, 5, 12, 18, 28];
const CATEGORIES = ['Electrical', 'Plumbing', 'Hardware', 'General'];

export const AddCustomItemModal = ({ isOpen, onClose, onAddItem, title = 'Add Local / Custom Product', defaultCategory = 'Hardware' }) => {
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [brand, setBrand] = useState('Local');
  const [category, setCategory] = useState(defaultCategory);
  const [hsnCode, setHsnCode] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [customUnit, setCustomUnit] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('1');
  const [gstRate, setGstRate] = useState(18);
  const [discountPercent, setDiscountPercent] = useState('0');
  const [errors, setErrors] = useState({});

  const nameInputRef = useRef(null);

  // Auto-focus name field when modal opens and reset state
  useEffect(() => {
    if (isOpen) {
      setName('');
      setSize('');
      setBrand('Local');
      setCategory(defaultCategory);
      setHsnCode('');
      setUnit('Pcs');
      setCustomUnit('');
      setPrice('');
      setQty('1');
      setGstRate(18);
      setDiscountPercent('0');
      setErrors({});
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, defaultCategory]);

  if (!isOpen) return null;

  // Real-time calculations for live preview badge
  const numPrice = Number(price) || 0;
  const numQty = Number(qty) || 0;
  const numDisc = Number(discountPercent) || 0;
  const lineBase = numPrice * numQty;
  const lineDiscount = (lineBase * numDisc) / 100;
  const lineTaxable = lineBase - lineDiscount;
  const lineGst = (lineTaxable * Number(gstRate)) / 100;
  const lineTotal = lineTaxable + lineGst;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter product / item name';
    }
    if (!price || Number(price) <= 0) {
      newErrors.price = 'Please enter a valid selling rate';
    }
    if (!qty || Number(qty) <= 0) {
      newErrors.qty = 'Quantity must be greater than 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalUnit = unit === 'OTHER' ? (customUnit.trim() || 'Pcs') : unit;

    onAddItem({
      name: name.trim(),
      size: size.trim() || 'Standard',
      brand: brand.trim() || 'Local',
      category: category || 'General',
      hsnCode: hsnCode.trim() || '',
      unit: finalUnit,
      price: numPrice,
      mrp: numPrice,
      qty: numQty,
      gstRate: Number(gstRate),
      discountPercent: numDisc,
      isCustomItem: true
    });

    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
      onKeyDown={handleKeyDown}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white leading-tight">{title}</h3>
              <p className="text-xs text-slate-300 font-medium">
                Add on-the-spot items directly to this bill/quotation (not saved to permanent DB)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Row 1: Item Name */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Product / Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              required
              placeholder="e.g. Nails 2 inch, Teflon Tape Local, GI Wire 16g"
              value={name}
              onChange={(e) => {
                setName(capitalizeInput(e.target.value));
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                errors.name ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-300 focus:ring-blue-500 focus:bg-white'
              }`}
            />
            {errors.name && <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Row 2: Size/Spec & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Size / Spec <span className="text-slate-400 font-medium lowercase">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 2 inch, 1/2', 100g, Standard"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Brand / Make <span className="text-slate-400 font-medium lowercase">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Local, Generic, Supreme, Finolex"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 3: Rate, Quantity & Unit */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Rate (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">₹</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors((prev) => ({ ...prev, price: null }));
                  }}
                  className={`w-full pl-7 pr-2.5 py-2 bg-slate-50 border rounded-xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errors.price ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-300 focus:ring-blue-500 focus:bg-white'
                  }`}
                />
              </div>
              {errors.price && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQty((prev) => {
                    const current = Number(prev) || 1;
                    const step = current <= 1 ? 0.1 : 1;
                    return Math.max(0.01, Number((current - step).toFixed(3))).toString();
                  })}
                  className="px-2 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-l-xl font-black text-xs transition-colors cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  step="any"
                  min="0.001"
                  required
                  value={qty}
                  onChange={(e) => {
                    setQty(e.target.value);
                    if (errors.qty) setErrors((prev) => ({ ...prev, qty: null }));
                  }}
                  className="w-full py-2 bg-slate-50 border-y border-slate-300 text-xs font-black text-center text-slate-900 focus:outline-none focus:bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setQty((prev) => {
                    const current = Number(prev) || 0;
                    const step = current < 1 ? 0.1 : 1;
                    return Number((current + step).toFixed(3)).toString();
                  })}
                  className="px-2 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-r-xl font-black text-xs transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                {POPULAR_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
                <option value="OTHER">Custom...</option>
              </select>
            </div>
          </div>

          {/* Quick Weight helper chips when Unit is Kg */}
          {unit === 'Kg' && (
            <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl">
              <span className="text-[11px] font-black text-amber-900 block mb-1.5">
                ⚖️ Quick Weight Presets (Kilograms):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '50g (0.05)', val: '0.05' },
                  { label: '100g (0.1)', val: '0.1' },
                  { label: '200g (0.2)', val: '0.2' },
                  { label: '250g (0.25)', val: '0.25' },
                  { label: '500g (0.5)', val: '0.5' },
                  { label: '750g (0.75)', val: '0.75' },
                  { label: '1 Kg', val: '1' },
                  { label: '2 Kg', val: '2' },
                  { label: '5 Kg', val: '5' }
                ].map((chip) => (
                  <button
                    key={chip.val}
                    type="button"
                    onClick={() => setQty(chip.val)}
                    className={`px-2 py-0.5 text-[11px] font-black rounded-lg border transition-all cursor-pointer ${
                      qty === chip.val 
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs' 
                        : 'bg-white text-slate-700 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {unit === 'OTHER' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Enter Custom Unit Name</label>
              <input
                type="text"
                placeholder="e.g. Coil, Bag, Drum"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Row 4: GST %, Item Discount %, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                GST Rate
              </label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                {GST_PRESETS.map((g) => (
                  <option key={g} value={g}>{g}% GST</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Item Disc %
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  placeholder="0"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: HSN Code (Optional) */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              HSN Code <span className="text-slate-400 font-medium lowercase">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 7318, 8536, 3917"
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Live Calculation Preview Banner */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-[11px] font-bold text-slate-600">
                  Base: {formatCurrency(lineTaxable)} + {gstRate}% GST ({formatCurrency(lineGst)})
                </p>
                <p className="text-xs font-black text-blue-950">Calculated Line Total</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base sm:text-lg font-black font-mono text-blue-700">
                {formatCurrency(lineTotal)}
              </span>
            </div>
          </div>

        </form>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-black text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Bill / Quotation</span>
          </button>
        </div>

      </div>
    </div>
  );
};
