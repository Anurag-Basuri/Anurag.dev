// Route configuration for the portfolio application
// Maps filesystem paths to module IDs for consistent routing

export type ModuleId =
	| 'about'
	| 'projects'
	| 'journey'
	| 'certifications'
	| 'blog'
	| 'contact'
	| 'ailab'
	| 'profiles';

// Module metadata for SEO and display
interface ModuleMetadata {
	title: string;
	description: string;
	keywords: string[];
}

const moduleMetadata: Record<ModuleId, ModuleMetadata> = {
	about: {
		title: 'About Me',
		description:
			'Full-stack engineer passionate about building elegant solutions. Learn about my background, skills, and experience.',
		keywords: ['about', 'bio', 'resume', 'skills', 'experience', 'full-stack engineer'],
	},
	projects: {
		title: 'Projects',
		description:
			'Explore my portfolio of web applications, AI experiments, and open-source contributions.',
		keywords: ['projects', 'portfolio', 'work', 'applications', 'development'],
	},
	journey: {
		title: 'My Journey',
		description: 'My career timeline, educational background, and professional milestones.',
		keywords: ['journey', 'career', 'timeline', 'education', 'experience'],
	},
	certifications: {
		title: 'Certifications',
		description:
			'Professional certifications and achievements in software development and cloud computing.',
		keywords: ['certifications', 'achievements', 'credentials', 'courses'],
	},
	blog: {
		title: 'Blog',
		description:
			'Technical articles, tutorials, and insights on web development and software engineering.',
		keywords: ['blog', 'articles', 'tutorials', 'technical writing'],
	},
	contact: {
		title: 'Contact',
		description:
			'Get in touch with me for collaboration opportunities, freelance work, or just to say hello.',
		keywords: ['contact', 'email', 'connect', 'hire', 'freelance'],
	},
	ailab: {
		title: 'AI Lab',
		description:
			'Experimental AI projects, machine learning demos, and cutting-edge technology explorations.',
		keywords: ['ai', 'machine learning', 'experiments', 'technology'],
	},
	profiles: {
		title: 'Coding Profiles',
		description:
			'My coding statistics, competitive programming achievements, and contribution graphs.',
		keywords: ['leetcode', 'github', 'codeforces', 'coding', 'statistics'],
	},
};

// Route segments to module ID mapping
// Handles both direct routes (/app/about) and nested routes (/app/bio/about)
const routeToModuleMap: Record<string, ModuleId> = {
	// Direct routes
	about: 'about',
	projects: 'projects',
	journey: 'journey',
	certifications: 'certifications',
	blog: 'blog',
	contact: 'contact',
	ailab: 'ailab',
	profiles: 'profiles',
	// Nested route aliases (folder/file structure)
	bio: 'about',
	work: 'projects',
	connect: 'contact',
	certs: 'certifications',
};

/**
 * Resolves a route slug array to a module ID
 * @param slug - Array of route segments, e.g., ['bio', 'about'] or ['projects']
 * @returns The resolved module ID or null if invalid
 */
export function resolveModuleFromSlug(slug: string[]): ModuleId | null {
	if (!slug || slug.length === 0) {
		return 'about'; // Default module
	}

	// Try the last segment first (most specific)
	const lastSegment = slug[slug.length - 1];
	if (lastSegment in routeToModuleMap) {
		return routeToModuleMap[lastSegment];
	}

	// Try the first segment (folder)
	const firstSegment = slug[0];
	if (firstSegment in routeToModuleMap) {
		return routeToModuleMap[firstSegment];
	}

	return null;
}

/**
 * Gets the canonical URL path for a module
 * @param moduleId - The module identifier
 * @returns The URL path for the module
 */
export function getModulePath(moduleId: ModuleId): string {
	return `/app/${moduleId}`;
}

/**
 * Gets the metadata for a module
 * @param moduleId - The module identifier
 * @returns The module metadata
 */
export function getModuleMetadata(moduleId: ModuleId): ModuleMetadata {
	return moduleMetadata[moduleId];
}

/**
 * Checks if a string is a valid module ID
 */
export function isValidModule(id: string): id is ModuleId {
	return id in routeToModuleMap || Object.values(routeToModuleMap).includes(id as ModuleId);
}

/**
 * Gets all valid module IDs
 */
export function getAllModuleIds(): ModuleId[] {
	return Object.keys(moduleMetadata) as ModuleId[];
}

// Navigation items for menus
export const navigationItems: Array<{ id: ModuleId; label: string; description: string }> = [
	{ id: 'about', label: 'About Me', description: 'Bio & Resume' },
	{ id: 'projects', label: 'Projects', description: 'Recent Work' },
	{ id: 'journey', label: 'My Journey', description: 'Career Timeline' },
	{ id: 'contact', label: 'Contact', description: 'Get in Touch' },
];

// Quick access modules for taskbar
export const taskbarModules: ModuleId[] = ['about', 'projects', 'journey', 'contact'];
