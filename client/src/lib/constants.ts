export const DEFAULT_LAYOUT = {
	sidebar: { collapsed: false, size: 20 },
	terminal: { collapsed: false, size: 25 },
	main: {
		vertical: [75, 25],
		horizontal: [20, 80],
	},
};

export const LAYOUT_STORAGE_KEYS = {
	state: 'layout:state',
	mainVertical: 'layout:main-v',
	mainHorizontal: 'layout:main-h',
	sidebarCollapsed: 'layout:sidebar-collapsed',
	terminalCollapsed: 'layout:terminal-collapsed',
} as const;

export const ANIMATION_DURATIONS = {
	fast: 0.15,
	normal: 0.2,
	slow: 0.3,
} as const;

/**
 * Panel size constraints and defaults for resizable layout
 */
export const PANEL_CONFIG = {
	HORIZONTAL: {
		SIDEBAR: { defaultSize: '20%', minSize: '10%', maxSize: '30%', collapsedSize: '0%' },
		MAIN: { defaultSize: '80%', minSize: '50%' },
	},
	VERTICAL: {
		CONTENT: { defaultSize: '65%', minSize: '30%' },
		TERMINAL: { defaultSize: '35%', minSize: '10%', maxSize: '60%', collapsedSize: '0%' },
	},
	DEFAULTS: {
		horizontal: [20, 80] as [number, number],
		vertical: [60, 40] as [number, number],
	},
} as const;

/**
 * Unified animation configuration for panels
 * Ensures consistent, smooth transitions across all panels
 */
export const PANEL_ANIMATION = {
	layout: {
		type: 'spring' as const,
		stiffness: 280,
		damping: 28,
		mass: 1.2,
	},
	opacity: {
		duration: 0.12,
		ease: [0.4, 0, 0.2, 1] as [number, number, number, number], // Cubic ease-out
	},
} as const;

/**
 * Design tokens for panel styling consistency
 */
export const PANEL_DESIGN = {
	border: {
		opacity: 'border-border/50',
		width: 'border',
	},
	shadow: {
		default: 'shadow-2xl shadow-black/20',
		hover: 'hover:shadow-emerald-500/10',
	},
	backdrop: 'backdrop-blur-sm', // Reduced from md for performance
	gap: 'gap-2', // 8px instead of 4px
} as const;
