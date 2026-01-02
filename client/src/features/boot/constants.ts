// Boot Sequence Configuration
// All timing, phases, and display constants in one place

export const BOOT_CONFIG = {
	// Timing
	PHASE_DURATION: 1.6, // seconds per phase
	COMPLETE_DELAY: 400, // ms after 100% before transitioning

	// Matrix Rain Effect
	MATRIX_CHARS: 'संगणकदात्तयंत्रतर्कजालसंकेतविधिस्मृति01',
	MATRIX_FONT_SIZE: 14,
	MATRIX_INTERVAL: 50, // ms between frames
} as const;

export const BOOT_PHASES = [
	{ label: 'YANTRA', status: 'INITIALIZING YANTRA...' },
	{ label: 'SMRITI', status: 'ALLOCATING MEMORY...' },
	{ label: 'TARK', status: 'LOADING LOGIC MODULES...' },
	{ label: 'JAL', status: 'CONNECTING TO NETWORK...' },
	{ label: 'READY', status: 'SYSTEM READY' },
] as const;

export const ROLES = [
	'Full Stack Developer',
	'AI and ML Enthusiast',
	'Problem Solver',
	'Creative Technologist',
] as const;

// Computed
export const BOOT_TOTAL_DURATION = BOOT_CONFIG.PHASE_DURATION * BOOT_PHASES.length;
