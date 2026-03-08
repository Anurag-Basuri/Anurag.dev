import { z } from 'zod';

// ─── Common Schemas ─────────────────────────────────────────────

export const SkillSchema = z.object({
	category: z.string(),
	name: z.string(),
	level: z.number().min(0).max(100),
});

export const SocialLinkSchema = z.object({
	platform: z.string(),
	url: z.string().url(),
	icon: z.string().optional(),
});

// ─── About / Profile ────────────────────────────────────────────

export const AboutSchema = z.object({
	name: z.string().min(1),
	role: z.string().min(1),
	tagline: z.string().optional(),
	summary: z.string().min(1),
	bio: z.string().min(1),
	location: z.string().optional(),
	avatarUrl: z.string().optional(),
	resumeUrl: z.string().url().optional(),
	experienceYears: z.number().default(0),
	projectsCount: z.number().default(0),
	coverUrl: z.string().optional(),

	currentStatus: z
		.object({
			label: z.string(),
			description: z.string().optional(),
		})
		.optional(),

	focusAreas: z.array(z.string()).optional(),

	highlights: z
		.array(
			z.object({
				label: z.string(),
				value: z.string(),
				icon: z.string().optional(),
			}),
		)
		.optional(),

	languages: z.array(z.string()).optional(),
	hobbies: z.array(z.string()).optional(),

	workPreferences: z
		.object({
			remote: z.boolean().optional(),
			hybrid: z.boolean().optional(),
			onsite: z.boolean().optional(),
			timezone: z.string().optional(),
		})
		.optional(),

	skills: z.object({
		frontend: z.array(SkillSchema),
		backend: z.array(SkillSchema),
		ml: z.array(SkillSchema),
		other: z.array(SkillSchema).optional(),
	}),

	socials: z.array(SocialLinkSchema).optional(),
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
	type: z.enum(['work', 'education', 'project', 'achievement', 'other']),
	title: z.string().min(1),
	company: z.string().optional(),
	location: z.string().optional(),

	date: z.string().min(1),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().nullable().optional(),

	description: z.string().min(1),
	skills: z.array(z.string()).optional(),
	url: z.string().url().optional(),

	order: z.number().default(0),
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

// ─── Coding Profile ─────────────────────────────────────────────

const PlatformProfileSchema = z.object({
	username: z.string(),
	url: z.string().url(),
});

export const CodingProfileSchema = z.object({
	leetcode: PlatformProfileSchema,
	codeforces: PlatformProfileSchema,
	codechef: PlatformProfileSchema,
	github: PlatformProfileSchema,
});

// ─── Inferred Types ─────────────────────────────────────────────

export type About = z.infer<typeof AboutSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type JourneyItem = z.infer<typeof JourneyItemSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type ContactMessage = z.infer<typeof ContactSchema>;
export type CodingProfile = z.infer<typeof CodingProfileSchema>;
