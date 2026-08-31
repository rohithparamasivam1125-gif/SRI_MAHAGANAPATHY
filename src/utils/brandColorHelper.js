// Pre-defined POS vibrant brand color schemes for Sri Mahaganapathy POS
export const BRAND_COLOR_PALETTES = {
  blue: {
    key: 'blue',
    label: 'Ocean Blue',
    hex: '#2563eb',
    badge: 'bg-blue-100 text-blue-950 border-blue-300',
    cardBorder: 'hover:border-blue-500',
    cardTopBar: 'bg-blue-600',
    iconColor: 'text-blue-600'
  },
  indigo: {
    key: 'indigo',
    label: 'Royal Indigo',
    hex: '#4f46e5',
    badge: 'bg-indigo-100 text-indigo-950 border-indigo-300',
    cardBorder: 'hover:border-indigo-500',
    cardTopBar: 'bg-indigo-600',
    iconColor: 'text-indigo-600'
  },
  purple: {
    key: 'purple',
    label: 'Vibrant Purple',
    hex: '#9333ea',
    badge: 'bg-purple-100 text-purple-950 border-purple-300',
    cardBorder: 'hover:border-purple-500',
    cardTopBar: 'bg-purple-600',
    iconColor: 'text-purple-600'
  },
  emerald: {
    key: 'emerald',
    label: 'Emerald Green',
    hex: '#059669',
    badge: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    cardBorder: 'hover:border-emerald-500',
    cardTopBar: 'bg-emerald-600',
    iconColor: 'text-emerald-600'
  },
  amber: {
    key: 'amber',
    label: 'Golden Amber',
    hex: '#d97706',
    badge: 'bg-amber-100 text-amber-950 border-amber-300',
    cardBorder: 'hover:border-amber-500',
    cardTopBar: 'bg-amber-500',
    iconColor: 'text-amber-600'
  },
  orange: {
    key: 'orange',
    label: 'Flame Orange',
    hex: '#ea580c',
    badge: 'bg-orange-100 text-orange-950 border-orange-300',
    cardBorder: 'hover:border-orange-500',
    cardTopBar: 'bg-orange-600',
    iconColor: 'text-orange-600'
  },
  rose: {
    key: 'rose',
    label: 'Crimson Red',
    hex: '#e11d48',
    badge: 'bg-rose-100 text-rose-950 border-rose-300',
    cardBorder: 'hover:border-rose-500',
    cardTopBar: 'bg-rose-600',
    iconColor: 'text-rose-600'
  },
  cyan: {
    key: 'cyan',
    label: 'Teal Aqua',
    hex: '#0891b2',
    badge: 'bg-cyan-100 text-cyan-950 border-cyan-300',
    cardBorder: 'hover:border-cyan-500',
    cardTopBar: 'bg-cyan-600',
    iconColor: 'text-cyan-600'
  },
  slate: {
    key: 'slate',
    label: 'Charcoal Dark',
    hex: '#0f172a',
    badge: 'bg-slate-900 text-white border-slate-700',
    cardBorder: 'hover:border-slate-800',
    cardTopBar: 'bg-slate-900',
    iconColor: 'text-slate-300'
  }
};

// Default fallback colors by brand hash
const PALETTE_KEYS = Object.keys(BRAND_COLOR_PALETTES);

export const getBrandTheme = (brandName, brandColorsConfig = {}) => {
  const cleanBrand = (brandName || '').trim();
  if (!cleanBrand) {
    return BRAND_COLOR_PALETTES.slate;
  }

  // 1. Check user preference from settings
  const customKey = brandColorsConfig[cleanBrand];
  if (customKey && BRAND_COLOR_PALETTES[customKey]) {
    return BRAND_COLOR_PALETTES[customKey];
  }

  // 2. Predictable color based on brand name string
  let hash = 0;
  for (let i = 0; i < cleanBrand.length; i++) {
    hash = cleanBrand.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE_KEYS.length;
  const fallbackKey = PALETTE_KEYS[index];
  return BRAND_COLOR_PALETTES[fallbackKey] || BRAND_COLOR_PALETTES.indigo;
};
