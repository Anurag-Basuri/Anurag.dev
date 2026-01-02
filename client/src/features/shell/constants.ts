// Shell Design Tokens
// Styling constants for the portfolio layout

export const PANEL_STYLES = {
	base: 'overflow-hidden backdrop-blur-2xl border border-border/30 rounded-lg ring-1 ring-inset ring-border/20 transition-all duration-300',
	collapsed: 'border-transparent ring-transparent shadow-none bg-transparent',
	sidebar: 'bg-sidebar/80 dark:bg-sidebar/60 shadow-md dark:shadow-2xl',
	content: 'bg-card/70 dark:bg-card/50 shadow-sm dark:shadow-xl',
	terminal: 'bg-sidebar/90 dark:bg-sidebar/70 shadow-md dark:shadow-2xl',
	mobile: 'bg-card/80 dark:bg-card/60 shadow-sm dark:shadow-xl',
	maximized: 'bg-background shadow-xl',
} as const;

export const MOTION_PRESETS = {
	fadeScale: {
		initial: { opacity: 0, scale: 0.98 },
		animate: { opacity: 1, scale: 1 },
		exit: { opacity: 0, scale: 0.98 },
		transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] },
	},
} as const;

export const LAYOUT_SPACING = {
	gap: 'gap-1',
	padding: 'p-1',
	inner: 'p-1',
} as const;
