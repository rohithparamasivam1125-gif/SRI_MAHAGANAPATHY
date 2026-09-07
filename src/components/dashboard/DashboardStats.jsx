import React, { useMemo } from 'react';
import { 
  BarChart3, 
  IndianRupee, 
  ReceiptText, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  Droplets,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

export const DashboardStats = () => {
  const { products, invoices, settings, setCurrentTab } = useApp();

  // Metrics computation
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  
  // Today's Revenue
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayInvoices = invoices.filter((inv) => {
    const invDate = inv.date || (inv.createdAt?.toDate ? inv.createdAt.toDate().toISOString() : '');
    return invDate.startsWith(todayStr);
  });
  const todayRevenue = todayInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

  // Electrical vs Plumbing items sold breakdown
  const categorySales = useMemo(() => {
    let electricalAmt = 0;
    let plumbingAmt = 0;

    invoices.forEach((inv) => {
      if (inv.items) {
        inv.items.forEach((it) => {
          const itemAmt = Number(it.lineTotal || (it.price * it.qty)) || 0;
          if (it.category === 'Electrical') {
            electricalAmt += itemAmt;
          } else if (it.category === 'Plumbing') {
            plumbingAmt += itemAmt;
          }
        });
      }
    });

    const totalCat = electricalAmt + plumbingAmt || 1;
    return {
      electricalAmt,
      plumbingAmt,
      electricalPercent: Math.round((electricalAmt / totalCat) * 100),
      plumbingPercent: Math.round((plumbingAmt / totalCat) * 100)
    };
  }, [invoices]);

  // Low stock variants (< 15 units)
  const lowStockItems = useMemo(() => {
    const list = [];
    products.forEach((prod) => {
      if (prod.variants) {
        prod.variants.forEach((v) => {
          if (Number(v.stock) <= 15) {
            list.push({
              productName: prod.name,
              category: prod.category,
              size: v.size,
              stock: v.stock,
              unit: v.unit || 'Pcs'
            });
          }
        });
      }
    });
    return list;
  }, [products]);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6 no-print">
      
      {/* Top Header with SMG Official Logo */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <img 
            src="/smg-logo-transparent.png" 
            alt="Sri Mahaganapathy Logo" 
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {settings.shopName || 'Sri Mahaganapathy Electricals and Hardware'}
              </h1>
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live Store
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-bold mt-0.5">
              {settings.tagline || 'Wholesale & Retail Electricals, Hardware Solutions'}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">
              📍 {settings.address} | 📞 {settings.phone} {settings.gstin && `| GST: ${settings.gstin}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentTab('billing')}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-black text-xs sm:text-sm shadow-md transition-all active:scale-95"
        >
          <span>Go to Counter POS</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-slate-500 font-bold">All Time Revenue</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers">
              {formatCurrency(totalRevenue)}
            </h3>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-slate-500 font-bold">Today's Revenue ({todayInvoices.length} bills)</p>
            <h3 className="text-xl sm:text-2xl font-black text-blue-700 font-mono-numbers">
              {formatCurrency(todayRevenue)}
            </h3>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-slate-500 font-bold">Products in Catalog</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers">
              {products.length} Items
            </h3>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-slate-500 font-bold">Low Stock Alerts</p>
            <h3 className="text-xl sm:text-2xl font-black text-rose-600 font-mono-numbers">
              {lowStockItems.length} Sizes
            </h3>
          </div>
        </div>

      </div>

      {/* Grid: Category Breakdown & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Share (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-black text-base text-slate-900">
            Category Sales Distribution
          </h3>

          <div className="space-y-4 pt-2">
            
            {/* Electrical Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <Zap className="w-3.5 h-3.5 fill-amber-500" />
                  <span>Electrical</span>
                </span>
                <span className="font-mono-numbers">{formatCurrency(categorySales.electricalAmt)} ({categorySales.electricalPercent}%)</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${categorySales.electricalPercent}%` }}
                />
              </div>
            </div>

            {/* Plumbing Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <Droplets className="w-3.5 h-3.5 fill-blue-500" />
                  <span>Plumbing</span>
                </span>
                <span className="font-mono-numbers">{formatCurrency(categorySales.plumbingAmt)} ({categorySales.plumbingPercent}%)</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${categorySales.plumbingPercent}%` }}
                />
              </div>
            </div>

          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">Quick Counter Access:</p>
            <p>Ready to generate fresh invoices? Switch to Counter Billing.</p>
            <button
              onClick={() => setCurrentTab('billing')}
              className="mt-1 flex items-center gap-1 text-blue-700 font-bold hover:underline"
            >
              <span>Open Billing Terminal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Low Stock Warning Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low Stock Items (Need Reorder)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono-numbers">
              {lowStockItems.length} items below 15 units
            </span>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              All inventory size variants are adequately stocked!
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white font-semibold sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Product Name</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Size</th>
                    <th className="py-2 px-3 text-right">Remaining Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-900">{item.productName}</td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.category === 'Electrical' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{item.size}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-rose-600">
                        {item.stock} {item.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
