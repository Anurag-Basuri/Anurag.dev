// Section registry — defines the order and metadata for all scroll sections
import type { AppModuleId } from './routes';

export interface SectionConfig {
	/** Unique section identifier, used as scroll target and URL slug */
	id: string;
	/** Module ID from moduleRegistry — the component to render */
	moduleId: AppModuleId;
	/** Display label for sidebar/TOC */
	label: string;
	/** File name shown in sidebar */
	file: string;
	/** Short description for tooltips */
	description: string;
}

/**
 * Ordered list of all portfolio sections matching the DB Schema.
 */
export const SECTIONS: SectionConfig[] = [
	{
		id: 'profile',
		moduleId: 'profile',
		label: 'Profile',
		file: 'profile.me',
		description: 'Personal info, bio, and skills',
	},
	{
		id: 'experience',
		moduleId: 'experience',
		label: 'Experience',
		file: 'experience.log',
		description: 'Work history and roles',
	},
	{
		id: 'education',
		moduleId: 'education',
		label: 'Education',
		file: 'education.log',
		description: 'Academic background',
	},
	{
		id: 'projects',
		moduleId: 'projects',
		label: 'Projects',
		file: 'projects.app',
		description: 'Featured applications',
	},
	{
		id: 'achievements',
		moduleId: 'achievements',
		label: 'Achievements',
		file: 'achievements.md',
		description: 'Awards and hackathons',
	},
	{
		id: 'certifications',
		moduleId: 'certifications',
		label: 'Certifications',
		file: 'certifications.pdf',
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
		id: 'coding_stats',
		moduleId: 'coding_stats',
		label: 'Coding Stats',
		file: 'coding_stats.sh',
		description: 'LeetCode, GitHub, etc.',
	},
	{
		id: 'contact',
		moduleId: 'contact',
		label: 'Contact',
		file: 'contact.sh',
		description: 'Get in touch',
	},
];

export const SECTION_MAP = new Map(SECTIONS.map(s => [s.id, s]));
export const SECTION_IDS = SECTIONS.map(s => s.id);

export function getSectionIndex(id: string): number {
	return SECTIONS.findIndex(s => s.id === id);
}
