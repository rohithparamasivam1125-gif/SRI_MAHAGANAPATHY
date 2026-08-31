import * as XLSX from 'xlsx';

/**
 * Formats a Date or timestamp into DD-MM-YYYY format
 */
export const formatGstDate = (dateVal) => {
  if (!dateVal) return '';
  const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Generates an Auditor-Ready Multi-Sheet GST Excel Workbook (.xlsx)
 *
 * Sheet 1: GST Sales Register (All Invoices with B2B/B2C, Taxable Value, CGST, SGST, Total)
 * Sheet 2: HSN Summary (GSTR-1 Table 12 compliant)
 * Sheet 3: Tax Slab Summary (GSTR-3B Table 3.1 compliant)
 */
export const exportGSTReportToExcel = (invoices, periodTitle = 'GST_Report', shopDetails = {}) => {
  if (!invoices || invoices.length === 0) {
    throw new Error('No invoices found for the selected period.');
  }

  const workbook = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: SALES REGISTER
  // ==========================================
  const salesRows = invoices.map((inv, index) => {
    const gstin = (inv.customerGstin || '').trim().toUpperCase();
    const isB2B = Boolean(gstin.length >= 15);
    const isInterState = isB2B && !gstin.startsWith('33'); // 33 is Tamil Nadu

    const taxableVal = Number(inv.subtotal || 0);
    const totalTax = Number(inv.totalTax || 0);

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = totalTax;
    } else {
      cgst = inv.cgstAmount !== undefined ? Number(inv.cgstAmount) : Number((totalTax / 2).toFixed(2));
      sgst = inv.sgstAmount !== undefined ? Number(inv.sgstAmount) : Number((totalTax / 2).toFixed(2));
      igst = Number(inv.igstAmount || 0);
    }

    const roundOff = Number(inv.roundOff || 0);
    const grandTotal = Number(inv.grandTotal || 0);

    const uniqueHsns = Array.from(new Set((inv.items || []).map((i) => i.hsnCode).filter(Boolean)));
    const hsnDisplay = uniqueHsns.length > 0 ? uniqueHsns.join(', ') : '3917';

    return {
      'S.No': index + 1,
      'Invoice Date': formatGstDate(inv.date),
      'Invoice Number': inv.invoiceNumber || `INV-${index + 1}`,
      'Customer Name': inv.customerName || 'Walk-in Customer',
      'Customer GSTIN': isB2B ? gstin : 'Unregistered',
      'Invoice Type': isB2B ? (isInterState ? 'B2B (Inter-State)' : 'B2B') : 'B2C',
      'HSN Code(s)': hsnDisplay,
      'Place of Supply': isInterState ? `State (${gstin.slice(0, 2)})` : (shopDetails.state || '33-Tamil Nadu'),
      'Payment Mode': inv.paymentMode || 'Cash',
      'Taxable Value (₹)': taxableVal,
      'CGST Amount (₹)': cgst,
      'SGST Amount (₹)': sgst,
      'IGST Amount (₹)': igst,
      'Total Tax (₹)': totalTax,
      'Round Off (₹)': roundOff,
      'Total Invoice Value (₹)': grandTotal
    };
  });

  // Calculate Totals Row for Sales Register
  const totalTaxable = salesRows.reduce((sum, r) => sum + r['Taxable Value (₹)'], 0);
  const totalCgst = salesRows.reduce((sum, r) => sum + r['CGST Amount (₹)'], 0);
  const totalSgst = salesRows.reduce((sum, r) => sum + r['SGST Amount (₹)'], 0);
  const totalIgst = salesRows.reduce((sum, r) => sum + r['IGST Amount (₹)'], 0);
  const totalRoundOff = salesRows.reduce((sum, r) => sum + r['Round Off (₹)'], 0);
  const grandTax = salesRows.reduce((sum, r) => sum + r['Total Tax (₹)'], 0);
  const grandValue = salesRows.reduce((sum, r) => sum + r['Total Invoice Value (₹)'], 0);

  salesRows.push({
    'S.No': 'TOTAL',
    'Invoice Date': '',
    'Invoice Number': `${invoices.length} Bills`,
    'Customer Name': '',
    'Customer GSTIN': '',
    'Invoice Type': '',
    'HSN Code(s)': '',
    'Place of Supply': '',
    'Payment Mode': '',
    'Taxable Value (₹)': Number(totalTaxable.toFixed(2)),
    'CGST Amount (₹)': Number(totalCgst.toFixed(2)),
    'SGST Amount (₹)': Number(totalSgst.toFixed(2)),
    'IGST Amount (₹)': Number(totalIgst.toFixed(2)),
    'Total Tax (₹)': Number(grandTax.toFixed(2)),
    'Round Off (₹)': Number(totalRoundOff.toFixed(2)),
    'Total Invoice Value (₹)': Number(grandValue.toFixed(2))
  });

  const salesSheet = XLSX.utils.json_to_sheet(salesRows);
  salesSheet['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 14 }, // Date
    { wch: 18 }, // Invoice No
    { wch: 26 }, // Customer Name
    { wch: 18 }, // GSTIN
    { wch: 14 }, // Type
    { wch: 14 }, // HSN
    { wch: 16 }, // POS
    { wch: 14 }, // Mode
    { wch: 18 }, // Taxable
    { wch: 16 }, // CGST
    { wch: 16 }, // SGST
    { wch: 16 }, // IGST
    { wch: 16 }, // Total Tax
    { wch: 14 }, // Round Off
    { wch: 22 }  // Grand Total
  ];
  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales_Register');

  // ==========================================
  // SHEET 2: HSN SUMMARY (GSTR-1 Section 12)
  // ==========================================
  const hsnMap = new Map();

  invoices.forEach((inv) => {
    const isGst = inv.isGstBill !== false && Number(inv.totalTax || 0) > 0;

    if (Array.isArray(inv.items)) {
      inv.items.forEach((item) => {
        const hsn = (item.hsnCode || '3917').trim();
        const desc = item.category || item.name || 'General';
        const unit = (item.unit || 'PCS').toUpperCase();
        const qty = Number(item.qty || 0);
        const lineTaxable = Number(item.lineTaxable || (item.price * qty) || 0);
        const gstRate = isGst ? (item.gstRate !== undefined ? Number(item.gstRate) : 18) : 0;
        const lineTax = isGst ? Number(item.itemTax !== undefined ? item.itemTax : (lineTaxable * gstRate) / 100) : 0;

        const key = `${hsn}_${unit}_${gstRate}`;
        if (!hsnMap.has(key)) {
          hsnMap.set(key, {
            hsnCode: hsn,
            description: desc,
            uqc: unit,
            totalQty: 0,
            taxableValue: 0,
            gstRate,
            cgstRate: gstRate / 2,
            sgstRate: gstRate / 2,
            cgstAmount: 0,
            sgstAmount: 0,
            totalTax: 0,
            totalValue: 0
          });
        }

        const entry = hsnMap.get(key);
        entry.totalQty += qty;
        entry.taxableValue += lineTaxable;
        entry.cgstAmount += lineTax / 2;
        entry.sgstAmount += lineTax / 2;
        entry.totalTax += lineTax;
        entry.totalValue += (lineTaxable + lineTax);
      });
    }
  });

  const hsnRows = Array.from(hsnMap.values()).map((h, i) => ({
    'S.No': i + 1,
    'HSN Code': h.hsnCode,
    'Description': h.description,
    'UQC (Unit)': h.uqc,
    'Total Quantity': h.totalQty,
    'Total Taxable Value (₹)': Number(h.taxableValue.toFixed(2)),
    'GST Rate (%)': `${h.gstRate}%`,
    'CGST (₹)': Number(h.cgstAmount.toFixed(2)),
    'SGST (₹)': Number(h.sgstAmount.toFixed(2)),
    'IGST (₹)': 0,
    'Total Tax Amount (₹)': Number(h.totalTax.toFixed(2)),
    'Total Value (₹)': Number(h.totalValue.toFixed(2))
  }));

  const hsnSheet = XLSX.utils.json_to_sheet(hsnRows);
  hsnSheet['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 14 }, // HSN
    { wch: 24 }, // Description
    { wch: 12 }, // UQC
    { wch: 14 }, // Qty
    { wch: 22 }, // Taxable
    { wch: 12 }, // GST Rate
    { wch: 15 }, // CGST
    { wch: 15 }, // SGST
    { wch: 12 }, // IGST
    { wch: 20 }, // Total Tax
    { wch: 20 }  // Total Value
  ];
  XLSX.utils.book_append_sheet(workbook, hsnSheet, 'HSN_Summary');

  // ==========================================
  // SHEET 3: TAX SLAB SUMMARY (GSTR-3B Table 3.1)
  // ==========================================
  const slabMap = {
    0: { taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0, total: 0, count: 0 },
    5: { taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0, total: 0, count: 0 },
    12: { taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0, total: 0, count: 0 },
    18: { taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0, total: 0, count: 0 },
    28: { taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0, total: 0, count: 0 }
  };

  invoices.forEach((inv) => {
    const isGst = inv.isGstBill !== false && Number(inv.totalTax || 0) > 0;

    if (!isGst) {
      // Non-GST bills placed under 0% slab
      const sub = Number(inv.subtotal || 0);
      slabs[0].taxable += sub;
      slabs[0].total += sub;
    } else {
      if (Array.isArray(inv.items) && inv.items.length > 0) {
        inv.items.forEach((item) => {
          const rate = item.gstRate !== undefined ? Number(item.gstRate) : 18;
          const lineTaxable = Number(item.lineTaxable || (item.price * item.qty) || 0);
          const lineTax = Number(item.itemTax !== undefined ? item.itemTax : (lineTaxable * rate) / 100);

          if (!slabMap[rate]) {
            slabMap[rate] = { taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0, total: 0, count: 0 };
          }
          slabMap[rate].taxable += lineTaxable;
          slabMap[rate].cgst += lineTax / 2;
          slabMap[rate].sgst += lineTax / 2;
          slabMap[rate].tax += lineTax;
          slabMap[rate].total += (lineTaxable + lineTax);
        });
      } else {
        // Fallback for bills without item breakdown
        const tax = Number(inv.totalTax || 0);
        const sub = Number(inv.subtotal || 0);
        slabMap[18].taxable += sub;
        slabMap[18].cgst += tax / 2;
        slabMap[18].sgst += tax / 2;
        slabMap[18].tax += tax;
        slabMap[18].total += (sub + tax);
      }
    }
  });

  const slabRows = Object.keys(slabMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map((rate) => {
      const s = slabMap[rate];
      return {
        'Tax Rate Slab': `${rate}%`,
        'CGST Rate': `${rate / 2}%`,
        'SGST Rate': `${rate / 2}%`,
        'IGST Rate': `${rate}%`,
        'Total Taxable Value (₹)': Number(s.taxable.toFixed(2)),
        'CGST Amount (₹)': Number(s.cgst.toFixed(2)),
        'SGST Amount (₹)': Number(s.sgst.toFixed(2)),
        'IGST Amount (₹)': Number(s.igst.toFixed(2)),
        'Total Tax Collected (₹)': Number(s.tax.toFixed(2)),
        'Gross Value (₹)': Number(s.total.toFixed(2))
      };
    });

  const slabSheet = XLSX.utils.json_to_sheet(slabRows);
  slabSheet['!cols'] = [
    { wch: 15 }, // Slab
    { wch: 12 }, // CGST %
    { wch: 12 }, // SGST %
    { wch: 12 }, // IGST %
    { wch: 22 }, // Taxable
    { wch: 16 }, // CGST
    { wch: 16 }, // SGST
    { wch: 16 }, // IGST
    { wch: 22 }, // Total Tax
    { wch: 20 }  // Gross
  ];
  XLSX.utils.book_append_sheet(workbook, slabSheet, 'Tax_Slab_Summary');

  // Trigger File Download
  const cleanFileName = `Sri_Mahaganapathy_GST_Report_${periodTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, cleanFileName);
};
