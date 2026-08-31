export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(Number(num) || 0);
};

export const formatDate = (timestamp) => {
  if (!timestamp) return new Date().toLocaleDateString('en-IN');
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateInvoiceNumber = (sequence = 1, prefix = 'RG-') => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const seqStr = String(sequence).padStart(4, '0');
  return `${prefix}${year}${month}-${seqStr}`;
};

/**
 * Capitalizes the first letter of each word and any letter after spaces, hyphens, slashes, brackets.
 * Ideal for live input onChange handlers across the app.
 */
export const capitalizeInput = (value) => {
  if (!value || typeof value !== 'string') return value || '';
  return value.replace(/(^|[\s\-\/\(\[\{])([a-z])/g, (match, separator, letter) => {
    return separator + letter.toUpperCase();
  });
};

/**
 * Standard title case formatter that preserves technical acronyms like PVC, cPVC, uPVC, LED, etc.
 */
export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str || '';
  
  const acronyms = {
    'CPVC': 'cPVC',
    'UPVC': 'uPVC',
    'RPVC': 'rPVC',
    'PVC': 'PVC',
    'SWR': 'SWR',
    'HDPE': 'HDPE',
    'GI': 'GI',
    'MS': 'MS',
    'SS': 'SS',
    'PTMT': 'PTMT',
    'LED': 'LED',
    'MCB': 'MCB',
    'DB': 'DB',
    'SPN': 'SPN',
    'DP': 'DP',
    'TPN': 'TPN',
    'FRLS': 'FRLS',
    'FR': 'FR',
    'LSH': 'LSH',
    'DOL': 'DOL',
    'HP': 'HP',
    'KW': 'KW',
    'ISI': 'ISI',
    'GST': 'GST',
    'HSN': 'HSN'
  };

  return str.replace(/[a-zA-Z0-9]+/g, (word) => {
    const upper = word.toUpperCase();
    if (acronyms[upper]) return acronyms[upper];
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
};

