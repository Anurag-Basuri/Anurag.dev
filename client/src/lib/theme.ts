// ─── Centralized Section Theme Registry ─────────────────────────
// Unified design tokens for section branding across the portfolio.
// Pins to the active runtime theme (--primary, --border, etc.) to ensure
// 100% visual harmony between the Boot sequence, Sidebar, and Section contents.

export type SectionAccent = 'primary';

export interface SectionTheme {
	accent: SectionAccent;
	/** Text color for icons and active labels */
	color: string;
	/** Hover background tint */
	hoverBg: string;
	/** Active gradient background (from-*) */
	activeBg: string;
	/** Active text color */
	activeText: string;
	/** Active left-edge glow line */
	activeGlow: string;
	/** SectionHeader icon text color */
	icon: string;
	/** SectionHeader badge background + border */
	badge: string;
	/** SectionHeader accent line gradient */
	line: string;
	/** SectionHeader glow dot */
	glow: string;
	/** Raw hex or CSS variable */
	hex: string;
}

const UNIFIED_SECTION_THEME: SectionTheme = {
	accent: 'primary',
	color: 'text-primary',
	hoverBg: 'hover:bg-foreground/5',
	activeBg: 'from-primary/15 to-transparent',
	activeText: 'text-foreground font-semibold',
	activeGlow: 'bg-primary shadow-[0_0_8px_var(--primary)]',
	icon: 'text-primary',
	badge: 'bg-primary/10 border-primary/25',
	line: 'from-primary/50 via-primary/20 to-transparent',
	glow: 'bg-primary',
	hex: 'var(--primary)',
};

export const SECTION_THEMES: Record<string, SectionTheme> = {
	profile: UNIFIED_SECTION_THEME,
	projects: UNIFIED_SECTION_THEME,
	experience: UNIFIED_SECTION_THEME,
	education: UNIFIED_SECTION_THEME,
	certifications: UNIFIED_SECTION_THEME,
	achievements: UNIFIED_SECTION_THEME,
	coding_stats: UNIFIED_SECTION_THEME,
	blog: UNIFIED_SECTION_THEME,
	contact: UNIFIED_SECTION_THEME,
};

export const DEFAULT_THEME = UNIFIED_SECTION_THEME;

/** Look up a section's theme by ID */
export function getSectionTheme(sectionId: string): SectionTheme {
	return SECTION_THEMES[sectionId] || DEFAULT_THEME;
}
