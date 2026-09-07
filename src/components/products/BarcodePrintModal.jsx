import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Barcode, 
  CheckSquare, 
  Square, 
  Search, 
  Sliders, 
  FileSpreadsheet,
  Plus,
  Minus,
  Settings2,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { generateBarcodeSvgDataUrl } from '../../utils/barcodeHelper';
import { useApp } from '../../context/AppContext';

// Preset Label Templates configuration with calibrated millimeter geometry
export const LABEL_TEMPLATES = {
  sheet24: {
    id: 'sheet24',
    name: 'A4 Sheet (3×8 = 24 Labels)',
    description: 'Standard Avery/Oddy 70mm × 37mm',
    type: 'sheet',
    cols: 3,
    rows: 8,
    perPage: 24,
    cellWidthMm: 70,
    cellHeightMm: 37,
    barcodeHeight: 30,
    fontSize: 'text-[9.5px]',
    subFontSize: 'text-[8px]',
    pageCss: '@page { size: A4 portrait; margin: 0; }'
  },
  sheet30: {
    id: 'sheet30',
    name: 'A4 Sheet (3×10 = 30 Labels)',
    description: 'Standard dense 70mm × 29.7mm',
    type: 'sheet',
    cols: 3,
    rows: 10,
    perPage: 30,
    cellWidthMm: 70,
    cellHeightMm: 29.5,
    barcodeHeight: 24,
    fontSize: 'text-[9px]',
    subFontSize: 'text-[7.5px]',
    pageCss: '@page { size: A4 portrait; margin: 0; }'
  },
  sheet40: {
    id: 'sheet40',
    name: 'A4 Sheet (4×10 = 40 Labels)',
    description: 'Small fittings & parts 52.5mm × 29.5mm',
    type: 'sheet',
    cols: 4,
    rows: 10,
    perPage: 40,
    cellWidthMm: 52.5,
    cellHeightMm: 29.5,
    barcodeHeight: 22,
    fontSize: 'text-[8.5px]',
    subFontSize: 'text-[7px]',
    pageCss: '@page { size: A4 portrait; margin: 0; }'
  },
  thermal50x30: {
    id: 'thermal50x30',
    name: 'Thermal Roll (50mm × 30mm)',
    description: 'Direct continuous thermal label (1-Up)',
    type: 'thermal',
    cols: 1,
    rows: 1,
    perPage: 1,
    cellWidthMm: 50,
    cellHeightMm: 30,
    barcodeHeight: 26,
    fontSize: 'text-[9px]',
    subFontSize: 'text-[7.5px]',
    pageCss: '@page { size: 50mm 30mm; margin: 0; }'
  },
  thermal50x25: {
    id: 'thermal50x25',
    name: 'Thermal Roll (50mm × 25mm)',
    description: 'Compact continuous thermal roll (1-Up)',
    type: 'thermal',
    cols: 1,
    rows: 1,
    perPage: 1,
    cellWidthMm: 50,
    cellHeightMm: 25,
    barcodeHeight: 20,
    fontSize: 'text-[8.5px]',
    subFontSize: 'text-[7px]',
    pageCss: '@page { size: 50mm 25mm; margin: 0; }'
  }
};

/**
 * Unified WYSIWYG Barcode Sticker Card component
 */
const BarcodeStickerCard = ({ 
  item, 
  template, 
  customOptions, 
  shopName, 
  isPrint = false 
}) => {
  const {
    showShopName = true,
    showMrp = true,
    showRate = true,
    showSize = true,
    showBarcodeText = true,
    showCategory = true
  } = customOptions;

  const barcodeSvg = generateBarcodeSvgDataUrl(item.barcode, {
    barHeight: template.barcodeHeight || 26,
    includeText: showBarcodeText,
    fontSize: 9
  });

  return (
    <div
      className={`box-border bg-white text-slate-900 flex flex-col justify-between items-center text-center overflow-hidden transition-all ${
        isPrint 
          ? 'border border-black' 
          : 'border border-slate-300 rounded-lg p-1.5 shadow-2xs hover:border-blue-500'
      }`}
      style={{
        width: isPrint ? `${template.cellWidthMm}mm` : '100%',
        height: isPrint ? `${template.cellHeightMm}mm` : `${template.cellHeightMm * 2.8}px`,
        maxHeight: isPrint ? `${template.cellHeightMm}mm` : undefined,
        padding: isPrint ? '1.5mm' : '6px',
        pageBreakInside: 'avoid',
        breakInside: 'avoid'
      }}
    >
      {/* 1. Header: Shop Name & Category */}
      {showShopName && (
        <div className="w-full flex items-center justify-between pb-0.5 border-b border-dashed border-slate-300 shrink-0 leading-tight">
          <span className="font-black uppercase tracking-wider text-[7.5px] truncate max-w-[75%] text-slate-800">
            {shopName || 'Sri Mahaganapathy'}
          </span>
          {showCategory && (
            <span className="font-extrabold text-[7px] text-slate-600">
              {item.category === 'Electrical' ? '⚡ EL' : '🚰 PL'}
            </span>
          )}
        </div>
      )}

      {/* 2. Product Name & Size/Brand */}
      <div className="my-auto w-full px-0.5 py-0.5">
        <h4 className={`font-black text-slate-900 leading-tight line-clamp-1 ${template.fontSize}`}>
          {item.productName}
        </h4>
        <div className="flex items-center justify-center gap-1.5 mt-0.5 leading-none">
          {item.brand && (
            <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-tight">
              {item.brand}
            </span>
          )}
          {showSize && item.size && (
            <span className="text-[8px] font-black text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
              {item.size}
            </span>
          )}
        </div>
      </div>

      {/* 3. Price & MRP Row */}
      {(showRate || (showMrp && item.mrp > item.price)) && (
        <div className="w-full flex items-center justify-center gap-2 py-0.5 my-0.5 bg-slate-50 rounded border border-slate-200 shrink-0 leading-none">
          {showMrp && item.mrp > item.price && (
            <span className="text-[7.5px] text-slate-400 line-through font-mono font-medium">
              MRP: ₹{item.mrp}
            </span>
          )}
          {showRate && (
            <span className="text-[9.5px] font-black text-slate-950 font-mono-numbers">
              ₹{item.price}
            </span>
          )}
        </div>
      )}

      {/* 4. Barcode Image */}
      <div className="w-full flex flex-col items-center justify-center shrink-0 pt-0.5">
        {barcodeSvg ? (
          <img
            src={barcodeSvg}
            alt={item.barcode}
            style={{
              maxHeight: `${template.barcodeHeight}px`,
              width: '95%',
              objectFit: 'contain'
            }}
          />
        ) : (
          <div className="text-[8px] font-mono font-bold text-slate-400">{item.barcode}</div>
        )}
      </div>
    </div>
  );
};

export const BarcodePrintModal = ({ 
  isOpen, 
  onClose, 
  products = [], 
  initialSelectedKey = null,
  initialProduct = null 
}) => {
  const { settings } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('sheet24');
  const [itemQuantities, setItemQuantities] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Label Customization Options
  const [customOptions, setCustomOptions] = useState({
    showShopName: true,
    showMrp: true,
    showRate: true,
    showSize: true,
    showBarcodeText: true,
    showCategory: true
  });

  const activeTemplate = LABEL_TEMPLATES[selectedTemplateKey] || LABEL_TEMPLATES.sheet24;

  // Flatten all variants with parent product info
  const allFlattenedItems = useMemo(() => {
    const list = [];
    const prodList = Array.isArray(products) ? products : [];
    prodList.forEach((prod) => {
      if (!prod) return;
      const variants = Array.isArray(prod.variants) ? prod.variants : [];
      variants.forEach((v, idx) => {
        if (!v) return;
        const key = `${prod.id || prod.name || 'prod'}__${v.size || 'std'}__${v.barcode || idx}`;
        list.push({
          key,
          productId: prod.id || '',
          productName: prod.name || 'Item',
          category: prod.category || 'Electrical',
          subcategory: prod.subcategory || '',
          brand: prod.brand || '',
          size: v.size || 'Standard',
          price: Number(v.price) || 0,
          mrp: Number(v.mrp || v.price) || 0,
          unit: v.unit || 'Pcs',
          stock: Number(v.stock) || 0,
          barcode: v.barcode || `SMG-${Math.floor(100000 + Math.random() * 900000)}`
        });
      });
    });
    return list;
  }, [products]);

  // Initial selection initialization
  useEffect(() => {
    if (isOpen) {
      const initialQtyMap = {};
      
      if (initialSelectedKey) {
        initialQtyMap[initialSelectedKey] = 1;
      } else if (initialProduct) {
        allFlattenedItems.forEach((item) => {
          if (item.productId === initialProduct.id || item.productName === initialProduct.name) {
            initialQtyMap[item.key] = Math.max(1, Math.min(100, item.stock || 1));
          }
        });
      } else {
        allFlattenedItems.forEach((item) => {
          initialQtyMap[item.key] = 1;
        });
      }

      setItemQuantities(initialQtyMap);
      setCurrentPage(1);
    }
  }, [isOpen, allFlattenedItems, initialSelectedKey, initialProduct]);

  // Filtered items for selection drawer
  const filteredItems = useMemo(() => {
    return allFlattenedItems.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pName = (item.productName || '').toLowerCase();
        const pBrand = (item.brand || '').toLowerCase();
        const pSub = (item.subcategory || '').toLowerCase();
        const pSize = (item.size || '').toLowerCase();
        const pBarcode = (item.barcode || '').toLowerCase();
        return (
          pName.includes(q) ||
          pBrand.includes(q) ||
          pSub.includes(q) ||
          pSize.includes(q) ||
          pBarcode.includes(q)
        );
      }
      return true;
    });
  }, [allFlattenedItems, selectedCategory, searchQuery]);

  // Build full queue of stickers
  const fullStickerQueue = useMemo(() => {
    const queue = [];
    allFlattenedItems.forEach((item) => {
      const qty = Number(itemQuantities[item.key]) || 0;
      for (let i = 0; i < qty; i++) {
        queue.push({
          ...item,
          instanceKey: `${item.key}_copy_${i}_${queue.length}`
        });
      }
    });
    return queue;
  }, [allFlattenedItems, itemQuantities]);

  const totalStickersCount = fullStickerQueue.length;
  const itemsPerPage = activeTemplate.perPage;
  const totalPages = Math.max(1, Math.ceil(totalStickersCount / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const currentSheetItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return fullStickerQueue.slice(startIndex, endIndex);
  }, [fullStickerQueue, currentPage, itemsPerPage]);

  const printPages = useMemo(() => {
    if (!isOpen || totalStickersCount === 0) return [];
    const pages = [];
    for (let i = 0; i < fullStickerQueue.length; i += itemsPerPage) {
      pages.push(fullStickerQueue.slice(i, i + itemsPerPage));
    }
    return pages;
  }, [fullStickerQueue, itemsPerPage, isOpen, totalStickersCount]);

  if (!isOpen) return null;

  const handleItemQuantityChange = (key, val) => {
    const qty = Math.max(0, Math.min(500, Number(val) || 0));
    setItemQuantities((prev) => ({
      ...prev,
      [key]: qty
    }));
  };

  const handleToggleItem = (key) => {
    setItemQuantities((prev) => {
      const current = prev[key] || 0;
      return {
        ...prev,
        [key]: current > 0 ? 0 : 1
      };
    });
  };

  const handleSelectAllFiltered = () => {
    const allSelected = filteredItems.every((item) => (itemQuantities[item.key] || 0) > 0);
    setItemQuantities((prev) => {
      const next = { ...prev };
      filteredItems.forEach((item) => {
        next[item.key] = allSelected ? 0 : (next[item.key] || 1);
      });
      return next;
    });
    setCurrentPage(1);
  };

  const handleSetAllQty = (qty) => {
    setItemQuantities((prev) => {
      const next = { ...prev };
      filteredItems.forEach((item) => {
        if ((next[item.key] || 0) > 0 || qty > 0) {
          next[item.key] = qty;
        }
      });
      return next;
    });
  };

  const handleSetFromStock = () => {
    setItemQuantities((prev) => {
      const next = { ...prev };
      filteredItems.forEach((item) => {
        next[item.key] = Math.max(1, Math.min(100, item.stock || 1));
      });
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedCount = Object.values(itemQuantities).filter((q) => q > 0).length;

  return (
    <div className="barcode-modal-root fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl max-w-7xl w-full h-[95vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col no-print">
        
        {/* Header */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Barcode & Price Sticker Label Printing</span>
                <span className="text-[10px] font-bold bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                  GS1 Code 128 Calibrated
                </span>
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                Print high-density A4 pre-cut sticker sheets or continuous direct thermal rolls with zero creep drift.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                showCustomizer 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-xs' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Customize elements shown on sticker labels"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Customize Labels</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={totalStickersCount === 0}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print {totalStickersCount} Labels ({totalPages} Pg{totalPages > 1 ? 's' : ''})</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Label Customizer Drawer Bar */}
        {showCustomizer && (
          <div className="bg-slate-800 border-b border-slate-700 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300 animate-slide-up shrink-0">
            <div className="flex items-center gap-2 font-bold">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Sticker Content Elements:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={customOptions.showShopName}
                  onChange={(e) => setCustomOptions({ ...customOptions, showShopName: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Shop Name</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={customOptions.showMrp}
                  onChange={(e) => setCustomOptions({ ...customOptions, showMrp: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>MRP</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={customOptions.showRate}
                  onChange={(e) => setCustomOptions({ ...customOptions, showRate: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Selling Rate (₹)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={customOptions.showSize}
                  onChange={(e) => setCustomOptions({ ...customOptions, showSize: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Size / Spec</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={customOptions.showBarcodeText}
                  onChange={(e) => setCustomOptions({ ...customOptions, showBarcodeText: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Barcode Text</span>
              </label>
            </div>
          </div>
        )}

        {/* Modal Main Workspace: 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Filter, Quantity Config & Variant Selector (5 cols) */}
          <div className="lg:col-span-5 p-3.5 bg-slate-50 border-r border-slate-200 flex flex-col gap-2.5 overflow-hidden">
            
            {/* Format & Template Selector Box */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2 shrink-0">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sticker Sheet / Roll Format</span>
                </span>
                <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {selectedCount} sizes selected ({totalStickersCount} stickers)
                </span>
              </div>

              <div>
                <select
                  value={selectedTemplateKey}
                  onChange={(e) => {
                    setSelectedTemplateKey(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {Object.values(LABEL_TEMPLATES).map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} — {tpl.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Batch Quantity Tools */}
              <div className="pt-1.5 flex items-center justify-between gap-1.5 text-[11px]">
                <span className="font-bold text-slate-500 text-[10px] uppercase">Batch Sets:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 5].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSetAllQty(preset)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold rounded-md transition-all active:scale-95"
                    >
                      {preset}x All
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleSetFromStock}
                    className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold rounded-md transition-all active:scale-95"
                    title="Set sticker count matching each variant's in-stock quantity"
                  >
                    <PackageCheck className="w-3 h-3 text-amber-700" />
                    <span>Sync Stock</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Product Selector Filter & Search */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter product, brand, size, code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleSelectAllFiltered}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 whitespace-nowrap transition-colors"
              >
                {filteredItems.every((item) => (itemQuantities[item.key] || 0) > 0) ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Category Filter Badges */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({allFlattenedItems.length})
              </button>
              <button
                onClick={() => setSelectedCategory('Electrical')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === 'Electrical'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                ⚡ Electrical
              </button>
              <button
                onClick={() => setSelectedCategory('Plumbing')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === 'Plumbing'
                    ? 'bg-blue-600 text-white font-black shadow-xs'
                    : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                🚰 Plumbing
              </button>
            </div>

            {/* Items Checkbox List with Individual Quantity Counters */}
            <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 p-1">
              {filteredItems.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No items match the search query.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const qty = itemQuantities[item.key] || 0;
                  const isChecked = qty > 0;
                  return (
                    <div
                      key={item.key}
                      className={`p-2 flex items-center justify-between gap-2 rounded-xl transition-colors ${
                        isChecked ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div 
                        onClick={() => handleToggleItem(item.key)}
                        className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="text-blue-600 shrink-0">
                          {isChecked ? <CheckSquare className="w-4 h-4 fill-blue-600 text-white" /> : <Square className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate leading-snug">
                            {item.productName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px]">
                            <span className="font-bold text-blue-700 bg-blue-100/70 px-1 py-0.2 rounded">
                              {item.size}
                            </span>
                            <span className="font-mono text-slate-500 truncate max-w-[120px]">
                              {item.barcode}
                            </span>
                            <span className="text-slate-400">
                              (Stock: {item.stock})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper & Price */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black text-slate-900 font-mono-numbers">
                          {formatCurrency(item.price)}
                        </span>

                        <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleItemQuantityChange(item.key, Math.max(0, qty - 1))}
                            className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Decrease Quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <input
                            type="number"
                            min="0"
                            max="500"
                            value={qty}
                            onChange={(e) => handleItemQuantityChange(item.key, e.target.value)}
                            className="w-10 text-center text-xs font-black font-mono-numbers bg-slate-50 border-x border-slate-200 focus:outline-none focus:bg-white"
                          />

                          <button
                            type="button"
                            onClick={() => handleItemQuantityChange(item.key, qty + 1)}
                            className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Increase Quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Live Calibrated WYSIWYG Preview (7 cols) */}
          <div className="lg:col-span-7 p-3 sm:p-5 bg-slate-200/80 overflow-y-auto flex flex-col items-center">
            
            {/* Auto Page Navigation Bar */}
            <div className="w-full max-w-[210mm] bg-white px-4 py-2.5 rounded-xl border border-slate-300 shadow-sm mb-3 flex items-center justify-between gap-2 text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>
                  Showing Page <strong className="text-blue-700 font-black">{currentPage}</strong> of <strong className="text-slate-900 font-black">{totalPages}</strong>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  ({totalStickersCount} stickers total)
                </span>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="First Page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1 px-2 font-mono font-bold text-xs">
                  <span>Pg</span>
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-black text-blue-700"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <span>/ {totalPages}</span>
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Last Page"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Sheet Container */}
            <div 
              className={`w-full bg-white shadow-xl rounded-2xl border border-slate-300 p-4 flex flex-col justify-between ${
                activeTemplate.type === 'thermal' ? 'max-w-sm' : 'max-w-[210mm] min-h-[297mm]'
              }`}
            >
              <div>
                {/* Sheet Header Preview */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 text-xs text-slate-400">
                  <span className="font-black uppercase tracking-wider text-slate-700 truncate max-w-sm">
                    {settings.shopName || 'Sri Mahaganapathy Electricals'} — {activeTemplate.name}
                  </span>
                  <span className="font-bold text-slate-500">
                    Page {currentPage} of {totalPages} ({currentSheetItems.length} Stickers)
                  </span>
                </div>

                {/* Calibrated Sticker Grid */}
                {currentSheetItems.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 text-xs">
                    No stickers selected for printing. Check items from the left drawer.
                  </div>
                ) : (
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${activeTemplate.cols}, minmax(0, 1fr))`
                    }}
                  >
                    {currentSheetItems.map((item) => (
                      <BarcodeStickerCard
                        key={item.instanceKey}
                        item={item}
                        template={activeTemplate}
                        customOptions={customOptions}
                        shopName={settings.shopName}
                        isPrint={false}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sheet Footer Info */}
              {activeTemplate.type === 'sheet' && (
                <div className="pt-3 mt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                  <span>Sri Mahaganapathy Electricals & Hardware • Barcode Label Master</span>
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* Actual Print View Output with Dynamic @page and Calibrated Millimeter Sizing */}
      <div className="barcode-print-container print-only w-full bg-white text-black p-0 m-0">
        <style>{`
          ${activeTemplate.pageCss}
          @media print {
            body, html {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              height: auto !important;
            }
            .barcode-modal-root {
              position: static !important;
              display: block !important;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
              background: transparent !important;
              padding: 0 !important;
              margin: 0 !important;
              inset: auto !important;
            }
            .no-print {
              display: none !important;
            }
            .print-only {
              display: block !important;
              position: static !important;
              overflow: visible !important;
              height: auto !important;
              width: 100% !important;
            }
            .sticker-page-container {
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              box-sizing: border-box !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
            }
            .sticker-page-container:last-child {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
          }
        `}</style>
        
        {printPages.map((pageItems, pageIdx) => (
          <div 
            key={pageIdx} 
            className="sticker-page-container"
            style={{
              width: activeTemplate.type === 'thermal' ? `${activeTemplate.cellWidthMm}mm` : '210mm',
              height: activeTemplate.type === 'thermal' ? `${activeTemplate.cellHeightMm}mm` : '296mm',
              display: 'grid',
              gridTemplateColumns: `repeat(${activeTemplate.cols}, ${activeTemplate.cellWidthMm}mm)`,
              gridAutoRows: `${activeTemplate.cellHeightMm}mm`,
              alignContent: 'start',
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}
          >
            {pageItems.map((item, idx) => (
              <BarcodeStickerCard
                key={idx}
                item={item}
                template={activeTemplate}
                customOptions={customOptions}
                shopName={settings.shopName}
                isPrint={true}
              />
            ))}
          </div>
        ))}
      </div>

    </div>
  );
};
