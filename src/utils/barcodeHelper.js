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
 * Standard Code 128 (Subset B) 11-module patterns for indices 0 to 106.
 * Compliant with ISO/IEC 15417 Code 128 specification.
 */
const CODE128_PATTERNS = [
  '11011001100', '11001101100', '11001100110', '10010011000', '10010001100', // 0-4
  '10001001100', '10011001000', '10011000100', '10001100100', '11001001000', // 5-9
  '11001000100', '11000100100', '10110011100', '10011011100', '10011001110', // 10-14
  '10111001100', '10011101100', '10011100110', '11001110010', '11001011100', // 15-19
  '11001001110', '11011100100', '11001110100', '11101101110', '11101001100', // 20-24
  '11100101100', '11100100110', '11101100100', '11100110100', '11100110010', // 25-29
  '11011011000', '11011000110', '11000110110', '10100011000', '10001011000', // 30-34
  '10001000110', '10110001000', '10001101000', '10001100010', '11010001000', // 35-39
  '11000101000', '11000100010', '10110111000', '10110001110', '10001101110', // 40-44
  '10111011000', '10111000110', '10001110110', '11101110110', '11010001110', // 45-49
  '11000101110', '11011101000', '11011100010', '11011101110', '11101011000', // 50-54
  '11101000110', '11100010110', '11101101000', '11101100010', '11100011010', // 55-59
  '11101111010', '11001000010', '11110001010', '10100110000', '10100001100', // 60-64
  '10010110000', '10010000110', '10000101100', '10000100110', '10110010000', // 65-69
  '10110000100', '10011010000', '10011000010', '10000110100', '10000110010', // 70-74
  '11000010010', '11001010000', '11110111010', '11000010100', '10001111010', // 75-79
  '10100111100', '10010111100', '10010011110', '10111100100', '10011110100', // 80-84
  '10011110010', '11110100100', '11110010100', '11110010010', '11011011110', // 85-89
  '11011110110', '11110110110', '10101111000', '10100011110', '10001011110', // 90-94
  '10111101000', '10111100010', '11110101000', '11110100010', '10111011110', // 95-99
  '10111101110', '11101011110', '11110101110', '11010000100', '11010010000', // 100-104 (104=START B)
  '11010011100', '1100011101011' // 105 (START C), 106 (STOP)
];

const START_B_INDEX = 104;
const STOP_INDEX = 106;
const QUIET_ZONE_MODULES = 10; // ISO standard 10 modules minimum

/**
 * Encodes text into standard Code 128 binary modules (1=bar, 0=space)
 */
export const encodeCode128 = (text) => {
  const safeText = String(text || '').trim();
  if (!safeText) return null;

  // Build character values list for Code 128 Subset B (ASCII 32 to 126)
  const charValues = [];
  for (let i = 0; i < safeText.length; i++) {
    const code = safeText.charCodeAt(i);
    if (code >= 32 && code <= 126) {
      charValues.push(code - 32);
    } else {
      // Fallback for unexpected characters
      charValues.push(63 - 32); // '?'
    }
  }

  // Calculate checksum modulo 103
  let checksum = START_B_INDEX;
  for (let i = 0; i < charValues.length; i++) {
    checksum += charValues[i] * (i + 1);
  }
  const checksumIndex = checksum % 103;

  // Assemble full module sequence with Start B, Data, Checksum, Stop
  let bitString = '0'.repeat(QUIET_ZONE_MODULES);
  bitString += CODE128_PATTERNS[START_B_INDEX];

  for (const val of charValues) {
    bitString += CODE128_PATTERNS[val];
  }

  bitString += CODE128_PATTERNS[checksumIndex];
  bitString += CODE128_PATTERNS[STOP_INDEX];
  bitString += '0'.repeat(QUIET_ZONE_MODULES);

  return bitString;
};

/**
 * Generates a clean, scannable Code 128 SVG Data URL
 * @param {string} code - The alphanumeric code or SKU to encode
 * @param {object} options - Configuration for sizing and text display
 */
export const generateBarcodeSvgDataUrl = (code, options = {}) => {
  const cleanCode = (code || 'SMG-0000').toUpperCase().trim();
  const {
    barHeight = 36,
    moduleWidth = 1.5,
    includeText = true,
    fontSize = 10,
    textColor = '#0f172a'
  } = options;

  const cacheKey = `${cleanCode}_${barHeight}_${moduleWidth}_${includeText ? 1 : 0}`;
  if (barcodeCache.has(cacheKey)) {
    return barcodeCache.get(cacheKey);
  }

  const bitString = encodeCode128(cleanCode);
  if (!bitString) {
    return '';
  }

  // Convert bit string to SVG rectangles (merging consecutive 1s into wider bars)
  let rects = [];
  let currentRunLength = 0;
  let runStartPos = 0;

  for (let i = 0; i < bitString.length; i++) {
    if (bitString[i] === '1') {
      if (currentRunLength === 0) {
        runStartPos = i;
      }
      currentRunLength++;
    } else {
      if (currentRunLength > 0) {
        const x = runStartPos * moduleWidth;
        const w = currentRunLength * moduleWidth;
        rects.push(`<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="${barHeight}" fill="#000" />`);
        currentRunLength = 0;
      }
    }
  }

  // Trailing bar if ends with 1
  if (currentRunLength > 0) {
    const x = runStartPos * moduleWidth;
    const w = currentRunLength * moduleWidth;
    rects.push(`<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="${barHeight}" fill="#000" />`);
  }

  const totalWidth = bitString.length * moduleWidth;
  const textSpace = includeText ? fontSize + 4 : 0;
  const totalHeight = barHeight + textSpace;

  const textElement = includeText
    ? `<text x="${(totalWidth / 2).toFixed(2)}" y="${(barHeight + fontSize + 1).toFixed(2)}" font-family="'JetBrains Mono', monospace, -apple-system" font-size="${fontSize}" font-weight="700" text-anchor="middle" fill="${textColor}" letter-spacing="1">${cleanCode}</text>`
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth.toFixed(2)} ${totalHeight.toFixed(2)}" width="100%" height="100%" shape-rendering="crispEdges">
    <rect width="${totalWidth.toFixed(2)}" height="${totalHeight.toFixed(2)}" fill="#ffffff" />
    ${rects.join('')}
    ${textElement}
  </svg>`;

  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  barcodeCache.set(cacheKey, dataUrl);
  return dataUrl;
};

