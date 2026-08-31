import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Zap, 
  Droplets, 
  Layers, 
  Edit,
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Sparkles,
  Package,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
  Barcode,
  Copy,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { exportProductsToExcel, downloadSampleExcelTemplate } from '../../utils/excelHelper';
import { ProductModal } from './ProductModal';
import { ExcelImportModal } from './ExcelImportModal';
import { BarcodePrintModal } from './BarcodePrintModal';
import { BulkBrandCloneModal } from './BulkBrandCloneModal';
import { getBrandTheme } from '../../utils/brandColorHelper';

export const ProductList = () => {
  const { 
    products, 
    handleDeleteProduct, 
    seedStarterProducts, 
    isLoadingProducts,
    settings
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCloningProduct, setIsCloningProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const categoryCounts = useMemo(() => {
    return {
      electrical: products.filter((p) => p.category === 'Electrical').length,
      plumbing: products.filter((p) => p.category === 'Plumbing').length,
    };
  }, [products]);

  // Extract unique brands
  const availableBrands = useMemo(() => {
    const brandMap = new Map();
    products.forEach((p) => {
      if (selectedCategory === 'ALL' || p.category === selectedCategory) {
        const b = (p.brand || 'Unbranded').trim();
        brandMap.set(b, (brandMap.get(b) || 0) + 1);
      }
    });
    return Array.from(brandMap.entries()).map(([name, count]) => ({ name, count }));
  }, [products, selectedCategory]);

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      handleDeleteProduct(id);
    }
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }
      if (selectedBrand !== 'ALL') {
        const pBrand = (p.brand || 'Unbranded').trim();
        if (pBrand !== selectedBrand) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchBrand = p.brand?.toLowerCase().includes(q);
        const matchCategory = p.category?.toLowerCase().includes(q);
        const matchSub = p.subcategory?.toLowerCase().includes(q);
        const matchSize = p.variants?.some((v) => v.size?.toLowerCase().includes(q));
        return matchName || matchBrand || matchCategory || matchSub || matchSize;
      }
      return true;
    });
  }, [products, selectedCategory, selectedBrand, searchQuery]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsCloningProduct(false);
    setIsProductModalOpen(true);
  };

  const handleDuplicate = (product) => {
    setEditingProduct(product);
    setIsCloningProduct(true);
    setIsProductModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsCloningProduct(false);
    setIsProductModalOpen(true);
  };

  const toggleExpand = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
      
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            <span>Product Master & Size Inventory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
            Manage your Electrical and Plumbing catalog, multi-brand rates, and stock.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Clone Brand Catalog Button */}
          <button
            onClick={() => setIsCloneModalOpen(true)}
            disabled={products.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-xl text-xs sm:text-sm font-bold transition-all disabled:opacity-50 shadow-2xs"
            title="Clone entire brand catalog to a new brand (e.g. Supreme, Finolex, Havells)"
          >
            <Copy className="w-4 h-4 text-indigo-700" />
            <span>Clone Brand Catalog</span>
          </button>

          {/* Print Barcodes Button */}
          <button
            onClick={() => setIsBarcodeModalOpen(true)}
            disabled={products.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-xl text-xs sm:text-sm font-bold transition-all disabled:opacity-50"
            title="Print sticker barcode labels for physical inventory / shelves"
          >
            <Barcode className="w-4 h-4 text-purple-700" />
            <span>Print Barcodes</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={() => exportProductsToExcel(products)}
            disabled={products.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold transition-all disabled:opacity-50"
            title="Download full catalog as Excel"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Excel</span>
          </button>

          {/* Import from Excel */}
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs sm:text-sm font-bold transition-all"
            title="Upload Excel price sheet to Firebase"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel</span>
          </button>

          {/* Add Product Button */}
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-blue-600/25 transition-all"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-xl border border-slate-300/60 w-full sm:w-auto">
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedBrand('ALL');
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-black transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All ({products.length})</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('Electrical');
              setSelectedBrand('ALL');
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-black transition-all ${
              selectedCategory === 'Electrical'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-amber-900 hover:bg-amber-100/60'
            }`}
          >
            <Zap className="w-4 h-4 fill-amber-500 text-amber-600" />
            <span>Electrical ({categoryCounts.electrical})</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategory('Plumbing');
              setSelectedBrand('ALL');
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-black transition-all ${
              selectedCategory === 'Plumbing'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-900 hover:bg-blue-100/60'
            }`}
          >
            <Droplets className="w-4 h-4 fill-blue-500 text-blue-600" />
            <span>Plumbing ({categoryCounts.plumbing})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by product name, brand, barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-8 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Brand Filter Pills Bar */}
      {availableBrands.length > 1 && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 mr-1">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filter by Brand:</span>
          </div>
          
          <button
            onClick={() => setSelectedBrand('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedBrand === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Brands ({products.length})
          </button>

          {availableBrands.map((b) => (
            <button
              key={b.name}
              onClick={() => setSelectedBrand(b.name)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedBrand === b.name
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{b.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                selectedBrand === b.name ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {b.count}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm sm:text-base font-bold">Fetching inventory from Firebase...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6 text-slate-400">
            <Package className="w-14 h-14 text-slate-300 mb-2" />
            <h4 className="text-base sm:text-lg font-black text-slate-700">No matching products found</h4>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-sm mt-1 mb-4">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-xs sm:text-sm">
                  <th className="py-3.5 px-4 w-10"></th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Brand</th>
                  <th className="py-3.5 px-3">Available Sizes</th>
                  <th className="py-3.5 px-3 text-right">Price Range</th>
                  <th className="py-3.5 px-4 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((prod) => {
                  const isExpanded = expandedRowId === prod.id;
                  const variants = prod.variants || [];
                  const prices = variants.map((v) => v.price);
                  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                  return (
                    <React.Fragment key={prod.id || prod.name}>
                      <tr className={`hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-blue-50/40' : ''}`}>
                        
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => toggleExpand(prod.id)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-950"
                            title="View all sizes & stock"
                          >
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900 text-sm sm:text-base">{prod.name}</div>
                          {prod.description && (
                            <div className="text-xs text-slate-500 font-medium truncate max-w-md">{prod.description}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-md ${
                              prod.category === 'Electrical'
                                ? 'bg-amber-100 text-amber-950 border border-amber-300'
                                : 'bg-sky-100 text-sky-950 border border-sky-300'
                            }`}
                          >
                            {prod.category === 'Electrical' ? <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /> : <Droplets className="w-3.5 h-3.5 fill-blue-500 text-blue-600" />}
                            {prod.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-bold text-slate-800">
                          {prod.brand ? (
                            <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-md border shadow-2xs ${getBrandTheme(prod.brand, settings?.brandColors).badge}`}>
                              <Tag className="w-3 h-3" />
                              <span>{prod.brand}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-bold">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1.5">
                            {variants.slice(0, 3).map((v, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-xs font-mono font-bold border border-slate-200">
                                {v.size}
                              </span>
                            ))}
                            {variants.length > 3 && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono font-black border border-blue-200">
                                +{variants.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="font-black text-slate-900 text-xs sm:text-sm">
                            {minPrice === maxPrice ? (
                              formatCurrency(minPrice)
                            ) : (
                              `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleDuplicate(prod)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title={`Duplicate "${prod.name}" to another Brand`}
                            >
                              <Copy className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-600" />
                            </button>
                            <button
                              onClick={() => handleEdit(prod)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit3 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(prod.id, prod.name)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={7} className="p-4 border-y border-slate-200">
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                              <div className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-[11px] flex justify-between">
                                <span>Size Variant Specifications for "{prod.name}"</span>
                                <span>{variants.length} Sizes Defined</span>
                              </div>
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-black">
                                    <th className="py-2 px-3">Size / Spec</th>
                                    <th className="py-2 px-3 text-right">MRP / List Rate (₹)</th>
                                    <th className="py-2 px-3 text-right">Stock</th>
                                    <th className="py-2 px-3">Unit</th>
                                    <th className="py-2 px-3">Barcode / SKU</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {variants.map((v, vIndex) => (
                                    <tr key={vIndex} className="hover:bg-slate-50">
                                      <td className="py-2 px-3 font-bold text-blue-800">{v.size}</td>
                                      <td className="py-2 px-3 text-right font-mono font-black text-slate-900">{formatCurrency(v.mrp || v.price)}</td>
                                      <td className="py-2 px-3 text-right font-mono">
                                        <span className={`px-2 py-0.5 rounded font-bold ${
                                          v.stock <= 10 ? 'bg-rose-100 text-rose-800' : 'text-slate-700'
                                        }`}>
                                          {v.stock}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-slate-600 font-bold">{v.unit}</td>
                                      <td className="py-2 px-3 text-slate-400 font-mono">{v.barcode || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit / Clone Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setIsCloningProduct(false);
        }}
        editingProduct={editingProduct}
        isCloning={isCloningProduct}
      />

      {/* Bulk Brand Catalog Cloner Modal */}
      <BulkBrandCloneModal
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
      />

      {/* Excel Importer Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
      />

      {/* Barcode & Label Printer Modal */}
      <BarcodePrintModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        products={products}
      />

    </div>
  );
};
