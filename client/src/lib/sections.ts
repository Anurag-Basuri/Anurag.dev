// Section registry — defines the order and metadata for all scroll sections

export interface SectionConfig {
	/** Unique section identifier, used as scroll target and URL slug */
	id: string;
	/** Module ID from moduleRegistry — the component to render */
	moduleId: string;
	/** Display label for sidebar/TOC */
	label: string;
	/** File name shown in sidebar */
	file: string;
	/** Short description for tooltips */
	description: string;
}

/**
 * Ordered list of all portfolio sections.
 * This defines the scroll order — About at top, Contact at bottom.
 */
export const SECTIONS: SectionConfig[] = [
	{
		id: 'about',
		moduleId: 'about',
		label: 'About Me',
		file: 'about.me',
		description: 'Who I am and what I do',
	},
	{
		id: 'resume',
		moduleId: 'resume',
		label: 'Resume',
		file: 'resume.pdf',
		description: 'Professional experience and skills',
	},
	{
		id: 'journey',
		moduleId: 'journey',
		label: 'Journey',
		file: 'journey.log',
		description: 'Career timeline and milestones',
	},
	{
		id: 'projects',
		moduleId: 'projects',
		label: 'Projects',
		file: 'projects.app',
		description: 'Things I have built',
	},
	{
		id: 'certifications',
		moduleId: 'certifications',
		label: 'Certifications',
		file: 'certifications.md',
		description: 'Professional credentials',
	},
	{
		id: 'blog',
		moduleId: 'blog',
		label: 'Blog',
		file: 'blog.md',
		description: 'Articles and insights',
	},
	{
		id: 'profiles',
		moduleId: 'profiles',
		label: 'Coding Profiles',
		file: 'profiles.app',
		description: 'LeetCode, GitHub, and more',
	},
	{
		id: 'ailab',
		moduleId: 'ailab',
		label: 'Ask Anurag',
		file: 'ask-anurag.ai',
		description: 'AI assistant that speaks on my behalf',
	},
	{
		id: 'contact',
		moduleId: 'contact',
		label: 'Contact',
		file: 'contact.sh',
		description: 'Get in touch',
	},
];

/** Map from section ID to section config for quick lookups */
export const SECTION_MAP = new Map(SECTIONS.map(s => [s.id, s]));

/** All section IDs in order */
export const SECTION_IDS = SECTIONS.map(s => s.id);

/** Find section index by ID */
export function getSectionIndex(id: string): number {
	return SECTIONS.findIndex(s => s.id === id);
}
