import { z } from 'zod';

// ─── JSON Sub-schemas (Profile JSON fields) ──────────────────

export const workPreferencesSchema = z.object({
	remote: z.boolean().optional(),
	hybrid: z.boolean().optional(),
	onsite: z.boolean().optional(),
	relocation: z.boolean().optional(),
});

export const socialLinkSchema = z.object({
	id: z.string(),
	platform: z.string(),
	url: z.string(),
	customLabel: z.string().nullish(),
	profileId: z.string().nullish(),
	createdAt: z.string().nullish(),
	updatedAt: z.string().nullish(),
});

// ─── Profile (Prisma: Profile) ───────────────────────────────

export const profileSchema = z.object({
	id: z.string(),

	// Personal Info
	name: z.string(),
	pronouns: z.string(),
	email: z.string(),
	phone: z.string(),

	// Career & Bio
	Tagline: z.string().nullish(),
	header: z.string().nullish(),
	bio: z.string().nullish(),

	// Location
	Currentlocation: z.string().nullish(),
	Originallocation: z.string().nullish(),

	// Job Seeking & Availability
	openToWork: z.boolean(),
	availableFrom: z.string().nullish(),
	noticePeriod: z.string().nullish(),

	// Job Preferences
	workPreferences: workPreferencesSchema.nullish(),
	Freelancing: z.boolean(),

	// Media & Links
	avatarUrl: z.string().nullish(),
	coverUrl: z.string().nullish(),
	resumeUrl: z.string().nullish(),

	// Quick Stats
	experienceYears: z.number().int(),
	projectsCount: z.number().int(),

	// Skills — { category: skills[] }
	skills: z.record(z.string(), z.array(z.string())).nullish(),

	// Personal
	languages: z.array(z.string()),

	// Social & Web
	socialLinks: z.array(socialLinkSchema).nullish(),

	// Coding Platforms
	github: z.string().nullish(),
	leetcode: z.string().nullish(),
	codeforces: z.string().nullish(),
	codechef: z.string().nullish(),
	gfg: z.string().nullish(),
	kaggle: z.string().nullish(),
	hackerrank: z.string().nullish(),
	stackoverflow: z.string().nullish(),
	otherProfiles: z.array(z.string()),

	// SEO / Meta
	seoTitle: z.string().nullish(),
	seoDesc: z.string().nullish(),
	seoKeywords: z.array(z.string()),

	createdAt: z.string(),
	updatedAt: z.string(),
});

// ─── Project (Prisma: Project) ───────────────────────────────

export const projectSchema = z.object({
	id: z.string(),

	title: z.string(),
	description: z.string(),
	techStack: z.array(z.string()),

	thumbnail: z.string().nullish(),
	images: z.array(z.string()),
	githubUrl: z.string().nullish(),
	liveUrl: z.string().nullish(),

	status: z.string(),

	stars: z.number().nullish(),
	forks: z.number().nullish(),

	order: z.number().int(),

	createdAt: z.string(),
	updatedAt: z.string(),
});

// ─── Achievement (Prisma: Achievement) ───────────────────────

export const achievementSchema = z.object({
	id: z.string(),

	title: z.string(),
	category: z.string(),
	issuer: z.string().nullish(),
	event: z.string().nullish(),

	description: z.string().nullish(),
	rank: z.string().nullish(),

	date: z.string().nullish(),
	proofUrl: z.string().nullish(),
	url: z.string().nullish(),

	tags: z.array(z.string()),
	team: z.array(z.string()),

	featured: z.boolean(),
	order: z.number().int(),

	journeyEntryId: z.string().nullish(),

	createdAt: z.string(),
	updatedAt: z.string(),
});

// ─── Journey Document (Prisma: JourneyDocument) ──────────────

export const journeyDocumentSchema = z.object({
	id: z.string(),
	journeyEntryId: z.string(),
	title: z.string(),
	type: z.string(),
	url: z.string(),
	issuer: z.string().nullish(),
	issuedAt: z.string().nullish(),
	notes: z.string().nullish(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

// ─── Journey Entry (Prisma: JourneyEntry) ────────────────────

export const journeyEntrySchema = z.object({
	id: z.string(),
	type: z.string(),
	title: z.string(),
	organization: z.string().nullish(),
	location: z.string().nullish(),

	date: z.string(),
	startDate: z.string().nullish(),
	endDate: z.string().nullish(),
	isCurrent: z.boolean(),

	description: z.string(),
	skills: z.array(z.string()),
	url: z.string().nullish(),

	// Education-specific
	degree: z.string().nullish(),
	fieldOfStudy: z.string().nullish(),
	grade: z.string().nullish(),
	board: z.string().nullish(),

	// Work-specific
	employmentType: z.string().nullish(),
	workMode: z.string().nullish(),
	workType: z.string().nullish(),
	workLocation: z.string().nullish(),
	offerUrl: z.string().nullish(),
	experienceUrl: z.string().nullish(),

	// Research-specific
	publication: z.string().nullish(),
	doi: z.string().nullish(),

	// Display
	icon: z.string().nullish(),
	highlighted: z.boolean(),

	order: z.number().int(),

	// Nested relations (populated by API)
	achievements: z.array(achievementSchema).optional(),
	documents: z.array(journeyDocumentSchema).optional(),

	createdAt: z.string(),
	updatedAt: z.string(),
});

// ─── Certification (Prisma: Certification) ───────────────────

export const certificationSchema = z.object({
	id: z.string(),

	title: z.string(),
	issuer: z.string(),

	description: z.string().nullish(),
	credentialId: z.string().nullish(),
	credentialUrl: z.string().nullish(),

	certificateUrl: z.string().nullish(),

	skills: z.array(z.string()),

	startDate: z.string().nullish(),
	endDate: z.string().nullish(),

	order: z.number().int(),

	createdAt: z.string(),
	updatedAt: z.string(),
});

// ─── Blog Post (Prisma: BlogPost) ────────────────────────────

export const blogPostSchema = z.object({
	id: z.string(),

	title: z.string(),
	content: z.string(),
	tags: z.array(z.string()),

	coverImage: z.string().nullish(),
	otherImages: z.array(z.string()),
	link: z.string().nullish(),

	status: z.string(),
	publishedAt: z.string().nullish(),

	order: z.number().int(),

	createdAt: z.string(),
	updatedAt: z.string(),
});

// ─── Contact Message (Prisma: ContactMessage) ────────────────

export const contactMessageSchema = z.object({
	id: z.string(),

	name: z.string(),
	email: z.string(),
	subject: z.string(),
	message: z.string(),

	ipAddress: z.string().nullish(),
	isRead: z.boolean(),

	createdAt: z.string(),
});

// ─── Agent Session (Prisma: AgentSession) ────────────────────

export const agentSessionSchema = z.object({
	id: z.string(),
	sessionId: z.string(),
	history: z.any(), // Raw JSON from Prisma DB
	createdAt: z.string(),
	updatedAt: z.string(),
});

// ─── Agent Message (Prisma: AgentMessage) ────────────────────

export const agentMessageSchema = z.object({
	id: z.string(),
	sessionId: z.string(),
	role: z.string(),
	content: z.string(),
	createdAt: z.string(),
});

// ─── Inferred Types ──────────────────────────────────────────

export type WorkPreferences = z.infer<typeof workPreferencesSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Achievement = z.infer<typeof achievementSchema>;
export type JourneyDocument = z.infer<typeof journeyDocumentSchema>;
export type JourneyEntry = z.infer<typeof journeyEntrySchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type BlogPost = z.infer<typeof blogPostSchema>;
export type ContactMessage = z.infer<typeof contactMessageSchema>;
export type AgentSession = z.infer<typeof agentSessionSchema>;

// Backward-compat alias — existing code references AboutData
export type AboutData = Profile;

// ─── Client-only types (not backed by Prisma) ────────────────

export const platformStatsSchema = z.object({
	username: z.string(),
	url: z.string(),
	stats: z
		.object({
			solved: z.number().optional(),
			easy: z.number().optional(),
			medium: z.number().optional(),
			hard: z.number().optional(),
			linesOfCode: z.number().optional(),
			rating: z.number().optional(),
			maxRating: z.number().optional(),
			globalRank: z.union([z.string(), z.number()]).optional(),
			stars: z.number().optional(),
			followers: z.number().optional(),
			following: z.number().optional(),
			prs: z.number().optional(),
			issues: z.number().optional(),
			repos: z.number().optional(),
			gists: z.number().optional(),
			commits: z.number().optional(),
		})
		.optional(),
	/** GitHub: 52 weeks of daily contribution data */
	contributionHeatmap: z.array(z.object({
		date: z.string(),
		count: z.number(),
		level: z.number(),
	})).optional(),
	/** LeetCode / Codeforces: contest rating history */
	ratingHistory: z.array(z.object({
		date: z.string(),
		rating: z.number(),
		contestName: z.string().optional(),
	})).optional(),
});

export const codingStatsSchema = z.object({
	id: z.string().optional(),
	leetcode: platformStatsSchema,
	codeforces: platformStatsSchema,
	codechef: platformStatsSchema.optional(),
	gfg: platformStatsSchema.optional(),
	github: platformStatsSchema,
	updatedAt: z.string().optional(),
});

export type PlatformStats = z.infer<typeof platformStatsSchema>;
export type CodingStats = z.infer<typeof codingStatsSchema>;

// ─── System Documents (Readme) ───────────────────────

export const readmeDataSchema = z.object({
	content: z.string(),
	metadata: z.object({
		sizeBytes: z.number(),
		lastModified: z.string(),
		lines: z.number(),
		words: z.number(),
	}),
});

export type ReadmeData = z.infer<typeof readmeDataSchema>;
