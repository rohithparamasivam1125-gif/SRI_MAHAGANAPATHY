import React, { useState, useMemo } from 'react';
import { 
  Search, 
  FileText, 
  Printer, 
  ShoppingCart, 
  Trash2, 
  IndianRupee, 
  Calendar, 
  User, 
  MapPin, 
  X,
  Clock,
  Edit3,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { generatePdfFromData } from '../../utils/pdfGenerator';
import { sharePdfFile } from '../../utils/whatsappShare';

const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export const QuotationHistory = ({ onSelectQuotation, onEditQuotation }) => {
  const { quotations, deleteQuotationRecord, convertQuotationToActiveBill, loadQuotationForEdit, settings, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingId, setSharingId] = useState(null);

  const handleShareQuotation = async (quo) => {
    const qId = quo.id || quo.quotationNumber;
    try {
      setSharingId(qId);
      const { file, blob, filename, docNumber, grandTotal, customerName } = await generatePdfFromData(quo, 'quotation', settings);
      await sharePdfFile({
        file,
        blob,
        filename,
        type: 'quotation',
        docNumber,
        customerName,
        grandTotal,
        showToast
      });
    } catch (err) {
      console.error('Error generating/sharing quotation PDF:', err);
      showToast('Failed to create PDF for WhatsApp: ' + err.message, 'error');
    } finally {
      setSharingId(null);
    }
  };

  const filteredQuotations = useMemo(() => {
    return quotations.filter((quo) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          quo.quotationNumber?.toLowerCase().includes(q) ||
          quo.customerName?.toLowerCase().includes(q) ||
          quo.customerPhone?.toLowerCase().includes(q) ||
          quo.siteLocation?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [quotations, searchQuery]);

  const totalQuotationValue = filteredQuotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);

  return (
    <div className="space-y-4">
      
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Saved Quotations & Price Proposals</span>
          </h3>
          <p className="text-xs text-slate-500 font-semibold">
            {filteredQuotations.length} Proposals Saved (Total Value: {formatCurrency(totalQuotationValue)})
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quotation #, client, phone, site..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredQuotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-400">
            <FileText className="w-14 h-14 text-slate-300 mb-2" />
            <h3 className="text-base font-black text-slate-700">No quotations found</h3>
            <p className="text-xs text-slate-500 font-semibold max-w-xs mt-1">
              Any quotations you generate will automatically be saved and listed here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-xs sm:text-sm">
                  <th className="py-3.5 px-4">Quotation #</th>
                  <th className="py-3.5 px-4">Date Issued</th>
                  <th className="py-3.5 px-4">Client Details</th>
                  <th className="py-3.5 px-3">Site Location</th>
                  <th className="py-3.5 px-3 text-center">Items</th>
                  <th className="py-3.5 px-4 text-right">Estimate Total (₹)</th>
                  <th className="py-3.5 px-4 text-center w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredQuotations.map((quo) => (
                  <tr key={quo.id || quo.quotationNumber} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Quotation No */}
                    <td className="py-3.5 px-4 font-mono font-black text-indigo-700 text-xs sm:text-sm">
                      {quo.quotationNumber}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-700 font-bold">
                      {formatDate(quo.date)}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900 text-xs sm:text-sm">
                        {quo.customerName || 'Prospective Client'}
                      </div>
                      {quo.customerPhone && (
                        <div className="text-xs text-slate-500 font-mono font-bold">{quo.customerPhone}</div>
                      )}
                    </td>

                    {/* Site */}
                    <td className="py-3.5 px-3 font-semibold text-slate-700 text-xs">
                      {quo.siteLocation || '-'}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2.5 py-0.5 bg-slate-100 rounded-md font-mono text-slate-800 font-bold text-xs">
                        {quo.items ? quo.items.length : 0} items
                      </span>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-sm sm:text-base">
                      {formatCurrency(quo.grandTotal)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Share on WhatsApp */}
                        <button
                          onClick={() => handleShareQuotation(quo)}
                          disabled={sharingId === (quo.id || quo.quotationNumber)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg transition-all shadow-xs disabled:opacity-50 flex items-center justify-center"
                          title="Share official PDF proposal on WhatsApp"
                        >
                          {sharingId === (quo.id || quo.quotationNumber) ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            <WhatsAppIcon className="w-4 h-4" />
                          )}
                        </button>

                        {/* Convert to Bill */}
                        <button
                          onClick={() => convertQuotationToActiveBill(quo)}
                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                          title="Load into Counter Bill for invoicing"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>

                        {/* Edit Quotation */}
                        <button
                          onClick={() => onEditQuotation ? onEditQuotation(quo) : loadQuotationForEdit(quo)}
                          className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors"
                          title="Edit Quotation (Add/Remove items, update info)"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* View & Print */}
                        <button
                          onClick={() => onSelectQuotation(quo)}
                          className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 rounded-lg transition-colors"
                          title="View & Print Quotation"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete quotation #${quo.quotationNumber}?`)) {
                              deleteQuotationRecord(quo.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete quotation"
                        >
                          <Trash2 className="w-4 h-4" />
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

    </div>
  );
};
