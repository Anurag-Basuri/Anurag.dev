import { Variants } from 'framer-motion';

// Standardized animation variants for consistent UI across all modules
export const fadeInUp: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

export const fadeInDown: Variants = {
	hidden: { opacity: 0, y: -20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

export const fadeIn: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { duration: 0.3 },
	},
};

export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.95 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

export const slideInLeft: Variants = {
	hidden: { opacity: 0, x: -20 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

export const slideInRight: Variants = {
	hidden: { opacity: 0, x: 20 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

// Staggered container for list animations
export const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.1,
		},
	},
};

// List item variant for staggered animations
export const staggerItem: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.3 },
	},
};

// Card hover animation presets
export const cardHover = {
	scale: 1.02,
	transition: { duration: 0.2 },
};

// Standard transition presets
export const transitions = {
	spring: { type: 'spring', stiffness: 300, damping: 30 },
	smooth: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
	fast: { duration: 0.15 },
};

// Viewport settings for scroll animations
export const viewportSettings = {
	once: true,
	margin: '-50px',
};
