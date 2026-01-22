// Shell Design Tokens
// Minimal styling constants for the portfolio layout

export const LAYOUT_SPACING = {
	gap: 'gap-2',
	padding: 'p-2',
} as const;

export const MOTION_PRESETS = {
	fadeScale: {
		initial: { opacity: 0, scale: 0.98 },
		animate: { opacity: 1, scale: 1 },
		exit: { opacity: 0, scale: 0.98 },
		transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] },
	},
} as const;
