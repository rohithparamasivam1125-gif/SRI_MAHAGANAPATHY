import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

const outputPath = path.resolve('e:/SRI_MAHAGANAPATHY', 'Electrical_and_Hardware_POS_Benefits_and_Usage.pdf');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

const pageWidth = 210;
const pageHeight = 297;
const margin = 14;
const contentWidth = pageWidth - margin * 2;

// Color Palette
const COLORS = {
  primary: [26, 54, 93],       // #1A365D Dark Navy
  primaryLight: [43, 108, 176],// #2B6CB0 Blue
  accent: [13, 148, 136],      // #0D9488 Teal
  accentBg: [240, 253, 250],   // #F0FDFA Teal Light
  dark: [15, 23, 42],          // #0F172A Slate 900
  body: [51, 65, 85],          // #334155 Slate 700
  muted: [100, 116, 139],      // #64748B Slate 500
  lightBg: [248, 250, 252],    // #F8FAFC Slate 50
  cardBorder: [226, 232, 240], // #E2E8F0 Slate 200
  emerald: [5, 150, 105],      // #059669 Green
  emeraldBg: [236, 253, 245],  // #ECFDF5 Green Light
  white: [255, 255, 255],
  gold: [217, 119, 6]          // #D97706 Amber
};

// Helper: Page Header
function renderPageHeader(doc, pageNum, totalPages, titleCategory) {
  // Top thin accent bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 5, 'F');
  
  doc.setFillColor(...COLORS.accent);
  doc.rect(pageWidth - 50, 0, 50, 5, 'F');

  // Header banner info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.primary);
  doc.text('ELECTRICAL & HARDWARE POS', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text(`|  ${titleCategory}`, margin + 52, 11);

  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, 11, { align: 'right' });

  // Divider line
  doc.setDrawColor(...COLORS.cardBorder);
  doc.setLineWidth(0.3);
  doc.line(margin, 13.5, pageWidth - margin, 13.5);
}

// Helper: Page Footer
function renderPageFooter(doc, pageNum, totalPages) {
  const y = pageHeight - 9;
  doc.setDrawColor(...COLORS.cardBorder);
  doc.setLineWidth(0.3);
  doc.line(margin, y - 2, pageWidth - margin, y - 2);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text('Electrical & Hardware POS - Complete Product Guide, Usage & End-User Benefits', margin, y + 2);

  doc.setFont('helvetica', 'normal');
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, y + 2, { align: 'right' });
}

// Helper: Section Title
function renderSectionHeading(doc, y, title, subtitle) {
  doc.setFillColor(...COLORS.primary);
  doc.rect(margin, y, 3, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.primary);
  doc.text(title, margin + 6, y + 5);

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(subtitle, margin + 6, y + 9.5);
    return y + 13;
  }
  return y + 11;
}

// Helper: Card Box
function drawCard(doc, x, y, width, height, bgColor = COLORS.lightBg, borderColor = COLORS.cardBorder, radius = 2) {
  doc.setFillColor(...bgColor);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, radius, radius, 'FD');
}

// =========================================================================
// PAGE 1: PRODUCT OVERVIEW & CORE VALUE PROPOSITION
// =========================================================================
renderPageHeader(doc, 1, 4, 'Product Overview & Value Proposition');

// Hero Banner
let curY = 17;
drawCard(doc, margin, curY, contentWidth, 38, COLORS.primary, COLORS.primary, 3);

// Decorative subtle highlight
doc.setFillColor(...COLORS.primaryLight);
doc.roundedRect(margin + 2, curY + 2, 4, 34, 1.5, 1.5, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(18);
doc.setTextColor(...COLORS.white);
doc.text('Electrical & Hardware POS', margin + 10, curY + 11);

doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(220, 240, 255);
doc.text('Smart Cloud Billing, Inventory & Business Management System', margin + 10, curY + 18);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(203, 213, 225);
const heroDesc = 'A purpose-built, high-speed Point of Sale and ERP software engineered specifically for retail and wholesale Electrical, Hardware, Plumbing, and Sanitaryware businesses. Simplifies counter sales, prevents stock loss, and accelerates cash flow.';
const splitHeroDesc = doc.splitTextToSize(heroDesc, contentWidth - 16);
doc.text(splitHeroDesc, margin + 10, curY + 25);

curY += 42;

// Section: Who Is It Built For?
curY = renderSectionHeading(doc, curY, '1. Target Industries & Shop Types', 'Engineered to handle complex multi-variant hardware and electrical items out-of-the-box');

const targetCols = [
  { title: 'Electrical Retail & Wholesale', desc: 'Wires, switches, MCBs, lighting, conduits, fans, cables & electrical fittings with meter/roll units.' },
  { title: 'Hardware & Tools Stores', desc: 'Power tools, fasteners, screws, bolts, paints, building materials, abrasives & hand tools.' },
  { title: 'Plumbing & Sanitaryware', desc: 'PVC / CPVC / UPVC pipes, multi-size fittings, taps, valves, water tanks & sanitary accessories.' },
  { title: 'Multi-Category Traders', desc: 'Hybrid stores managing both retail walk-ins and contractor wholesale bulk orders on credit.' }
];

const cardW = (contentWidth - 6) / 2;
const cardH = 21;

targetCols.forEach((col, idx) => {
  const colX = margin + (idx % 2) * (cardW + 6);
  const rowY = curY + Math.floor(idx / 2) * (cardH + 4);
  drawCard(doc, colX, rowY, cardW, cardH, COLORS.lightBg, COLORS.cardBorder, 2);

  // Left accent dot
  doc.setFillColor(...COLORS.accent);
  doc.circle(colX + 4.5, rowY + 5.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.dark);
  doc.text(col.title, colX + 8.5, rowY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.body);
  const textLines = doc.splitTextToSize(col.desc, cardW - 12);
  doc.text(textLines, colX + 8.5, rowY + 11.5);
});

curY += (cardH * 2) + 11;

// Section: The Core Business Problems Solved (Comparison Table)
curY = renderSectionHeading(doc, curY, '2. Overcoming Traditional Shop Challenges', 'Direct comparison: Manual Paper Billing vs. Electrical & Hardware POS System');

// Table Headers
const tableY = curY;
const col1W = 44;
const col2W = 67;
const col3W = contentWidth - col1W - col2W;

doc.setFillColor(...COLORS.primary);
doc.rect(margin, tableY, contentWidth, 7, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...COLORS.white);
doc.text('Operational Area', margin + 3, tableY + 4.8);
doc.text('Traditional Manual Bill Book / Generic Method', margin + col1W + 3, tableY + 4.8);
doc.text('Electrical & Hardware POS Solution', margin + col1W + col2W + 3, tableY + 4.8);

const rows = [
  {
    area: 'Billing Speed & Checkout',
    manual: 'Slow manual handwriting; customer waits 5-10 mins per bill during rush hours.',
    solution: '3-second instant product search, auto-rates, barcode lookup, instant thermal/A4 print.'
  },
  {
    area: 'Pricing & Size Variations',
    manual: 'Staff confused by hundreds of pipe & wire sizes (e.g. 20mm, 25mm, Class 1-3).',
    solution: 'Pre-loaded multi-variant catalog with pre-set wholesale & retail price lists.'
  },
  {
    area: 'Calculation Errors',
    manual: 'Handwritten math mistakes in totals, manual discounts, and tax percentages.',
    solution: '100% automated calculations, line item discounts, auto-round-off, and zero error.'
  },
  {
    area: 'Payment Collections',
    manual: 'Manual tracking of cash; uncollected credit balances slip through the cracks.',
    solution: 'Dynamic UPI QR on bills for instant scan & pay; transparent customer credit records.'
  },
  {
    area: 'GST & Tax Accounting',
    manual: 'Messy bill books handed to CA at month end; severe delay in filing returns.',
    solution: '1-Click GSTR-1, GSTR-3B, HSN-wise tax reports ready for immediate CA submission.'
  },
  {
    area: 'Internet Dependencies',
    manual: 'Traditional cloud apps stop working entirely during network outages.',
    solution: 'Hybrid offline resilience: works offline seamlessly and auto-syncs when online.'
  }
];

let rY = tableY + 7;
rows.forEach((r, idx) => {
  const rowBg = idx % 2 === 0 ? COLORS.lightBg : COLORS.white;
  doc.setFillColor(...rowBg);
  doc.rect(margin, rY, contentWidth, 11, 'F');
  doc.setDrawColor(...COLORS.cardBorder);
  doc.setLineWidth(0.2);
  doc.rect(margin, rY, contentWidth, 11, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.dark);
  doc.text(doc.splitTextToSize(r.area, col1W - 5), margin + 2.5, rY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(180, 50, 50); // Muted red for pain
  doc.text(doc.splitTextToSize(r.manual, col2W - 5), margin + col1W + 2.5, rY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(5, 120, 80); // Muted green for solution
  doc.text(doc.splitTextToSize(r.solution, col3W - 5), margin + col1W + col2W + 2.5, rY + 4);

  rY += 11;
});

renderPageFooter(doc, 1, 4);

// =========================================================================
// PAGE 2: COMPREHENSIVE MODULE & USAGE BREAKDOWN (PART 1)
// =========================================================================
doc.addPage();
renderPageHeader(doc, 2, 4, 'Core Features & Module Usage (Part 1)');

curY = 17;
curY = renderSectionHeading(doc, curY, '3. Core System Modules & How They Work', 'In-depth breakdown of features designed for everyday hardware store operations');

// Feature 1: Fast Point of Sale & Invoicing
drawCard(doc, margin, curY, contentWidth, 54, COLORS.white, COLORS.cardBorder, 2.5);

// Header Pill
doc.setFillColor(...COLORS.primaryLight);
doc.roundedRect(margin + 4, curY + 4, 34, 5.5, 1, 1, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.white);
doc.text('MODULE 01', margin + 8, curY + 8);

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...COLORS.primary);
doc.text('High-Speed POS & Billing Engine', margin + 42, curY + 8);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.body);
doc.text('Designed for high counter traffic with lightning-fast search, item additions, and multi-format printing.', margin + 4, curY + 14);

const posFeatures = [
  { label: 'GST & Non-GST Modes', desc: 'Toggle between formal GST Tax Invoices and Non-GST / Estimate bills in a single click.' },
  { label: 'Dual Printing Modes', desc: 'Supports both standard A4 multi-page invoices and ultra-fast 2-inch / 3-inch Thermal POS receipts.' },
  { label: 'Bilingual Receipts (Tamil + English)', desc: 'Prints item names, terms, and headers in both English and Tamil for regional clarity.' },
  { label: 'Dynamic UPI QR Code on Bill', desc: 'Generates real-time UPI QR code (GPay, PhonePe, Paytm) matching exact bill total for instant tap & pay.' },
  { label: '1-Click WhatsApp Invoice Dispatch', desc: 'Directly sends formatted PDF/digital bills to customer WhatsApp without saving numbers.' },
  { label: 'Flexible Discounts & Round-Off', desc: 'Apply item-wise percentage/fixed discounts or overall bill concessions with automated rupee round-off.' }
];

let posGridY = curY + 18;
posFeatures.forEach((feat, i) => {
  const fX = margin + (i % 2) * (cardW + 6);
  const fY = posGridY + Math.floor(i / 2) * 11;

  doc.setFillColor(...COLORS.emerald);
  doc.circle(fX + 3, fY + 2.5, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.dark);
  doc.text(feat.label + ': ', fX + 6, fY + 3.2);

  const labelWidth = doc.getTextWidth(feat.label + ': ');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...COLORS.body);
  const descLines = doc.splitTextToSize(feat.desc, cardW - 8 - labelWidth);
  doc.text(descLines, fX + 6 + labelWidth, fY + 3.2);
});

curY += 58;

// Feature 2: Quotations & Pro-forma Estimates
drawCard(doc, margin, curY, contentWidth, 38, COLORS.white, COLORS.cardBorder, 2.5);

doc.setFillColor(...COLORS.accent);
doc.roundedRect(margin + 4, curY + 4, 34, 5.5, 1, 1, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.white);
doc.text('MODULE 02', margin + 8, curY + 8);

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...COLORS.primary);
doc.text('Quotations & Contractor Estimates', margin + 42, curY + 8);

const quotePoints = [
  { title: 'Contractor & Site Estimates', text: 'Generate detailed itemized quotes with custom site location, client GSTIN, and validity periods.' },
  { title: '1-Click Invoice Conversion', text: 'Instantly convert approved quotations into live billing invoices without re-entering a single item.' },
  { title: 'WhatsApp & PDF Export', text: 'Share clean, branded PDF estimates with builders and electricians immediately upon request.' },
  { title: 'Quotation Sequence & Tracking', text: 'Maintains independent sequence numbering (QUO-) and historical quotation repository.' }
];

let quoteGridY = curY + 15;
quotePoints.forEach((qp, i) => {
  const qX = margin + (i % 2) * (cardW + 6);
  const qY = quoteGridY + Math.floor(i / 2) * 10.5;

  doc.setFillColor(...COLORS.primaryLight);
  doc.circle(qX + 3, qY + 2.5, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.dark);
  doc.text(qp.title + ' - ', qX + 6, qY + 3.2);

  const tw = doc.getTextWidth(qp.title + ' - ');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...COLORS.body);
  doc.text(doc.splitTextToSize(qp.text, cardW - 8 - tw), qX + 6 + tw, qY + 3.2);
});

curY += 42;

// Feature 3: Hardware & Electrical Catalog Management
drawCard(doc, margin, curY, contentWidth, 48, COLORS.white, COLORS.cardBorder, 2.5);

doc.setFillColor(...COLORS.gold);
doc.roundedRect(margin + 4, curY + 4, 34, 5.5, 1, 1, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.white);
doc.text('MODULE 03', margin + 8, curY + 8);

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...COLORS.primary);
doc.text('Pre-Loaded Catalog & Inventory Master', margin + 42, curY + 8);

const catPoints = [
  { title: 'Pre-Configured Item Database', text: 'Comes ready with hardware, pipes (Leo Plast, ISI), electrical wires, fittings, switches, and valves.' },
  { title: 'Multi-Size Variant Engine', text: 'Handles 10+ size variants per product (e.g. 20mm, 25mm, 32mm, 40mm) under a single master card.' },
  { title: 'Bulk Excel Import & Export', text: 'Upload entire supplier price lists via Excel in seconds. Export inventory for stock auditing.' },
  { title: 'Low-Stock Radar & Alerts', text: 'Automated warnings when high-velocity items drop below threshold (< 15 units) to avoid stockouts.' },
  { title: 'Catalog Deduplication Tool', text: 'Built-in intelligent cleaner removes duplicate entries and merges variant pricing automatically.' },
  { title: 'Unit Flexibility', text: 'Full support for Numbers (Nos), Meters (Mtr), Bundles, Boxes, Kilograms (Kg), and Sets.' }
];

let catGridY = curY + 15;
catPoints.forEach((cp, i) => {
  const cX = margin + (i % 2) * (cardW + 6);
  const cY = catGridY + Math.floor(i / 2) * 10.5;

  doc.setFillColor(...COLORS.gold);
  doc.circle(cX + 3, cY + 2.5, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.dark);
  doc.text(cp.title + ' - ', cX + 6, cY + 3.2);

  const ctw = doc.getTextWidth(cp.title + ' - ');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...COLORS.body);
  doc.text(doc.splitTextToSize(cp.text, cardW - 8 - ctw), cX + 6 + ctw, cY + 3.2);
});

curY += 52;

// Bottom Highlight Banner
drawCard(doc, margin, curY, contentWidth, 14, COLORS.accentBg, COLORS.accent, 2);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.2);
doc.setTextColor(...COLORS.accent);
doc.text('ZERO LEARNING CURVE:', margin + 4, curY + 5.5);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.dark);
doc.text('Any shop assistant or cashier can master complete billing in less than 10 minutes without accounting knowledge.', margin + 4, curY + 10);

renderPageFooter(doc, 2, 4);

// =========================================================================
// PAGE 3: ADVANCED MODULES & BUSINESS OPERATIONS (PART 2)
// =========================================================================
doc.addPage();
renderPageHeader(doc, 3, 4, 'Core Features & Module Usage (Part 2)');

curY = 17;
curY = renderSectionHeading(doc, curY, '4. Intelligence, Compliance & Mobility', 'Real-time analytics, tax compliance, and mobile operations for shop owners');

// Feature 4: Real-time Analytics & Dashboard
drawCard(doc, margin, curY, contentWidth, 44, COLORS.white, COLORS.cardBorder, 2.5);

doc.setFillColor(...COLORS.primary);
doc.roundedRect(margin + 4, curY + 4, 34, 5.5, 1, 1, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.white);
doc.text('MODULE 04', margin + 8, curY + 8);

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...COLORS.primary);
doc.text('360° Real-Time Business Dashboard', margin + 42, curY + 8);

const dashPoints = [
  { title: 'Live Revenue & Profit Tracking', desc: 'Instant visibility into daily, weekly, and monthly sales turnover and estimated gross margins.' },
  { title: 'Category Sales Distribution', desc: 'Visual percentage split between Electrical vs. Plumbing vs. Hardware product revenue.' },
  { title: 'Top-Selling Items Ranking', desc: 'Identifies top 5 fast-moving items to ensure optimal capital allocation and bulk purchasing.' },
  { title: 'Payment Channel Breakdown', desc: 'Detailed split across Cash, UPI (GPay/PhonePe), and Credit ledger transactions.' }
];

let dashGridY = curY + 15;
dashPoints.forEach((dp, i) => {
  const dX = margin + (i % 2) * (cardW + 6);
  const dY = dashGridY + Math.floor(i / 2) * 13;

  drawCard(doc, dX, dY, cardW, 11, COLORS.lightBg, COLORS.cardBorder, 1.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.dark);
  doc.text(dp.title, dX + 3, dY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...COLORS.body);
  doc.text(doc.splitTextToSize(dp.desc, cardW - 6), dX + 3, dY + 8);
});

curY += 48;

// Feature 5: GST & Tax Accounting Reports
drawCard(doc, margin, curY, contentWidth, 44, COLORS.white, COLORS.cardBorder, 2.5);

doc.setFillColor(...COLORS.emerald);
doc.roundedRect(margin + 4, curY + 4, 34, 5.5, 1, 1, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...COLORS.white);
doc.text('MODULE 05', margin + 8, curY + 8);

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(...COLORS.primary);
doc.text('1-Click GST & Tax Compliance Engine', margin + 42, curY + 8);

const gstPoints = [
  { title: 'GSTR-1 Ready Summaries', desc: 'Automated B2B invoices with customer GSTIN, B2C small retail sales, and credit notes.' },
  { title: 'GSTR-3B Tax Liability Breakdown', desc: 'Aggregated figures for Outward Taxable Supplies, Total Taxable Value, CGST, SGST, and IGST.' },
  { title: 'HSN-Wise Sales Breakdown', desc: 'Detailed table of HSN codes with quantity, total value, tax rate, and computed tax liability.' },
  { title: 'Excel & CSV Export for CAs', desc: 'Generates clean spreadsheets ready to send straight to your tax accountant or CA without manual data entry.' }
];

let gstGridY = curY + 15;
gstPoints.forEach((gp, i) => {
  const gX = margin + (i % 2) * (cardW + 6);
  const gY = gstGridY + Math.floor(i / 2) * 13;

  drawCard(doc, gX, gY, cardW, 11, COLORS.emeraldBg, [167, 243, 208], 1.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.emerald);
  doc.text(gp.title, gX + 3, gY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...COLORS.dark);
  doc.text(doc.splitTextToSize(gp.desc, cardW - 6), gX + 3, gY + 8);
});

curY += 48;

// Feature 6 & 7: Mobile Portal & Offline Cloud Sync (Side-by-Side)
const halfW = (contentWidth - 6) / 2;
const halfH = 50;

// Mobile Portal
drawCard(doc, margin, curY, halfW, halfH, COLORS.white, COLORS.cardBorder, 2.5);
doc.setFillColor(...COLORS.primaryLight);
doc.roundedRect(margin + 4, curY + 4, 30, 5, 1, 1, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7);
doc.setTextColor(...COLORS.white);
doc.text('MODULE 06', margin + 7, curY + 7.5);

doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(...COLORS.primary);
doc.text('Mobile Portal (/mobile)', margin + 37, curY + 7.5);

const mobBullets = [
  'Full mobile web app for shop floor staff.',
  'Instant price check and stock lookup while walking aisles with customers.',
  'Create quotes & bills directly on smartphones.',
  'Optimized for touch screens & mobile browsers.'
];
let mobY = curY + 14;
mobBullets.forEach(b => {
  doc.setFillColor(...COLORS.primaryLight);
  doc.circle(margin + 5, mobY + 1.5, 1, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.body);
  doc.text(doc.splitTextToSize(b, halfW - 12), margin + 8, mobY + 2.5);
  mobY += 8;
});

// Offline & Cloud Architecture
const cloudX = margin + halfW + 6;
drawCard(doc, cloudX, curY, halfW, halfH, COLORS.white, COLORS.cardBorder, 2.5);
doc.setFillColor(...COLORS.accent);
doc.roundedRect(cloudX + 4, curY + 4, 30, 5, 1, 1, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7);
doc.setTextColor(...COLORS.white);
doc.text('MODULE 07', cloudX + 7, curY + 7.5);

doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(...COLORS.primary);
doc.text('Cloud Sync & Offline Reliability', cloudX + 37, curY + 7.5);

const cloudBullets = [
  'Built on real-time cloud database architecture.',
  'Offline failover: billing never halts during broadband or 4G disconnects.',
  'Auto-syncs local sales to cloud when reconnected.',
  'Automated daily backup ensures data is never lost.'
];
let cldY = curY + 14;
cloudBullets.forEach(b => {
  doc.setFillColor(...COLORS.accent);
  doc.circle(cloudX + 5, cldY + 1.5, 1, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.body);
  doc.text(doc.splitTextToSize(b, halfW - 12), cloudX + 8, cldY + 2.5);
  cldY += 8;
});

renderPageFooter(doc, 3, 4);

// =========================================================================
// PAGE 4: END-USER AFFORDABILITY & DIRECT CLIENT BENEFITS (ROI)
// =========================================================================
doc.addPage();
renderPageHeader(doc, 4, 4, 'End-User Affordability & Business Benefits');

curY = 17;
curY = renderSectionHeading(doc, curY, '5. End-User Affordability & Direct Business Benefits', 'Tangible financial and operational gains that shop owners receive from Day 1');

// Top Highlight Banner: Affordability Proposition
drawCard(doc, margin, curY, contentWidth, 24, COLORS.emeraldBg, [167, 243, 208], 2.5);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(...COLORS.emerald);
doc.text('100% Hardware-Agnostic & Extremely Affordable', margin + 5, curY + 7);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(...COLORS.dark);
const affordDesc = 'Unlike outdated legacy POS systems that demand expensive proprietary POS terminals, touch cash registers, and annual maintenance contracts, this system runs smoothly on ANY existing desktop PC, laptop, Android tablet, or smartphone with standard printers.';
doc.text(doc.splitTextToSize(affordDesc, contentWidth - 10), margin + 5, curY + 13);

curY += 28;

// 6 Core Value Pillars (Grid of 6 Cards)
const benefitCards = [
  {
    num: '01',
    title: '80% Faster Billing & Queue Elimination',
    tag: 'TIME SAVINGS',
    desc: 'Instant keyword search, pre-set prices, and automated tax calculations reduce checkout time from 5 minutes down to 30 seconds per customer. Zero customer walkaways during evening rush hours.'
  },
  {
    num: '02',
    title: 'Zero Math Mistakes & Revenue Leakage',
    tag: 'FINANCIAL ACCURACY',
    desc: 'Eliminates handwritten pricing miscalculations, incorrect discounts, and missed items. Every rupee is accounted for accurately with automated round-off and item-level price controls.'
  },
  {
    num: '03',
    title: 'Faster Cash Flow & Instant UPI Payments',
    tag: 'CASH FLOW ACCELERATION',
    desc: 'Dynamic UPI QR codes printed directly on customer bills encourage instant digital payments via GPay, PhonePe, and Paytm, significantly slashing delayed customer credits and bad debt.'
  },
  {
    num: '04',
    title: 'Eliminate Stockouts & Dead Inventory',
    tag: 'WORKING CAPITAL OPTIMIZATION',
    desc: 'Real-time stock alerts (<15 units) warn owners before popular pipe sizes or electrical cables run out. Top-selling item analytics ensure you only invest capital in fast-moving inventory.'
  },
  {
    num: '05',
    title: 'Zero-Stress GST Filing & CA Coordination',
    tag: 'COMPLIANCE PEACE OF MIND',
    desc: 'Saves 15+ hours every month of manual bill entry. Export GSTR-1, GSTR-3B, and HSN-wise summaries directly into Excel and send to your CA with zero filing penalties or errors.'
  },
  {
    num: '06',
    title: 'Offline Billing Resilience & Total Security',
    tag: 'BUSINESS CONTINUITY',
    desc: 'Never lose a sale during internet outages. Local caching keeps billing active, automatically syncing to the cloud when connection returns. Complete backup protects against hardware failure.'
  }
];

const bCardW = (contentWidth - 6) / 2;
const bCardH = 34;

benefitCards.forEach((b, idx) => {
  const bX = margin + (idx % 2) * (bCardW + 6);
  const bY = curY + Math.floor(idx / 2) * (bCardH + 4);

  drawCard(doc, bX, bY, bCardW, bCardH, COLORS.white, COLORS.cardBorder, 2);

  // Number Badge
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(bX + 3, bY + 3.5, 8, 5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLORS.white);
  doc.text(b.num, bX + 5, bY + 7);

  // Tag Badge
  doc.setFillColor(...COLORS.lightBg);
  doc.roundedRect(bX + 13, bY + 3.5, bCardW - 16, 5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.muted);
  doc.text(b.tag, bX + 15, bY + 7);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.primary);
  doc.text(doc.splitTextToSize(b.title, bCardW - 8), bX + 3, bY + 12.5);

  // Desc
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...COLORS.body);
  doc.text(doc.splitTextToSize(b.desc, bCardW - 6), bX + 3, bY + 18.5);
});

curY += (bCardH * 3) + 12;

// Bottom Summary Table: Quick ROI Breakdown
drawCard(doc, margin, curY, contentWidth, 30, COLORS.lightBg, COLORS.cardBorder, 2);

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...COLORS.primary);
doc.text('Summary of Quantifiable Return on Investment (ROI) for Shop Owners:', margin + 4, curY + 6);

const roiPoints = [
  { metric: 'Billing Time', impact: 'Reduced from ~5 mins to 30 secs per bill (80% faster checkout).' },
  { metric: 'Hardware Cost', impact: '₹0 additional hardware needed; runs on existing shop PC/laptop/phone.' },
  { metric: 'Accounting Effort', impact: 'Saves 15+ hours/month in manual ledger reconciliation and tax tallying.' },
  { metric: 'Revenue Leakage', impact: 'Eliminates 100% of manual calculation and unrecorded credit losses.' }
];

let roiY = curY + 10.5;
roiPoints.forEach((rp, i) => {
  const rX = margin + (i % 2) * (cardW + 6);
  const rRowY = roiY + Math.floor(i / 2) * 8.5;

  doc.setFillColor(...COLORS.emerald);
  doc.circle(rX + 3, rRowY + 1.8, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...COLORS.dark);
  doc.text(rp.metric + ': ', rX + 6, rRowY + 2.5);

  const rw = doc.getTextWidth(rp.metric + ': ');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.body);
  doc.text(doc.splitTextToSize(rp.impact, cardW - 8 - rw), rX + 6 + rw, rRowY + 2.5);
});

renderPageFooter(doc, 4, 4);

// Output to file
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync(outputPath, pdfBuffer);
console.log(`PDF successfully generated at: ${outputPath}`);
console.log(`File size: ${pdfBuffer.length} bytes`);
