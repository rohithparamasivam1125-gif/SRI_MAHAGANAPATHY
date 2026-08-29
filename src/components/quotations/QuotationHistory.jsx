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
  Clock
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const QuotationHistory = ({ onSelectQuotation }) => {
  const { quotations, deleteQuotationRecord, convertQuotationToActiveBill } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

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
                  <th className="py-3.5 px-4 text-center w-36">Actions</th>
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
                        
                        {/* Convert to Bill */}
                        <button
                          onClick={() => convertQuotationToActiveBill(quo)}
                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                          title="Load into Counter Bill for invoicing"
                        >
                          <ShoppingCart className="w-4 h-4" />
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
