import React, { useState, useMemo } from 'react';
import { 
  ReceiptText, 
  FileText, 
  Search, 
  Download, 
  Phone, 
  Eye, 
  Calendar, 
  CreditCard, 
  User, 
  Filter, 
  RefreshCw, 
  Monitor, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShoppingBag,
  Loader2,
  ChevronRight,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generatePdfFromData } from '../../utils/pdfGenerator';
import { sharePdfFile } from '../../utils/whatsappShare';
import { MobileDocDetailsModal } from './MobileDocDetailsModal';

const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export const MobilePortal = () => {
  const { 
    invoices, 
    quotations, 
    settings, 
    showToast, 
    isFirebaseConnected, 
    refreshAllData 
  } = useApp();

  // Active Tab: 'bills' or 'quotations'
  const [activeTab, setActiveTab] = useState('bills');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL', 'TODAY', 'WEEK'
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('invoice');

  // Loading states for actions
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionType, setActionType] = useState(null); // 'download' | 'share'
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      if (refreshAllData) await refreshAllData();
      showToast('Data refreshed successfully!', 'success');
    } catch (e) {
      showToast('Refresh completed', 'info');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper for date filter
  const isWithinDateFilter = (timestamp) => {
    if (dateFilter === 'ALL' || !timestamp) return true;
    const docDate = new Date(timestamp);
    const now = new Date();
    if (dateFilter === 'TODAY') {
      return (
        docDate.getDate() === now.getDate() &&
        docDate.getMonth() === now.getMonth() &&
        docDate.getFullYear() === now.getFullYear()
      );
    }
    if (dateFilter === 'WEEK') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return docDate >= sevenDaysAgo;
    }
    return true;
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return (invoices || []).filter((inv) => {
      if (selectedPaymentMode !== 'ALL' && inv.paymentMode !== selectedPaymentMode) {
        return false;
      }
      if (!isWithinDateFilter(inv.createdAt || inv.date)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = inv.invoiceNumber?.toLowerCase().includes(q);
        const matchCustomer = inv.customerName?.toLowerCase().includes(q);
        const matchPhone = inv.customerPhone?.toLowerCase().includes(q);
        const matchItems = Array.isArray(inv.items) && inv.items.some(it => 
          (it.name && it.name.toLowerCase().includes(q)) ||
          (it.size && it.size.toLowerCase().includes(q)) ||
          (it.spec && it.spec.toLowerCase().includes(q)) ||
          (it.brand && it.brand.toLowerCase().includes(q))
        );
        return matchNumber || matchCustomer || matchPhone || matchItems;
      }
      return true;
    });
  }, [invoices, selectedPaymentMode, dateFilter, searchQuery]);

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return (quotations || []).filter((quo) => {
      if (!isWithinDateFilter(quo.createdAt || quo.date)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = quo.quotationNumber?.toLowerCase().includes(q);
        const matchCustomer = quo.customerName?.toLowerCase().includes(q);
        const matchPhone = quo.customerPhone?.toLowerCase().includes(q);
        const matchSite = quo.siteLocation?.toLowerCase().includes(q);
        const matchItems = Array.isArray(quo.items) && quo.items.some(it => 
          (it.name && it.name.toLowerCase().includes(q)) ||
          (it.size && it.size.toLowerCase().includes(q)) ||
          (it.spec && it.spec.toLowerCase().includes(q)) ||
          (it.brand && it.brand.toLowerCase().includes(q))
        );
        return matchNumber || matchCustomer || matchPhone || matchSite || matchItems;
      }
      return true;
    });
  }, [quotations, dateFilter, searchQuery]);

  // Action: Download PDF
  const handleDownloadPdf = async (doc, type) => {
    const docId = doc.id || (type === 'invoice' ? doc.invoiceNumber : doc.quotationNumber);
    try {
      setActionLoadingId(docId);
      setActionType('download');
      const { pdf, filename } = await generatePdfFromData(doc, type, settings);
      pdf.save(filename);
      showToast(`Downloaded ${filename} successfully!`, 'success');
    } catch (err) {
      console.error('Download PDF error:', err);
      showToast('Failed to download PDF: ' + err.message, 'error');
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  // Action: Share via WhatsApp
  const handleShareWhatsApp = async (doc, type) => {
    const docId = doc.id || (type === 'invoice' ? doc.invoiceNumber : doc.quotationNumber);
    try {
      setActionLoadingId(docId);
      setActionType('share');
      const { file, blob, filename, docNumber, grandTotal, customerName } = await generatePdfFromData(doc, type, settings);
      await sharePdfFile({
        file,
        blob,
        filename,
        type,
        docNumber,
        customerName,
        grandTotal,
        showToast
      });
    } catch (err) {
      console.error('Share WhatsApp error:', err);
      showToast('Failed to share PDF: ' + err.message, 'error');
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  // Open Details Modal
  const handleOpenDetails = (doc, type) => {
    setSelectedDoc(doc);
    setSelectedDocType(type);
  };

  // Totals
  const totalBillsAmount = filteredInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
  const totalQuotationsAmount = filteredQuotations.reduce((acc, quo) => acc + (quo.grandTotal || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 pb-12 selection:bg-blue-600 selection:text-white">
      
      {/* Mobile Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            
            {/* Store Brand */}
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src="/smg-logo-transparent.png" 
                alt="Logo" 
                className="w-9 h-9 object-contain shrink-0"
              />
              <div className="min-w-0">
                <h1 className="font-black text-sm text-slate-900 leading-tight truncate">
                  {settings.shopName || 'Sri Mahaganapathy'}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Portal
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    Mobile View
                  </span>
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center transition-all"
                title="Refresh Data"
                aria-label="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              </button>

              <a
                href="/"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-slate-800 active:scale-95 transition-all"
                title="Switch to Desktop POS"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Desktop</span>
              </a>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl w-full mx-auto px-4 py-4 space-y-4 flex-1">
        
        {/* TWO PRIMARY SWITCHER BUTTONS: BILL & QUOTATION */}
        <div className="bg-slate-200/90 p-1.5 rounded-2xl flex gap-1.5 shadow-inner">
          <button
            onClick={() => {
              setActiveTab('bills');
              setSelectedPaymentMode('ALL');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'bills'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.01]'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ReceiptText className="w-4 h-4 shrink-0" />
            <span>Bills (Invoices)</span>
            <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
              activeTab === 'bills'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-300 text-slate-700'
            }`}>
              {invoices?.length || 0}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('quotations');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'quotations'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.01]'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Quotations</span>
            <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
              activeTab === 'quotations'
                ? 'bg-indigo-700 text-white'
                : 'bg-slate-300 text-slate-700'
            }`}>
              {quotations?.length || 0}
            </span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'bills'
                  ? 'Search Bill #, Customer, Phone...'
                  : 'Search Quotation #, Client, Site...'
              }
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {/* Date filter pills */}
            <button
              onClick={() => setDateFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                dateFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('TODAY')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                dateFilter === 'TODAY'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('WEEK')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                dateFilter === 'WEEK'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Last 7 Days
            </button>

            {/* Payment Mode Pills (Only for Bills) */}
            {activeTab === 'bills' && (
              <>
                <div className="h-4 w-px bg-slate-300 mx-1 shrink-0" />
                {['ALL', 'CASH', 'UPI', 'CREDIT'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedPaymentMode(mode)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 text-[11px] uppercase transition-all ${
                      selectedPaymentMode === mode
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold text-slate-600">
          <div>
            Showing <strong className="text-slate-900 font-bold">
              {activeTab === 'bills' ? filteredInvoices.length : filteredQuotations.length}
            </strong> {activeTab === 'bills' ? 'Bills' : 'Quotations'}
          </div>
          <div className="font-bold text-slate-900 flex items-center gap-1">
            <span>Total:</span>
            <span className={`font-black ${activeTab === 'bills' ? 'text-emerald-700' : 'text-indigo-700'}`}>
              {formatCurrency(activeTab === 'bills' ? totalBillsAmount : totalQuotationsAmount)}
            </span>
          </div>
        </div>

        {/* DOCUMENT CARDS LIST */}
        <div className="space-y-3">
          
          {/* 1. BILLS (INVOICES) CARDS */}
          {activeTab === 'bills' && (
            <>
              {filteredInvoices.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <ReceiptText className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">No Bills Found</h3>
                  <p className="text-xs text-slate-500">
                    {searchQuery ? 'No bills match your search criteria.' : 'No invoices generated yet.'}
                  </p>
                </div>
              ) : (
                filteredInvoices.map((inv) => {
                  const invId = inv.id || inv.invoiceNumber;
                  const isActionLoading = actionLoadingId === invId;
                  const items = Array.isArray(inv.items) ? inv.items : [];
                  const itemsCount = items.reduce((s, it) => s + (it.qty || 1), 0);
                  const firstFewItems = items.slice(0, 2).map(it => {
                    const rawName = it.name || it.productName || 'Item';
                    const spec = (it.size || it.spec || it.specification || it.variant || '').trim();
                    const hasValidSpec = spec && !['standard', 'std', '-', 'default'].includes(spec.toLowerCase());
                    const isSpecAlreadyInName = hasValidSpec && rawName.toLowerCase().includes(spec.toLowerCase());
                    return (hasValidSpec && !isSpecAlreadyInName) ? `${spec} ${rawName}` : rawName;
                  }).filter(Boolean);

                  return (
                    <div
                      key={invId}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
                    >
                      {/* Card Top Section */}
                      <div className="p-4 space-y-3">
                        
                        {/* Header: Doc #, Date, Payment Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm tracking-tight">
                                {inv.invoiceNumber || 'INV-DRAFT'}
                              </span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {inv.paymentMode || 'CASH'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{formatDate(inv.createdAt || inv.date || Date.now())}</span>
                            </div>
                          </div>

                          {/* Grand Total Amount Highlight */}
                          <div className="text-right">
                            <div className="text-xs text-slate-400 font-medium">Grand Total</div>
                            <div className="text-base font-black text-emerald-700 tracking-tight">
                              {formatCurrency(inv.grandTotal || 0)}
                            </div>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-800 truncate">
                              {inv.customerName || 'Walk-in Customer'}
                            </span>
                          </div>
                          {inv.customerPhone && (
                            <a
                              href={`tel:${inv.customerPhone}`}
                              className="flex items-center gap-1 font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0 hover:bg-blue-100 transition-colors"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{inv.customerPhone}</span>
                            </a>
                          )}
                        </div>

                        {/* Items Preview */}
                        <div className="text-xs text-slate-600 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 text-slate-500 font-medium truncate">
                            <ShoppingBag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {firstFewItems.length > 0 ? firstFewItems.join(', ') : 'Items'}
                              {items.length > 2 ? ` +${items.length - 2} more` : ''}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>

                      </div>

                      {/* Card Action Buttons (Download, WhatsApp, View) */}
                      <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 grid grid-cols-3 gap-2">
                        
                        {/* Download PDF Button */}
                        <button
                          onClick={() => handleDownloadPdf(inv, 'invoice')}
                          disabled={isActionLoading}
                          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shadow-2xs hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
                          title="Download PDF"
                        >
                          {isActionLoading && actionType === 'download' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-slate-700" />
                          )}
                          <span>PDF</span>
                        </button>

                        {/* WhatsApp Share Button */}
                        <button
                          onClick={() => handleShareWhatsApp(inv, 'invoice')}
                          disabled={isActionLoading}
                          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs shadow-emerald-600/20 transition-all disabled:opacity-50"
                          title="Share to WhatsApp"
                        >
                          {isActionLoading && actionType === 'share' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                          )}
                          <span>Share</span>
                        </button>

                        {/* View Details Button */}
                        <button
                          onClick={() => handleOpenDetails(inv, 'invoice')}
                          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
                          title="View Bill Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* 2. QUOTATIONS CARDS */}
          {activeTab === 'quotations' && (
            <>
              {filteredQuotations.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs space-y-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">No Quotations Found</h3>
                  <p className="text-xs text-slate-500">
                    {searchQuery ? 'No quotations match your search criteria.' : 'No quotations created yet.'}
                  </p>
                </div>
              ) : (
                filteredQuotations.map((quo) => {
                  const quoId = quo.id || quo.quotationNumber;
                  const isActionLoading = actionLoadingId === quoId;
                  const items = Array.isArray(quo.items) ? quo.items : [];
                  const itemsCount = items.reduce((s, it) => s + (it.qty || 1), 0);
                  const firstFewItems = items.slice(0, 2).map(it => {
                    const rawName = it.name || it.productName || 'Item';
                    const spec = (it.size || it.spec || it.specification || it.variant || '').trim();
                    const hasValidSpec = spec && !['standard', 'std', '-', 'default'].includes(spec.toLowerCase());
                    const isSpecAlreadyInName = hasValidSpec && rawName.toLowerCase().includes(spec.toLowerCase());
                    return (hasValidSpec && !isSpecAlreadyInName) ? `${spec} ${rawName}` : rawName;
                  }).filter(Boolean);

                  return (
                    <div
                      key={quoId}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
                    >
                      {/* Card Top Section */}
                      <div className="p-4 space-y-3">
                        
                        {/* Header: Quotation #, Date, Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm tracking-tight">
                                {quo.quotationNumber || 'QUO-DRAFT'}
                              </span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Quotation
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{formatDate(quo.createdAt || quo.date || Date.now())}</span>
                            </div>
                          </div>

                          {/* Grand Total Amount Highlight */}
                          <div className="text-right">
                            <div className="text-xs text-slate-400 font-medium">Est. Total</div>
                            <div className="text-base font-black text-indigo-700 tracking-tight">
                              {formatCurrency(quo.grandTotal || 0)}
                            </div>
                          </div>
                        </div>

                        {/* Customer & Site Info */}
                        <div className="bg-slate-50 px-3 py-2 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-bold text-slate-800 truncate">
                                {quo.customerName || 'Prospective Client'}
                              </span>
                            </div>
                            {quo.customerPhone && (
                              <a
                                href={`tel:${quo.customerPhone}`}
                                className="flex items-center gap-1 font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0 hover:bg-blue-100 transition-colors"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{quo.customerPhone}</span>
                              </a>
                            )}
                          </div>

                          {quo.siteLocation && (
                            <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">Site: {quo.siteLocation}</span>
                            </div>
                          )}
                        </div>

                        {/* Items Preview */}
                        <div className="text-xs text-slate-600 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 text-slate-500 font-medium truncate">
                            <ShoppingBag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {firstFewItems.length > 0 ? firstFewItems.join(', ') : 'Items'}
                              {items.length > 2 ? ` +${items.length - 2} more` : ''}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>

                      </div>

                      {/* Card Action Buttons (Download, WhatsApp, View) */}
                      <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 grid grid-cols-3 gap-2">
                        
                        {/* Download PDF Button */}
                        <button
                          onClick={() => handleDownloadPdf(quo, 'quotation')}
                          disabled={isActionLoading}
                          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shadow-2xs hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
                          title="Download PDF"
                        >
                          {isActionLoading && actionType === 'download' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-slate-700" />
                          )}
                          <span>PDF</span>
                        </button>

                        {/* WhatsApp Share Button */}
                        <button
                          onClick={() => handleShareWhatsApp(quo, 'quotation')}
                          disabled={isActionLoading}
                          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs shadow-emerald-600/20 transition-all disabled:opacity-50"
                          title="Share to WhatsApp"
                        >
                          {isActionLoading && actionType === 'share' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                          )}
                          <span>Share</span>
                        </button>

                        {/* View Details Button */}
                        <button
                          onClick={() => handleOpenDetails(quo, 'quotation')}
                          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
                          title="View Quotation Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

        </div>

        {/* Mobile Developer Watermark */}
        <div className="py-6 text-center space-y-1">
          <p className="text-[10px] text-slate-400 font-medium">
            Sri Mahaganapathy Electricals & Hardware
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600">
            <span>Designed & Developed by</span>
            <span className="text-blue-600 font-black">RR Software Solutions</span>
          </div>
        </div>

      </main>

      {/* Details Modal / Bottom Sheet */}
      {selectedDoc && (
        <MobileDocDetailsModal
          doc={selectedDoc}
          type={selectedDocType}
          onClose={() => setSelectedDoc(null)}
        />
      )}

    </div>
  );
};
