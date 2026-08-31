import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Plus, Trash2, Zap, Droplets, PackagePlus, AlertCircle, Barcode, Sparkles, Copy, Layers, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateUniqueBarcode } from '../../utils/barcodeHelper';
import { capitalizeInput } from '../../utils/formatters';

export const STANDARD_SUBCATEGORIES = {
  Electrical: [
    { label: 'Wires & Cables', hsn: '8544', gst: 18 },
    { label: 'Conduit Pipes', hsn: '3917', gst: 18 },
    { label: 'Switches & Sockets', hsn: '8536', gst: 18 },
    { label: 'MCB & Distribution Boards', hsn: '8536', gst: 18 },
    { label: 'LED Lighting & Fixtures', hsn: '8539', gst: 12 },
    { label: 'Fans & Ventilation', hsn: '8414', gst: 18 },
    { label: 'Electrical Accessories & Tape', hsn: '8547', gst: 18 },
    { label: 'Meters & Starters', hsn: '9028', gst: 18 },
    { label: 'Modular Plates & Boxes', hsn: '8538', gst: 18 }
  ],
  Plumbing: [
    { label: 'Pipes', hsn: '3917', gst: 18 },
    { label: 'Agri Pipes', hsn: '3917', gst: 18 },
    { label: 'cPVC Pipes', hsn: '3917', gst: 18 },
    { label: 'uPVC Pipes', hsn: '3917', gst: 18 },
    { label: 'SWR Drainage Pipes', hsn: '3917', gst: 18 },
    { label: 'HDPE Pipes', hsn: '3917', gst: 18 },
    { label: 'PVC Fittings', hsn: '3917', gst: 18 },
    { label: 'cPVC Fittings', hsn: '3917', gst: 18 },
    { label: 'uPVC Fittings', hsn: '3917', gst: 18 },
    { label: 'SWR Fittings', hsn: '3917', gst: 18 },
    { label: 'PVC Brass Fittings', hsn: '3917', gst: 18 },
    { label: 'uPVC Brass Fittings', hsn: '3917', gst: 18 },
    { label: 'PVC Bends', hsn: '3917', gst: 18 },
    { label: 'Pipe Clamps', hsn: '7326', gst: 18 },
    { label: 'Valves', hsn: '8481', gst: 18 },
    { label: 'Faucets & Taps', hsn: '8481', gst: 18 },
    { label: 'Water Storage Tanks', hsn: '3925', gst: 18 },
    { label: 'Hoses', hsn: '3917', gst: 18 },
    { label: 'Solvents & Adhesives', hsn: '3506', gst: 18 },
    { label: 'Sanitary Ware', hsn: '6910', gst: 18 }
  ]
};

export const POPULAR_BRANDS = [
  'Leo Plast',
  'Supreme',
  'Finolex',
  'Anchor by Panasonic',
  'Havells',
  'Legrand',
  'Polycab',
  'Crompton',
  'Ashirvad',
  'Astral',
  'Prince',
  'Usha',
  'Philips',
  'L&T',
  'V-Guard',
  'Steelgrip',
  'Sintex',
  'Watertec',
  'Parryware'
];

export const ProductModal = ({ isOpen, onClose, editingProduct = null, isCloning = false }) => {
  const { products, handleAddProduct, handleUpdateProduct } = useApp();

  const isCloneMode = Boolean(isCloning || editingProduct?._isClone);
  const brandInputRef = useRef(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electrical'); // 'Electrical' | 'Plumbing'
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [gstRate, setGstRate] = useState(18);
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState([
    { size: 'Standard', price: '', mrp: '', stock: 50, unit: 'Pcs', barcode: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Combined list of subcategories (standard presets + existing from DB)
  const categorySubcategories = useMemo(() => {
    const standardList = STANDARD_SUBCATEGORIES[category] || [];
    const dbSubcats = new Set(standardList.map(s => s.label));

    (products || []).forEach(p => {
      if (p.category === category && p.subcategory && p.subcategory.trim()) {
        dbSubcats.add(p.subcategory.trim());
      }
    });

    return Array.from(dbSubcats).sort();
  }, [category, products]);

  // Combined list of brands (popular brands + existing from DB)
  const availableBrandOptions = useMemo(() => {
    const brandSet = new Set(POPULAR_BRANDS);
    (products || []).forEach(p => {
      if (p.brand && p.brand.trim()) {
        brandSet.add(p.brand.trim());
      }
    });
    return Array.from(brandSet).sort();
  }, [products]);

  const handleSubcategorySelect = (selectedSub) => {
    setSubcategory(selectedSub);
    // Find matching preset for auto HSN & GST
    const match = (STANDARD_SUBCATEGORIES[category] || []).find(
      s => s.label.toLowerCase() === selectedSub.toLowerCase()
    );
    if (match) {
      if (!hsnCode.trim()) setHsnCode(match.hsn);
      if (match.gst && (!gstRate || gstRate === 18)) setGstRate(match.gst);
    }
  };

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      setCategory(editingProduct.category || 'Electrical');
      setSubcategory(editingProduct.subcategory || '');
      setBrand(isCloneMode ? '' : (editingProduct.brand || ''));
      setHsnCode(editingProduct.hsnCode || '');
      setGstRate(editingProduct.gstRate !== undefined ? editingProduct.gstRate : 18);
      setDescription(editingProduct.description || '');
      setVariants(
        editingProduct.variants && editingProduct.variants.length > 0
          ? editingProduct.variants.map((v) => ({
              ...v,
              barcode: isCloneMode ? generateUniqueBarcode(editingProduct.category || 'Electrical') : (v.barcode && v.barcode.trim() !== '' ? v.barcode : generateUniqueBarcode(editingProduct.category || 'Electrical'))
            }))
          : [{ size: 'Standard', price: '', mrp: '', stock: 50, unit: 'Pcs', barcode: generateUniqueBarcode('Electrical') }]
      );

      if (isCloneMode) {
        setTimeout(() => {
          brandInputRef.current?.focus();
        }, 150);
      }
    } else {
      setName('');
      setCategory('Electrical');
      setSubcategory('');
      setBrand('');
      setHsnCode('');
      setGstRate(18);
      setDescription('');
      setVariants([
        { size: '1/2" (15mm)', price: '', mrp: '', stock: 50, unit: 'Pcs', barcode: generateUniqueBarcode('Electrical') }
      ]);
    }
    setErrorMsg('');
  }, [editingProduct, isOpen, isCloneMode]);

  if (!isOpen) return null;

  // Variants management
  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      { 
        size: '', 
        price: '', 
        mrp: '', 
        stock: 50, 
        unit: variants[0]?.unit || 'Pcs', 
        barcode: generateUniqueBarcode(category)
      }
    ]);
  };

  const regenerateBarcode = (index) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], barcode: generateUniqueBarcode(category) };
      return updated;
    });
  };

  const removeVariantRow = (index) => {
    if (variants.length <= 1) {
      setErrorMsg('Product must have at least 1 size / variant specification.');
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }

    // Validate variants & guarantee barcode
    const cleanedVariants = variants.map((v) => ({
      size: (v.size || 'Standard').trim(),
      price: Number(v.price) || 0,
      mrp: Number(v.mrp) || Number(v.price) || 0,
      stock: Number(v.stock) || 0,
      unit: (v.unit || 'Pcs').trim(),
      barcode: (v.barcode && v.barcode.trim() !== '' ? v.barcode.trim() : generateUniqueBarcode(category))
    }));

    const payload = {
      name: name.trim(),
      category,
      subcategory: subcategory.trim() || 'General',
      brand: brand.trim(),
      hsnCode: hsnCode.trim(),
      gstRate: Number(gstRate) || 0,
      description: description.trim(),
      variants: cleanedVariants
    };

    setIsSubmitting(true);
    try {
      if (editingProduct && editingProduct.id && !isCloneMode) {
        await handleUpdateProduct(editingProduct.id, payload);
      } else {
        await handleAddProduct(payload);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className={`px-6 py-4 text-white flex items-center justify-between ${
          isCloneMode ? 'bg-gradient-to-r from-emerald-800 to-teal-900' : 'bg-slate-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {isCloneMode ? (
              <Copy className="w-5 h-5 text-emerald-300" />
            ) : (
              <PackagePlus className="w-5 h-5 text-blue-400" />
            )}
            <div>
              <h3 className="font-bold text-base">
                {isCloneMode 
                  ? `Duplicate Product to New Brand (from "${editingProduct?.brand || 'Original'}")`
                  : editingProduct 
                  ? 'Edit Product & Sizes' 
                  : 'Add New Electrical / Plumbing Product'}
              </h3>
              {isCloneMode && (
                <p className="text-xs text-emerald-200 font-semibold">
                  Sizes & HSN are preserved. Just set the new brand & adjust prices.
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {isCloneMode && (
            <div className="p-3.5 bg-emerald-50 text-emerald-900 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Quick Clone Active:</strong> All sizes, units, HSN code ({hsnCode || '3917'}), and categories are loaded. Type the new brand name below and adjust prices.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Category Switch */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Primary Department
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('Electrical')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border font-bold text-sm transition-all ${
                  category === 'Electrical'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-400/40 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Zap className="w-4 h-4 fill-amber-500 text-amber-600" />
                <span>⚡ Electrical</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('Plumbing')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border font-bold text-sm transition-all ${
                  category === 'Plumbing'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/40 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Droplets className="w-4 h-4 fill-blue-500 text-blue-600" />
                <span>🚰 Plumbing</span>
              </button>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product Title / Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={
                category === 'Electrical'
                  ? 'e.g. Finolex Flame Retardant Copper Wire (90m)'
                  : 'e.g. Supreme CPVC SDR-11 Pipe (3 Meters)'
              }
              value={name}
              onChange={(e) => setName(capitalizeInput(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Subcategory & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Subcategory / Group <span className="text-blue-600 font-normal">(Select or Type)</span>
                </label>
                {subcategory && (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Selected: {subcategory}
                  </span>
                )}
              </div>
              
              {/* Dropdown Selector to Avoid Typo Mismatches */}
              <select
                value={categorySubcategories.includes(subcategory) ? subcategory : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    handleSubcategorySelect(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 mb-1.5 cursor-pointer"
              >
                <option value="">-- Choose Standard Subcategory ({category}) --</option>
                {categorySubcategories.map((sub) => (
                  <option key={sub} value={sub} className="font-bold text-slate-900">
                    {sub}
                  </option>
                ))}
              </select>

              {/* Editable Text Input for Custom or Fine-Tuning */}
              <input
                type="text"
                placeholder={
                  category === 'Electrical'
                    ? 'Or type custom (e.g. Wires, Switches, MCB, Lighting)'
                    : 'Or type custom (e.g. Pipes, PVC Brass Fittings, Valves)'
                }
                value={subcategory}
                onChange={(e) => setSubcategory(capitalizeInput(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Brand / Manufacturer {isCloneMode ? (
                    <span className="text-emerald-600 font-black">(Enter New Brand)</span>
                  ) : (
                    <span className="text-blue-600 font-normal">(Select or Type)</span>
                  )}
                </label>
                {brand && (
                  <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                    Selected: {brand}
                  </span>
                )}
              </div>

              {/* Brand Dropdown Selector */}
              <select
                value={availableBrandOptions.includes(brand) ? brand : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setBrand(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 mb-1.5 cursor-pointer"
              >
                <option value="">-- Choose Brand / Company --</option>
                {availableBrandOptions.map((b) => (
                  <option key={b} value={b} className="font-bold text-slate-900">
                    {b}
                  </option>
                ))}
              </select>

              {/* Editable Text Input for Custom Brand or Fine-Tuning */}
              <input
                ref={brandInputRef}
                type="text"
                placeholder="Or type custom brand (e.g. Supreme, Finolex, Leo Plast)..."
                value={brand}
                onChange={(e) => setBrand(capitalizeInput(e.target.value))}
                className={`w-full px-3 py-1.5 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 transition-all ${
                  isCloneMode 
                    ? 'bg-emerald-50/60 border-emerald-400 text-slate-900 focus:ring-emerald-500/30 focus:border-emerald-600 font-bold'
                    : 'bg-white border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
            </div>
          </div>

          {/* HSN & GST Rate with Custom Percentage Option */}
          <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  HSN / SAC Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8544, 3917, 8536"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    GST Tax Rate (%)
                  </label>
                  <span className="text-[11px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                    Active: {gstRate}% GST
                  </span>
                </div>

                {/* GST Quick Presets + Custom Button */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[0, 5, 12, 18, 28].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setGstRate(rate)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                        gstRate === rate
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {rate === 0 ? '0% (Exempt)' : `${rate}%`}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      if ([0, 5, 12, 18, 28].includes(gstRate)) {
                        setGstRate(7.5); // Initial custom value
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                      ![0, 5, 12, 18, 28].includes(gstRate)
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Custom %
                  </button>
                </div>
              </div>
            </div>

            {/* Custom GST Input Field (Visible when non-standard rate is set) */}
            {![0, 5, 12, 18, 28].includes(gstRate) && (
              <div className="pt-2 border-t border-dashed border-slate-200 flex items-center justify-between gap-3 animate-fade-in">
                <div className="text-xs text-slate-600 font-semibold">
                  <span>Enter Custom GST Percentage:</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={gstRate}
                      onChange={(e) => setGstRate(Math.max(0, Number(e.target.value)))}
                      className="w-24 px-3 py-1.5 bg-white border-2 border-blue-500 rounded-xl text-xs font-black font-mono-numbers text-right focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="e.g. 7.5"
                    />
                    <span className="text-xs font-black text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      %
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    (Auto-links to Bill & Quotation)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              SIZE VARIANTS & PRICING TABLE (Core Motive)
              ======================================================== */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Product Sizes & MRP / List Rates
                </h4>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Enter official MRP / List price. At billing, you can apply trade discounts cleanly without risk of double-discounting.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariantRow}
                className="flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Size</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200/80 text-slate-800 font-black text-[11px]">
                    <th className="py-2 px-3">Size / Spec <span className="text-rose-500">*</span></th>
                    <th className="py-2 px-2 w-32 text-right">MRP / List Rate (₹) <span className="text-rose-500">*</span></th>
                    <th className="py-2 px-2 w-20 text-center">Stock</th>
                    <th className="py-2 px-2 w-24">Unit</th>
                    <th className="py-2 px-2 w-36">Barcode / SKU</th>
                    <th className="py-2 px-2 w-8 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {variants.map((v, idx) => {
                    const displayRate = v.mrp !== undefined && v.mrp !== '' ? v.mrp : v.price;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        
                        {/* Size */}
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            required
                            placeholder='e.g. 3/4" (20mm)'
                            value={v.size}
                            onChange={(e) => handleVariantChange(idx, 'size', capitalizeInput(e.target.value))}
                            className="w-full px-2 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded text-xs font-bold text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>

                        {/* Single MRP / List Rate (₹) */}
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            step="any"
                            required
                            placeholder="0.00"
                            value={displayRate}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleVariantChange(idx, 'price', val);
                              handleVariantChange(idx, 'mrp', val);
                            }}
                            className="w-full px-2 py-1 bg-slate-50 focus:bg-white border border-slate-300 rounded text-xs font-mono font-black text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                          />
                        </td>

                        {/* Stock */}
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            step="any"
                            placeholder="0"
                            value={v.stock}
                            onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                          />
                        </td>

                        {/* Unit */}
                        <td className="py-1.5 px-2">
                          <select
                            value={v.unit}
                            onChange={(e) => handleVariantChange(idx, 'unit', e.target.value)}
                            className="w-full px-1.5 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Pcs">Pcs</option>
                            <option value="Meters">Meters</option>
                            <option value="Coil">Coil</option>
                            <option value="Tin">Tin / Can</option>
                            <option value="Feet">Feet</option>
                            <option value="Box">Box</option>
                            <option value="Bundle">Bundle</option>
                            <option value="Sets">Sets</option>
                            <option value="Kg">Kg</option>
                          </select>
                        </td>

                        {/* Barcode */}
                        <td className="py-1.5 px-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="Auto barcode"
                              value={v.barcode || ''}
                              onChange={(e) => handleVariantChange(idx, 'barcode', e.target.value)}
                              className="w-full px-2 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded text-[11px] font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => regenerateBarcode(idx)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Generate new random barcode"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Delete */}
                        <td className="py-1.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeVariantRow(idx)}
                            className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
                            title="Remove size"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving to Firebase...' : editingProduct ? 'Update Product' : 'Add to Catalog'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
