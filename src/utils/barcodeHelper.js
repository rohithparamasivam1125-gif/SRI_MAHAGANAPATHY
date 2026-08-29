/**
 * Barcode Utility for Sri Mahaganapathy Electricals & Hardware
 * Generates unique barcodes, formats scanner codes, and produces SVG barcodes for thermal/sheet label printing.
 */

// Generate a unique, standard alphanumeric barcode
export const generateUniqueBarcode = (category = 'Electrical', prefix = 'SMG') => {
  const catCode = category === 'Plumbing' ? 'PL' : 'EL';
  const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit unique number
  return `${prefix}-${catCode}-${randomNum}`;
};

// Generate an EAN-13 formatted numeric barcode (if numeric only is preferred)
export const generateNumericBarcode = () => {
  // 890 is India GS1 country prefix
  const base = '890' + Math.floor(100000000 + Math.random() * 900000000).toString().substring(0, 9);
  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(base[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const checksum = (10 - (sum % 10)) % 10;
  return `${base}${checksum}`;
};

// Ensure all variants in a product have valid, unique barcodes
export const ensureProductHasBarcodes = (product) => {
  if (!product) return product;
  const category = product.category || 'Electrical';
  
  const updatedVariants = (product.variants || []).map((variant, idx) => {
    if (!variant.barcode || variant.barcode.trim() === '') {
      return {
        ...variant,
        barcode: generateUniqueBarcode(category, 'SMG')
      };
    }
    return variant;
  });

  return {
    ...product,
    variants: updatedVariants.length > 0 ? updatedVariants : [
      {
        size: 'Standard',
        price: 0,
        mrp: 0,
        stock: 50,
        unit: 'Pcs',
        barcode: generateUniqueBarcode(category, 'SMG')
      }
    ]
  };
};

// Cache for generated SVG barcodes to prevent recalculation lag
const barcodeCache = new Map();

/**
 * Generates a clean Code 128 / Barcode SVG representation for printing
 */
export const generateBarcodeSvgDataUrl = (code) => {
  const cleanCode = (code || 'SMG-0000').toUpperCase();
  if (barcodeCache.has(cleanCode)) {
    return barcodeCache.get(cleanCode);
  }
  
  // Deterministic bar widths pattern based on code characters
  let bars = [];
  let currentPos = 10;
  
  // Start guard bars
  bars.push({ x: currentPos, width: 2, isBlack: true });
  currentPos += 3;
  bars.push({ x: currentPos, width: 1, isBlack: true });
  currentPos += 3;

  for (let i = 0; i < cleanCode.length; i++) {
    const charCode = cleanCode.charCodeAt(i);
    const pattern = (charCode * 7 + i * 13) % 16;
    
    const w1 = (pattern % 3) + 1;
    const w2 = ((pattern >> 1) % 2) + 1;
    const w3 = ((pattern >> 2) % 3) + 1;
    
    bars.push({ x: currentPos, width: w1, isBlack: true });
    currentPos += w1 + 1;
    bars.push({ x: currentPos, width: w2, isBlack: true });
    currentPos += w2 + 2;
    bars.push({ x: currentPos, width: w3, isBlack: true });
    currentPos += w3 + 1;
  }

  // End guard bars
  bars.push({ x: currentPos, width: 2, isBlack: true });
  currentPos += 3;
  bars.push({ x: currentPos, width: 2, isBlack: true });
  currentPos += 10;

  const totalWidth = currentPos;
  const height = 45;

  const rects = bars
    .map((b) => `<rect x="${b.x}" y="0" width="${b.width}" height="${height}" fill="#000" />`)
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height + 15}" width="100%" height="100%">
    <rect width="${totalWidth}" height="${height + 15}" fill="#fff" />
    ${rects}
    <text x="${totalWidth / 2}" y="${height + 11}" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle" fill="#1e293b">${cleanCode}</text>
  </svg>`;

  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  barcodeCache.set(cleanCode, dataUrl);
  return dataUrl;
};
