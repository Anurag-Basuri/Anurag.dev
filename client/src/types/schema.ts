export interface Project {
	id: string;
	title: string;
	description: string;
	techStack: string[];
	githubUrl?: string | null;
	liveUrl?: string | null;
	status: 'draft' | 'published' | 'archived'; // enhancing string to union if possible, or just string
	stars?: number | null;
	forks?: number | null;
	commits?: number | null;
	createdAt: string; // DateTime comes as string from JSON
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
