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
