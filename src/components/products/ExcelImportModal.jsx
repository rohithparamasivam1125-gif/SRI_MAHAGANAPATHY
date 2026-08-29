import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Layers, 
  Database,
  ArrowRight
} from 'lucide-react';
import { parseExcelFile, downloadSampleExcelTemplate } from '../../utils/excelHelper';
import { bulkImportProducts } from '../../firebase/firestoreService';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

export const ExcelImportModal = ({ isOpen, onClose }) => {
  const { showToast } = useApp();

  const [file, setFile] = useState(null);
  const [parsedProducts, setParsedProducts] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadSuccessCount, setUploadSuccessCount] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMessage('');
    setIsParsing(true);

    try {
      const results = await parseExcelFile(selectedFile);
      setParsedProducts(results);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to read Excel file. Please ensure it has valid product columns.');
      setParsedProducts([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleUploadToFirebase = async () => {
    if (parsedProducts.length === 0) return;

    setIsUploading(true);
    setErrorMessage('');
    try {
      const count = await bulkImportProducts(parsedProducts);
      setUploadSuccessCount(count);
      showToast(`Successfully uploaded ${count} products to Firebase!`, 'success');
    } catch (err) {
      console.error(err);
      setErrorMessage('Firebase batch upload error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedProducts([]);
    setErrorMessage('');
    setUploadSuccessCount(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Import Products from Excel / CSV</h3>
              <p className="text-xs text-slate-400">Directly sync your inventory to Firebase Firestore</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Top Bar: Template download & quick instructions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Upload your <strong>Electrical & Plumbing</strong> price sheet. Products with matching names will group their sizes automatically!
              </span>
            </div>
            <button
              onClick={downloadSampleExcelTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel Template</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {uploadSuccessCount !== null ? (
            /* Upload Success Banner */
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-lg font-extrabold text-emerald-900">
                Import Complete!
              </h4>
              <p className="text-sm text-emerald-700">
                Successfully uploaded <strong>{uploadSuccessCount}</strong> products and their size variants to your Firebase database.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl hover:bg-emerald-100"
                >
                  Import Another File
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Done & Back to Products
                </button>
              </div>
            </div>
          ) : parsedProducts.length === 0 ? (
            /* File Upload Dropzone */
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center">
              <UploadCloud className="w-12 h-12 text-blue-600 mb-3 animate-bounce" />
              <h4 className="text-base font-bold text-slate-800">
                {isParsing ? 'Reading Excel file...' : 'Choose an Excel or CSV file to import'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Supported formats: <strong>.xlsx, .xls, .csv</strong>. Columns like Product Name, Category, Size, Price, Stock will be automatically mapped.
              </p>
              <label className="cursor-pointer px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95">
                <span>Browse Excel File</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            /* Preview Parsed Data Table */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Preview: Found {parsedProducts.length} unique products
                  </h4>
                  <p className="text-xs text-slate-500">
                    Review parsed items before committing to Firebase Firestore
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-900 underline"
                >
                  Choose different file
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-white font-bold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Product Name</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Brand</th>
                      <th className="py-2 px-3">Size Variants</th>
                      <th className="py-2 px-3 text-right">Price Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parsedProducts.map((p, idx) => {
                      const prices = p.variants.map((v) => v.price);
                      const minPrice = Math.min(...prices);
                      const maxPrice = Math.max(...prices);

                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-900">{p.name}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.category === 'Electrical' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                            }`}>
                              {p.category}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600">{p.brand || '-'}</td>
                          <td className="py-2 px-3 font-mono text-blue-700">
                            {p.variants.map((v) => v.size).join(', ')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {minPrice === maxPrice 
                              ? formatCurrency(minPrice)
                              : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Upload Action */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-medium">
                  Ready to batch upload into Firebase Firestore
                </span>
                <button
                  onClick={handleUploadToFirebase}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  <Database className="w-4 h-4" />
                  <span>{isUploading ? 'Importing to Firebase...' : 'Confirm & Upload to Firebase'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
