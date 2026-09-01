import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Barcode, 
  CheckSquare, 
  Square, 
  Search, 
  Sliders, 
  Tag, 
  Layers, 
  Zap, 
  Droplets,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { generateBarcodeSvgDataUrl } from '../../utils/barcodeHelper';
import { useApp } from '../../context/AppContext';

export const BarcodePrintModal = ({ isOpen, onClose, products = [] }) => {
  const { settings } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiesPerItem, setCopiesPerItem] = useState(1);
  const [labelFormat, setLabelFormat] = useState('sheet24'); // 'sheet24' (3x8 = 24), 'sheet30' (3x10 = 30), 'thermal'
  const [selectedVariantKeys, setSelectedVariantKeys] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

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

  // Initial selection - select all items
  useEffect(() => {
    if (isOpen) {
      const allKeys = new Set(allFlattenedItems.map((item) => item.key));
      setSelectedVariantKeys(allKeys);
      setCurrentPage(1);
    }
  }, [isOpen, allFlattenedItems]);

  // Filtered items for selection in left panel
  const filteredItems = useMemo(() => {
    return allFlattenedItems.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pName = (item.productName || '').toLowerCase();
        const pBrand = (item.brand || '').toLowerCase();
        const pSize = (item.size || '').toLowerCase();
        const pBarcode = (item.barcode || '').toLowerCase();
        return (
          pName.includes(q) ||
          pBrand.includes(q) ||
          pSize.includes(q) ||
          pBarcode.includes(q)
        );
      }
      return true;
    });
  }, [allFlattenedItems, selectedCategory, searchQuery]);

  // Selected base items
  const selectedBaseItems = useMemo(() => {
    return allFlattenedItems.filter((item) => selectedVariantKeys.has(item.key));
  }, [allFlattenedItems, selectedVariantKeys]);

  // Total stickers to print count
  const validCopies = Math.max(1, Math.min(100, Number(copiesPerItem) || 1));
  const totalStickersCount = selectedBaseItems.length * validCopies;

  // Items per sheet based on format
  const itemsPerPage = labelFormat === 'sheet30' ? 30 : labelFormat === 'sheet24' ? 24 : 12;
  const totalPages = Math.max(1, Math.ceil(totalStickersCount / itemsPerPage));

  // Reset to page 1 if current page is out of range
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Lightweight Paginated Items for Preview (Only renders the current page, ensuring 0 lag!)
  const currentSheetItems = useMemo(() => {
    const list = [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    let currentIndex = 0;
    for (const item of selectedBaseItems) {
      for (let c = 0; c < validCopies; c++) {
        if (currentIndex >= startIndex && currentIndex < endIndex) {
          list.push({ ...item, instanceKey: `${item.key}_${c}_${currentIndex}` });
        }
        currentIndex++;
        if (currentIndex >= endIndex) break;
      }
      if (currentIndex >= endIndex) break;
    }
    return list;
  }, [selectedBaseItems, validCopies, currentPage, itemsPerPage]);

  // Grouped pages for the print media output
  const printPages = useMemo(() => {
    if (!isOpen) return [];
    const pages = [];
    let currentPageItems = [];

    for (const item of selectedBaseItems) {
      for (let c = 0; c < validCopies; c++) {
        currentPageItems.push(item);
        if (currentPageItems.length === itemsPerPage) {
          pages.push(currentPageItems);
          currentPageItems = [];
        }
      }
    }
    if (currentPageItems.length > 0) {
      pages.push(currentPageItems);
    }
    return pages;
  }, [selectedBaseItems, validCopies, itemsPerPage, isOpen]);

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedVariantKeys.size === allFlattenedItems.length) {
      setSelectedVariantKeys(new Set());
    } else {
      setSelectedVariantKeys(new Set(allFlattenedItems.map((item) => item.key)));
    }
    setCurrentPage(1);
  };

  const toggleItem = (key) => {
    setSelectedVariantKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl max-w-7xl w-full h-[94vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col no-print">
        
        {/* Header */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>Barcode & Price Sticker Label Printing</span>
                <span className="text-xs font-bold bg-blue-500/30 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                  Auto-Paged & High Speed
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Auto-generates printable barcode sticker sheets (A4) or thermal label rolls with instant page calculation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={totalStickersCount === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-xl text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print {totalStickersCount} Labels ({totalPages} Page{totalPages > 1 ? 's' : ''})</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Workspace: 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Filter & Sticker Configuration (5 cols) */}
          <div className="lg:col-span-5 p-4 bg-slate-50 border-r border-slate-200 flex flex-col gap-3 overflow-hidden">
            
            {/* Sticker Configuration Box */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3 shrink-0">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Sticker Options</span>
                </span>
                <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {selectedVariantKeys.size} sizes ({totalStickersCount} stickers)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Copies / Stickers per Size */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stickers per Size
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={copiesPerItem}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(100, Number(e.target.value) || 1));
                        setCopiesPerItem(val);
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-black font-mono-numbers focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-1">
                      {[1, 2, 5].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCopiesPerItem(preset)}
                          className={`px-2 py-1 text-[11px] font-black rounded-md border transition-all ${
                            copiesPerItem === preset
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {preset}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sheet Format */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Label Layout Format
                  </label>
                  <select
                    value={labelFormat}
                    onChange={(e) => {
                      setLabelFormat(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="sheet24">A4 Sheet (3x8 = 24 Labels)</option>
                    <option value="sheet30">A4 Sheet (3x10 = 30 Labels)</option>
                    <option value="thermal">Thermal Roll (50x30mm)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Selector Filter & Search */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter products / sizes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={toggleSelectAll}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 whitespace-nowrap transition-colors"
              >
                {selectedVariantKeys.size === allFlattenedItems.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({allFlattenedItems.length})
              </button>
              <button
                onClick={() => setSelectedCategory('Electrical')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === 'Electrical'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                ⚡ Electrical
              </button>
              <button
                onClick={() => setSelectedCategory('Plumbing')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === 'Plumbing'
                    ? 'bg-blue-600 text-white font-black shadow-xs'
                    : 'bg-white text-blue-900 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                🚰 Plumbing
              </button>
            </div>

            {/* Items Checkbox List */}
            <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 p-1">
              {filteredItems.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No items match search filter.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isChecked = selectedVariantKeys.has(item.key);
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleItem(item.key)}
                      className={`p-2.5 flex items-center justify-between gap-2 rounded-xl cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="text-blue-600 shrink-0">
                          {isChecked ? <CheckSquare className="w-4 h-4 fill-blue-600 text-white" /> : <Square className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate leading-snug">
                            {item.productName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                            <span className="font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded">
                              {item.size}
                            </span>
                            <span className="font-mono text-slate-500">
                              {item.barcode}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900 font-mono-numbers">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Live Paginated Sheet Preview (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 bg-slate-200/80 overflow-y-auto flex flex-col items-center">
            
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
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
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
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* A4 Sheet Container */}
            <div className="w-full max-w-[210mm] bg-white p-5 sm:p-6 shadow-xl rounded-2xl border border-slate-300 min-h-[297mm] flex flex-col justify-between">
              
              <div>
                {/* Sheet Header Preview */}
                <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-slate-200 text-xs text-slate-400">
                  <span className="font-black uppercase tracking-wider text-slate-700 truncate max-w-sm">
                    {settings.shopName || 'Sri Mahaganapathy Electricals and Hardware'} - Sticker Labels Sheet
                  </span>
                  <span className="font-bold text-slate-500">
                    Page {currentPage} of {totalPages} ({currentSheetItems.length} Stickers)
                  </span>
                </div>

                {/* Printable Labels Grid for Current Page */}
                <div className={`grid gap-2.5 ${
                  labelFormat === 'thermal'
                    ? 'grid-cols-1 max-w-xs mx-auto'
                    : labelFormat === 'sheet30'
                    ? 'grid-cols-3'
                    : 'grid-cols-3'
                }`}>
                  {currentSheetItems.map((item) => (
                    <div
                      key={item.instanceKey}
                      className="border border-slate-300 rounded-lg p-2 bg-white flex flex-col justify-between items-center text-center shadow-2xs hover:border-blue-400 transition-all text-slate-900"
                      style={{ minHeight: '38mm' }}
                    >
                      {/* Top Shop Brand */}
                      <div className="w-full flex items-center justify-between text-[8px] font-black uppercase text-slate-600 pb-0.5 border-b border-dashed border-slate-200">
                        <span className="truncate max-w-[120px]">{settings.shopName || 'Sri Mahaganapathy'}</span>
                        <span>{item.category === 'Electrical' ? '⚡ EL' : '🚰 PL'}</span>
                      </div>

                      {/* Product Name & Size */}
                      <div className="my-1 w-full">
                        <h4 className="text-[10px] font-black text-slate-900 line-clamp-1 leading-tight">
                          {item.productName}
                        </h4>
                        <p className="text-[9px] font-extrabold text-blue-700 mt-0.5">
                          Size: {item.size}
                        </p>
                      </div>

                      {/* Price & MRP */}
                      <div className="w-full flex items-center justify-center gap-2 my-0.5 bg-slate-50 py-0.5 rounded border border-slate-100">
                        {item.mrp > item.price && (
                          <span className="text-[9px] text-slate-400 line-through font-mono font-medium">
                            MRP: ₹{item.mrp}
                          </span>
                        )}
                        <span className="text-[11px] font-black text-slate-950 font-mono-numbers">
                          ₹{item.price}
                        </span>
                      </div>

                      {/* Barcode Image & Code */}
                      <div className="w-full flex flex-col items-center pt-0.5">
                        <img
                          src={generateBarcodeSvgDataUrl(item.barcode)}
                          alt={item.barcode}
                          className="h-9 w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Sheet Footer Info */}
              <div className="pt-4 mt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                <span>Sri Mahaganapathy Electricals and Hardware • Barcode Label Master</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Print Only Layout Formatted Specifically for Sheet/Thermal Sticker Printing Across All Pages */}
      <div className="print-only w-full bg-white text-black p-0 m-0">
        <style>{`
          @page {
            size: A4 portrait;
            margin: 8mm 6mm;
          }
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            .sticker-page-break {
              page-break-after: always;
              break-after: page;
            }
            .sticker-label-card {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          }
        `}</style>
        
        {printPages.map((pageItems, pageIdx) => (
          <div 
            key={pageIdx} 
            className={`w-full min-h-[285mm] ${pageIdx < printPages.length - 1 ? 'sticker-page-break' : ''}`}
          >
            <div className={`grid gap-2 ${
              labelFormat === 'thermal'
                ? 'grid-cols-1'
                : labelFormat === 'sheet30'
                ? 'grid-cols-3'
                : 'grid-cols-3'
            }`}>
              {pageItems.map((item, idx) => (
                <div
                  key={idx}
                  className="sticker-label-card border border-black rounded p-2 bg-white flex flex-col justify-between items-center text-center text-black"
                  style={{ height: labelFormat === 'sheet30' ? '28mm' : '33mm', overflow: 'hidden' }}
                >
                  {/* Top Header */}
                  <div className="w-full flex items-center justify-between text-[8px] font-bold uppercase pb-0.5 border-b border-black">
                    <span className="truncate">{settings.shopName || 'Sri Mahaganapathy'}</span>
                    <span>{item.category === 'Electrical' ? 'ELEC' : 'PLUMB'}</span>
                  </div>

                  {/* Item details */}
                  <div className="my-0.5 w-full">
                    <div className="text-[9px] font-extrabold line-clamp-1 leading-tight">
                      {item.productName}
                    </div>
                    <div className="text-[8px] font-bold">
                      Size: {item.size}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="w-full flex items-center justify-center gap-1.5 text-[9px] font-extrabold">
                    {item.mrp > item.price && (
                      <span className="line-through text-[8px]">MRP ₹{item.mrp}</span>
                    )}
                    <span>Rate: ₹{item.price}</span>
                  </div>

                  {/* Barcode */}
                  <div className="w-full flex flex-col items-center">
                    <img
                      src={generateBarcodeSvgDataUrl(item.barcode)}
                      alt={item.barcode}
                      style={{ height: '24px', width: '90%', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
