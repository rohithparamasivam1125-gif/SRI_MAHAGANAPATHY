import React, { useState, useMemo } from 'react';
import { 
  X, 
  Copy, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Percent, 
  DollarSign, 
  Check 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateUniqueBarcode } from '../../utils/barcodeHelper';
import { bulkImportProducts } from '../../firebase/firestoreService';

export const BulkBrandCloneModal = ({ isOpen, onClose }) => {
  const { products, showToast } = useApp();

  // Extract unique existing brands
  const existingBrands = useMemo(() => {
    const brandMap = new Map();
    const list = Array.isArray(products) ? products : [];
    list.forEach((p) => {
      if (!p) return;
      const b = (p.brand || 'Unbranded').trim();
      brandMap.set(b, (brandMap.get(b) || 0) + 1);
    });
    return Array.from(brandMap.entries()).map(([name, count]) => ({ name, count }));
  }, [products]);

  const [sourceBrand, setSourceBrand] = useState(existingBrands[0]?.name || '');
  const [targetBrand, setTargetBrand] = useState('');
  const [priceAdjustmentType, setPriceAdjustmentType] = useState('none'); // 'none' | 'percent_increase' | 'percent_decrease'
  const [percentValue, setPercentValue] = useState('10');
  const [roundToInteger, setRoundToInteger] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Source products to clone
  const sourceProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list.filter((p) => p && (p.brand || 'Unbranded').trim() === sourceBrand);
  }, [products, sourceBrand]);

  const totalVariantsCount = useMemo(() => {
    return sourceProducts.reduce((acc, p) => acc + (Array.isArray(p?.variants) ? p.variants.length : 0), 0);
  }, [sourceProducts]);

  if (!isOpen) return null;

  const handleClone = async () => {
    setErrorMsg('');
    const cleanTargetBrand = targetBrand.trim();

    if (!cleanTargetBrand) {
      setErrorMsg('Please enter a target brand name (e.g. Supreme, Finolex, Havells).');
      return;
    }

    if (cleanTargetBrand.toLowerCase() === sourceBrand.toLowerCase()) {
      setErrorMsg('Target brand name must be different from source brand.');
      return;
    }

    if (sourceProducts.length === 0) {
      setErrorMsg(`No products found for source brand "${sourceBrand}".`);
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate multiplier
      let multiplier = 1;
      if (priceAdjustmentType === 'percent_increase') {
        multiplier = 1 + (Number(percentValue) || 0) / 100;
      } else if (priceAdjustmentType === 'percent_decrease') {
        multiplier = 1 - (Number(percentValue) || 0) / 100;
      }

      // Prepare cloned products
      const clonedProducts = sourceProducts.map((p) => {
        const clonedVariants = (p.variants || []).map((v) => {
          let adjustedPrice = (Number(v.price) || 0) * multiplier;
          let adjustedMrp = (Number(v.mrp) || Number(v.price) || 0) * multiplier;

          if (roundToInteger) {
            adjustedPrice = Math.round(adjustedPrice);
            adjustedMrp = Math.round(adjustedMrp);
          } else {
            adjustedPrice = Number(adjustedPrice.toFixed(2));
            adjustedMrp = Number(adjustedMrp.toFixed(2));
          }

          return {
            ...v,
            price: adjustedPrice,
            mrp: adjustedMrp,
            barcode: generateUniqueBarcode(p.category || 'Plumbing')
          };
        });

        return {
          name: p.name,
          category: p.category,
          subcategory: p.subcategory || 'General',
          brand: cleanTargetBrand,
          hsnCode: p.hsnCode || '',
          gstRate: p.gstRate !== undefined ? p.gstRate : 18,
          description: p.description || '',
          variants: clonedVariants
        };
      });

      const count = await bulkImportProducts(clonedProducts);
      if (showToast) {
        showToast(`Successfully cloned ${count} products (${totalVariantsCount} sizes) to "${cleanTargetBrand}"!`, 'success');
      }
      onClose();
    } catch (err) {
      console.error('Cloning error:', err);
      setErrorMsg('Failed to clone products: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Copy className="w-5 h-5 text-blue-200" />
            <div>
              <h3 className="font-bold text-base">Bulk Brand Catalog Cloner</h3>
              <p className="text-xs text-blue-100 font-semibold">
                Instantly duplicate an entire brand catalog with same sizes & HSN codes
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: Select Source Brand & Target Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                1. Source Brand (Copy From)
              </label>
              <select
                value={sourceBrand}
                onChange={(e) => setSourceBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {existingBrands.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name} ({b.count} products)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                2. New Target Brand (Create To)
              </label>
              <input
                type="text"
                placeholder="e.g. Supreme, Finolex, Havells"
                value={targetBrand}
                onChange={(e) => setTargetBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Step 2: Price Adjustment Settings */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              3. Price Difference for {targetBrand.trim() || 'New Brand'} (Optional)
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriceAdjustmentType('none')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  priceAdjustmentType === 'none'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Same Prices (0%)
              </button>

              <button
                type="button"
                onClick={() => setPriceAdjustmentType('percent_increase')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  priceAdjustmentType === 'percent_increase'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                + Higher Price (%)
              </button>

              <button
                type="button"
                onClick={() => setPriceAdjustmentType('percent_decrease')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  priceAdjustmentType === 'percent_decrease'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                - Lower Price (%)
              </button>
            </div>

            {priceAdjustmentType !== 'none' && (
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Adjustment Percentage:</span>
                  <div className="relative w-28">
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={percentValue}
                      onChange={(e) => setPercentValue(e.target.value)}
                      className="w-full pl-3 pr-7 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={roundToInteger}
                    onChange={(e) => setRoundToInteger(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>Round to nearest ₹1</span>
                </label>
              </div>
            )}
          </div>

          {/* Step 3: Summary / Preview Card */}
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2 text-xs text-slate-700">
            <div className="font-bold text-blue-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>What will be created:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600 font-semibold">
              <li>
                <strong className="text-slate-900 font-bold">{sourceProducts.length}</strong> products with{' '}
                <strong className="text-slate-900 font-bold">{totalVariantsCount}</strong> size variants.
              </li>
              <li>
                All Categories, Subcategories, Units, HSN Codes, and GST Rates will be copied identically.
              </li>
              <li>
                Fresh unique Barcodes will be generated automatically for every size.
              </li>
              <li>
                New prices will be{' '}
                <strong className="text-blue-900 font-bold">
                  {priceAdjustmentType === 'none'
                    ? 'identical to ' + sourceBrand
                    : priceAdjustmentType === 'percent_increase'
                    ? `+${percentValue}% higher than ` + sourceBrand
                    : `-${percentValue}% lower than ` + sourceBrand}
                </strong>
                .
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleClone}
            disabled={isProcessing || !targetBrand.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Cloning {sourceProducts.length} Products...</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Duplicate to "{targetBrand.trim() || 'New Brand'}"</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
