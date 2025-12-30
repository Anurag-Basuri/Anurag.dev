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

// Legacy export for backwards compatibility
export const TIMINGS = {
	instant: 0,
	fast: 150,
	normal: 200,
	slow: 300,
	slower: 500,
} as const;

export const EASINGS = {
	smooth: [0.25, 0.46, 0.45, 0.94] as const,
	snappy: [0.16, 1, 0.3, 1] as const,
	bounce: [0.68, -0.55, 0.265, 1.55] as const,
} as const;

export const SPRINGS = {
	gentle: { type: 'spring' as const, stiffness: 200, damping: 25 },
	normal: { type: 'spring' as const, stiffness: 300, damping: 30 },
	snappy: { type: 'spring' as const, stiffness: 400, damping: 20 },
} as const;

export const TRANSITIONS = {
	fade: { duration: TIMINGS.normal / 1000, ease: EASINGS.smooth },
	slide: { duration: TIMINGS.normal / 1000, ease: EASINGS.snappy },
	scale: { duration: TIMINGS.fast / 1000, ease: EASINGS.smooth },
	blur: { duration: TIMINGS.normal / 1000 },
} as const;

// Legacy export for backwards compatibility
export const OPACITY = {
	ghost: 10,
	subtle: 20,
	light: 30,
	medium: 40,
	strong: 50,
	heavy: 60,
	solid: 70,
	opaque: 80,
	full: 100,
} as const;

// Legacy export for backwards compatibility
export const Z_INDEX = {
	base: 0,
	panels: 1,
	handles: 2,
	headers: 4,
	dropdowns: 10,
	modals: 20,
	toasts: 30,
	maximized: 50,
} as const;

// Legacy export for backwards compatibility
export const PANEL_CONFIG = {
	HORIZONTAL: {
		SIDEBAR: { defaultSize: '20%', minSize: '3%', maxSize: '30%', collapsedSize: '3%' },
		MAIN: { defaultSize: '80%', minSize: '50%' },
	},
	VERTICAL: {
		CONTENT: { defaultSize: '65%', minSize: '30%' },
		TERMINAL: { defaultSize: '35%', minSize: '3%', maxSize: '60%', collapsedSize: '3%' },
	},
	DEFAULTS: {
		horizontal: [20, 80] as [number, number],
		vertical: [60, 40] as [number, number],
	},
} as const;

// Legacy export for backwards compatibility
export const PANEL_ANIMATION = {
	layout: SPRINGS.normal,
	opacity: TRANSITIONS.fade,
	scale: TRANSITIONS.scale,
	filter: TRANSITIONS.blur,
} as const;

// Legacy export for backwards compatibility
export const PANEL_COLLAPSE = {
	expanded: {
		opacity: 1,
		scale: 1,
		filter: 'blur(0px)',
	},
	collapsed: {
		opacity: 0,
		scale: 0.98,
		filter: 'blur(2px)',
	},
} as const;

// Legacy export for backwards compatibility
export const PANEL_STYLES = {
	sidebar: {
		bg: `bg-sidebar/${OPACITY.medium}`,
		border: `border-border/${OPACITY.light}`,
		blur: 'backdrop-blur-lg',
		shadow: 'shadow-xl',
		rounded: 'rounded-r-xl',
	},
	content: {
		bg: `bg-card/${OPACITY.opaque}`,
		border: `border-border/${OPACITY.subtle}`,
		blur: 'backdrop-blur-xl',
		shadow: 'shadow-xl',
		rounded: 'rounded-xl',
	},
	terminal: {
		bg: `bg-card/${OPACITY.solid}`,
		border: `border-border/${OPACITY.light}`,
		blur: 'backdrop-blur-xl',
		shadow: 'shadow-xl',
		rounded: 'rounded-t-xl',
	},
} as const;

// Legacy export for backwards compatibility
export const HOVER_STATES = {
	button: 'hover:bg-white/10 transition-colors',
	card: 'hover:shadow-lg hover:-translate-y-0.5 transition-all',
	link: 'hover:text-emerald-400 transition-colors',
	panel: 'hover:border-emerald-500/20 transition-colors',
} as const;

export const FOCUS_STATES = {
	default: 'focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
	input: 'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
	button: 'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2',
} as const;

export const ACTIVE_STATES = {
	button: 'active:scale-95',
	card: 'active:scale-[0.98]',
	tab: 'border-b-2 border-emerald-500',
} as const;

// Legacy export for backwards compatibility
export const ANIMATION_DURATIONS = {
	fast: TIMINGS.fast / 1000,
	normal: TIMINGS.normal / 1000,
	slow: TIMINGS.slow / 1000,
} as const;

export const PANEL_DESIGN = {
	gap: 'gap-1',
	backdrop: PANEL_STYLES.content.blur,
	border: {
		opacity: PANEL_STYLES.content.border,
	},
	shadow: {
		default: PANEL_STYLES.content.shadow,
		hover: '',
	},
} as const;

// Legacy export for backwards compatibility
export const PANEL_COLLAPSE_THRESHOLD = 5; // Increased threshold to 5% to safely capture 3% collapsed state
export const COLLAPSE_ANIMATION_DURATION = 250; // Match spring physics duration

// Legacy export for backwards compatibility
export const PANEL_TOKENS = {
	// Shared header styles
	header: {
		height: 'h-9',
		padding: 'px-3',
		bg: 'bg-white/5',
		blur: 'backdrop-blur-md',
		border: 'border-b border-white/5',
		shadow: 'shadow-sm',
	},
	// Collapsed panel button styles
	collapsed: {
		bg: 'bg-zinc-900/50',
		bgHover: 'hover:bg-zinc-900/70',
		transition: 'transition-all duration-200',
		iconSize: 'w-4 h-4',
		iconColor: 'text-white/30',
		iconColorHover: 'group-hover:text-emerald-400',
		textSize: 'text-xs font-mono',
		textColor: 'text-white/30',
		textColorHover: 'group-hover:text-white/60',
	},
	// Input bar styles (shared between terminal input and suggestions)
	inputBar: {
		minHeight: 'min-h-[2rem]',
		padding: 'px-2 sm:px-3',
		bg: 'bg-zinc-900/40',
		blur: 'backdrop-blur-md',
		border: 'border-white/5',
	},
	// Accent colors for focus states and interactive elements
	accent: {
		primary: 'emerald-400',
		secondary: 'emerald-500',
		glow: 'drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]',
		glowBg: 'shadow-[0_0_8px_rgba(52,211,153,0.3)]',
	},
	// Icon sizes
	icons: {
		xs: 'w-2 h-2',
		sm: 'w-3 h-3',
		md: 'w-3.5 h-3.5',
		lg: 'w-4 h-4',
	},
	// Control button (traffic light) styles
	control: {
		size: 'w-3 h-3',
		iconSize: 'w-2 h-2',
		gap: 'gap-1.5',
	},
} as const;
