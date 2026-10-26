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
	/** 2-digit index string matching BootScreen style */
	indexStr: string;
	/** Short section domain tag */
	tag: string;
	/** Short description for tooltips */
	description: string;
}

/**
 * Ordered list of all portfolio sections matching the DB Schema.
 * Projects directly follows Profile for immediate engineering demonstration.
 */
export const SECTIONS: SectionConfig[] = [
	{
		id: 'profile',
		moduleId: 'profile',
		label: 'Overview',
		file: '01_Overview',
		indexStr: '01',
		tag: 'DOSSIER',
		description: 'Personal info, bio, skills, and telemetry',
	},
	{
		id: 'projects',
		moduleId: 'projects',
		label: 'Projects',
		file: '02_Projects',
		indexStr: '02',
		tag: 'SYSTEMS',
		description: 'Featured applications and autonomous agents',
	},
	{
		id: 'experience',
		moduleId: 'experience',
		label: 'Journey',
		file: '03_Journey',
		indexStr: '03',
		tag: 'CAREER',
		description: 'Work history, production impact, and roles',
	},
	{
		id: 'education',
		moduleId: 'education',
		label: 'Academics',
		file: '04_Academics',
		indexStr: '04',
		tag: 'FOUNDATION',
		description: 'Academic background and CSE fundamentals',
	},
	{
		id: 'certifications',
		moduleId: 'certifications',
		label: 'Credentials',
		file: '05_Credentials',
		indexStr: '05',
		tag: 'LICENSES',
		description: 'Verified credentials and cloud badges',
	},
	{
		id: 'achievements',
		moduleId: 'achievements',
		label: 'Honors',
		file: '06_Honors',
		indexStr: '06',
		tag: 'AWARDS',
		description: 'National hackathon finalists and awards',
	},
	{
		id: 'coding_stats',
		moduleId: 'coding_stats',
		label: 'Telemetry',
		file: '07_Telemetry',
		indexStr: '07',
		tag: 'BENCHMARKS',
		description: 'LeetCode, GitHub activity, and statistics',
	},
	{
		id: 'blog',
		moduleId: 'blog',
		label: 'Insights',
		file: '08_Insights',
		indexStr: '08',
		tag: 'WRITINGS',
		description: 'Technical articles, research, and deep dives',
	},
	{
		id: 'contact',
		moduleId: 'contact',
		label: 'Connect',
		file: '09_Connect',
		indexStr: '09',
		tag: 'CHANNELS',
		description: 'Get in touch and communication endpoints',
	},
];

export const SECTION_MAP = new Map(SECTIONS.map(s => [s.id, s]));
export const SECTION_IDS = SECTIONS.map(s => s.id);

export function getSectionIndex(id: string): number {
	return SECTIONS.findIndex(s => s.id === id);
}

