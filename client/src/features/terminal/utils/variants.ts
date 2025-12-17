export const expandedVariants = {
	initial: { opacity: 0, y: 20, scale: 0.98 },
	animate: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 300,
			damping: 25,
		},
	},
	exit: {
		opacity: 0,
		y: 10,
		scale: 0.98,
		transition: { duration: 0.15 },
	},
} as const;

export const collapsedVariants = {
	initial: { opacity: 0 },
	animate: {
		opacity: 1,
		transition: { duration: 0.15 },
	},
	exit: {
		opacity: 0,
		transition: { duration: 0.1 },
	},
} as const;
