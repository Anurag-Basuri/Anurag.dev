// Route configuration for the portfolio application
// Maps filesystem paths to module IDs for consistent routing

export type ModuleId =
	| 'profile'
	| 'experience'
	| 'education'
	| 'projects'
	| 'achievements'
	| 'certifications'
	| 'blog'
	| 'coding_stats'
	| 'contact';

// Module metadata for SEO and display
interface ModuleMetadata {
	title: string;
	description: string;
	keywords: string[];
}

const moduleMetadata: Record<ModuleId, ModuleMetadata> = {
	profile: {
		title: 'Profile',
		description: 'Full-stack engineer passionate about building elegant solutions.',
		keywords: ['about', 'bio', 'resume', 'skills', 'experience', 'full-stack engineer'],
	},
	experience: {
		title: 'Experience',
		description: 'My professional work history, internships, and roles.',
		keywords: ['experience', 'work', 'job', 'career', 'internship'],
	},
	education: {
		title: 'Education',
		description: 'My academic background, degrees, and coursework.',
		keywords: ['education', 'university', 'college', 'degree', 'academics'],
	},
	projects: {
		title: 'Projects',
		description: 'Portfolio of web applications, AI experiments, and open-source contributions.',
		keywords: ['projects', 'portfolio', 'work', 'applications', 'development'],
	},
	achievements: {
		title: 'Achievements',
		description: 'Hackathon wins, awards, and professional milestones.',
		keywords: ['achievements', 'hackathons', 'awards', 'medals', 'competitions'],
	},
	certifications: {
		title: 'Certifications',
		description: 'Professional credentials and technical certifications.',
		keywords: ['certifications', 'achievements', 'credentials', 'courses'],
	},
	blog: {
		title: 'Blog',
		description: 'Technical articles, tutorials, and insights on software engineering.',
		keywords: ['blog', 'articles', 'tutorials', 'technical writing'],
	},
	coding_stats: {
		title: 'Coding Stats',
		description: 'Coding profiles, LeetCode stats, and GitHub contributions.',
		keywords: ['leetcode', 'github', 'codeforces', 'coding', 'statistics', 'profiles'],
	},
	contact: {
		title: 'Contact',
		description: 'Get in touch for collaboration opportunities or freelance work.',
		keywords: ['contact', 'email', 'connect', 'hire', 'freelance'],
	},
};

const routeToModuleMap: Record<string, ModuleId> = {
	profile: 'profile',
	experience: 'experience',
	education: 'education',
	projects: 'projects',
	achievements: 'achievements',
	certifications: 'certifications',
	blog: 'blog',
	coding_stats: 'coding_stats',
	contact: 'contact',
	// Legacy aliases
	about: 'profile',
	journey: 'experience',
	profiles: 'coding_stats',
};

export function resolveModuleFromSlug(slug: string[]): ModuleId | null {
	if (!slug || slug.length === 0) return null;

	const lastSegment = slug[slug.length - 1];
	if (lastSegment in routeToModuleMap) return routeToModuleMap[lastSegment];

	const firstSegment = slug[0];
	if (firstSegment in routeToModuleMap) return routeToModuleMap[firstSegment];

	return null;
}

export function getModulePath(moduleId: ModuleId): string {
	return `/portfolio/${moduleId}`;
}

export function getModuleMetadata(moduleId: ModuleId): ModuleMetadata {
	return moduleMetadata[moduleId];
}

export function isValidModule(id: string): id is ModuleId {
	return id in routeToModuleMap || Object.values(routeToModuleMap).includes(id as ModuleId);
}

export function getAllModuleIds(): ModuleId[] {
	return Object.keys(moduleMetadata) as ModuleId[];
}

export type AppModuleId = ModuleId;



