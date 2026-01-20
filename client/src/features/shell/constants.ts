// Shell Design Tokens
// Styling constants for the portfolio layout

export const PANEL_STYLES = {
	base: 'overflow-hidden backdrop-blur-xl border border-border/25 rounded-xl ring-1 ring-inset ring-border/15 transition-[border,box-shadow,background-color] duration-300',
	collapsed: 'border-transparent ring-transparent shadow-none bg-transparent',
	sidebar: 'bg-sidebar/70 dark:bg-sidebar/55 shadow-sm dark:shadow-lg',
	content: 'bg-card/75 dark:bg-card/55 shadow-lg ring-1 ring-primary/10',
	terminal: 'bg-sidebar/75 dark:bg-sidebar/60 shadow-sm dark:shadow-lg',
	mobile: 'bg-card/80 dark:bg-card/60 shadow-md',
	maximized: 'bg-background shadow-2xl',
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
	gap: 'gap-2',
	padding: 'p-2',
	inner: 'p-2',
} as const;
