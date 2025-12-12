export interface Project {
	id: string;
	title: string;
	slug: string;
	description: string;
	content?: string;
	techStack: string[];
	tags?: string[];

	thumbnail?: string;
	images?: string[];

	githubUrl?: string | null;
	liveUrl?: string | null;

	status: 'draft' | 'published' | 'archived' | 'completed';
	featured: boolean;
	priority: number;

	stars?: number | null;
	forks?: number | null;

	createdAt: string;
	updatedAt: string;
}

export interface JourneyEntry {
	id: string;
	type: 'work' | 'education' | 'project' | 'achievement' | 'other';
	title: string;
	company?: string;
	location?: string;

	date: string; // "2023 - Present"
	startDate?: string;
	endDate?: string | null;

	description: string;
	skills: string[];
	url?: string;

	order: number;
}

export interface Certification {
	id: string;
	title: string;
	issuer: string;
	date: string;
	expirationDate?: string | null;
	credentialId?: string;
	credentialUrl?: string;

	skills: string[];
	image?: string;
}

export interface BlogPost {
	id: string;
	title: string;
	slug: string;
	summary: string;
	content: string;
	coverImage?: string;

	tags: string[];
	status: 'draft' | 'published' | 'archived';
	featured: boolean;

	publishedAt?: string | null;
	readingTime?: number;

	createdAt: string;
	updatedAt: string;
}

export interface ContactMessage {
	id?: string;
	name: string;
	email: string;
	subject: string;
	message: string;
	ipAddress?: string;
}

export interface Skill {
	category: string;
	name: string;
	level: number;
}

export interface SocialLink {
	platform: string;
	url: string;
	icon?: string;
}

export interface AboutData {
	name: string;
	role: string;
	tagline: string;
	summary: string;
	bio: string;
	location?: string;
	avatarUrl: string;
	resumeUrl?: string;
	experienceYears: number;
	projectsCount: number;

	skills: {
		frontend: Skill[];
		backend: Skill[];
		ml: Skill[];
		other?: Skill[];
	};

	socials?: SocialLink[];
}

export interface CodingLanguage {
	name: string;
	percentage: number;
	color: string;
}

export interface CodingStats {
	id?: string;
	identity: {
		yearsActive: number;
		totalCommits: number;
		mostUsedLanguage: string;
	};
	languages: CodingLanguage[];
	leetcode: {
		totalSolved: number;
		easy: number;
		medium: number;
		hard: number;
		globalPercentile: number;
	};
	codeforces: {
		rating: number;
		rank: string;
		maxRating: number;
		maxRank: string;
	};
	github: {
		totalCommits: number;
		stars: number;
		followers: number;
		percentile: number;
	};
	updatedAt?: string;
}
