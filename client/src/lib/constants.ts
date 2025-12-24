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
