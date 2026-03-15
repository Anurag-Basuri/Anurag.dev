// Design tokens used by panel headers, sidebar, terminal, and window controls

export const SPRINGS = {
	gentle: { type: 'spring' as const, stiffness: 200, damping: 25 },
	normal: { type: 'spring' as const, stiffness: 300, damping: 30 },
	snappy: { type: 'spring' as const, stiffness: 400, damping: 20 },
} as const;

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
