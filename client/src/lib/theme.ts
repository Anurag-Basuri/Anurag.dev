// ─── Centralized Section Theme Registry ─────────────────────────
// Single source of truth for every section's accent color.
// Both the Sidebar (TableOfContents) and SectionHeader consume this.

export type SectionAccent =
	| 'pink'
	| 'purple'
	| 'blue'
	| 'yellow'
	| 'orange'
	| 'emerald'
	| 'sky'
	| 'red'
	| 'indigo';

export interface SectionTheme {
	accent: SectionAccent;
	/** Tailwind text color for icons and active labels */
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
	/** Raw hex for CSS custom properties */
	hex: string;
}

const t = (
	accent: SectionAccent,
	tw: string,
	hex: string,
	rgb: string,
): SectionTheme => ({
	accent,
	color: `text-${tw}-400`,
	hoverBg: `hover:bg-${tw}-500/10`,
	activeBg: `from-${tw}-500/15`,
	activeText: `text-${tw}-400`,
	activeGlow: `bg-${tw}-400 shadow-[0_0_12px_rgba(${rgb},0.6)]`,
	icon: `text-${tw}-500`,
	badge: `bg-${tw}-500/10 border-${tw}-500/20`,
	line: `from-${tw}-500/50`,
	glow: `bg-${tw}-500`,
	hex,
});

/**
 * Every section maps to exactly one theme.
 */
export const SECTION_THEMES: Record<string, SectionTheme> = {
	profile:        t('pink',    'pink',    '#f472b6', '244,114,182'),
	experience:     t('purple',  'purple',  '#c084fc', '192,132,252'),
	education:      t('blue',    'blue',    '#60a5fa', '96,165,250'),
	projects:       t('yellow',  'yellow',  '#facc15', '250,204,21'),
	achievements:   t('orange',  'orange',  '#fb923c', '251,146,60'),
	certifications: t('emerald', 'emerald', '#34d399', '52,211,153'),
	blog:           t('sky',     'sky',     '#38bdf8', '56,189,248'),
	coding_stats:   t('red',     'red',     '#f87171', '248,113,113'),
	contact:        t('indigo',  'indigo',  '#818cf8', '129,140,248'),
};

export const DEFAULT_THEME: SectionTheme = t('emerald', 'emerald', '#34d399', '52,211,153');

/** Look up a section's theme by ID */
export function getSectionTheme(sectionId: string): SectionTheme {
	return SECTION_THEMES[sectionId] || DEFAULT_THEME;
}
