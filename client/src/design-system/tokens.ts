/**
 * design-system/tokens.ts
 * Single source of truth for all design tokens.
 * 4 themes: Obsidian (dark), Ember (dark), Sakura (light), Ocean (medium)
 */

// ─── Theme Palettes ────────────────────────────────────────────────────────────
export type ThemeName = 'obsidian' | 'ember' | 'sakura' | 'ocean';

export type ThemeBrightness = 'dark' | 'light' | 'medium';

export interface ThemePalette {
  name: ThemeName;
  label: string;
  brightness: ThemeBrightness;
  /** Primary accent hex */
  primary: string;
  /** Secondary accent hex */
  secondary: string;
  /** Background hex (for canvas clear + body) */
  bg: string;
  /** Foreground text hex */
  fg: string;
  /** Muted text hex */
  muted: string;
  /** Panel glass tint (Tailwind class) */
  panelBg: string;
  /** Border for glass panels */
  panelBorder: string;
}

export const THEMES: Record<ThemeName, ThemePalette> = {
  obsidian: {
    name: 'obsidian',
    label: 'Obsidian',
    brightness: 'dark',
    primary: '#34d399',
    secondary: '#60a5fa',
    bg: '#020409',
    fg: '#f0f0f0',
    muted: '#6b7280',
    panelBg: 'bg-black/30 backdrop-blur-xl',
    panelBorder: 'border-white/10',
  },
  ember: {
    name: 'ember',
    label: 'Ember',
    brightness: 'dark',
    primary: '#f59e0b',
    secondary: '#ef4444',
    bg: '#0c0a06',
    fg: '#fef3c7',
    muted: '#92786a',
    panelBg: 'bg-black/30 backdrop-blur-xl',
    panelBorder: 'border-amber-500/10',
  },
  sakura: {
    name: 'sakura',
    label: 'Sakura',
    brightness: 'light',
    primary: '#ec4899',
    secondary: '#8b5cf6',
    bg: '#fef7f0',
    fg: '#1e293b',
    muted: '#94a3b8',
    panelBg: 'bg-white/40 backdrop-blur-xl',
    panelBorder: 'border-pink-300/20',
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean',
    brightness: 'medium',
    primary: '#06b6d4',
    secondary: '#3b82f6',
    bg: '#1a2332',
    fg: '#e2e8f0',
    muted: '#64748b',
    panelBg: 'bg-slate-900/40 backdrop-blur-xl',
    panelBorder: 'border-cyan-500/10',
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

// ─── Panel Tokens (backward compat) ───────────────────────────────────────────
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
