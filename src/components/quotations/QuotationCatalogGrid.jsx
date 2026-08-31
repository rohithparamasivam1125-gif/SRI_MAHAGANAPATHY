import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Zap, 
  Droplets, 
  Package, 
  Plus, 
  Layers,
  Sparkles,
  Filter,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { getBrandTheme } from '../../utils/brandColorHelper';

export const QuotationCatalogGrid = () => {
  const { products, addToQuotationCart, seedStarterProducts, isLoadingProducts, settings } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedSubcategory, setSelectedSubcategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubcategoriesExpanded, setIsSubcategoriesExpanded] = useState(false);

  // Extract unique brands and product counts
  const { availableBrands, brandCounts } = useMemo(() => {
    const brands = new Set();
    const counts = { ALL: 0 };

    products.forEach((p) => {
      if (selectedCategory === 'ALL' || p.category === selectedCategory) {
        counts.ALL = (counts.ALL || 0) + 1;
        const b = (p.brand || 'Unbranded').trim();
        brands.add(b);
        counts[b] = (counts[b] || 0) + 1;
      }
    });

    return {
      availableBrands: ['ALL', ...Array.from(brands).sort()],
      brandCounts: counts
    };
  }, [products, selectedCategory]);

  // Extract unique subcategories and product counts
  const { availableSubcategories, subcategoryCounts } = useMemo(() => {
    const subs = new Set();
    const counts = { ALL: 0 };

    products.forEach((p) => {
      if (selectedCategory === 'ALL' || p.category === selectedCategory) {
        if (selectedBrand === 'ALL' || (p.brand || 'Unbranded').trim() === selectedBrand) {
          counts.ALL = (counts.ALL || 0) + 1;
          const sub = p.subcategory || 'General';
          subs.add(sub);
          counts[sub] = (counts[sub] || 0) + 1;
        }
      }
    });

    return {
      availableSubcategories: ['ALL', ...Array.from(subs)],
      subcategoryCounts: counts
    };
  }, [products, selectedCategory, selectedBrand]);

  // Helper to normalize search text: handles '', inch, and casing
  const normalizeText = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/''/g, '"') // Normalize double single-quotes ('') to (")
      .replace(/(\d+)\s*inch/g, '$1"') // Normalize '1 inch' to '1"'
      .trim();
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    const rawQuery = searchQuery.trim();
    const normalizedQuery = normalizeText(rawQuery);
    const queryTokens = normalizedQuery ? normalizedQuery.split(/\s+/).filter(Boolean) : [];

    return products.filter((p) => {
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }
      if (selectedBrand !== 'ALL') {
        const pBrand = (p.brand || 'Unbranded').trim();
        if (pBrand !== selectedBrand) return false;
      }
      if (selectedSubcategory !== 'ALL' && p.subcategory !== selectedSubcategory) {
        return false;
      }
      // Multi-token Smart Search (Matches brand + name + size across tokens)
      if (queryTokens.length > 0) {
        const combinedText = normalizeText(
          `${p.name || ''} ${p.brand || ''} ${p.category || ''} ${p.subcategory || ''} ${p.hsnCode || ''} ${(p.variants || []).map((v) => `${v.size || ''} ${v.barcode || ''}`).join(' ')}`
        );
        return queryTokens.every((token) => combinedText.includes(token));
      }
      return true;
    });
  }, [products, selectedCategory, selectedBrand, selectedSubcategory, searchQuery]);

  // Check if a variant size matches search query for visual highlighting
  const isVariantMatched = (size, barcode) => {
    if (!searchQuery.trim()) return false;
    const normalizedQuery = normalizeText(searchQuery);
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const normalizedVariant = normalizeText(`${size || ''} ${barcode || ''}`);
    return queryTokens.some((token) => normalizedVariant.includes(token));
  };

  // Handle barcode scanner
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      for (const prod of products) {
        const matchedVariant = (prod.variants || []).find((v) => 
          v.barcode && v.barcode.toLowerCase() === q
        );
        if (matchedVariant) {
          addToQuotationCart(prod, matchedVariant);
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
      
      {/* Ultra-Compact Bold POS Control Bar (Takes minimal height, maximizes product grid space) */}
      <div className="bg-white rounded-2xl border border-slate-300 p-2.5 sm:p-3 shadow-xs space-y-2 mb-3 shrink-0">
        
        {/* ROW 1: Integrated Search Input + Bold Category Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Scan barcode or search quotation item, brand, size (e.g. supreme elbow, 1'', leo 3/4)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-14 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-300 text-slate-950 placeholder:text-slate-400 text-xs sm:text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-600 hover:text-slate-950 bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs (Compact, High-Contrast & Bold) */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedBrand('ALL');
                setSelectedSubcategory('ALL');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All ({products.length})</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('Electrical');
                setSelectedBrand('ALL');
                setSelectedSubcategory('ALL');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all ${
                selectedCategory === 'Electrical'
                  ? 'bg-amber-500 text-slate-950 shadow-xs ring-1 ring-amber-400 font-black'
                  : 'text-amber-950 hover:bg-amber-100/70'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              <span>⚡ Electrical</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('Plumbing');
                setSelectedBrand('ALL');
                setSelectedSubcategory('ALL');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all ${
                selectedCategory === 'Plumbing'
                  ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-500 font-black'
                  : 'text-blue-950 hover:bg-blue-100/70'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 fill-blue-500 text-blue-600" />
              <span>🚰 Plumbing</span>
            </button>
          </div>

        </div>

        {/* ROW 2: Inline Dropdowns for Brand & Subcategory + Reset button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Brand Dropdown */}
            {availableBrands.length > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-2.5 py-1 rounded-lg">
                <Tag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Brand:</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="bg-transparent text-xs font-black text-slate-900 focus:outline-none cursor-pointer pr-1"
                >
                  {availableBrands.map((b) => (
                    <option key={b} value={b} className="font-bold">
                      {b === 'ALL' ? `All Brands (${brandCounts.ALL || 0})` : `${b} (${brandCounts[b] || 0})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subcategory Dropdown */}
            {availableSubcategories.length > 2 && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-2.5 py-1 rounded-lg">
                <Filter className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Subcategory:</span>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="bg-transparent text-xs font-black text-slate-900 focus:outline-none cursor-pointer pr-1 max-w-[200px] truncate"
                >
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub} className="font-bold">
                      {sub === 'ALL' ? `All Subcategories (${subcategoryCounts.ALL || 0})` : `${sub} (${subcategoryCounts[sub] || 0})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Active Filter Clear Tag */}
            {(selectedBrand !== 'ALL' || selectedSubcategory !== 'ALL') && (
              <button
                onClick={() => {
                  setSelectedBrand('ALL');
                  setSelectedSubcategory('ALL');
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-black text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                title="Reset Brand & Subcategory filters"
              >
                <span>Reset Filters ✕</span>
              </button>
            )}
          </div>

          {/* Collapsible Pills Toggle */}
          {availableSubcategories.length > 3 && (
            <button
              onClick={() => setIsSubcategoriesExpanded(!isSubcategoriesExpanded)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-black text-blue-700 hover:text-blue-900 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors ml-auto"
            >
              <span>{isSubcategoriesExpanded ? 'Hide Pills ▲' : 'Show Quick Pills ▼'}</span>
            </button>
          )}

        </div>

        {/* Collapsible Quick Pills Drawer (Only shown if toggled) */}
        {isSubcategoriesExpanded && availableSubcategories.length > 2 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 animate-in fade-in duration-150">
            {availableSubcategories.map((sub) => {
              const isSelected = selectedSubcategory === sub;
              const count = subcategoryCounts[sub] || 0;

              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    isSelected
                      ? 'bg-blue-700 text-white shadow-xs ring-1 ring-blue-700'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200 hover:text-slate-950 border border-slate-200'
                  }`}
                >
                  <span>{sub === 'ALL' ? 'All' : sub}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                    isSelected ? 'bg-blue-950 text-white' : 'bg-white text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* Product List / Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
            <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-base font-bold">Loading inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6 bg-white rounded-xl border border-dashed border-slate-300">
            <Package className="w-14 h-14 text-slate-300 mb-2" />
            <h4 className="text-lg font-black text-slate-800">No products found</h4>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-sm mt-1 mb-4">
              {products.length === 0 
                ? "Your database has no products yet. Click below to load items."
                : `No products matching "${searchQuery}" in ${selectedCategory}${selectedBrand !== 'ALL' ? ` (${selectedBrand})` : ''}.`}
            </p>
            {products.length === 0 && (
              <button
                onClick={seedStarterProducts}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-blue-600 text-white rounded-xl text-sm sm:text-base font-black shadow-md hover:brightness-105 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                <span>Load Starter Products</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3.5 items-start">
            {filteredProducts.map((product) => {
              const isElectrical = product.category === 'Electrical';
              const variants = product.variants || [];
              const brandTheme = getBrandTheme(product.brand, settings?.brandColors);

              return (
                <div
                  key={product.id || product.name}
                  className={`bg-white rounded-xl border border-slate-200 ${brandTheme.cardBorder} p-4 pt-4.5 shadow-xs hover:shadow-md transition-all group flex flex-col relative overflow-hidden`}
                >
                  {/* Subtle top brand color accent stripe */}
                  {product.brand && (
                    <div className={`absolute top-0 left-0 right-0 h-1 ${brandTheme.cardTopBar}`} />
                  )}

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
                        <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-md border shadow-2xs ${brandTheme.badge}`}>
                          <Tag className="w-3 h-3" />
                          <span>{product.brand}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-700 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  {/* Size Variants */}
                  <div className="pt-2.5 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                        ADD TO QUOTATION:
                      </span>
                      <span className="text-xs text-slate-400 font-bold font-mono">
                        {variants.length} size{variants.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
                      {variants.map((v, idx) => {
                        const isMatch = isVariantMatched(v.size, v.barcode);
                        return (
                          <button
                            key={idx}
                            onClick={() => addToQuotationCart(product, v)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all group/btn active:scale-95 shadow-2xs ${
                              isMatch
                                ? 'bg-amber-100 text-amber-950 border-2 border-amber-500 ring-2 ring-amber-400/50 font-black shadow-xs'
                                : 'bg-slate-50 hover:bg-blue-600 text-slate-800 hover:text-white border border-slate-300 hover:border-blue-600'
                            }`}
                            title={`Click to add ${product.name} (${v.size}) to quotation`}
                          >
                            <span className={isMatch ? 'text-amber-950 font-black' : 'font-bold text-slate-950 group-hover/btn:text-white'}>
                              {v.size}
                            </span>
                            <span className={isMatch ? 'text-amber-900 font-black font-mono-numbers' : 'text-blue-700 group-hover/btn:text-white font-black font-mono-numbers'}>
                              {formatCurrency(v.price)}
                            </span>
                            <Plus className={isMatch ? 'w-3.5 h-3.5 text-amber-800 font-bold' : 'w-3.5 h-3.5 text-slate-500 group-hover/btn:text-white font-bold'} />
                          </button>
                        );
                      })}
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
