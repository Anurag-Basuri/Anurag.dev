import { z } from 'zod';

// ─── Common Schemas ─────────────────────────────────────────────

export const SkillItemSchema = z.object({
	name: z.string(),
	level: z.number().min(0).max(100).optional(), // 0–100 proficiency
	icon: z.string().optional(), // icon identifier / URL
});

export const SocialLinkSchema = z.object({
	platform: z.string(),
	url: z.string().url(),
	icon: z.string().optional(),
	handle: z.string().optional(),
});

const CodingPlatformSchema = z.object({
	username: z.string(),
	url: z.string().url(),
	stats: z.record(z.unknown()).optional(), // Platform-specific — kept flexible
});

// ─── Profile (singleton) ─────────────────────────────────────────

export const ProfileSchema = z.object({
	// Identity
	name: z.string().min(1),
	displayName: z.string().optional(),
	pronouns: z.string().optional(),
	email: z.string().email().optional(),
	phone: z.string().optional(),

	// Headline
	role: z.string().optional(),
	tagline: z.string().optional(),
	summary: z.string().optional(),
	bio: z.string().optional(),

	// Location & Availability
	location: z.string().optional(),
	timezone: z.string().optional(),
	openToWork: z.boolean().default(false),
	availableFrom: z.string().optional(),
	noticePeriod: z.string().optional(),

	// Media
	avatarUrl: z.string().url().optional().or(z.literal('')),
	coverUrl: z.string().url().optional().or(z.literal('')),
	resumeUrl: z.string().url().optional().or(z.literal('')),

	// Quick Stats
	experienceYears: z.number().int().min(0).default(0),
	projectsCount: z.number().int().min(0).default(0),

	// Work Preferences
	workPreferences: z
		.object({
			remote: z.boolean().optional(),
			hybrid: z.boolean().optional(),
			onsite: z.boolean().optional(),
			relocation: z.boolean().optional(),
		})
		.optional(),
	jobTypes: z
		.array(z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']))
		.optional(),
	preferredRoles: z.array(z.string()).optional(),
	industries: z.array(z.string()).optional(),
	salaryRange: z
		.object({
			min: z.number().optional(),
			max: z.number().optional(),
			currency: z.string().default('USD'),
			period: z.enum(['annual', 'monthly', 'hourly']).default('annual'),
		})
		.optional(),

	// Skills
	skills: z
		.object({
			frontend: z.array(SkillItemSchema).optional(),
			backend: z.array(SkillItemSchema).optional(),
			ml: z.array(SkillItemSchema).optional(),
			devops: z.array(SkillItemSchema).optional(),
			databases: z.array(SkillItemSchema).optional(),
			tools: z.array(SkillItemSchema).optional(),
			other: z.array(SkillItemSchema).optional(),
		})
		.optional(),
	techStack: z.array(z.string()).optional(),

	// Status, Highlights & Focus
	currentStatus: z
		.object({
			label: z.string(),
			description: z.string().optional(),
			emoji: z.string().optional(),
			show: z.boolean().default(true),
		})
		.optional(),
	highlights: z
		.array(z.object({ label: z.string(), value: z.string(), icon: z.string().optional() }))
		.optional(),
	focusAreas: z.array(z.string()).optional(),
	achievements: z
		.array(
			z.object({
				title: z.string(),
				description: z.string().optional(),
				year: z.number().optional(),
				url: z.string().url().optional(),
			}),
		)
		.optional(),

	// Personal
	languages: z.array(z.string()).optional(),
	hobbies: z.array(z.string()).optional(),

	// Social & Web
	socials: z.array(SocialLinkSchema).optional(),
	website: z.string().url().optional().or(z.literal('')),

	// Coding Platforms
	github: CodingPlatformSchema.optional(),
	leetcode: CodingPlatformSchema.optional(),
	codeforces: CodingPlatformSchema.optional(),
	codechef: CodingPlatformSchema.optional(),
	hackerrank: CodingPlatformSchema.optional(),
	gfg: CodingPlatformSchema.optional(),
	kaggle: CodingPlatformSchema.optional(),
	otherProfiles: z.array(CodingPlatformSchema.extend({ platform: z.string() })).optional(),

	// Open Source
	openSource: z
		.array(
			z.object({
				repo: z.string(),
				description: z.string().optional(),
				url: z.string().url(),
				stars: z.number().optional(),
				language: z.string().optional(),
				role: z.string().optional(),
			}),
		)
		.optional(),

	// Publications & Talks
	publications: z
		.array(
			z.object({
				title: z.string(),
				url: z.string().url().optional(),
				venue: z.string().optional(),
				date: z.string().optional(),
				type: z.enum(['article', 'talk', 'paper', 'video', 'podcast']).optional(),
			}),
		)
		.optional(),

	// Education Quick-Reference
	education: z
		.array(
			z.object({
				institution: z.string(),
				degree: z.string().optional(),
				field: z.string().optional(),
				year: z.string().optional(),
				gpa: z.string().optional(),
				url: z.string().url().optional(),
			}),
		)
		.optional(),

	// Testimonials
	testimonials: z
		.array(
			z.object({
				name: z.string(),
				role: z.string().optional(),
				company: z.string().optional(),
				text: z.string(),
				avatarUrl: z.string().url().optional(),
			}),
		)
		.optional(),

	// SEO
	seoTitle: z.string().optional(),
	seoDesc: z.string().optional(),
	seoKeywords: z.array(z.string()).optional(),
});

// ─── Project ────────────────────────────────────────────────────

export const ProjectSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(2, 'Title is required'),
	slug: z.string().min(2, 'Slug is required'),
	description: z.string().min(10),
	content: z.string().optional(),

	techStack: z.array(z.string()),
	tags: z.array(z.string()).optional(),

	githubUrl: z.string().url().nullable().optional(),
	liveUrl: z.string().url().nullable().optional(),
	thumbnail: z.string().optional(),
	images: z.array(z.string()).optional(),

	status: z.enum(['draft', 'published', 'archived', 'completed']).default('draft'),
	featured: z.boolean().default(false),
	priority: z.number().default(0),

	stars: z.number().nullable().optional(),
	forks: z.number().nullable().optional(),

	createdAt: z.string().datetime().optional(),
	updatedAt: z.string().datetime().optional(),
});

// ─── Journey Entry ──────────────────────────────────────────────

export const JourneyItemSchema = z.object({
	id: z.string().optional(),
	type: z.enum(['work', 'education', 'volunteering', 'research', 'other']),
	title: z.string().min(1),
	organization: z.string().optional(),
	location: z.string().optional(),

	date: z.string().min(1),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().nullable().optional(),
	isCurrent: z.boolean().default(false),

	description: z.string().min(1),
	skills: z.array(z.string()).optional(),
	url: z.string().url().optional(),

	// Education-specific
	degree: z.string().optional(),
	fieldOfStudy: z.string().optional(),
	grade: z.string().optional(),
	board: z.string().optional(),

	// Work-specific
	employmentType: z
		.enum(['full-time', 'part-time', 'internship', 'contract', 'freelance'])
		.optional(),

	// Research-specific
	publication: z.string().optional(),
	doi: z.string().optional(),

	// Display
	icon: z.string().optional(),
	highlighted: z.boolean().default(false),

	order: z.number().default(0),
});

// ─── Achievement ────────────────────────────────────────────────

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
	issuer: z.string().optional(),
	event: z.string().optional(),

	description: z.string().optional(),
	rank: z.string().optional(),

	date: z.string().datetime().nullable().optional(),
	proofUrl: z.string().url().optional(),
	url: z.string().url().optional(),

	tags: z.array(z.string()).optional(),
	team: z.array(z.string()).optional(),

	featured: z.boolean().default(false),
	order: z.number().default(0),

	journeyEntryId: z.string().nullable().optional(),
});

// ─── Certification ──────────────────────────────────────────────

export const CertificationSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1),
	issuer: z.string().min(1),
	date: z.string().datetime(),
	expirationDate: z.string().datetime().nullable().optional(),
	credentialId: z.string().optional(),
	credentialUrl: z.string().url().optional(),

	skills: z.array(z.string()).optional(),
	image: z.string().optional(),
});

// ─── Blog Post ──────────────────────────────────────────────────

export const BlogPostSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(5),
	slug: z.string().min(3),
	summary: z.string().min(1),
	content: z.string().min(1),
	coverImage: z.string().optional(),

	tags: z.array(z.string()),
	status: z.enum(['draft', 'published', 'archived']).default('draft'),
	featured: z.boolean().default(false),

	publishedAt: z.string().datetime().nullable().optional(),
	readingTime: z.number().optional(),

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

// Project
export const ProjectCreateSchema = ProjectSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const ProjectUpdateSchema = ProjectSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
export const ProjectStatusSchema = z.object({ status: z.enum(['draft', 'published', 'archived', 'completed']) });

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
export const BlogUpdateSchema = BlogPostSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
export const BlogStatusSchema = z.object({ status: z.enum(['draft', 'published', 'archived']) });

// ─── Inferred Types ─────────────────────────────────────────────

export type Profile = z.infer<typeof ProfileSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type JourneyItem = z.infer<typeof JourneyItemSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type ContactMessage = z.infer<typeof ContactSchema>;

