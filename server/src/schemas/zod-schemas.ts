import { z } from 'zod';

// ─── Reusable field helpers ─────────────────────────────────────
// Frontend forms send empty strings for blank optional fields.
// These helpers coerce '' → null so nullable validators don't reject them.

/** Nullable string field: '' | null → null */
const nullableStr = z
	.preprocess(
		v => (v === null || v === undefined ? '' : v),
		z
			.string()
			.transform(v => (v === '' ? null : v))
			.pipe(z.string().nullable()),
	)
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

/** Enum field with case-insensitive input and optional/empty handling */
const optionalEnum = <T extends [string, ...string[]]>(values: T) =>
	z.preprocess(v => {
		if (v === '' || v === null || v === undefined) return null;
		if (typeof v === 'string') return v.trim().toUpperCase();
		return v;
	}, z.enum(values).nullable().optional());

/** Enum field with case-insensitive input (required) */
const requiredEnum = <T extends [string, ...string[]]>(values: T) =>
	z.preprocess(v => (typeof v === 'string' ? v.trim().toUpperCase() : v), z.enum(values));

// ─── Common Schemas ─────────────────────────────────────────────

export const SocialLinkSchema = z.object({
	platform: requiredEnum([
		'LINKEDIN',
		'GITHUB',
		'X',
		'REDDIT',
		'INSTAGRAM',
		'MEDIUM',
		'QUORA',
		'DEVTO',
		'OTHER',
	]),
	url: z.string().url('Must be a valid URL'),
	customLabel: nullableStr,
});

// ─── Profile (singleton) ─────────────────────────────────────────
// Matches Prisma Profile model exactly.
// JSON fields (workPreferences, skills, socials) are validated structurally.

export const ProfileSchema = z.object({
	// Personal Info
	name: z.string().min(1, 'Name is required'),
	pronouns: z.string().optional(),
	email: z.string().email('Must be a valid email address').optional(),
	phone: z.string().optional(),

	// Career & Bio
	Tagline: nullableStr,
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
	Freelancing: z.boolean().optional(),

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
	// Coding Platforms — plain string URLs/usernames (matches Prisma String?)
	github: nullableStr,
	leetcode: nullableStr,
	codeforces: nullableStr,
	codechef: nullableStr,
	gfg: nullableStr,
	kaggle: nullableStr,
	hackerrank: nullableStr,
	stackoverflow: nullableStr,
	otherProfiles: z.array(z.string()).optional(),

	// SEO / Meta
	seoTitle: nullableStr,
	seoDesc: nullableStr,
	seoKeywords: z.array(z.string()).optional(),

	socialLinks: z.array(SocialLinkSchema).optional(),
});

// ─── Project ────────────────────────────────────────────────────
// Matches Prisma Project model exactly.

export const ProjectSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(2, 'Title must be at least 2 characters'),
	description: z.string().min(10, 'Description must be at least 10 characters'),
	techStack: z.array(z.string(), { required_error: 'Tech stack is required' }),

	thumbnail: nullableStr,
	images: z.array(z.string()).optional(),
	githubUrl: nullableUrl,
	liveUrl: nullableUrl,

	status: z.enum(['draft', 'published', 'archived', 'completed']).default('draft'),

	stars: z.number().int().nullable().optional(),
	forks: z.number().int().nullable().optional(),

	createdAt: nullableDatetime,
	updatedAt: nullableDatetime,
});

// ─── Journey Entry ──────────────────────────────────────────────
// Matches Prisma JourneyEntry model exactly.

export const JourneyItemSchema = z.object({
	id: z.string().optional(),
	type: requiredEnum(['WORK', 'EDUCATION', 'VOLUNTEERING', 'RESEARCH', 'EDUCATOR', 'OTHER']),
	title: z.string().min(1, 'Title is required'),
	organization: nullableStr,
	location: nullableStr,

	date: z.string().min(1, 'Date is required'),
	startDate: nullableDatetime,
	endDate: nullableDatetime,
	isCurrent: z.boolean().default(false),

	description: z.string().min(1, 'Description is required'),
	skills: z.array(z.string()).optional(),
	url: nullableUrl,

	// Education-specific
	degree: nullableStr,
	fieldOfStudy: nullableStr,
	grade: nullableStr,
	board: nullableStr,

	// Work-specific
	employmentType: optionalEnum([
		'FULL_TIME',
		'PART_TIME',
		'INTERNSHIP',
		'CONTRACT',
		'FREELANCE',
		'TEMPORARY',
		'APPRENTICESHIP',
	]),
	workMode: optionalEnum(['ONSITE', 'REMOTE', 'HYBRID']),
	workType: optionalEnum(['INDIVIDUAL_CONTRIBUTOR', 'LEAD', 'MANAGER', 'CONSULTANT', 'OTHER']),
	workLocation: nullableStr,
	offerUrl: nullableUrl,
	experienceUrl: nullableUrl,

	// Research-specific
	publication: nullableStr,
	doi: nullableStr,

	// Display
	icon: nullableStr,
	highlighted: z.boolean().default(false),

	order: z.number().int().default(0),
});

export const JourneyDocumentSchema = z.object({
	id: z.string().optional(),
	journeyEntryId: z.string().min(1, 'Journey entry ID is required'),
	title: z.string().min(1, 'Document title is required'),
	type: requiredEnum([
		'OFFER_LETTER',
		'APPOINTMENT_LETTER',
		'EXPERIENCE_LETTER',
		'RELIEVING_LETTER',
		'PAYSLIP',
		'PROMOTION_LETTER',
		'CERTIFICATE',
		'OTHER',
	]),
	url: z.string().url('Document URL must be valid'),
	issuer: nullableStr,
	issuedAt: nullableDatetime,
	notes: nullableStr,
});

// ─── Achievement ────────────────────────────────────────────────
// Matches Prisma Achievement model exactly.

export const AchievementSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1, 'Achievement title is required'),
	category: z.enum([
		'hackathon',
		'competition',
		'award',
		'opensource',
		'publication',
		'scholarship',
		'other',
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
	title: z.string().min(1, 'Certification title is required'),
	issuer: z.string().min(1, 'Issuer is required'),

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
	title: z.string().min(5, 'Blog title must be at least 5 characters'),
	content: z.string().min(1, 'Content is required'),
	tags: z.array(z.string(), { required_error: 'Tags are required' }),

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
	subject: z.string().transform(v => (v === '' ? 'No Subject' : v)),
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

// Upload helpers
export const UrlListSchema = z.object({
	urls: z.array(z.string().url()).min(1),
});

// Journey documents
export const JourneyDocumentCreateSchema = JourneyDocumentSchema.omit({
	id: true,
	journeyEntryId: true,
	url: true,
});
export const JourneyDocumentUpdateSchema = JourneyDocumentSchema.partial().omit({
	id: true,
	journeyEntryId: true,
	url: true,
});

// Social links
export const SocialLinkCreateSchema = SocialLinkSchema.omit({});
export const SocialLinkUpdateSchema = SocialLinkSchema.partial();

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
