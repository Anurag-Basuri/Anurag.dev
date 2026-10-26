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

	// ── Elevation Hierarchy (4 Layers) ──
	surface0: string;
	surface1: string;
	surface2: string;
	surface3: string;

	// ── Borders & Input ──
	border: string;
	borderSubtle: string;
	borderHover: string;
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

	// ── Semantic Status Colors ──
	success: string;
	warning: string;
	info: string;
}

// ─── Theme Definitions ─────────────────────────────────────────────────────────

export const THEMES: Record<ThemeName, ThemePalette> = {
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// OBSIDIAN — Refined deep slate, softer contrast, emerald accents
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	obsidian: {
		name: 'obsidian',
		label: 'Obsidian',
		brightness: 'dark',
		primary: '#34d399',
		secondary: '#60a5fa',
		bg: '#080b11',
		fg: '#f1f5f9',
		card: '#0f1420',
		cardFg: '#f1f5f9',
		popover: '#141b2a',
		popoverFg: '#f1f5f9',
		muted: '#121824',
		mutedFg: '#8c9bb4',
		accent: '#162032',
		accentFg: '#f1f5f9',
		secondary_surface: '#121824',
		secondaryFg: '#f1f5f9',
		surface0: '#05070c',
		surface1: '#0a0e17',
		surface2: '#101624',
		surface3: '#162032',
		border: 'rgba(255, 255, 255, 0.08)',
		borderSubtle: 'rgba(255, 255, 255, 0.07)',
		borderHover: 'rgba(52, 211, 153, 0.35)',
		input: '#162032',
		ring: '#34d399',
		sidebar: '#0a0e17',
		sidebarFg: '#8c9bb4',
		sidebarAccent: '#141b2a',
		sidebarAccentFg: '#f1f5f9',
		sidebarBorder: 'rgba(255, 255, 255, 0.07)',
		shadowSm: '0 1px 3px rgba(0,0,0,0.4)',
		shadowMd: '0 4px 8px -1px rgba(0,0,0,0.5)',
		shadowLg: '0 12px 20px -4px rgba(0,0,0,0.5)',
		shadowXl: '0 24px 32px -6px rgba(0,0,0,0.6)',
		shadowPremium: '0 0 0 1px rgba(52,211,153,0.06), 0 20px 50px -10px rgba(0,0,0,0.7)',
		success: '#34d399',
		warning: '#fbbf24',
		info: '#22d3ee',
	},

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// EMBER — Warm muted dark amber tones
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	ember: {
		name: 'ember',
		label: 'Ember',
		brightness: 'dark',
		primary: '#f59e0b',
		secondary: '#ef4444',
		bg: '#0e0c08',
		fg: '#fef3c7',
		card: '#16130d',
		cardFg: '#fef3c7',
		popover: '#1e1911',
		popoverFg: '#fef3c7',
		muted: '#18140e',
		mutedFg: '#a8927e',
		accent: '#241e15',
		accentFg: '#fef3c7',
		secondary_surface: '#18140e',
		secondaryFg: '#fef3c7',
		surface0: '#090704',
		surface1: '#0f0c08',
		surface2: '#16120c',
		surface3: '#211b12',
		border: 'rgba(245, 158, 11, 0.12)',
		borderSubtle: 'rgba(245, 158, 11, 0.10)',
		borderHover: 'rgba(245, 158, 11, 0.40)',
		input: '#241e15',
		ring: '#f59e0b',
		sidebar: '#0c0906',
		sidebarFg: '#a8927e',
		sidebarAccent: '#18140e',
		sidebarAccentFg: '#fef3c7',
		sidebarBorder: 'rgba(245, 158, 11, 0.10)',
		shadowSm: '0 1px 3px rgba(0,0,0,0.4)',
		shadowMd: '0 4px 8px -1px rgba(0,0,0,0.5)',
		shadowLg: '0 12px 20px -4px rgba(0,0,0,0.5)',
		shadowXl: '0 24px 32px -6px rgba(0,0,0,0.6)',
		shadowPremium: '0 0 0 1px rgba(245,158,11,0.06), 0 20px 50px -10px rgba(0,0,0,0.7)',
		success: '#34d399',
		warning: '#fb923c',
		info: '#fbbf24',
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
		bg: '#fef7f2',
		fg: '#1e293b',
		card: '#ffffff',
		cardFg: '#1e293b',
		popover: '#ffffff',
		popoverFg: '#1e293b',
		muted: '#fdf0f5',
		mutedFg: '#78716c',
		accent: '#fae8f0',
		accentFg: '#1e293b',
		secondary_surface: '#fdf0f5',
		secondaryFg: '#1e293b',
		surface0: '#fbf3ed',
		surface1: '#fdf5f0',
		surface2: '#ffffff',
		surface3: '#ffffff',
		border: 'rgba(236, 72, 153, 0.20)',
		borderSubtle: 'rgba(236, 72, 153, 0.15)',
		borderHover: 'rgba(236, 72, 153, 0.45)',
		input: '#fdf0f5',
		ring: '#ec4899',
		sidebar: '#fcf2f7',
		sidebarFg: '#78716c',
		sidebarAccent: '#fdf0f5',
		sidebarAccentFg: '#1e293b',
		sidebarBorder: 'rgba(236, 72, 153, 0.15)',
		shadowSm: '0 1px 2px rgba(0,0,0,0.03)',
		shadowMd: '0 4px 6px -1px rgba(0,0,0,0.05)',
		shadowLg: '0 10px 15px -3px rgba(0,0,0,0.05)',
		shadowXl: '0 20px 25px -5px rgba(0,0,0,0.05)',
		shadowPremium: '0 0 0 1px rgba(236,72,153,0.08), 0 10px 30px -5px rgba(0,0,0,0.05)',
		success: '#059669',
		warning: '#d97706',
		info: '#0891b2',
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
		bg: '#f8fafc',
		fg: '#0f172a',
		card: '#ffffff',
		cardFg: '#0f172a',
		popover: '#ffffff',
		popoverFg: '#0f172a',
		muted: '#f1f5f9',
		mutedFg: '#64748b',
		accent: '#f1f5f9',
		accentFg: '#0f172a',
		secondary_surface: '#f1f5f9',
		secondaryFg: '#0f172a',
		surface0: '#f1f5f9',
		surface1: '#f8fafc',
		surface2: '#ffffff',
		surface3: '#ffffff',
		border: 'rgba(15, 23, 42, 0.08)',
		borderSubtle: 'rgba(15, 23, 42, 0.06)',
		borderHover: 'rgba(14, 165, 233, 0.40)',
		input: '#f1f5f9',
		ring: '#0ea5e9',
		sidebar: '#ffffff',
		sidebarFg: '#64748b',
		sidebarAccent: '#f1f5f9',
		sidebarAccentFg: '#0f172a',
		sidebarBorder: 'rgba(15, 23, 42, 0.06)',
		shadowSm: '0 1px 2px rgba(0,0,0,0.03)',
		shadowMd: '0 4px 6px -1px rgba(0,0,0,0.04)',
		shadowLg: '0 10px 15px -3px rgba(0,0,0,0.04)',
		shadowXl: '0 20px 25px -5px rgba(0,0,0,0.04)',
		shadowPremium: '0 0 0 1px rgba(0,0,0,0.04), 0 10px 30px -5px rgba(0,0,0,0.05)',
		success: '#16a34a',
		warning: '#ca8a04',
		info: '#0284c7',
	},

	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	// NEBULA — Deep cosmic charcoal purple
	// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
	nebula: {
		name: 'nebula',
		label: 'Nebula',
		brightness: 'dark',
		primary: '#a78bfa',
		secondary: '#22d3ee',
		bg: '#0a0614',
		fg: '#f1f5f9',
		card: '#130c24',
		cardFg: '#f1f5f9',
		popover: '#1a1030',
		popoverFg: '#f1f5f9',
		muted: '#170e2b',
		mutedFg: '#9d8ac7',
		accent: '#20143b',
		accentFg: '#f1f5f9',
		secondary_surface: '#170e2b',
		secondaryFg: '#f1f5f9',
		surface0: '#07040f',
		surface1: '#0d081a',
		surface2: '#140d26',
		surface3: '#1e1438',
		border: 'rgba(167, 139, 250, 0.12)',
		borderSubtle: 'rgba(167, 139, 250, 0.10)',
		borderHover: 'rgba(167, 139, 250, 0.40)',
		input: '#20143b',
		ring: '#a78bfa',
		sidebar: '#0d081a',
		sidebarFg: '#9d8ac7',
		sidebarAccent: '#170e2b',
		sidebarAccentFg: '#f1f5f9',
		sidebarBorder: 'rgba(167, 139, 250, 0.10)',
		shadowSm: '0 1px 3px rgba(0,0,0,0.4)',
		shadowMd: '0 4px 8px -1px rgba(0,0,0,0.5)',
		shadowLg: '0 12px 20px -4px rgba(0,0,0,0.5)',
		shadowXl: '0 24px 32px -6px rgba(0,0,0,0.6)',
		shadowPremium: '0 0 0 1px rgba(167,139,250,0.06), 0 20px 50px -10px rgba(0,0,0,0.7)',
		success: '#a78bfa',
		warning: '#c084fc',
		info: '#22d3ee',
	},
} as const;

export const THEME_LIST = Object.values(THEMES);
export const DEFAULT_THEME: ThemeName = 'obsidian';

// ─── Z-Index Scale ─────────────────────────────────────────────────────────────
export const Z = {
	bg3d: -1,
	base: 0,
	content: 10,
	sidebar: 20,
	topbar: 30,
	modal: 50,
	toast: 60,
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
