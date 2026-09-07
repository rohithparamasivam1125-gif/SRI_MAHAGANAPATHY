// Pre-defined POS vibrant brand color schemes for Sri Mahaganapathy POS
export const BRAND_COLOR_PALETTES = {
  blue: {
    key: 'blue',
    label: 'Ocean Blue',
    hex: '#2563eb',
    badge: 'bg-blue-100 text-blue-950 border-blue-300',
    cardBg: 'bg-blue-50/70 hover:bg-blue-50/95',
    cardBorder: 'border-blue-200/90 hover:border-blue-500',
    cardTopBar: 'bg-blue-600',
    cardStyle: { backgroundColor: '#f0f7ff', borderColor: '#bfdbfe' },
    iconColor: 'text-blue-600'
  },
  indigo: {
    key: 'indigo',
    label: 'Royal Indigo',
    hex: '#4f46e5',
    badge: 'bg-indigo-100 text-indigo-950 border-indigo-300',
    cardBg: 'bg-indigo-50/70 hover:bg-indigo-50/95',
    cardBorder: 'border-indigo-200/90 hover:border-indigo-500',
    cardTopBar: 'bg-indigo-600',
    cardStyle: { backgroundColor: '#f5f3ff', borderColor: '#c7d2fe' },
    iconColor: 'text-indigo-600'
  },
  purple: {
    key: 'purple',
    label: 'Vibrant Purple',
    hex: '#9333ea',
    badge: 'bg-purple-100 text-purple-950 border-purple-300',
    cardBg: 'bg-purple-50/70 hover:bg-purple-50/95',
    cardBorder: 'border-purple-200/90 hover:border-purple-500',
    cardTopBar: 'bg-purple-600',
    cardStyle: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff' },
    iconColor: 'text-purple-600'
  },
  emerald: {
    key: 'emerald',
    label: 'Emerald Green',
    hex: '#059669',
    badge: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    cardBg: 'bg-emerald-50/70 hover:bg-emerald-50/95',
    cardBorder: 'border-emerald-200/90 hover:border-emerald-500',
    cardTopBar: 'bg-emerald-600',
    cardStyle: { backgroundColor: '#f0fdf4', borderColor: '#a7f3d0' },
    iconColor: 'text-emerald-600'
  },
  amber: {
    key: 'amber',
    label: 'Golden Amber',
    hex: '#d97706',
    badge: 'bg-amber-100 text-amber-950 border-amber-300',
    cardBg: 'bg-amber-50/70 hover:bg-amber-50/95',
    cardBorder: 'border-amber-200/90 hover:border-amber-500',
    cardTopBar: 'bg-amber-500',
    cardStyle: { backgroundColor: '#fffdf0', borderColor: '#fde68a' },
    iconColor: 'text-amber-600'
  },
  orange: {
    key: 'orange',
    label: 'Flame Orange',
    hex: '#ea580c',
    badge: 'bg-orange-100 text-orange-950 border-orange-300',
    cardBg: 'bg-orange-50/70 hover:bg-orange-50/95',
    cardBorder: 'border-orange-200/90 hover:border-orange-500',
    cardTopBar: 'bg-orange-600',
    cardStyle: { backgroundColor: '#fff7ed', borderColor: '#fed7aa' },
    iconColor: 'text-orange-600'
  },
  rose: {
    key: 'rose',
    label: 'Crimson Red',
    hex: '#e11d48',
    badge: 'bg-rose-100 text-rose-950 border-rose-300',
    cardBg: 'bg-rose-50/70 hover:bg-rose-50/95',
    cardBorder: 'border-rose-200/90 hover:border-rose-500',
    cardTopBar: 'bg-rose-600',
    cardStyle: { backgroundColor: '#fff1f2', borderColor: '#fecdd3' },
    iconColor: 'text-rose-600'
  },
  cyan: {
    key: 'cyan',
    label: 'Teal Aqua',
    hex: '#0891b2',
    badge: 'bg-cyan-100 text-cyan-950 border-cyan-300',
    cardBg: 'bg-cyan-50/70 hover:bg-cyan-50/95',
    cardBorder: 'border-cyan-200/90 hover:border-cyan-500',
    cardTopBar: 'bg-cyan-600',
    cardStyle: { backgroundColor: '#f0fdfa', borderColor: '#a5f3fc' },
    iconColor: 'text-cyan-600'
  },
  slate: {
    key: 'slate',
    label: 'Charcoal Dark',
    hex: '#0f172a',
    badge: 'bg-slate-900 text-white border-slate-700',
    cardBg: 'bg-slate-50/90 hover:bg-slate-100',
    cardBorder: 'border-slate-300 hover:border-slate-600',
    cardTopBar: 'bg-slate-900',
    cardStyle: { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' },
    iconColor: 'text-slate-700'
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
  if (brandColorsConfig && typeof brandColorsConfig === 'object') {
    const customKey = brandColorsConfig[cleanBrand];
    if (customKey) {
      if (BRAND_COLOR_PALETTES[customKey]) {
        return BRAND_COLOR_PALETTES[customKey];
      }
      // If user selected a custom hex color (e.g. #e11d48, #2563eb)
      if (typeof customKey === 'string' && customKey.startsWith('#')) {
        const hex = customKey.toLowerCase();
        return {
          key: hex,
          label: hex.toUpperCase(),
          hex: hex,
          isCustom: true,
          badge: 'border font-black shadow-2xs',
          customStyle: {
            backgroundColor: `${hex}18`,
            color: hex,
            borderColor: `${hex}60`
          },
          cardBg: 'hover:brightness-98',
          cardBorder: 'hover:shadow-md',
          cardTopBar: 'bg-slate-900',
          cardStyle: {
            backgroundColor: `${hex}0d`, // Soft ~5% tint of brand color
            borderColor: `${hex}45`
          },
          topBarStyle: {
            backgroundColor: hex
          },
          iconColor: 'text-slate-800'
        };
      }
    }
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

