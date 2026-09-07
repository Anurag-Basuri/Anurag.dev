// Boot Sequence Configuration
// Minimal, premium boot — timing constants only

export const BOOT_CONFIG = {
	// Total boot animation duration in ms
	BOOT_DURATION: 2000,
	// Delay after progress hits 100% before transitioning out (exit animation time)
	COMPLETE_DELAY: 350,
	// Delay before the skip hint text fades in
	SKIP_HINT_DELAY: 600,
} as const;

export const ROLES = [
	'Full Stack Developer',
	'AI and ML Enthusiast',
	'Problem Solver',
	'Creative Technologist',
] as const;
