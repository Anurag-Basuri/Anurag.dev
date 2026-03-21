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

// Ensure Tailwind JIT compiler doesn't purge by explicitly declaring full classes
export const SECTION_THEMES: Record<string, SectionTheme> = {
	profile: {
		accent: 'pink',
		color: 'text-pink-400',
		hoverBg: 'hover:bg-pink-500/10',
		activeBg: 'from-pink-500/15',
		activeText: 'text-pink-400',
		activeGlow: 'bg-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.6)]',
		icon: 'text-pink-500',
		badge: 'bg-pink-500/10 border-pink-500/20',
		line: 'from-pink-500/50',
		glow: 'bg-pink-500',
		hex: '#f472b6',
	},
	experience: {
		accent: 'purple',
		color: 'text-purple-400',
		hoverBg: 'hover:bg-purple-500/10',
		activeBg: 'from-purple-500/15',
		activeText: 'text-purple-400',
		activeGlow: 'bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.6)]',
		icon: 'text-purple-500',
		badge: 'bg-purple-500/10 border-purple-500/20',
		line: 'from-purple-500/50',
		glow: 'bg-purple-500',
		hex: '#c084fc',
	},
	education: {
		accent: 'blue',
		color: 'text-blue-400',
		hoverBg: 'hover:bg-blue-500/10',
		activeBg: 'from-blue-500/15',
		activeText: 'text-blue-400',
		activeGlow: 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.6)]',
		icon: 'text-blue-500',
		badge: 'bg-blue-500/10 border-blue-500/20',
		line: 'from-blue-500/50',
		glow: 'bg-blue-500',
		hex: '#60a5fa',
	},
	projects: {
		accent: 'yellow',
		color: 'text-yellow-400',
		hoverBg: 'hover:bg-yellow-500/10',
		activeBg: 'from-yellow-500/15',
		activeText: 'text-yellow-400',
		activeGlow: 'bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)]',
		icon: 'text-yellow-500',
		badge: 'bg-yellow-500/10 border-yellow-500/20',
		line: 'from-yellow-500/50',
		glow: 'bg-yellow-500',
		hex: '#facc15',
	},
	achievements: {
		accent: 'orange',
		color: 'text-orange-400',
		hoverBg: 'hover:bg-orange-500/10',
		activeBg: 'from-orange-500/15',
		activeText: 'text-orange-400',
		activeGlow: 'bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.6)]',
		icon: 'text-orange-500',
		badge: 'bg-orange-500/10 border-orange-500/20',
		line: 'from-orange-500/50',
		glow: 'bg-orange-500',
		hex: '#fb923c',
	},
	certifications: {
		accent: 'emerald',
		color: 'text-emerald-400',
		hoverBg: 'hover:bg-emerald-500/10',
		activeBg: 'from-emerald-500/15',
		activeText: 'text-emerald-400',
		activeGlow: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]',
		icon: 'text-emerald-500',
		badge: 'bg-emerald-500/10 border-emerald-500/20',
		line: 'from-emerald-500/50',
		glow: 'bg-emerald-500',
		hex: '#34d399',
	},
	blog: {
		accent: 'sky',
		color: 'text-sky-400',
		hoverBg: 'hover:bg-sky-500/10',
		activeBg: 'from-sky-500/15',
		activeText: 'text-sky-400',
		activeGlow: 'bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]',
		icon: 'text-sky-500',
		badge: 'bg-sky-500/10 border-sky-500/20',
		line: 'from-sky-500/50',
		glow: 'bg-sky-500',
		hex: '#38bdf8',
	},
	coding_stats: {
		accent: 'red',
		color: 'text-red-400',
		hoverBg: 'hover:bg-red-500/10',
		activeBg: 'from-red-500/15',
		activeText: 'text-red-400',
		activeGlow: 'bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.6)]',
		icon: 'text-red-500',
		badge: 'bg-red-500/10 border-red-500/20',
		line: 'from-red-500/50',
		glow: 'bg-red-500',
		hex: '#f87171',
	},
	contact: {
		accent: 'indigo',
		color: 'text-indigo-400',
		hoverBg: 'hover:bg-indigo-500/10',
		activeBg: 'from-indigo-500/15',
		activeText: 'text-indigo-400',
		activeGlow: 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.6)]',
		icon: 'text-indigo-500',
		badge: 'bg-indigo-500/10 border-indigo-500/20',
		line: 'from-indigo-500/50',
		glow: 'bg-indigo-500',
		hex: '#818cf8',
	},
};

export const DEFAULT_THEME = SECTION_THEMES.certifications;

/** Look up a section's theme by ID */
export function getSectionTheme(sectionId: string): SectionTheme {
	return SECTION_THEMES[sectionId] || DEFAULT_THEME;
}
