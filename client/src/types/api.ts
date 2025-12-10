export type BackendStatus = 'unknown' | 'online' | 'offline';

export interface Project {
	id: string;
	title: string;
	description: string;
	techStack: string[];
	githubUrl?: string;
	liveUrl?: string;
	status: string;
	stars?: number;
	forks?: number;
	commits?: number;
	createdAt: string;
	updatedAt: string;
	featured?: boolean;
}

export interface JourneyEntry {
	id: string;
	year: number;
	title: string;
	description: string;
	category: string;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface BlogPost {
	id: string;
	title: string;
	slug: string;
	content: string;
	tags: string[];
	status: string;
	publishedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface ContactFormData {
	name: string;
	email: string;
	subject?: string;
	message: string;
}

export interface Skill {
	name: string;
	level: number; // 0-100
}

export interface AboutData {
	name: string;
	tagline: string;
	short: string;
	currentStatus: string[];
	philosophy: string;
	callToAction: string;
	skills: {
		frontend: Skill[];
		backend: Skill[];
		ml: Skill[];
	};
}
