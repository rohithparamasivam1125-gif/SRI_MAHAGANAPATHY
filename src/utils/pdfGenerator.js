import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatCurrency, formatDate, toTitleCase } from './formatters';
import { paginateBillItems } from './billPaginator';
import { PRINT_TRANSLATIONS } from './printTranslations';

// Number to Words Converter for Indian Rupee
export const numberToWordsINR = (num) => {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    let str = '';
    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const hundred = Math.floor(n / 100);
    n %= 100;

    if (crore > 0) str += inWords(crore) + 'Crore ';
    if (lakh > 0) str += inWords(lakh) + 'Lakh ';
    if (thousand > 0) str += inWords(thousand) + 'Thousand ';
    if (hundred > 0) str += a[hundred] + 'Hundred ';
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) str += a[n];
      else str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    }
    return str;
  };

  const val = Math.round(Number(num) || 0);
  if (val === 0) return 'Zero Rupees Only';
  return (inWords(val).trim() + ' Rupees Only').replace(/\s+/g, ' ');
};

/**
 * Builds HTML for a single page of an invoice or quotation,
 * matching the EXACT styling, fonts, borders, and layout of the print preview.
 */
const buildPageHtml = ({
  data,
  type,
  shop,
  t,
  pageObj,
  docNumber,
  customerName,
  customerPhone,
  customerGstin,
  siteLocation,
  isInvoice,
  isGst,
  showDiscount,
  subtotal,
  totalTax,
  discountAmount,
  discountOverall,
  roundOff,
  grandTotal,
  paymentMode
}) => {
  const { pageNumber, totalPages, isFirstPage, isLastPage, items, startIndex } = pageObj;

  return `
    <div style="width: 794px; min-height: 1120px; background: #ffffff; color: #000000; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; line-height: 1.35; padding: 24px 28px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
      
      <div style="flex: 1; display: flex; flex-direction: column;">
        <!-- ==================== HEADER ==================== -->
        ${isFirstPage ? `
          <!-- FULL BRANDING HEADER (PAGE 1) -->
          <div style="border-bottom: 2px solid #000000; padding-bottom: 8px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
              
              <!-- Left: Logo & Shop Details -->
              <div style="display: flex; align-items: flex-start; gap: 12px; flex: 1;">
                <img src="/smg-logo-transparent.png" alt="SMG" style="width: 48px; height: 48px; object-fit: contain; margin-top: 2px;" onerror="this.style.display='none'" />
                <div>
                  <h1 style="margin: 0; font-size: 15px; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: -0.3px; line-height: 1.15;">
                    ${shop.shopName}
                  </h1>
                  <p style="margin: 2px 0 0 0; font-size: 9.5px; font-weight: 700; color: #000000;">
                    ${shop.tagline}
                  </p>
                  <p style="margin: 2px 0 0 0; font-size: 9.5px; color: #000000;">
                    📍 ${shop.address}
                  </p>
                  <div style="margin-top: 2px; font-size: 9.5px; font-weight: bold; color: #000000; display: flex; flex-wrap: wrap; gap: 12px;">
                    <span>📞 ${shop.phone}</span>
                    ${shop.gstin ? `<span>GSTIN: <strong style="font-family: monospace;">${shop.gstin}</strong></span>` : ''}
                  </div>
                </div>
              </div>

              <!-- Right: Doc Badge, Number & Date -->
              <div style="text-align: right; min-width: 170px; shrink: 0;">
                <div style="display: inline-block; background: #000000; color: #ffffff; padding: 2px 8px; border-radius: 3px; font-size: 9.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${isInvoice ? (isGst ? t.taxInvoice : t.cashBill) : t.quotationTitle}
                </div>
                <div style="font-size: 9.5px; margin-top: 4px; font-weight: bold; color: #000000; line-height: 1.35;">
                  <div>
                    <span style="font-weight: normal; color: #334155;">${isInvoice ? t.invoiceNo : t.quoteNo}</span>
                    <strong style="font-family: monospace; font-size: 11px; color: #000000;">${docNumber}</strong>
                  </div>
                  <div>
                    <span style="font-weight: normal; color: #334155;">${t.date}</span> ${formatDate(data.date)}
                  </div>
                  ${isInvoice ? `
                    <div><span style="font-weight: normal; color: #334155;">${t.mode}</span> ${paymentMode?.toUpperCase() || 'CASH'}</div>
                  ` : (data.validUntil ? `
                    <div><span style="font-weight: normal; color: #334155;">${t.validTill}</span> ${formatDate(data.validUntil)}</div>
                  ` : '')}
                </div>
              </div>

            </div>

            <!-- Customer Details Row -->
            <div style="margin-top: 6px; padding-top: 5px; border-top: 1px dashed rgba(0,0,0,0.4); display: flex; justify-content: space-between; align-items: center; font-size: 10px;">
              <div>
                <span style="color: #475569;">${isInvoice ? t.billedTo : t.client} </span>
                <strong style="font-weight: 900; color: #000000; font-size: 11px;">${toTitleCase(customerName || '')}</strong>
                ${customerPhone ? `<span style="margin-left: 6px; font-family: monospace; font-weight: bold;">(${customerPhone})</span>` : ''}
                ${customerGstin ? `
                  <span style="margin-left: 8px; font-family: monospace; font-size: 9px; font-weight: bold; background: #f1f5f9; padding: 2px 5px; border-radius: 3px; border: 1px solid rgba(0,0,0,0.2);">
                    GSTIN: <strong>${customerGstin}</strong>
                  </span>
                ` : ''}
              </div>

              ${siteLocation ? `
                <div style="text-align: right; font-size: 9.5px;">
                  <span style="color: #475569;">${t.site} </span>
                  <strong>${toTitleCase(siteLocation || '')}</strong>
                </div>
              ` : ''}
            </div>

          </div>
        ` : `
          <!-- MINI HEADER (PAGES 2+) -->
          <div style="border-bottom: 1.5px solid #000000; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong style="font-size: 11px; text-transform: uppercase; letter-spacing: -0.2px;">${shop.shopName}</strong>
              <span style="color: #64748b;">•</span>
              <span style="font-family: monospace; font-weight: bold; color: #000000;">${isInvoice ? 'Invoice' : 'Quotation'} #${docNumber}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span>${isInvoice ? t.billedTo : t.client} <strong style="color: #000000;">${toTitleCase(customerName || '')}</strong></span>
              <span style="font-weight: 800; color: #000000; font-size: 9.5px; border: 1px solid #000000; padding: 2px 8px; border-radius: 4px; background: #f8fafc;">
                Page ${pageNumber} of ${totalPages}
              </span>
            </div>
          </div>
        `}

        <!-- ==================== ITEMS TABLE ==================== -->
        <div style="border: 1px solid #000000; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 10px;">
            <thead>
              <tr style="background: #000000; color: #ffffff; font-weight: bold; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px;">
                <th style="padding: 5px 6px; width: 26px; text-align: center; border-right: 1px solid #334155;">${t.sNo}</th>
                <th style="padding: 5px 8px; width: 105px; border-right: 1px solid #334155;">${t.sizeSpec}</th>
                <th style="padding: 5px 8px; border-right: 1px solid #334155;">${t.description}</th>
                <th style="padding: 5px 6px; width: 44px; text-align: center; border-right: 1px solid #334155;">${t.qty}</th>
                <th style="padding: 5px 6px; width: 42px; text-align: center; border-right: 1px solid #334155;">${t.unit}</th>
                <th style="padding: 5px 6px; width: 62px; text-align: right; border-right: 1px solid #334155;">${t.rate}</th>
                ${(isInvoice && showDiscount) ? `<th style="padding: 5px 6px; width: 42px; text-align: right; border-right: 1px solid #334155;">${t.discount || 'Disc'}</th>` : ''}
                ${isGst ? `<th style="padding: 5px 6px; width: 42px; text-align: right; border-right: 1px solid #334155;">${t.gst}</th>` : ''}
                <th style="padding: 5px 8px; width: 75px; text-align: right;">${t.amount}</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, localIdx) => {
                const globalIndex = startIndex + localIdx + 1;
                const qty = Number(item.qty) || 1;
                const price = Number(item.price) || 0;
                const lineTotal = item.lineTotal !== undefined ? Number(item.lineTotal) : (price * qty);
                const gstRate = item.gstRate !== undefined ? item.gstRate : 18;
                const bg = localIdx % 2 === 1 ? '#f8fafc' : '#ffffff';

                return `
                  <tr style="background: ${bg}; border-bottom: 1px solid rgba(0,0,0,0.15);">
                    <td style="padding: 4px 6px; text-align: center; font-family: monospace; font-weight: bold; border-right: 1px solid rgba(0,0,0,0.15); color: #334155;">
                      ${globalIndex}
                    </td>
                    <td style="padding: 4px 8px; font-weight: 900; color: #000000; border-right: 1px solid rgba(0,0,0,0.15); line-height: 1.2;">
                      ${item.size || '-'}
                    </td>
                    <td style="padding: 4px 8px; border-right: 1px solid rgba(0,0,0,0.15);">
                      <div style="font-weight: 900; color: #000000; line-height: 1.2;">${toTitleCase(item.name || 'Item')}</div>
                      ${item.brand ? `
                        <div style="font-size: 8px; color: #475569; font-weight: 600; margin-top: 1px;">
                          Brand: ${toTitleCase(item.brand)}
                        </div>
                      ` : ''}
                    </td>
                    <td style="padding: 4px 6px; text-align: center; font-family: monospace; font-weight: bold; color: #000000; border-right: 1px solid rgba(0,0,0,0.15);">
                      ${qty}
                    </td>
                    <td style="padding: 4px 6px; text-align: center; font-family: monospace; color: #334155; border-right: 1px solid rgba(0,0,0,0.15);">
                      ${item.unit || 'Pcs'}
                    </td>
                    <td style="padding: 4px 6px; text-align: right; font-family: monospace; font-weight: 600; color: #000000; border-right: 1px solid rgba(0,0,0,0.15);">
                      ${price.toFixed(2)}
                    </td>
                    ${(isInvoice && showDiscount) ? `
                      <td style="padding: 4px 6px; text-align: right; font-family: monospace; color: #334155; border-right: 1px solid rgba(0,0,0,0.15);">
                        ${item.discountPercent ? `${item.discountPercent}%` : '-'}
                      </td>
                    ` : ''}
                    ${isGst ? `
                      <td style="padding: 4px 6px; text-align: right; font-family: monospace; color: #334155; border-right: 1px solid rgba(0,0,0,0.15);">
                        ${gstRate}%
                      </td>
                    ` : ''}
                    <td style="padding: 4px 8px; text-align: right; font-family: monospace; font-weight: 900; color: #000000;">
                      ${lineTotal.toFixed(2)}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- ==================== TOTALS & TERMS (LAST PAGE ONLY) ==================== -->
        ${isLastPage ? `
          <div style="border: 1px solid #000000; border-radius: 4px; padding: 10px 14px; background: #ffffff; margin-top: auto;">
            
            <div style="display: flex; justify-content: space-between; gap: 16px;">
              
              <!-- Left: Terms & UPI -->
              <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; font-size: 9.5px;">
                <div>
                  <div style="font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; font-size: 9.5px; color: #000000; margin-bottom: 3px;">
                    ${isInvoice ? t.termsHeader : t.quotationTermsHeader}
                  </div>
                  <ul style="margin: 0; padding-left: 14px; color: #000000; font-size: 8.5px; line-height: 1.35;">
                    ${(isInvoice ? t.billTerms : (typeof t.quotationTerms === 'function' ? t.quotationTerms(data.validityDays || 15) : t.quotationTerms)).map(term => `
                      <li>${term}</li>
                    `).join('')}
                  </ul>
                </div>

                ${shop.upiId ? `
                  <div style="margin-top: 8px; padding-top: 5px; border-top: 1px dashed rgba(0,0,0,0.3); font-size: 9.5px; font-weight: bold; color: #000000;">
                    <span>${t.upiId} </span>
                    <strong style="font-family: monospace; font-size: 10.5px; color: #000000;">${shop.upiId}</strong>
                  </div>
                ` : ''}
              </div>

              <!-- Right: Totals Box -->
              <div style="width: 240px; border-left: 1px solid #000000; padding-left: 14px; font-size: 10.5px; font-weight: bold;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                  <span style="font-weight: normal; color: #334155;">${isGst ? (t.taxableAmount || 'Taxable Value:') : t.subtotal}</span>
                  <span style="font-family: monospace;">${formatCurrency(showDiscount ? subtotal : (subtotal - discountAmount))}</span>
                </div>

                ${isGst && totalTax > 0 ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                    <span style="font-weight: normal; color: #334155;">${t.cgstTax || 'CGST:'}</span>
                    <span style="font-family: monospace;">${formatCurrency(data.cgstAmount ?? (totalTax / 2))}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                    <span style="font-weight: normal; color: #334155;">${t.sgstTax || 'SGST:'}</span>
                    <span style="font-family: monospace;">${formatCurrency(data.sgstAmount ?? (totalTax / 2))}</span>
                  </div>
                ` : ''}

                ${showDiscount && discountAmount > 0 ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 3px; color: #16a34a;">
                    <span>${t.discountAmount} (${discountOverall}%):</span>
                    <span style="font-family: monospace;">- ${formatCurrency(discountAmount)}</span>
                  </div>
                ` : ''}

                ${roundOff !== 0 ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 9.5px; color: #475569;">
                    <span style="font-weight: normal;">${t.roundOff}</span>
                    <span style="font-family: monospace;">${roundOff > 0 ? `+₹${roundOff}` : `-₹${Math.abs(roundOff)}`}</span>
                  </div>
                ` : ''}

                <!-- GRAND TOTAL HIGHLIGHT -->
                <div style="margin-top: 6px; padding: 5px 8px; background: #000000; color: #ffffff; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 10px; font-weight: 900; text-transform: uppercase;">${isInvoice ? t.grandTotal : t.grandTotal}</span>
                  <span style="font-size: 13px; font-weight: 900; font-family: monospace;">${formatCurrency(grandTotal)}</span>
                </div>
              </div>

            </div>

            <!-- Signatory & Thank You Row -->
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #000000; display: flex; justify-content: space-between; align-items: flex-end; font-size: 9.5px;">
              <div style="font-weight: 600; color: #000000;">
                ${t.thankYou}
              </div>
              <div style="text-align: center; min-width: 170px;">
                <p style="margin: 0 0 16px 0; font-size: 8.5px; font-weight: bold; text-transform: uppercase; color: #000000;">
                  ${t.forShop(shop.shopName)}
                </p>
                <div style="border-top: 1px solid #000000; padding-top: 2px;">
                  <span style="font-weight: 900; font-size: 9px; color: #000000;">${t.authorizedSignatory}</span>
                </div>
              </div>
            </div>

          </div>
        ` : ''}

      </div>

      <!-- ==================== PAGE FOOTER ==================== -->
      <div style="border-top: 1px solid rgba(0,0,0,0.2); padding-top: 4px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; color: #475569;">
        <span>${shop.shopName} • ${docNumber}</span>
        <span style="font-weight: bold; color: #000000;">Page ${pageNumber} of ${totalPages}</span>
      </div>

    </div>
  `;
};

/**
 * Main PDF generator function supporting exact multi-page A4 rendering
 * identical to the browser print preview.
 */
export const generatePdfFromData = async (data, type = 'invoice', shopSettings = {}, printLanguage = 'en') => {
  const isInvoice = type === 'invoice';
  const t = PRINT_TRANSLATIONS[printLanguage] || PRINT_TRANSLATIONS.en;

  // Merge shop details
  const shop = {
    shopName: shopSettings.shopName || data.shopDetails?.name || 'Sri Mahaganapathy Electricals and Hardware',
    tagline: shopSettings.tagline || data.shopDetails?.tagline || 'Wholesale & Retail Electricals, Hardware Solutions',
    address: shopSettings.address || data.shopDetails?.address || '1/110, Kaliamman Kovil Back Side, Maniyanur',
    phone: shopSettings.phone || data.shopDetails?.phone || '+91 90876 83308',
    email: shopSettings.email || data.shopDetails?.email || 'srimahaganapathy.stores@gmail.com',
    gstin: shopSettings.gstin || data.shopDetails?.gstin || '33AAAAA0000A1Z5',
    upiId: shopSettings.upiId || '9087683308@upi'
  };

  const docNumber = isInvoice 
    ? (data.invoiceNumber || 'INV-DRAFT')
    : (data.quotationNumber || 'QUO-DRAFT');

  const customerName = data.customerName || (isInvoice ? 'Walk-in Customer' : 'Prospective Client');
  const customerPhone = data.customerPhone || '';
  const customerGstin = data.customerGstin || '';
  const siteLocation = data.siteLocation || '';
  const items = Array.isArray(data.items) ? data.items : [];

  // Totals calculations
  const subtotal = Number(data.subtotal) || 0;
  const totalTax = Number(data.totalTax) || 0;
  const discountAmount = Number(data.discountAmount) || 0;
  const discountOverall = Number(data.discountOverall) || 0;
  const roundOff = Number(data.roundOff) || 0;
  const grandTotal = Number(data.grandTotal) || Math.round(subtotal + totalTax - discountAmount);
  const paymentMode = data.paymentMode || 'Cash';
  const isGst = isInvoice ? (data.isGstBill !== false) : (data.isGstEstimate !== false);

  // Paginate items into exact page chunks
  const pages = paginateBillItems(items);

  // Initialize jsPDF A4 portrait
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Create staging container off-screen
  const stage = document.createElement('div');
  stage.style.position = 'fixed';
  stage.style.top = '-99999px';
  stage.style.left = '-99999px';
  stage.style.zIndex = '-9999';
  document.body.appendChild(stage);

  try {
    for (let i = 0; i < pages.length; i++) {
      const pageObj = pages[i];
      stage.innerHTML = buildPageHtml({
        data,
        type,
        shop,
        t,
        pageObj,
        docNumber,
        customerName,
        customerPhone,
        customerGstin,
        siteLocation,
        isInvoice,
        isGst,
        showDiscount: data.showDiscount !== false,
        subtotal,
        totalTax,
        discountAmount,
        discountOverall,
        roundOff,
        grandTotal,
        paymentMode
      });

      const pageEl = stage.firstElementChild;

      // Capture page at 2x high resolution
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Add page to PDF
      if (i > 0) {
        pdf.addPage();
      }

      // Add image filling A4 sheet with 4mm border margins
      pdf.addImage(imgData, 'JPEG', 4, 4, pdfWidth - 8, pdfHeight - 8);
    }

    const cleanNumber = docNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${isInvoice ? 'Invoice' : 'Quotation'}_${cleanNumber}.pdf`;

    const blob = pdf.output('blob');
    const file = new File([blob], filename, { type: 'application/pdf' });

    return { pdf, blob, file, filename, grandTotal, docNumber, customerName, totalPages: pages.length };
  } finally {
    if (document.body.contains(stage)) {
      document.body.removeChild(stage);
    }
  }
};
