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
	type: 'work' | 'education' | 'volunteering' | 'research' | 'other';
	title: string;
	organization?: string;
	location?: string;

	date: string; // "2023 - Present"
	startDate?: string;
	endDate?: string | null;
	isCurrent?: boolean;

	description: string;
	skills: string[];
	url?: string;

	// Education-specific
	degree?: string;
	fieldOfStudy?: string;
	grade?: string;
	board?: string;

	// Work-specific
	employmentType?: string;

	// Research-specific
	publication?: string;
	doi?: string;

	// Display
	icon?: string;
	highlighted?: boolean;

	order: number;

	// Related achievements
	achievements?: Achievement[];
}

export interface Achievement {
	id: string;
	title: string;
	category: 'hackathon' | 'competition' | 'award' | 'opensource' | 'publication' | 'scholarship';
	issuer?: string;
	event?: string;

	description?: string;
	rank?: string;

	date?: string;
	proofUrl?: string;
	url?: string;

	tags: string[];
	team: string[];

	featured?: boolean;
	order: number;

	journeyEntryId?: string | null;
	journeyEntry?: { id: string; title: string; type: string };
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
	coverUrl?: string;
	resumeUrl?: string;

	experienceYears: number;
	projectsCount: number;

	currentStatus?: {
		label: string;
		description?: string;
	};

	focusAreas?: string[];

	highlights?: {
		label: string;
		value: string;
		icon?: string;
	}[];

	skills: {
		frontend: Skill[];
		backend: Skill[];
		ml: Skill[];
		other?: Skill[];
	};

	languages?: string[];
	hobbies?: string[];

	workPreferences?: {
		remote?: boolean;
		hybrid?: boolean;
		onsite?: boolean;
		timezone?: string;
	};

	socials?: SocialLink[];
}

export interface PlatformStats {
	username: string;
	url: string;
	stats?: {
		solved?: number;
		easy?: number;
		medium?: number;
		hard?: number;
		linesOfCode?: number;
		rating?: number;
		maxRating?: number;
		globalRank?: string | number;
		stars?: number;
		followers?: number;
		prs?: number;
		issues?: number;
	};
}

export interface CodingStats {
	id?: string;
	leetcode: PlatformStats;
	codeforces: PlatformStats;
	codechef?: PlatformStats;
	github: PlatformStats;
	updatedAt?: string;
}
