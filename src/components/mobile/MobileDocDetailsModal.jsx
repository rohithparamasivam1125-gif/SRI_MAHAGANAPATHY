import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ReceiptText, 
  FileText, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Percent, 
  IndianRupee, 
  Loader2,
  CheckCircle2,
  Package
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generatePdfFromData } from '../../utils/pdfGenerator';
import { sharePdfFile } from '../../utils/whatsappShare';
import { useApp } from '../../context/AppContext';

const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export const MobileDocDetailsModal = ({ doc, type = 'invoice', onClose }) => {
  const { settings, showToast } = useApp();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!doc) return null;

  const isInvoice = type === 'invoice';
  const docNumber = isInvoice ? (doc.invoiceNumber || 'INV') : (doc.quotationNumber || 'QUO');
  const items = Array.isArray(doc.items) ? doc.items : [];

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const { pdf, filename } = await generatePdfFromData(doc, type, settings);
      pdf.save(filename);
      showToast(`Downloaded ${filename} successfully!`, 'success');
    } catch (err) {
      console.error('Download PDF error:', err);
      showToast('Failed to download PDF: ' + err.message, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
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
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-slate-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100/60 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
              isInvoice ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
            }`}>
              {isInvoice ? <ReceiptText className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-base">
                  {docNumber}
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  isInvoice 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {isInvoice ? 'Invoice' : 'Quotation'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDate(doc.createdAt || doc.date || Date.now())}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 active:scale-95 text-slate-700 flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-slate-800">
          
          {/* Customer & Info Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <User className="w-4 h-4 text-slate-500" />
                <span>{doc.customerName || (isInvoice ? 'Walk-in Customer' : 'Prospective Client')}</span>
              </div>
              {doc.customerPhone && (
                <a
                  href={`tel:${doc.customerPhone}`}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>{doc.customerPhone}</span>
                </a>
              )}
            </div>

            {doc.siteLocation && (
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Site: {doc.siteLocation}</span>
              </div>
            )}

            {doc.customerGstin && (
              <div className="text-xs text-slate-600 font-medium">
                GSTIN: <span className="font-mono font-bold text-slate-800">{doc.customerGstin}</span>
              </div>
            )}

            {isInvoice && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  Payment Mode:
                </span>
                <span className="font-bold uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                  {doc.paymentMode || 'CASH'}
                </span>
              </div>
            )}
          </div>

          {/* Items Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                <span>Items & Specifications ({items.length})</span>
              </h4>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => {
                const itemTotal = (item.qty || 1) * (item.price || item.rate || 0);
                const rawName = item.name || item.productName || `Item #${idx + 1}`;
                const spec = (item.size || item.spec || item.specification || item.variant || '').trim();
                const hasValidSpec = spec && !['standard', 'std', '-', 'default'].includes(spec.toLowerCase());
                const isSpecAlreadyInName = hasValidSpec && rawName.toLowerCase().includes(spec.toLowerCase());
                const fullItemTitle = (hasValidSpec && !isSpecAlreadyInName) ? `${spec} ${rawName}` : rawName;

                return (
                  <div 
                    key={idx}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-start justify-between gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      {/* Item Name formatted like '1" uPVC Coupler' */}
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                          {fullItemTitle}
                        </span>
                        {item.brand && item.brand !== 'General' && (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {item.brand}
                          </span>
                        )}
                      </div>

                      {/* Item Calculations & Details */}
                      <div className="text-[11px] text-slate-500 font-medium mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                          Qty: {item.qty} {item.unit || 'Nos'}
                        </span>
                        <span>×</span>
                        <span className="font-semibold text-slate-700">₹{Number(item.price || item.rate || 0).toLocaleString('en-IN')}</span>
                        {item.discount > 0 && (
                          <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 text-[10px]">
                            -{item.discount}%
                          </span>
                        )}
                        {item.gstRate > 0 && (
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px] font-bold border border-emerald-200">
                            GST {item.gstRate}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-slate-900 text-xs sm:text-sm">
                        {formatCurrency(item.totalAmount || itemTotal)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals Calculation Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold">{formatCurrency(doc.subtotal || doc.totalAmount || 0)}</span>
            </div>

            {Number(doc.totalTax || doc.gstAmount || 0) > 0 && (
              <div className="flex justify-between text-xs text-slate-600">
                <span>Total GST</span>
                <span className="font-semibold">{formatCurrency(doc.totalTax || doc.gstAmount || 0)}</span>
              </div>
            )}

            {Number(doc.discountAmount || 0) > 0 && (
              <div className="flex justify-between text-xs text-rose-600 font-medium">
                <span>Discount</span>
                <span>-{formatCurrency(doc.discountAmount)}</span>
              </div>
            )}

            {Number(doc.roundOff || 0) !== 0 && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Round Off</span>
                <span>{doc.roundOff > 0 ? `+${doc.roundOff}` : doc.roundOff}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-900">
              <span className="font-black text-sm">Grand Total</span>
              <span className="font-black text-lg text-emerald-700">
                {formatCurrency(doc.grandTotal || doc.total || 0)}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 gap-3 sticky bottom-0 z-10">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {isSharing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <WhatsAppIcon className="w-4 h-4" />
            )}
            <span>{isSharing ? 'Preparing...' : 'Share WhatsApp'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
