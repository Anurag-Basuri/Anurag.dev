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
		file: 'Overview',
		description: 'Personal info, bio, and skills',
	},
	{
		id: 'experience',
		moduleId: 'experience',
		label: 'Experience',
		file: 'Journey',
		description: 'Work history and roles',
	},
	{
		id: 'education',
		moduleId: 'education',
		label: 'Education',
		file: 'Academics',
		description: 'Academic background',
	},
	{
		id: 'projects',
		moduleId: 'projects',
		label: 'Projects',
		file: 'Innovations',
		description: 'Featured applications',
	},
	{
		id: 'certifications',
		moduleId: 'certifications',
		label: 'Certifications',
		file: 'Credentials',
		description: 'Professional credentials',
	},
	{
		id: 'blog',
		moduleId: 'blog',
		label: 'Blog',
		file: 'Insights',
		description: 'Articles and insights',
	},
	{
		id: 'achievements',
		moduleId: 'achievements',
		label: 'Achievements',
		file: 'Triumphs',
		description: 'Awards and hackathons',
	},
	{
		id: 'coding_stats',
		moduleId: 'coding_stats',
		label: 'Coding Stats',
		file: 'Telemetry',
		description: 'LeetCode, GitHub, etc.',
	},
	{
		id: 'contact',
		moduleId: 'contact',
		label: 'Contact',
		file: 'Connect',
		description: 'Get in touch',
	},
];

export const SECTION_MAP = new Map(SECTIONS.map(s => [s.id, s]));
export const SECTION_IDS = SECTIONS.map(s => s.id);

export function getSectionIndex(id: string): number {
	return SECTIONS.findIndex(s => s.id === id);
}

