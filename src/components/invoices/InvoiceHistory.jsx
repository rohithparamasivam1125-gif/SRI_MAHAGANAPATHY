import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ReceiptText, 
  Printer, 
  Trash2, 
  Eye, 
  Calendar, 
  CreditCard, 
  User, 
  IndianRupee,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoicePrintView } from '../billing/InvoicePrintView';

export const InvoiceHistory = () => {
  const { invoices, deleteInvoiceRecord } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('ALL');
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState(null);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (selectedPaymentMode !== 'ALL' && inv.paymentMode !== selectedPaymentMode) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = inv.invoiceNumber?.toLowerCase().includes(q);
        const matchCustomer = inv.customerName?.toLowerCase().includes(q);
        const matchPhone = inv.customerPhone?.toLowerCase().includes(q);
        return matchNumber || matchCustomer || matchPhone;
      }
      return true;
    });
  }, [invoices, selectedPaymentMode, searchQuery]);

  // Quick stats
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const totalItemsSold = filteredInvoices.reduce((sum, inv) => {
    return sum + (inv.items ? inv.items.reduce((s, it) => s + it.qty, 0) : 0);
  }, 0);
  const avgBillValue = filteredInvoices.length > 0 ? Math.round(totalRevenue / filteredInvoices.length) : 0;

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ReceiptText className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
            <span>Bills & Invoice History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
            View, search, reprint, or manage past customer invoices stored in Firebase.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-slate-500 font-bold">Filtered Total Sales</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers">
              {formatCurrency(totalRevenue)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ReceiptText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-slate-500 font-bold">Total Invoices</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers">
              {filteredInvoices.length} Bills
            </h3>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-slate-500 font-bold">Average Bill Size</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers">
              {formatCurrency(avgBillValue)}
            </h3>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Payment Mode Pills */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-xl border border-slate-300/60 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Cash', 'UPI', 'Card', 'Credit'].map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedPaymentMode(mode)}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all whitespace-nowrap ${
                selectedPaymentMode === mode
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {mode === 'ALL' ? 'All Modes' : mode}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
          />
        </div>

      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-400">
            <ReceiptText className="w-14 h-14 text-slate-300 mb-2" />
            <h3 className="text-base sm:text-lg font-black text-slate-700">No invoices found</h3>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-xs mt-1">
              Generated counter bills will automatically appear here with real-time Firebase sync.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-xs sm:text-sm">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-3 text-center">Items</th>
                  <th className="py-3.5 px-3">Payment</th>
                  <th className="py-3.5 px-4 text-right">Grand Total (₹)</th>
                  <th className="py-3.5 px-4 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id || inv.invoiceNumber} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Invoice No */}
                    <td className="py-3.5 px-4 font-mono font-black text-blue-700 text-xs sm:text-sm">
                      {inv.invoiceNumber}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-700 font-bold">
                      {formatDate(inv.date || inv.createdAt)}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900 text-xs sm:text-sm">{inv.customerName || 'Walk-in Customer'}</div>
                      {inv.customerPhone && (
                        <div className="text-xs text-slate-500 font-mono font-bold">{inv.customerPhone}</div>
                      )}
                    </td>

                    {/* Items count */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2.5 py-0.5 bg-slate-100 rounded-md font-mono text-slate-800 font-bold text-xs">
                        {inv.items ? inv.items.length : 0} items
                      </span>
                    </td>

                    {/* Payment Mode */}
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-black ${
                        inv.paymentMode === 'Cash' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : inv.paymentMode === 'UPI'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : inv.paymentMode === 'Card'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {inv.paymentMode}
                      </span>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-sm sm:text-base">
                      {formatCurrency(inv.grandTotal)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedInvoiceForView(inv)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View & Reprint Invoice"
                        >
                          <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete bill #${inv.invoiceNumber}?`)) {
                              deleteInvoiceRecord(inv.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete bill"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Reprint Modal */}
      {selectedInvoiceForView && (
        <InvoicePrintView
          invoice={selectedInvoiceForView}
          onClose={() => setSelectedInvoiceForView(null)}
        />
      )}

    </div>
  );
};
