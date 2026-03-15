import { z } from 'zod';

// ─── Reusable field helpers ─────────────────────────────────────
// Frontend forms send empty strings for blank optional fields.
// These helpers coerce '' → null so nullable validators don't reject them.

/** Nullable string field: '' → null */
const nullableStr = z
	.string()
	.transform(v => (v === '' ? null : v))
	.pipe(z.string().nullable())
	.optional();

/** Nullable URL field: '' → null, non-empty must be a valid URL */
const nullableUrl = z
	.string()
	.transform(v => (v === '' ? null : v))
	.pipe(z.string().url().nullable())
	.optional();

/** Nullable datetime field: '' → null, 'YYYY-MM-DD' → full ISO, passthrough ISO strings */
const nullableDatetime = z
	.string()
	.transform(v => {
		if (v === '') return null;
		// If it's a date-only string like "2024-01-15", convert to ISO datetime
		if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00:00.000Z`;
		return v;
	})
	.pipe(z.string().datetime().nullable())
	.optional();

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
	header: nullableStr,
	bio: nullableStr,

	// Location
	Currentlocation: nullableStr,
	Originallocation: nullableStr,

	// Job Seeking & Availability
	openToWork: z.boolean().default(true),
	availableFrom: nullableStr,
	noticePeriod: nullableStr,

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
	avatarUrl: nullableStr,
	coverUrl: nullableStr,
	resumeUrl: nullableStr,

	// Quick Stats
	experienceYears: z.number().int().min(0).default(0),
	projectsCount: z.number().int().min(0).default(0),

	// Skills — { category: skills[] }
	skills: z.record(z.string(), z.array(z.string())).nullable().optional(),

	// Personal
	languages: z.array(z.string()).optional(),

	// Social & Web
	socials: z.array(SocialLinkSchema).nullable().optional(),
	website: nullableStr,

	// Coding Platforms — plain string URLs/usernames (matches Prisma String?)
	github: nullableStr,
	leetcode: nullableStr,
	codeforces: nullableStr,
	codechef: nullableStr,
	gfg: nullableStr,
	kaggle: nullableStr,
	otherProfiles: z.array(z.string()).optional(),

	// SEO / Meta
	seoTitle: nullableStr,
	seoDesc: nullableStr,
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

	thumbnail: nullableStr,
	images: z.array(z.string()).optional(),
	githubUrl: nullableUrl,
	liveUrl: nullableUrl,

	status: z.enum(['draft', 'published', 'archived', 'completed']).default('draft'),
	featured: z.boolean().default(false),

	stars: z.number().int().nullable().optional(),
	forks: z.number().int().nullable().optional(),

	createdAt: nullableDatetime,
	updatedAt: nullableDatetime,
});

// ─── Journey Entry ──────────────────────────────────────────────
// Matches Prisma JourneyEntry model exactly.

export const JourneyItemSchema = z.object({
	id: z.string().optional(),
	type: z.enum(['work', 'education', 'volunteering', 'research', 'other']),
	title: z.string().min(1),
	organization: nullableStr,
	location: nullableStr,

	date: z.string().min(1),
	startDate: nullableDatetime,
	endDate: nullableDatetime,
	isCurrent: z.boolean().default(false),

	description: z.string().min(1),
	skills: z.array(z.string()).optional(),
	url: nullableUrl,

	// Education-specific
	degree: nullableStr,
	fieldOfStudy: nullableStr,
	grade: nullableStr,
	board: nullableStr,

	// Work-specific
	employmentType: nullableStr,

	// Research-specific
	publication: nullableStr,
	doi: nullableStr,

	// Display
	icon: nullableStr,
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
	issuer: nullableStr,
	event: nullableStr,

	description: nullableStr,
	rank: nullableStr,

	date: nullableDatetime,
	proofUrl: nullableUrl,
	url: nullableUrl,

	tags: z.array(z.string()).optional(),
	team: z.array(z.string()).optional(),

	featured: z.boolean().default(false),
	order: z.number().int().default(0),

	journeyEntryId: nullableStr,
});

// ─── Certification ──────────────────────────────────────────────
// Matches Prisma Certification model exactly.

export const CertificationSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1),
	issuer: z.string().min(1),

	description: nullableStr,
	credentialId: nullableStr,
	credentialUrl: nullableUrl,

	certificateUrl: nullableStr,

	skills: z.array(z.string()).optional(),

	startDate: nullableDatetime,
	endDate: nullableDatetime,
});

// ─── Blog Post ──────────────────────────────────────────────────
// Matches Prisma BlogPost model exactly.

export const BlogPostSchema = z.object({
	id: z.string().optional(),
	slug: z.string().min(3),
	title: z.string().min(5),
	content: z.string().min(1),
	tags: z.array(z.string()),

	coverImage: nullableStr,
	otherImages: z.array(z.string()).optional(),
	link: nullableStr,

	status: z.enum(['draft', 'published', 'archived']).default('draft'),
	publishedAt: nullableDatetime,

	createdAt: nullableDatetime,
	updatedAt: nullableDatetime,
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
