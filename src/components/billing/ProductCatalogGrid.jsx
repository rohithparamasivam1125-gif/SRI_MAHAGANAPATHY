import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Zap, 
  Droplets, 
  Package, 
  Plus, 
  Filter, 
  Check, 
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

export const ProductCatalogGrid = () => {
  const { products, addToCart, seedStarterProducts, isLoadingProducts } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'Electrical' | 'Plumbing'
  const [selectedSubcategory, setSelectedSubcategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubcategoriesExpanded, setIsSubcategoriesExpanded] = useState(false);

  // Extract unique subcategories and product counts
  const { availableSubcategories, subcategoryCounts } = useMemo(() => {
    const subs = new Set();
    const counts = { ALL: 0 };

    products.forEach((p) => {
      if (selectedCategory === 'ALL' || p.category === selectedCategory) {
        counts.ALL = (counts.ALL || 0) + 1;
        const sub = p.subcategory || 'General';
        subs.add(sub);
        counts[sub] = (counts[sub] || 0) + 1;
      }
    });

    return {
      availableSubcategories: ['ALL', ...Array.from(subs)],
      subcategoryCounts: counts
    };
  }, [products, selectedCategory]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }
      // Subcategory filter
      if (selectedSubcategory !== 'ALL' && p.subcategory !== selectedSubcategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchBrand = p.brand?.toLowerCase().includes(q);
        const matchCategory = p.category?.toLowerCase().includes(q);
        const matchSubcategory = p.subcategory?.toLowerCase().includes(q);
        const matchVariant = p.variants?.some((v) => 
          v.size?.toLowerCase().includes(q) || 
          v.barcode?.toLowerCase().includes(q)
        );
        return matchName || matchBrand || matchCategory || matchSubcategory || matchVariant;
      }
      return true;
    });
  }, [products, selectedCategory, selectedSubcategory, searchQuery]);

  // Instant Barcode Scanner Handler
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      // Look for exact barcode match across all products
      for (const prod of products) {
        const matchedVariant = (prod.variants || []).find((v) => 
          v.barcode && v.barcode.toLowerCase() === q
        );
        if (matchedVariant) {
          addToCart(prod, matchedVariant);
          setSearchQuery('');
          return;
        }
      }
    }
  };

  const visibleSubcategories = isSubcategoriesExpanded 
    ? availableSubcategories 
    : availableSubcategories.slice(0, 8);

  return (
    <div className="flex flex-col h-full bg-slate-100/80 rounded-2xl border border-slate-200/90 p-4">
      
      {/* Top Search & Category Selection Bar */}
      <div className="space-y-3 mb-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Scan barcode with scanner gun or search item, size, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-12 pr-16 py-3 bg-white rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* Main Category Tabs (Electrical vs Plumbing) */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedSubcategory('ALL');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm sm:text-base font-black transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15'
                : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>All Products</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('Electrical');
              setSelectedSubcategory('ALL');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm sm:text-base font-black transition-all ${
              selectedCategory === 'Electrical'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 ring-2 ring-amber-400'
                : 'bg-white text-amber-950 border border-amber-300 hover:bg-amber-50'
            }`}
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500 text-amber-600" />
            <span>⚡ Electrical</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('Plumbing');
              setSelectedSubcategory('ALL');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm sm:text-base font-black transition-all ${
              selectedCategory === 'Plumbing'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-400'
                : 'bg-white text-blue-950 border border-blue-300 hover:bg-blue-50'
            }`}
          >
            <Droplets className="w-4 h-4 sm:w-5 sm:h-5 fill-blue-500 text-blue-600" />
            <span>🚰 Plumbing</span>
          </button>
        </div>

        {/* Hybrid Subcategory Selector Box: Quick Dropdown + Wrapped Multi-Row Pills */}
        {availableSubcategories.length > 2 && (
          <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            
            {/* Subcategory Bar Header with Dropdown & Expand Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Filter className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <label className="text-xs font-black text-slate-700 whitespace-nowrap">
                  Subcategory:
                </label>
                {/* Option 1: Quick Dropdown Menu */}
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="flex-1 max-w-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub === 'ALL' ? `All Subcategories (${subcategoryCounts.ALL || 0})` : `${sub} (${subcategoryCounts[sub] || 0})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Option 2: Expand / Collapse Toggle if many subcategories */}
              {availableSubcategories.length > 8 && (
                <button
                  onClick={() => setIsSubcategoriesExpanded(!isSubcategoriesExpanded)}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <span>{isSubcategoriesExpanded ? 'Show Less' : `+ More (${availableSubcategories.length - 8})`}</span>
                  {isSubcategoriesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Option 2: Wrapped Multi-Row Pill Buttons (No swiping required!) */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {visibleSubcategories.map((sub) => {
                const isSelected = selectedSubcategory === sub;
                const count = subcategoryCounts[sub] || 0;

                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-700 text-white shadow-xs ring-1 ring-blue-700'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <span>{sub === 'ALL' ? 'All' : sub}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                      isSelected 
                        ? 'bg-blue-900 text-white' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* Product List / Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
            <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-base font-bold">Loading inventory from Firebase...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6 bg-white rounded-xl border border-dashed border-slate-300">
            <Package className="w-14 h-14 text-slate-300 mb-2" />
            <h4 className="text-lg font-black text-slate-800">No products found</h4>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-sm mt-1 mb-4">
              {products.length === 0 
                ? "Your Firebase database has no products yet. Click below to load pre-configured electrical and plumbing items."
                : `No products matching "${searchQuery}" in ${selectedCategory}. Try changing filters or search terms.`}
            </p>
            {products.length === 0 && (
              <button
                onClick={seedStarterProducts}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-blue-600 text-white rounded-xl text-sm sm:text-base font-black shadow-md hover:brightness-105 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                <span>Load Starter Electrical & Plumbing Items</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3.5 items-start">
            {filteredProducts.map((product) => {
              const isElectrical = product.category === 'Electrical';
              const variants = product.variants || [];

              return (
                <div
                  key={product.id || product.name}
                  className="bg-white rounded-xl border border-slate-200 hover:border-blue-500 p-4 shadow-xs hover:shadow-md transition-all group flex flex-col"
                >
                  {/* Header: Category Badge, Brand & Title */}
                  <div className="mb-2.5">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-0.5 rounded-md ${
                          isElectrical
                            ? 'bg-amber-100 text-amber-950 border border-amber-300'
                            : 'bg-sky-100 text-sky-950 border border-sky-300'
                        }`}
                      >
                        {isElectrical ? <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> : <Droplets className="w-3.5 h-3.5 text-sky-600 fill-sky-500" />}
                        {product.subcategory || product.category}
                      </span>
                      {product.brand && (
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                          {product.brand}
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-700 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  {/* Size Variants - Compact Grid of Buttons */}
                  <div className="pt-2.5 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                        SELECT SIZE TO ADD:
                      </span>
                      <span className="text-xs text-slate-400 font-bold font-mono">
                        {variants.length} size{variants.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
                      {variants.map((v, idx) => (
                        <button
                          key={idx}
                          onClick={() => addToCart(product, v)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-600 text-slate-800 hover:text-white border border-slate-300 hover:border-blue-600 rounded-lg text-xs sm:text-sm font-bold transition-all group/btn active:scale-95 shadow-2xs"
                          title={`Click to add ${product.name} (${v.size}) to bill`}
                        >
                          <span className="font-bold text-slate-950 group-hover/btn:text-white">
                            {v.size}
                          </span>
                          <span className="text-blue-700 group-hover/btn:text-white font-black font-mono-numbers">
                            {formatCurrency(v.price)}
                          </span>
                          <Plus className="w-3.5 h-3.5 text-slate-500 group-hover/btn:text-white font-bold" />
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
