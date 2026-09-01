import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, 
  Store, 
  Database, 
  Sparkles, 
  Save, 
  Check, 
  RefreshCw, 
  FileText,
  KeyRound,
  Layers,
  HelpCircle,
  Eye,
  RotateCcw,
  CheckCircle,
  Receipt,
  Palette,
  Tag,
  Trash2,
  Loader2,
  Zap,
  Droplets
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getActiveFirebaseConfig } from '../../firebase/firebaseConfig';
import { BRAND_COLOR_PALETTES, getBrandTheme } from '../../utils/brandColorHelper';

export const SettingsView = () => {
  const { 
    products,
    settings, 
    updateShopSettings, 
    seedStarterProducts, 
    isFirebaseConnected, 
    showToast,
    handleDeleteBrand
  } = useApp();

  const [deletingBrand, setDeletingBrand] = useState(null);
  const [brandCategoryFilter, setBrandCategoryFilter] = useState('ALL'); // 'ALL' | 'Electrical' | 'Plumbing'

  const categoryBrandStats = useMemo(() => {
    const electricalBrands = new Set();
    const plumbingBrands = new Set();
    const allBrands = new Set();

    (products || []).forEach((p) => {
      if (!p || !p.brand || !p.brand.trim()) return;
      const b = p.brand.trim();
      allBrands.add(b);
      if (p.category === 'Electrical') electricalBrands.add(b);
      if (p.category === 'Plumbing') plumbingBrands.add(b);
    });

    return {
      all: allBrands.size,
      electrical: electricalBrands.size,
      plumbing: plumbingBrands.size
    };
  }, [products]);

  const filteredBrands = useMemo(() => {
    const brandMap = new Map();
    (products || []).forEach((p) => {
      if (!p || !p.brand || !p.brand.trim()) return;
      if (brandCategoryFilter === 'ALL' || p.category === brandCategoryFilter) {
        const b = p.brand.trim();
        brandMap.set(b, (brandMap.get(b) || 0) + 1);
      }
    });
    return Array.from(brandMap.keys()).sort();
  }, [products, brandCategoryFilter]);

  const uniqueBrands = useMemo(() => {
    const brandSet = new Set();
    (products || []).forEach((p) => {
      if (p && p.brand && p.brand.trim()) brandSet.add(p.brand.trim());
    });
    return Array.from(brandSet).sort();
  }, [products]);

  const handleDeleteBrandClick = async (brandName) => {
    const brandProducts = (products || []).filter(
      (p) => (p.brand || 'Unbranded').trim().toLowerCase() === brandName.toLowerCase()
    );
    const count = brandProducts.length;

    const confirmMsg = count > 0
      ? `Are you sure you want to permanently delete brand "${brandName}" and ALL ${count} product(s) associated with it?\n\nThis will remove all products under this brand from the system.`
      : `Are you sure you want to delete brand "${brandName}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingBrand(brandName);
      await handleDeleteBrand(brandName);
    } catch (err) {
      console.error('Delete brand error:', err);
    } finally {
      setDeletingBrand(null);
    }
  };

  const [formData, setFormData] = useState({
    shopName: settings.shopName || 'Sri Mahaganapathy Electricals and Hardware',
    tagline: settings.tagline || 'Wholesale & Retail Electricals, Hardware Solutions',
    address: settings.address || '1/110, Kaliamman Kovil Back Side, Maniyanur',
    phone: settings.phone || '+91 90876 83308',
    email: settings.email || 'srimahaganapathy.stores@gmail.com',
    gstin: settings.gstin || '33AAAAA0000A1Z5',
    upiId: settings.upiId || '9087683308@upi',
    invoicePrefix: settings.invoicePrefix || 'SMG-',
    quotationPrefix: settings.quotationPrefix || 'QUO-',
    defaultGstRate: settings.defaultGstRate || 18,
    terms: settings.terms || '1. Goods once sold will not be taken back without original bill.\n2. Warranty as per manufacturer terms.\n3. Subject to local jurisdiction.',
    brandColors: settings.brandColors || {}
  });

  useEffect(() => {
    setFormData({
      shopName: settings.shopName || 'Sri Mahaganapathy Electricals and Hardware',
      tagline: settings.tagline || 'Wholesale & Retail Electricals, Hardware Solutions',
      address: settings.address || '1/110, Kaliamman Kovil Back Side, Maniyanur',
      phone: settings.phone || '+91 90876 83308',
      email: settings.email || 'srimahaganapathy.stores@gmail.com',
      gstin: settings.gstin || '33AAAAA0000A1Z5',
      upiId: settings.upiId || '9087683308@upi',
      invoicePrefix: settings.invoicePrefix || 'SMG-',
      quotationPrefix: settings.quotationPrefix || 'QUO-',
      defaultGstRate: settings.defaultGstRate || 18,
      terms: settings.terms || '1. Goods once sold will not be taken back without original bill.\n2. Warranty as per manufacturer terms.\n3. Subject to local jurisdiction.',
      brandColors: settings.brandColors || {}
    });
  }, [settings]);

  const [isSaving, setIsSaving] = useState(false);
  const [activeConfig] = useState(getActiveFirebaseConfig());

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBrandColorChange = (brandName, colorKey) => {
    setFormData((prev) => ({
      ...prev,
      brandColors: {
        ...(prev.brandColors || {}),
        [brandName]: colorKey
      }
    }));
  };

  const handleSaveShopProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateShopSettings(formData);
      showToast('Shop profile settings saved and synced everywhere!', 'success');
    } catch (err) {
      showToast('Failed to save settings: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setFormData({
      shopName: 'Sri Mahaganapathy Electricals and Hardware',
      tagline: 'Wholesale & Retail Electricals, Hardware Solutions',
      address: '1/110, Kaliamman Kovil Back Side, Maniyanur',
      phone: '+91 90876 83308',
      email: 'srimahaganapathy.stores@gmail.com',
      gstin: '33AAAAA0000A1Z5',
      upiId: '9087683308@upi',
      invoicePrefix: 'SMG-',
      quotationPrefix: 'QUO-',
      defaultGstRate: 18,
      terms: '1. Goods once sold will not be taken back without original bill.\n2. Warranty as per manufacturer terms.\n3. Subject to local jurisdiction.'
    });
    showToast('Reset to official store branding defaults. Click "Save Profile Changes" to apply.', 'info');
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            <span>Store Profile & Customization Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
            Anything you change here automatically reflects on the <strong>Header, Tax Invoices, Quotations, and Dashboard</strong>!
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Official Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Shop Details Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Customizable Store Branding</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">Live Sync Enabled</span>
          </div>

          <form onSubmit={handleSaveShopProfile} className="space-y-4">
            
            {/* Shop Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Shop / Business Name (Appears everywhere on header, bills & quotes)
              </label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => handleChange('shopName', e.target.value)}
                placeholder="Sri Mahaganapathy Electricals and Hardware"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subtitle / Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="Wholesale & Retail Electricals, Hardware Solutions"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Store Address (Printed on bill headers)
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="1/110, Kaliamman Kovil Back Side, Maniyanur"
                className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
              />
            </div>

            {/* Phone & GSTIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number(s)
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 90876 83308"
                  className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  GSTIN (Tax Registration No)
                </label>
                <input
                  type="text"
                  placeholder="33AAAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={(e) => handleChange('gstin', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* UPI ID & Prefixes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  UPI ID (For Payments)
                </label>
                <input
                  type="text"
                  placeholder="9087683308@upi"
                  value={formData.upiId}
                  onChange={(e) => handleChange('upiId', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bill Invoice Prefix
                </label>
                <input
                  type="text"
                  placeholder="SMG-"
                  value={formData.invoicePrefix}
                  onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quotation Prefix
                </label>
                <input
                  type="text"
                  placeholder="QUO-"
                  value={formData.quotationPrefix}
                  onChange={(e) => handleChange('quotationPrefix', e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Terms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bill Terms & Conditions (Prints in footer)
              </label>
              <textarea
                rows={3}
                value={formData.terms}
                onChange={(e) => handleChange('terms', e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:outline-none"
              />
            </div>

            {/* Brand Color Customizer Section */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-600" />
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Brand Color Preferences (POS Badges & Cards)
                  </label>
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">
                  {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''} shown
                </span>
              </div>
              
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Assign a custom color theme to each brand. Filter by Electrical or Plumbing to manage specific brand catalogs.
              </p>

              {/* Electrical and Plumbing Toggle Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-xl border border-slate-300/60 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => setBrandCategoryFilter('ALL')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    brandCategoryFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All ({categoryBrandStats.all})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBrandCategoryFilter('Electrical')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    brandCategoryFilter === 'Electrical'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-amber-900 hover:bg-amber-100/60'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  <span>Electrical ({categoryBrandStats.electrical})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBrandCategoryFilter('Plumbing')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    brandCategoryFilter === 'Plumbing'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-900 hover:bg-blue-100/60'
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5 fill-blue-500 text-blue-600" />
                  <span>Plumbing ({categoryBrandStats.plumbing})</span>
                </button>
              </div>

              {filteredBrands.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold italic py-3 text-center">
                  No {brandCategoryFilter !== 'ALL' ? brandCategoryFilter : ''} brands found. Add products with brand names in Product Master to customize their colors here.
                </p>
              ) : (
                <div className="space-y-2 pt-1">
                  {filteredBrands.map((b) => {
                    const currentTheme = getBrandTheme(b, formData.brandColors);
                    const selectedKey = formData.brandColors?.[b] || currentTheme.key;

                    return (
                      <div 
                        key={b} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-md border shadow-2xs ${currentTheme.badge}`}
                            style={currentTheme.customStyle || {}}
                          >
                            <Tag className="w-3 h-3" />
                            <span>{b}</span>
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            ({currentTheme.label})
                          </span>
                        </div>

                        {/* Color Swatches + Custom Color Picker */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {Object.values(BRAND_COLOR_PALETTES).map((pal) => {
                            const isPicked = selectedKey === pal.key;
                            return (
                              <button
                                type="button"
                                key={pal.key}
                                onClick={() => handleBrandColorChange(b, pal.key)}
                                className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                                  isPicked 
                                    ? 'border-slate-900 scale-125 shadow-md ring-2 ring-blue-500/50' 
                                    : 'border-slate-200 hover:scale-110'
                                }`}
                                style={{ backgroundColor: pal.hex }}
                                title={`${pal.label} (${pal.hex})`}
                              >
                                {isPicked && <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />}
                              </button>
                            );
                          })}

                          {/* Custom Hex Color Picker */}
                          <label 
                            className={`relative w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all shadow-2xs hover:scale-110 ml-1 ${
                              selectedKey?.startsWith('#') 
                                ? 'border-slate-900 ring-2 ring-blue-500/50 scale-110' 
                                : 'border-dashed border-slate-300 hover:border-slate-400 bg-slate-50'
                            }`}
                            style={selectedKey?.startsWith('#') ? { backgroundColor: selectedKey } : {}}
                            title="Choose Custom Color (Spectrum Picker)"
                          >
                            <input
                              type="color"
                              value={selectedKey?.startsWith('#') ? selectedKey : currentTheme.hex}
                              onChange={(e) => handleBrandColorChange(b, e.target.value)}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            />
                            <Palette className={`w-3.5 h-3.5 ${selectedKey?.startsWith('#') ? 'text-white drop-shadow-xs' : 'text-slate-600'}`} />
                          </label>

                          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

                          {/* Delete Brand & All Products Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteBrandClick(b)}
                            disabled={deletingBrand === b}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all text-xs font-bold disabled:opacity-50"
                            title={`Delete brand "${b}" and all its products`}
                          >
                            {deletingBrand === b ? (
                              <Loader2 className="w-3.5 h-3.5 text-rose-600 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            )}
                            <span className="hidden sm:inline text-rose-600">Delete Brand</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving & Syncing...' : 'Save Profile & Color Changes'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right: Live Real-time Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Live Preview Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Eye className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Live Real-Time Preview
              </h3>
            </div>

            {/* Header Preview */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Navbar & Branding:</span>
              <div className="flex items-center gap-3">
                <img 
                  src="/smg-logo-transparent.png" 
                  alt="SMG" 
                  className="w-10 h-10 object-contain shrink-0"
                />
                <div>
                  <h4 className="font-black text-xs text-slate-900 leading-tight">
                    {formData.shopName || 'Sri Mahaganapathy Electricals and Hardware'}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                    {formData.tagline || 'Wholesale & Retail Electricals, Hardware Solutions'}
                  </p>
                </div>
              </div>
            </div>

            {/* Brand Colors Preview */}
            {uniqueBrands.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Active Brand Badges:</span>
                <div className="flex flex-wrap gap-1.5">
                  {uniqueBrands.map((b) => {
                    const theme = getBrandTheme(b, formData.brandColors);
                    return (
                      <span 
                        key={b} 
                        className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-md border shadow-2xs ${theme.badge}`}
                        style={theme.customStyle || {}}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{b}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Invoice Print Preview */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Printout Header & Footer:</span>
              <div className="text-[11px] space-y-1 text-slate-700">
                <p>📍 <strong>Address:</strong> {formData.address}</p>
                <p>📞 <strong>Phone:</strong> {formData.phone} | <strong>GST:</strong> {formData.gstin}</p>
                <p className="text-blue-700 font-mono font-bold">💳 UPI ID: {formData.upiId}</p>
                <p className="text-slate-500 font-mono text-[10px]">Sample Bill #: {formData.invoicePrefix}2608-0101 | Sample Quote #: {formData.quotationPrefix}101</p>
              </div>
            </div>
          </div>

          {/* Database Status Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Cloud Database Status</h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isFirebaseConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {isFirebaseConnected ? 'Connected & Synced' : 'Offline Mode'}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>
                <strong>Project:</strong> <code className="bg-slate-100 px-1 rounded font-mono text-blue-700">{activeConfig.projectId}</code>
              </p>
              <p>
                <strong>Collections:</strong> <code className="bg-slate-100 px-1 rounded font-mono">products</code>, <code className="bg-slate-100 px-1 rounded font-mono">invoices</code>, <code className="bg-slate-100 px-1 rounded font-mono">quotations</code>, <code className="bg-slate-100 px-1 rounded font-mono">settings</code>
              </p>
            </div>

            {/* Seed Starter Products */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={seedStarterProducts}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-xs transition-all active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Re-seed 78+ Starter Products</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
