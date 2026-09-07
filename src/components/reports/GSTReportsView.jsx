import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  Search, 
  Filter, 
  Building2, 
  UserCheck, 
  IndianRupee, 
  Receipt, 
  Layers, 
  CheckCircle2,
  Printer,
  ChevronDown,
  Percent,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportGSTReportToExcel, formatGstDate } from '../../utils/gstExportHelper';

export const GSTReportsView = () => {
  const { invoices, settings, showToast } = useApp();

  // Filter states
  const [filterMode, setFilterMode] = useState('monthly'); // 'monthly' | 'fy' | 'custom' | 'all'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedFy, setSelectedFy] = useState(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth(); // 0-indexed: 0 is Jan, 3 is Apr
    // If before April, current FY started last year
    return curMonth >= 3 ? `${curYear}-${(curYear + 1).toString().slice(-2)}` : `${curYear - 1}-${curYear.toString().slice(-2)}`;
  });
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'B2B' | 'B2C'
  const [activeReportTab, setActiveReportTab] = useState('register'); // 'register' | 'hsn' | 'slabs'
  const [isExporting, setIsExporting] = useState(false);

  // Month list
  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ];

  // Financial Year options
  const fyOptions = [
    { value: '2026-27', label: 'FY 2026–27 (Apr 2026 – Mar 2027)' },
    { value: '2025-26', label: 'FY 2025–26 (Apr 2025 – Mar 2026)' },
    { value: '2024-25', label: 'FY 2024–25 (Apr 2024 – Mar 2025)' }
  ];

  // Year options for monthly filter
  const yearOptions = [2027, 2026, 2025, 2024, 2023];

  // Compute Period Title & Date Range
  const { periodTitle, filteredInvoices } = useMemo(() => {
    let title = '';
    let start = null;
    let end = null;

    if (filterMode === 'monthly') {
      const monthObj = months.find(m => m.value === Number(selectedMonth));
      title = `${monthObj ? monthObj.label : 'Month'}_${selectedYear}`;
      start = new Date(selectedYear, Number(selectedMonth), 1, 0, 0, 0, 0);
      end = new Date(selectedYear, Number(selectedMonth) + 1, 0, 23, 59, 59, 999);
    } else if (filterMode === 'fy') {
      title = `FY_${selectedFy}`;
      const [startYr, endYrShort] = selectedFy.split('-');
      const startYearNum = parseInt(startYr, 10);
      const endYearNum = parseInt(startYr.slice(0, 2) + endYrShort, 10);
      start = new Date(startYearNum, 3, 1, 0, 0, 0, 0); // Apr 1
      end = new Date(endYearNum, 2, 31, 23, 59, 59, 999); // Mar 31
    } else if (filterMode === 'custom') {
      title = `Custom_${customStartDate || 'Start'}_to_${customEndDate || 'End'}`;
      if (customStartDate) start = new Date(customStartDate + 'T00:00:00.000');
      if (customEndDate) end = new Date(customEndDate + 'T23:59:59.999');
    } else {
      title = 'All_Time';
    }

    const filtered = invoices.filter((inv) => {
      // Date filtering
      if (start || end) {
        const invDate = inv.date?.toDate ? inv.date.toDate() : new Date(inv.date);
        if (isNaN(invDate.getTime())) return false;
        if (start && invDate < start) return false;
        if (end && invDate > end) return false;
      }

      // Type filtering (B2B vs B2C)
      const gstin = (inv.customerGstin || '').trim().toUpperCase();
      const isB2B = Boolean(gstin.length >= 15);
      if (typeFilter === 'B2B' && !isB2B) return false;
      if (typeFilter === 'B2C' && isB2B) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const numMatch = inv.invoiceNumber?.toLowerCase().includes(q);
        const nameMatch = inv.customerName?.toLowerCase().includes(q);
        const gstinMatch = inv.customerGstin?.toLowerCase().includes(q);
        const phoneMatch = inv.customerPhone?.toLowerCase().includes(q);
        return numMatch || nameMatch || gstinMatch || phoneMatch;
      }

      return true;
    });

    return { periodTitle: title, filteredInvoices: filtered };
  }, [invoices, filterMode, selectedMonth, selectedYear, selectedFy, customStartDate, customEndDate, typeFilter, searchQuery]);

  // Aggregate Totals
  const metrics = useMemo(() => {
    let taxable = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let totalTax = 0;
    let grandTotal = 0;
    let b2bCount = 0;
    let b2cCount = 0;

    filteredInvoices.forEach((inv) => {
      const gstin = (inv.customerGstin || '').trim().toUpperCase();
      const isB2B = Boolean(gstin.length >= 15);
      const isInterState = isB2B && !gstin.startsWith('33');

      if (isB2B) b2bCount++;
      else b2cCount++;

      const taxVal = Number(inv.subtotal || 0);
      const tax = Number(inv.totalTax || 0);

      if (isInterState) {
        igst += tax;
      } else {
        const c = inv.cgstAmount !== undefined ? Number(inv.cgstAmount) : Number((tax / 2).toFixed(2));
        const s = inv.sgstAmount !== undefined ? Number(inv.sgstAmount) : Number((tax / 2).toFixed(2));
        cgst += c;
        sgst += s;
      }

      const g = Number(inv.grandTotal || 0);

      taxable += taxVal;
      totalTax += tax;
      grandTotal += g;
    });

    return {
      taxable: Number(taxable.toFixed(2)),
      cgst: Number(cgst.toFixed(2)),
      sgst: Number(sgst.toFixed(2)),
      igst: Number(igst.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
      b2bCount,
      b2cCount,
      totalCount: filteredInvoices.length
    };
  }, [filteredInvoices]);

  // Aggregate HSN Table
  const hsnSummaryData = useMemo(() => {
    const map = new Map();
    filteredInvoices.forEach((inv) => {
      const isGst = inv.isGstBill !== false && Number(inv.totalTax || 0) > 0;

      if (Array.isArray(inv.items)) {
        inv.items.forEach((item) => {
          const hsn = (item.hsnCode || '3917').trim();
          const desc = item.category || item.name || 'General Goods';
          const unit = (item.unit || 'PCS').toUpperCase();
          const qty = Number(item.qty || 0);
          const lineTaxable = Number(item.lineTaxable || (item.price * qty) || 0);
          const gstRate = isGst ? (item.gstRate !== undefined ? Number(item.gstRate) : 18) : 0;
          const lineTax = isGst ? Number(item.itemTax !== undefined ? item.itemTax : (lineTaxable * gstRate) / 100) : 0;

          const key = `${hsn}_${unit}_${gstRate}`;
          if (!map.has(key)) {
            map.set(key, {
              hsnCode: hsn,
              description: desc,
              uqc: unit,
              qty: 0,
              taxable: 0,
              gstRate,
              cgst: 0,
              sgst: 0,
              totalTax: 0,
              totalValue: 0
            });
          }

          const entry = map.get(key);
          entry.qty += qty;
          entry.taxable += lineTaxable;
          entry.cgst += lineTax / 2;
          entry.sgst += lineTax / 2;
          entry.totalTax += lineTax;
          entry.totalValue += (lineTaxable + lineTax);
        });
      }
    });
    return Array.from(map.values());
  }, [filteredInvoices]);

  // Aggregate Tax Slabs Table
  const taxSlabsData = useMemo(() => {
    const slabs = {
      0: { rate: 0, taxable: 0, cgst: 0, sgst: 0, tax: 0, total: 0 },
      5: { rate: 5, taxable: 0, cgst: 0, sgst: 0, tax: 0, total: 0 },
      12: { rate: 12, taxable: 0, cgst: 0, sgst: 0, tax: 0, total: 0 },
      18: { rate: 18, taxable: 0, cgst: 0, sgst: 0, tax: 0, total: 0 },
      28: { rate: 28, taxable: 0, cgst: 0, sgst: 0, tax: 0, total: 0 }
    };

    filteredInvoices.forEach((inv) => {
      const isGst = inv.isGstBill !== false && Number(inv.totalTax || 0) > 0;

      if (!isGst) {
        // Non-GST cash bills are placed under 0% Slab (Exempt / Non-GST)
        const sub = Number(inv.subtotal || 0);
        slabs[0].taxable += sub;
        slabs[0].total += sub;
      } else {
        if (Array.isArray(inv.items) && inv.items.length > 0) {
          inv.items.forEach((item) => {
            const rate = item.gstRate !== undefined ? Number(item.gstRate) : 18;
            const lineTaxable = Number(item.lineTaxable || (item.price * item.qty) || 0);
            const lineTax = Number(item.itemTax !== undefined ? item.itemTax : (lineTaxable * rate) / 100);

            if (!slabs[rate]) {
              slabs[rate] = { rate, taxable: 0, cgst: 0, sgst: 0, tax: 0, total: 0 };
            }
            slabs[rate].taxable += lineTaxable;
            slabs[rate].cgst += lineTax / 2;
            slabs[rate].sgst += lineTax / 2;
            slabs[rate].tax += lineTax;
            slabs[rate].total += (lineTaxable + lineTax);
          });
        } else {
          // Fallback for bills without item breakdown
          const tax = Number(inv.totalTax || 0);
          const sub = Number(inv.subtotal || 0);
          slabs[18].taxable += sub;
          slabs[18].cgst += tax / 2;
          slabs[18].sgst += tax / 2;
          slabs[18].tax += tax;
          slabs[18].total += (sub + tax);
        }
      }
    });

    return Object.values(slabs).sort((a, b) => a.rate - b.rate);
  }, [filteredInvoices]);

  // Handle Export to Excel
  const handleExportExcel = () => {
    if (filteredInvoices.length === 0) {
      showToast('No invoices available in the selected period to export.', 'error');
      return;
    }

    try {
      setIsExporting(true);
      exportGSTReportToExcel(filteredInvoices, periodTitle, {
        shopName: settings.shopName,
        gstin: settings.gstin,
        state: '33-Tamil Nadu'
      });
      showToast(`Auditor GST Excel file downloaded for ${periodTitle.replace(/_/g, ' ')}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Export failed: ' + err.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6 no-print">
      
      {/* Top Banner & Exporter Action Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>GST Reports & Auditor Filing</span>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  GSTR-1 & 3B Ready
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                Generate month-wise and financial year GST sales registers, HSN tables, and auditor-formatted Excel spreadsheets.
              </p>
            </div>
          </div>
        </div>

        {/* Big Auditor Excel Download Button */}
        <button
          onClick={handleExportExcel}
          disabled={isExporting || filteredInvoices.length === 0}
          className="flex items-center justify-center gap-2.5 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Download className="w-5 h-5" />
          <span>{isExporting ? 'Preparing Excel...' : 'Download Auditor GST Excel (.xlsx)'}</span>
        </button>
      </div>

      {/* Date Range & Period Filter Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilterMode('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'monthly'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Return
            </button>

            <button
              onClick={() => setFilterMode('fy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'fy'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Financial Year (Annual)
            </button>

            <button
              onClick={() => setFilterMode('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'custom'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom Range
            </button>

            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'all'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Invoices
            </button>
          </div>

          {/* Type Filter (All / B2B / B2C) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Invoice Type:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setTypeFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  typeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All ({metrics.totalCount})
              </button>
              <button
                onClick={() => setTypeFilter('B2B')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  typeFilter === 'B2B' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                B2B ({metrics.b2bCount})
              </button>
              <button
                onClick={() => setTypeFilter('B2C')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  typeFilter === 'B2C' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                B2C ({metrics.b2cCount})
              </button>
            </div>
          </div>

        </div>

        {/* Dynamic Filter Controls Based on Mode */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3">
          
          {filterMode === 'monthly' && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold text-slate-700">Select Filing Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {filterMode === 'fy' && (
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-700">Select Financial Year:</span>
              <select
                value={selectedFy}
                onChange={(e) => setSelectedFy(e.target.value)}
                className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {fyOptions.map((fy) => (
                  <option key={fy.value} value={fy.value}>{fy.label}</option>
                ))}
              </select>
            </div>
          )}

          {filterMode === 'custom' && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold text-slate-700">From Date:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-xs font-bold text-slate-700">To Date:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}

          {/* Search within period */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer name, GSTIN, or invoice no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Invoices */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Invoices</span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1 font-mono-numbers">{metrics.totalCount}</h3>
          <div className="flex gap-1.5 mt-1 text-[10px] font-bold">
            <span className="text-blue-600">{metrics.b2bCount} B2B</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{metrics.b2cCount} B2C</span>
          </div>
        </div>

        {/* Taxable Amount */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Taxable Turnover</span>
            <IndianRupee className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1 font-mono-numbers">{formatCurrency(metrics.taxable)}</h3>
          <p className="text-[10px] font-semibold text-slate-400 mt-1">Excl. taxes</p>
        </div>

        {/* CGST */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Central Tax (CGST)</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">9% / 6%</span>
          </div>
          <h3 className="text-xl font-black text-blue-700 mt-1 font-mono-numbers">{formatCurrency(metrics.cgst)}</h3>
          <p className="text-[10px] font-semibold text-slate-400 mt-1">50% share</p>
        </div>

        {/* SGST */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">State Tax (SGST)</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded">9% / 6%</span>
          </div>
          <h3 className="text-xl font-black text-purple-700 mt-1 font-mono-numbers">{formatCurrency(metrics.sgst)}</h3>
          <p className="text-[10px] font-semibold text-slate-400 mt-1">50% share</p>
        </div>

        {/* Total GST */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Total GST</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-xl font-black text-emerald-700 mt-1 font-mono-numbers">{formatCurrency(metrics.totalTax)}</h3>
          <p className="text-[10px] font-semibold text-slate-400 mt-1">CGST + SGST</p>
        </div>

        {/* Grand Total */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300">Total Gross Sales</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-xl font-black text-amber-400 mt-1 font-mono-numbers">{formatCurrency(metrics.grandTotal)}</h3>
          <p className="text-[10px] font-semibold text-slate-300 mt-1">Incl. all taxes</p>
        </div>

      </div>

      {/* Report Tab Selector (Sales Register | HSN Summary | Tax Slabs) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveReportTab('register')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                activeReportTab === 'register'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Sales Register ({filteredInvoices.length} Bills)</span>
            </button>

            <button
              onClick={() => setActiveReportTab('hsn')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                activeReportTab === 'hsn'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>HSN Summary (GSTR-1 Table 12)</span>
            </button>

            <button
              onClick={() => setActiveReportTab('slabs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                activeReportTab === 'slabs'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>Tax Rate Breakdown (GSTR-3B)</span>
            </button>
          </div>

          <span className="text-xs font-bold text-slate-500">
            Period: <strong className="text-slate-800">{periodTitle.replace(/_/g, ' ')}</strong>
          </span>

        </div>

        {/* Tab 1: Sales Register */}
        {activeReportTab === 'register' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3 text-center">#</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Invoice No</th>
                  <th className="py-2.5 px-4">Customer Name</th>
                  <th className="py-2.5 px-3">GSTIN</th>
                  <th className="py-2.5 px-2.5 text-center">Type</th>
                  <th className="py-2.5 px-3 text-center">HSN</th>
                  <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                  <th className="py-2.5 px-3 text-right text-blue-700">CGST (₹)</th>
                  <th className="py-2.5 px-3 text-right text-purple-700">SGST (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total Tax (₹)</th>
                  <th className="py-2.5 px-4 text-right">Invoice Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="py-12 text-center text-slate-400 font-semibold">
                      No invoices found for this date period.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv, idx) => {
                    const isB2B = Boolean(inv.customerGstin && inv.customerGstin.trim().length >= 15);
                    const tax = Number(inv.totalTax || 0);
                    const cgst = inv.cgstAmount !== undefined ? Number(inv.cgstAmount) : Number((tax / 2).toFixed(2));
                    const sgst = inv.sgstAmount !== undefined ? Number(inv.sgstAmount) : Number((tax / 2).toFixed(2));
                    const uniqueHsns = Array.from(new Set((inv.items || []).map((i) => i.hsnCode).filter(Boolean)));
                    const hsnDisplay = uniqueHsns.length > 0 ? uniqueHsns.join(', ') : '3917';

                    return (
                      <tr key={inv.id || idx} className="hover:bg-slate-50/80 transition-colors font-medium">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono-numbers">{idx + 1}</td>
                        <td className="py-2 px-3 text-slate-700 font-mono-numbers whitespace-nowrap">{formatGstDate(inv.date)}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">{inv.invoiceNumber}</td>
                        <td className="py-2 px-4 font-bold text-slate-800 truncate max-w-[200px]">{inv.customerName || 'Walk-in'}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                          {inv.customerGstin ? (
                            <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {inv.customerGstin}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unregistered</span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            isB2B ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isB2B ? 'B2B' : 'B2C'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="font-mono font-bold text-slate-700 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {hsnDisplay}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                          {formatCurrency(inv.subtotal)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                          {formatCurrency(cgst)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-purple-700">
                          {formatCurrency(sgst)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(tax)}
                        </td>
                        <td className="py-2 px-4 text-right font-mono font-black text-slate-900">
                          {formatCurrency(inv.grandTotal)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filteredInvoices.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-900 text-white font-black text-xs">
                    <td colSpan="7" className="py-3 px-4 text-right uppercase tracking-wider">
                      TOTAL ({filteredInvoices.length} Bills):
                    </td>
                    <td className="py-3 px-3 text-right font-mono">{formatCurrency(metrics.taxable)}</td>
                    <td className="py-3 px-3 text-right font-mono text-blue-300">{formatCurrency(metrics.cgst)}</td>
                    <td className="py-3 px-3 text-right font-mono text-purple-300">{formatCurrency(metrics.sgst)}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-300">{formatCurrency(metrics.totalTax)}</td>
                    <td className="py-3 px-4 text-right font-mono text-amber-400 text-sm">{formatCurrency(metrics.grandTotal)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* Tab 2: HSN Summary */}
        {activeReportTab === 'hsn' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3 text-center">#</th>
                  <th className="py-2.5 px-4">HSN Code</th>
                  <th className="py-2.5 px-4">Description / Group</th>
                  <th className="py-2.5 px-3 text-center">Unit (UQC)</th>
                  <th className="py-2.5 px-3 text-center">Total Qty</th>
                  <th className="py-2.5 px-3 text-center">GST Rate</th>
                  <th className="py-2.5 px-4 text-right">Taxable Value (₹)</th>
                  <th className="py-2.5 px-3 text-right text-blue-700">CGST (₹)</th>
                  <th className="py-2.5 px-3 text-right text-purple-700">SGST (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total Tax (₹)</th>
                  <th className="py-2.5 px-4 text-right">Total Value (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hsnSummaryData.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="py-12 text-center text-slate-400 font-semibold">
                      No items found for HSN aggregation in this period.
                    </td>
                  </tr>
                ) : (
                  hsnSummaryData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors font-medium">
                      <td className="py-2 px-3 text-center text-slate-400 font-mono-numbers">{idx + 1}</td>
                      <td className="py-2 px-4 font-mono font-black text-blue-700">{row.hsnCode}</td>
                      <td className="py-2 px-4 font-bold text-slate-800">{row.description}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-600">{row.uqc}</td>
                      <td className="py-2 px-3 text-center font-mono font-black text-slate-900">{row.qty}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700">{row.gstRate}%</td>
                      <td className="py-2 px-4 text-right font-mono font-bold text-slate-800">{formatCurrency(row.taxable)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">{formatCurrency(row.cgst)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-purple-700">{formatCurrency(row.sgst)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">{formatCurrency(row.totalTax)}</td>
                      <td className="py-2 px-4 text-right font-mono font-black text-slate-900">{formatCurrency(row.totalValue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Tax Rate Slabs */}
        {activeReportTab === 'slabs' && (
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {taxSlabsData.map((slab) => (
                <div key={slab.rate} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-sm font-black text-slate-900">{slab.rate}% GST Slab</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                      {slab.rate / 2}% + {slab.rate / 2}%
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Taxable Turnover:</span>
                      <strong className="text-slate-900 font-mono">{formatCurrency(slab.taxable)}</strong>
                    </div>
                    <div className="flex justify-between text-blue-700">
                      <span>CGST ({slab.rate / 2}%):</span>
                      <strong className="font-mono">{formatCurrency(slab.cgst)}</strong>
                    </div>
                    <div className="flex justify-between text-purple-700">
                      <span>SGST ({slab.rate / 2}%):</span>
                      <strong className="font-mono">{formatCurrency(slab.sgst)}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-700 pt-1 border-t border-slate-200 font-bold">
                      <span>Total Tax:</span>
                      <strong className="font-mono">{formatCurrency(slab.tax)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
