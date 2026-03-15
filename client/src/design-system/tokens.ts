/**
 * design-system/tokens.ts
 * Single source of truth for all design tokens.
 * Replaces: src/lib/constants.ts
 */

// ─── Theme Palettes ────────────────────────────────────────────────────────────
export type ThemeName = 'dark' | 'cyberpunk' | 'aurora';

export interface ThemePalette {
  name: ThemeName;
  label: string;
  /** CSS class applied to <html> for next-themes */
  htmlClass: string;
  /** Primary accent color (Tailwind name) */
  primary: string;
  /** Hex for glow effects */
  primaryHex: string;
  /** Secondary accent */
  secondary: string;
  secondaryHex: string;
  /** 3D scene identifier for Scene3D */
  scene: 'deep-space' | 'neon-grid' | 'aurora';
  /** Background gradient CSS */
  bgGradient: string;
  /** Sidebar/panel bg opacity */
  panelBg: string;
}

export const THEMES: Record<ThemeName, ThemePalette> = {
  dark: {
    name: 'dark',
    label: 'Deep Space',
    htmlClass: 'dark',
    primary: 'emerald-400',
    primaryHex: '#34d399',
    secondary: 'blue-400',
    secondaryHex: '#60a5fa',
    scene: 'deep-space',
    bgGradient: 'from-[#020409] via-[#050d14] to-[#020409]',
    panelBg: 'bg-black/60',
  },
  cyberpunk: {
    name: 'cyberpunk',
    label: 'Cyberpunk',
    htmlClass: 'dark cyberpunk',
    primary: 'cyan-400',
    primaryHex: '#22d3ee',
    secondary: 'fuchsia-500',
    secondaryHex: '#d946ef',
    scene: 'neon-grid',
    bgGradient: 'from-[#020010] via-[#050014] to-[#020010]',
    panelBg: 'bg-[#06002a]/70',
  },
  aurora: {
    name: 'aurora',
    label: 'Aurora',
    htmlClass: 'aurora',
    primary: 'violet-500',
    primaryHex: '#8b5cf6',
    secondary: 'teal-400',
    secondaryHex: '#2dd4bf',
    scene: 'aurora',
    bgGradient: 'from-[#f0f4ff] via-[#e8f0fe] to-[#f5f0ff]',
    panelBg: 'bg-white/60',
  },
} as const;

export const DEFAULT_THEME: ThemeName = 'dark';

// ─── Spacing ───────────────────────────────────────────────────────────────────
export const SPACING = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
} as const;

// ─── Border Radius ─────────────────────────────────────────────────────────────
export const RADII = {
  sm: 'rounded-lg',    // 8px
  md: 'rounded-xl',   // 12px
  lg: 'rounded-2xl',  // 16px
  xl: 'rounded-3xl',  // 24px
  '2xl': 'rounded-4xl', // 32px
  full: 'rounded-full',
} as const;

// ─── Z-Index Scale ─────────────────────────────────────────────────────────────
export const Z = {
  bg3d:    -1,
  base:     0,
  content: 10,
  sidebar: 20,
  topbar:  30,
  modal:   50,
  toast:   60,
  tooltip: 70,
} as const;

// ─── Blur Values ───────────────────────────────────────────────────────────────
export const BLUR = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
} as const;

// ─── Shadow Presets ────────────────────────────────────────────────────────────
export const SHADOWS = {
  glow: (hex: string, intensity = 0.4) =>
    `0 0 20px ${hex}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
  card: '0 4px 32px rgba(0,0,0,0.4)',
  panel: '0 8px 48px rgba(0,0,0,0.6)',
} as const;

// ─── Icon Sizes ────────────────────────────────────────────────────────────────
export const ICON_SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
} as const;

// ─── Spring Configs ────────────────────────────────────────────────────────────
/** For use outside of framer-motion (e.g., CSS transitions) */
export const DURATION = {
  fast:   150,
  normal: 300,
  slow:   500,
  xslow:  800,
} as const;

// ─── Panel Tokens (backwards compat with Sidebar/controls) ────────────────────
export const PANEL_TOKENS = {
  header: {
    height: 'h-9',
    padding: 'px-3',
    bg: 'bg-white/5',
    blur: 'backdrop-blur-md',
    border: 'border-b border-white/5',
    shadow: 'shadow-sm',
  },
  accent: {
    primary: 'emerald-400',
    secondary: 'emerald-500',
    glow: 'drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]',
    glowBg: 'shadow-[0_0_8px_rgba(52,211,153,0.3)]',
  },
  icons: {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  },
  control: {
    size: 'w-3 h-3',
    iconSize: 'w-2 h-2',
    gap: 'gap-1.5',
  },
} as const;
