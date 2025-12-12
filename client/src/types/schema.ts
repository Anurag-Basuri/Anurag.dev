export interface Project {
	id: string;
	title: string;
	description: string;
	techStack: string[];
	githubUrl?: string | null;
	liveUrl?: string | null;
	status: 'draft' | 'published' | 'archived' | 'Completed';
	stars?: number | null;
	forks?: number | null;
	commits?: number | null;
	featured?: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface JourneyEntry {
	id: string;
	year: number;
	title: string;
	description: string;
	category: string;
	order: number;
}

export interface BlogPost {
	id: string;
	title: string;
	slug: string;
	content: string;
	tags: string[];
	status: 'draft' | 'published';
	publishedAt?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ContactMessage {
	id?: string;
	name: string;
	email: string;
	subject: string;
	message: string;
}

export interface Skill {
	name: string;
	level: number;
}

export interface AboutData {
	name: string;
	tagline: string;
	short: string;
	skills: {
		frontend: Skill[];
		backend: Skill[];
		ml: Skill[];
	};
}

export interface Certification {
	id: string;
	title: string;
	issuer: string;
	date: string;
	credentialUrl?: string;
	skills: string[];
}
