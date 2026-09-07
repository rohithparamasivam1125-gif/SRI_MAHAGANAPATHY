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
  ShoppingBag,
  Loader2,
  Clock,
  Timer,
  Edit3,
  Hash,
  Check,
  X
} from 'lucide-react';
import { useApp, getInvoiceExpiryInfo } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoicePrintView } from '../billing/InvoicePrintView';
import { generatePdfFromData } from '../../utils/pdfGenerator';
import { sharePdfFile } from '../../utils/whatsappShare';

const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export const InvoiceHistory = () => {
  const { invoices, deleteInvoiceRecord, loadInvoiceForEdit, updateInvoiceNumberOnly, settings, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('ALL');
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState(null);
  const [sharingId, setSharingId] = useState(null);
  const [invoiceToEditNumber, setInvoiceToEditNumber] = useState(null);
  const [newBillNumberInput, setNewBillNumberInput] = useState('');
  const [isUpdatingBillNumber, setIsUpdatingBillNumber] = useState(false);

  const handleOpenEditNumber = (inv) => {
    setInvoiceToEditNumber(inv);
    setNewBillNumberInput(inv.invoiceNumber || '');
  };

  const handleSaveBillNumber = async (e) => {
    e?.preventDefault();
    if (!invoiceToEditNumber || !newBillNumberInput.trim()) return;
    setIsUpdatingBillNumber(true);
    try {
      await updateInvoiceNumberOnly(invoiceToEditNumber.id || invoiceToEditNumber.invoiceNumber, newBillNumberInput.trim());
      setInvoiceToEditNumber(null);
    } catch (_) {}
    finally {
      setIsUpdatingBillNumber(false);
    }
  };

  const handleShareInvoice = async (inv) => {
    const invId = inv.id || inv.invoiceNumber;
    try {
      setSharingId(invId);
      const { file, blob, filename, docNumber, grandTotal, customerName } = await generatePdfFromData(inv, 'invoice', settings);
      await sharePdfFile({
        file,
        blob,
        filename,
        type: 'invoice',
        docNumber,
        customerName,
        grandTotal,
        showToast
      });
    } catch (err) {
      console.error('Error generating/sharing invoice PDF:', err);
      showToast('Failed to create PDF for WhatsApp: ' + err.message, 'error');
    } finally {
      setSharingId(null);
    }
  };

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
      
      {/* Background History Content (Hidden when printing invoice) */}
      <div className="space-y-6 no-print">
        
        {/* Top Header */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <ReceiptText className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
              <span>Bills & Invoice History</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              View, search, reprint, or manage customer invoices (retained for 40 days).
            </p>
          </div>
          
          {/* 40-Day Auto Retention Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 self-start sm:self-auto shadow-xs">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>40-Day Auto-Purge: Bills auto-delete after 40 days</span>
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
              <p className="text-xs sm:text-sm text-slate-500 font-bold">Active Stored Bills</p>
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
                Bills created within the last 40 days will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-xs sm:text-sm">
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Bill Date</th>
                    <th className="py-3.5 px-4">Expires In (40d)</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-3 text-center">Items</th>
                    <th className="py-3.5 px-3">Payment</th>
                    <th className="py-3.5 px-4 text-right">Grand Total (₹)</th>
                    <th className="py-3.5 px-4 text-center w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredInvoices.map((inv) => {
                    const expiry = getInvoiceExpiryInfo(inv);
                    return (
                      <tr key={inv.id || inv.invoiceNumber} className="hover:bg-slate-50 transition-colors">
                        
                        {/* Invoice No */}
                        <td className="py-3.5 px-4 font-mono font-black text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5 group">
                            <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                              #{inv.invoiceNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenEditNumber(inv)}
                              className="opacity-60 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                              title="Quick Change Bill Number"
                            >
                              <Hash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Bill Date */}
                        <td className="py-3.5 px-4 text-slate-700 font-bold whitespace-nowrap">
                          {formatDate(inv.date || inv.createdAt)}
                        </td>

                        {/* Expiry Countdown */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black border w-fit ${
                              expiry.daysLeft > 25
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : expiry.daysLeft > 10
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                            }`}>
                              <Timer className="w-3.5 h-3.5" />
                              <span>{expiry.daysLeft} {expiry.daysLeft === 1 ? 'day' : 'days'} left</span>
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Expires: {formatDate(expiry.expiryDate)}
                            </span>
                          </div>
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
                            
                            {/* Share on WhatsApp */}
                            <button
                              onClick={() => handleShareInvoice(inv)}
                              disabled={sharingId === (inv.id || inv.invoiceNumber)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg transition-all shadow-xs disabled:opacity-50 flex items-center justify-center cursor-pointer"
                              title="Share official PDF bill on WhatsApp"
                            >
                              {sharingId === (inv.id || inv.invoiceNumber) ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                              ) : (
                                <WhatsAppIcon className="w-4 h-4" />
                              )}
                            </button>

                            {/* Edit Bill */}
                            <button
                              onClick={() => loadInvoiceForEdit(inv)}
                              className="p-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 rounded-lg transition-all active:scale-95 flex items-center gap-1 font-bold text-xs cursor-pointer"
                              title="Edit & modify this saved bill in Counter Billing"
                            >
                              <Edit3 className="w-4 h-4 text-amber-700" />
                              <span className="hidden xl:inline">Edit</span>
                            </button>

                            {/* Print Invoice */}
                            <button
                              onClick={() => setSelectedInvoiceForView(inv)}
                              className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 rounded-lg transition-colors cursor-pointer"
                              title="View & Reprint Invoice"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete bill #${inv.invoiceNumber}?`)) {
                                  deleteInvoiceRecord(inv.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete bill"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Change Bill Number Modal */}
      {invoiceToEditNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">Change Bill Number</h3>
              </div>
              <button
                type="button"
                onClick={() => setInvoiceToEditNumber(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBillNumber} className="p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-600 mb-2">
                  Customer: <strong className="text-slate-900">{invoiceToEditNumber.customerName || 'Walk-in'}</strong> • Total: <strong className="text-slate-900 font-mono">{formatCurrency(invoiceToEditNumber.grandTotal)}</strong>
                </p>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter New Bill / Invoice Number:
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newBillNumberInput}
                    onChange={(e) => setNewBillNumberInput(e.target.value.toUpperCase())}
                    placeholder="e.g. INV-101 / SMG-2609-0001"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInvoiceToEditNumber(null)}
                  className="w-1/2 py-2 px-3 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingBillNumber || !newBillNumberInput.trim()}
                  className="w-1/2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isUpdatingBillNumber ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Update Number</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
