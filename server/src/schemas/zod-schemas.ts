import { z } from 'zod';

// ─── Common Schemas ─────────────────────────────────────────────

export const SocialLinkSchema = z.object({
	platform: z.string(),
	url: z.string().url(),
	icon: z.string().optional(),
	handle: z.string().optional(),
});

// ─── Profile (singleton) ─────────────────────────────────────────
// Matches Prisma Profile model exactly.
// JSON fields (workPreferences, skills, socials) are validated structurally.

export const ProfileSchema = z.object({
	// Personal Info
	name: z.string().min(1),
	pronouns: z.string().optional(),
	email: z.string().email().optional(),
	phone: z.string().optional(),

	// Career & Bio
	header: z.string().nullable().optional(),
	bio: z.string().nullable().optional(),

	// Location
	Currentlocation: z.string().nullable().optional(),
	Originallocation: z.string().nullable().optional(),

	// Job Seeking & Availability
	openToWork: z.boolean().default(true),
	availableFrom: z.string().nullable().optional(),
	noticePeriod: z.string().nullable().optional(),

	// Job Preferences
	workPreferences: z
		.object({
			remote: z.boolean().optional(),
			hybrid: z.boolean().optional(),
			onsite: z.boolean().optional(),
			relocation: z.boolean().optional(),
		})
		.nullable()
		.optional(),
	jobTypes: z.array(z.string()).optional(),

	// Media — URLs are set by file upload endpoints, but can also be set directly
	avatarUrl: z.string().nullable().optional(),
	coverUrl: z.string().nullable().optional(),
	resumeUrl: z.string().nullable().optional(),

	// Quick Stats
	experienceYears: z.number().int().min(0).default(0),
	projectsCount: z.number().int().min(0).default(0),

	// Skills — { category: skills[] }
	skills: z.record(z.string(), z.array(z.string())).nullable().optional(),

	// Personal
	languages: z.array(z.string()).optional(),

	// Social & Web
	socials: z.array(SocialLinkSchema).nullable().optional(),
	website: z.string().nullable().optional(),

	// Coding Platforms — plain string URLs/usernames (matches Prisma String?)
	github: z.string().nullable().optional(),
	leetcode: z.string().nullable().optional(),
	codeforces: z.string().nullable().optional(),
	codechef: z.string().nullable().optional(),
	gfg: z.string().nullable().optional(),
	kaggle: z.string().nullable().optional(),
	otherProfiles: z.array(z.string()).optional(),

	// SEO / Meta
	seoTitle: z.string().nullable().optional(),
	seoDesc: z.string().nullable().optional(),
	seoKeywords: z.array(z.string()).optional(),
});

// ─── Project ────────────────────────────────────────────────────
// Matches Prisma Project model exactly.

export const ProjectSchema = z.object({
	id: z.string().optional(),
	slug: z.string().min(2, 'Slug is required'),
	title: z.string().min(2, 'Title is required'),
	description: z.string().min(10),
	techStack: z.array(z.string()),

	thumbnail: z.string().nullable().optional(),
	images: z.array(z.string()).optional(),
	githubUrl: z.string().url().nullable().optional(),
	liveUrl: z.string().url().nullable().optional(),

	status: z.enum(['draft', 'published', 'archived', 'completed']).default('draft'),
	featured: z.boolean().default(false),

	stars: z.number().int().nullable().optional(),
	forks: z.number().int().nullable().optional(),

	createdAt: z.string().datetime().optional(),
	updatedAt: z.string().datetime().optional(),
});

// ─── Journey Entry ──────────────────────────────────────────────
// Matches Prisma JourneyEntry model exactly.

export const JourneyItemSchema = z.object({
	id: z.string().optional(),
	type: z.enum(['work', 'education', 'volunteering', 'research', 'other']),
	title: z.string().min(1),
	organization: z.string().nullable().optional(),
	location: z.string().nullable().optional(),

	date: z.string().min(1),
	startDate: z.string().datetime().nullable().optional(),
	endDate: z.string().datetime().nullable().optional(),
	isCurrent: z.boolean().default(false),

	description: z.string().min(1),
	skills: z.array(z.string()).optional(),
	url: z.string().url().nullable().optional(),

	// Education-specific
	degree: z.string().nullable().optional(),
	fieldOfStudy: z.string().nullable().optional(),
	grade: z.string().nullable().optional(),
	board: z.string().nullable().optional(),

	// Work-specific
	employmentType: z.string().nullable().optional(),

	// Research-specific
	publication: z.string().nullable().optional(),
	doi: z.string().nullable().optional(),

	// Display
	icon: z.string().nullable().optional(),
	highlighted: z.boolean().default(false),

	order: z.number().int().default(0),
});

// ─── Achievement ────────────────────────────────────────────────
// Matches Prisma Achievement model exactly.

export const AchievementSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1),
	category: z.enum([
		'hackathon',
		'competition',
		'award',
		'opensource',
		'publication',
		'scholarship',
	]),
	issuer: z.string().nullable().optional(),
	event: z.string().nullable().optional(),

	description: z.string().nullable().optional(),
	rank: z.string().nullable().optional(),

	date: z.string().datetime().nullable().optional(),
	proofUrl: z.string().url().nullable().optional(),
	url: z.string().url().nullable().optional(),

	tags: z.array(z.string()).optional(),
	team: z.array(z.string()).optional(),

	featured: z.boolean().default(false),
	order: z.number().int().default(0),

	journeyEntryId: z.string().nullable().optional(),
});

// ─── Certification ──────────────────────────────────────────────
// Matches Prisma Certification model exactly.

export const CertificationSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1),
	issuer: z.string().min(1),

	description: z.string().nullable().optional(),
	credentialId: z.string().nullable().optional(),
	credentialUrl: z.string().url().nullable().optional(),

	certificateUrl: z.string().nullable().optional(),

	skills: z.array(z.string()).optional(),

	startDate: z.string().datetime().nullable().optional(),
	endDate: z.string().datetime().nullable().optional(),
});

// ─── Blog Post ──────────────────────────────────────────────────
// Matches Prisma BlogPost model exactly.

export const BlogPostSchema = z.object({
	id: z.string().optional(),
	slug: z.string().min(3),
	title: z.string().min(5),
	content: z.string().min(1),
	tags: z.array(z.string()),

	coverImage: z.string().nullable().optional(),
	otherImages: z.array(z.string()).optional(),
	link: z.string().nullable().optional(),

	status: z.enum(['draft', 'published', 'archived']).default('draft'),
	publishedAt: z.string().datetime().nullable().optional(),

	createdAt: z.string().datetime().optional(),
	updatedAt: z.string().datetime().optional(),
});

// ─── Contact ────────────────────────────────────────────────────

export const ContactSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	subject: z.string().min(2, 'Subject must be at least 2 characters'),
	message: z.string().min(10, 'Message must be at least 10 characters'),
});

// ─── Auth Schemas ────────────────────────────────────────────────

export const LoginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required'),
});

export const RefreshSchema = z.object({
	refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── Derived Schemas (Create / Update / Status) ──────────────────

// Profile — update is always partial since it's a singleton upsert
export const ProfileUpdateSchema = ProfileSchema.partial();
export const ProjectCreateSchema = ProjectSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});
export const ProjectUpdateSchema = ProjectSchema.partial().omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});
export const ProjectStatusSchema = z.object({
	status: z.enum(['draft', 'published', 'archived', 'completed']),
});

// Journey
export const JourneyCreateSchema = JourneyItemSchema.omit({ id: true });
export const JourneyUpdateSchema = JourneyItemSchema.partial().omit({ id: true });
export const ReorderSchema = z.object({
	items: z.array(z.object({ id: z.string(), order: z.number().int().min(0) })),
});

// Achievement
export const AchievementCreateSchema = AchievementSchema.omit({ id: true });
export const AchievementUpdateSchema = AchievementSchema.partial().omit({ id: true });

// Certification
export const CertificationCreateSchema = CertificationSchema.omit({ id: true });
export const CertificationUpdateSchema = CertificationSchema.partial().omit({ id: true });

// Blog
export const BlogCreateSchema = BlogPostSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const BlogUpdateSchema = BlogPostSchema.partial().omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});
export const BlogStatusSchema = z.object({ status: z.enum(['draft', 'published', 'archived']) });

// ─── Inferred Types ─────────────────────────────────────────────

export type Profile = z.infer<typeof ProfileSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type JourneyItem = z.infer<typeof JourneyItemSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type ContactMessage = z.infer<typeof ContactSchema>;
