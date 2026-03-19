/**
 * design-system/tokens.ts
 * Single source of truth for ALL design tokens across 5 themes.
 * Each theme defines every CSS variable — no separate light/dark blocks needed.
 */

// ─── Theme Palettes ────────────────────────────────────────────────────────────
export type ThemeName = 'obsidian' | 'ember' | 'sakura' | 'pureWhite' | 'nebula';

export type ThemeBrightness = 'dark' | 'light' | 'medium';

export interface ThemePalette {
  name: ThemeName;
  label: string;
  brightness: ThemeBrightness;

  // ── Core ──
  primary: string;
  secondary: string;
  bg: string;
  fg: string;

  // ── Surfaces ──
  card: string;
  cardFg: string;
  popover: string;
  popoverFg: string;
  muted: string;
  mutedFg: string;
  accent: string;
  accentFg: string;
  secondary_surface: string;
  secondaryFg: string;

  // ── Borders & Input ──
  border: string;
  input: string;
  ring: string;

  // ── Sidebar ──
  sidebar: string;
  sidebarFg: string;
  sidebarAccent: string;
  sidebarAccentFg: string;
  sidebarBorder: string;

  // ── Shadows ──
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
  shadowPremium: string;
}

// ─── Theme Definitions ─────────────────────────────────────────────────────────

export const THEMES: Record<ThemeName, ThemePalette> = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // OBSIDIAN — Cool blue-gray, emerald accents
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  obsidian: {
    name: 'obsidian',
    label: 'Obsidian',
    brightness: 'dark',
    primary: '#34d399',
    secondary: '#60a5fa',
    bg: '#020409',
    fg: '#f0f0f0',
    card: '#0d1117',
    cardFg: '#f0f0f0',
    popover: '#0d1117',
    popoverFg: '#f0f0f0',
    muted: '#161b22',
    mutedFg: '#7d8590',
    accent: '#1c2128',
    accentFg: '#f0f0f0',
    secondary_surface: '#161b22',
    secondaryFg: '#f0f0f0',
    border: '#30363d',
    input: '#21262d',
    ring: '#34d399',
    sidebar: '#010409',
    sidebarFg: '#7d8590',
    sidebarAccent: '#161b22',
    sidebarAccentFg: '#f0f0f0',
    sidebarBorder: '#21262d',
    shadowSm: '0 1px 3px rgba(0,0,0,0.5)',
    shadowMd: '0 4px 8px -1px rgba(0,0,0,0.6)',
    shadowLg: '0 12px 20px -4px rgba(0,0,0,0.6)',
    shadowXl: '0 24px 32px -6px rgba(0,0,0,0.7)',
    shadowPremium: '0 0 0 1px rgba(52,211,153,0.06), 0 20px 50px -10px rgba(0,0,0,0.8)',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EMBER — Warm dark amber tones
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ember: {
    name: 'ember',
    label: 'Ember',
    brightness: 'dark',
    primary: '#f59e0b',
    secondary: '#ef4444',
    bg: '#0c0a06',
    fg: '#fef3c7',
    card: '#1a1508',
    cardFg: '#fef3c7',
    popover: '#1a1508',
    popoverFg: '#fef3c7',
    muted: '#1f1a0e',
    mutedFg: '#92786a',
    accent: '#2a2010',
    accentFg: '#fef3c7',
    secondary_surface: '#1f1a0e',
    secondaryFg: '#fef3c7',
    border: '#3d2e14',
    input: '#2a2010',
    ring: '#f59e0b',
    sidebar: '#0a0806',
    sidebarFg: '#92786a',
    sidebarAccent: '#1f1a0e',
    sidebarAccentFg: '#fef3c7',
    sidebarBorder: '#2a2010',
    shadowSm: '0 1px 3px rgba(0,0,0,0.5)',
    shadowMd: '0 4px 8px -1px rgba(0,0,0,0.6)',
    shadowLg: '0 12px 20px -4px rgba(0,0,0,0.6)',
    shadowXl: '0 24px 32px -6px rgba(0,0,0,0.7)',
    shadowPremium: '0 0 0 1px rgba(245,158,11,0.06), 0 20px 50px -10px rgba(0,0,0,0.8)',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SAKURA — Soft pink-rose light theme
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  sakura: {
    name: 'sakura',
    label: 'Sakura',
    brightness: 'light',
    primary: '#ec4899',
    secondary: '#8b5cf6',
    bg: '#fef7f0',
    fg: '#1e293b',
    card: '#ffffff',
    cardFg: '#1e293b',
    popover: '#ffffff',
    popoverFg: '#1e293b',
    muted: '#fce7f3',
    mutedFg: '#78716c',
    accent: '#fdf2f8',
    accentFg: '#1e293b',
    secondary_surface: '#fce7f3',
    secondaryFg: '#1e293b',
    border: '#f9a8d4',
    input: '#fce7f3',
    ring: '#ec4899',
    sidebar: '#fdf2f8',
    sidebarFg: '#78716c',
    sidebarAccent: '#fce7f3',
    sidebarAccentFg: '#1e293b',
    sidebarBorder: '#fbcfe8',
    shadowSm: '0 1px 2px rgba(0,0,0,0.04)',
    shadowMd: '0 4px 6px -1px rgba(0,0,0,0.06)',
    shadowLg: '0 10px 15px -3px rgba(0,0,0,0.06)',
    shadowXl: '0 20px 25px -5px rgba(0,0,0,0.06)',
    shadowPremium: '0 0 0 1px rgba(236,72,153,0.08), 0 10px 30px -5px rgba(0,0,0,0.06)',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PURE WHITE — Crisp neutral professional
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  pureWhite: {
    name: 'pureWhite',
    label: 'Pure White',
    brightness: 'light',
    primary: '#0ea5e9',
    secondary: '#6366f1',
    bg: '#ffffff',
    fg: '#0f172a',
    card: '#f8fafc',
    cardFg: '#0f172a',
    popover: '#ffffff',
    popoverFg: '#0f172a',
    muted: '#f1f5f9',
    mutedFg: '#64748b',
    accent: '#f1f5f9',
    accentFg: '#0f172a',
    secondary_surface: '#f1f5f9',
    secondaryFg: '#0f172a',
    border: '#e2e8f0',
    input: '#f1f5f9',
    ring: '#0ea5e9',
    sidebar: '#f8fafc',
    sidebarFg: '#64748b',
    sidebarAccent: '#f1f5f9',
    sidebarAccentFg: '#0f172a',
    sidebarBorder: '#e2e8f0',
    shadowSm: '0 1px 2px rgba(0,0,0,0.03)',
    shadowMd: '0 4px 6px -1px rgba(0,0,0,0.05)',
    shadowLg: '0 10px 15px -3px rgba(0,0,0,0.05)',
    shadowXl: '0 20px 25px -5px rgba(0,0,0,0.05)',
    shadowPremium: '0 0 0 1px rgba(0,0,0,0.04), 0 10px 30px -5px rgba(0,0,0,0.06)',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // NEBULA — Deep purple cosmic
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  nebula: {
    name: 'nebula',
    label: 'Nebula',
    brightness: 'dark',
    primary: '#a78bfa',
    secondary: '#22d3ee',
    bg: '#06010f',
    fg: '#f1f5f9',
    card: '#120a20',
    cardFg: '#f1f5f9',
    popover: '#120a20',
    popoverFg: '#f1f5f9',
    muted: '#1a0e2e',
    mutedFg: '#a78bfa80',
    accent: '#1e1235',
    accentFg: '#f1f5f9',
    secondary_surface: '#1a0e2e',
    secondaryFg: '#f1f5f9',
    border: '#2e1a50',
    input: '#1e1235',
    ring: '#a78bfa',
    sidebar: '#04010a',
    sidebarFg: '#8b7ab8',
    sidebarAccent: '#1a0e2e',
    sidebarAccentFg: '#f1f5f9',
    sidebarBorder: '#1e1235',
    shadowSm: '0 1px 3px rgba(0,0,0,0.5)',
    shadowMd: '0 4px 8px -1px rgba(0,0,0,0.6)',
    shadowLg: '0 12px 20px -4px rgba(0,0,0,0.6)',
    shadowXl: '0 24px 32px -6px rgba(0,0,0,0.7)',
    shadowPremium: '0 0 0 1px rgba(167,139,250,0.06), 0 20px 50px -10px rgba(0,0,0,0.8)',
  },

} as const;

export const THEME_LIST = Object.values(THEMES);
export const DEFAULT_THEME: ThemeName = 'obsidian';

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

// ─── Icon Sizes ────────────────────────────────────────────────────────────────
export const ICON_SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
} as const;

// ─── Panel Tokens (used by WindowControls & SidebarProfile) ───────────────────
export const PANEL_TOKENS = {
  header: {
    height: 'h-9',
    padding: 'px-3',
    bg: 'bg-foreground/5',
    blur: 'backdrop-blur-md',
    border: 'border-b border-border',
    shadow: 'shadow-sm',
  },
  accent: {
    primary: 'primary',
    secondary: 'primary',
    glow: 'drop-shadow-[0_0_6px_var(--theme-primary)]',
    glowBg: 'shadow-[0_0_8px_var(--theme-primary)]',
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
