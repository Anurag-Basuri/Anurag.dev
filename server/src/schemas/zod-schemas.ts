import { z } from 'zod';

// --- Common Schemas ---
export const SkillSchema = z.object({
	category: z.string(),
	name: z.string(),
	level: z.number().min(0).max(100),
});

// --- Social Link Schema ---
export const SocialLinkSchema = z.object({
	platform: z.string(),
	url: z.string().url(),
	icon: z.string().optional(),
});

// --- About Schema ---
export const AboutSchema = z.object({
	id: z.string().optional(),
	name: z.string(),
	role: z.string(),
	tagline: z.string(),
	summary: z.string(),
	bio: z.string(),
	location: z.string().optional(),
	avatarUrl: z.string().url(),
	resumeUrl: z.string().url().optional(),
	experienceYears: z.number().default(0),
	projectsCount: z.number().default(0),

	skills: z.object({
		frontend: z.array(SkillSchema),
		backend: z.array(SkillSchema),
		ml: z.array(SkillSchema),
		other: z.array(SkillSchema).optional(),
	}),

	socials: z.array(SocialLinkSchema).optional(),
});

// --- Project Schema ---
export const ProjectSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(2, 'Title is required'),
	slug: z.string().min(2, 'Slug is required'), // For URL friendly routing
	description: z.string().min(10),
	content: z.string().optional(), // Extended markdown content

	techStack: z.array(z.string()),
	tags: z.array(z.string()).optional(),

	// URLs & Media
	githubUrl: z.string().url().nullable().optional(),
	liveUrl: z.string().url().nullable().optional(),
	thumbnail: z.string().url().optional(),
	images: z.array(z.string().url()).optional(), // Gallery

	// Metadata
	status: z.enum(['draft', 'published', 'archived', 'completed']).default('draft'),
	featured: z.boolean().default(false),
	priority: z.number().default(0), // For custom sorting

	// Stats (derived or manual)
	stars: z.number().nullable().optional(),
	forks: z.number().nullable().optional(),

	createdAt: z.string().datetime().optional(),
	updatedAt: z.string().datetime().optional(),
});

// --- Journey Item Schema ---
export const JourneyItemSchema = z.object({
	id: z.string().optional(),
	type: z.enum(['work', 'education', 'project', 'achievement', 'other']), // Replaces generalized 'category' string for better type safety

	title: z.string(), // Role or Degree
	company: z.string().optional(), // Company or Institution name
	location: z.string().optional(),

	date: z.string(), // Display date like "2023 - Present" or ISO
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().nullable().optional(),

	description: z.string(),
	skills: z.array(z.string()).optional(), // Skills used in this role
	url: z.string().url().optional(),

	order: z.number().default(0),
});

// --- Certification Schema ---
export const CertificationSchema = z.object({
	id: z.string().optional(),
	title: z.string(),
	issuer: z.string(),
	date: z.string().datetime(), // Issue date
	expirationDate: z.string().datetime().nullable().optional(),
	credentialId: z.string().optional(),
	credentialUrl: z.string().url().optional(),

	skills: z.array(z.string()).optional(),
	image: z.string().url().optional(),
});

// --- Blog Post Schema ---
export const BlogPostSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(5),
	slug: z.string().min(5),
	summary: z.string(),
	content: z.string(), // Markdown
	coverImage: z.string().url().optional(),

	tags: z.array(z.string()),
	status: z.enum(['draft', 'published', 'archived']).default('draft'),
	featured: z.boolean().default(false),

	publishedAt: z.string().datetime().nullable().optional(),
	readingTime: z.number().optional(), // In minutes
});

// --- Contact Schema ---
export const ContactSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	subject: z.string().min(2),
	message: z.string().min(10),
});

const profileSchema = z.object({
	username: z.string(),
	url: z.string().url(),
});

// --- Coding Profile Schema ---
export const CodingProfileSchema = z.object({
	id: z.string().optional(),
	leetcode: profileSchema,
	codeforces: profileSchema,
	codechef: profileSchema,
	github: profileSchema,
	updatedAt: z.string().datetime().optional(),
});

// Types inferred from Zod schemas
export type About = z.infer<typeof AboutSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type JourneyItem = z.infer<typeof JourneyItemSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type ContactMessage = z.infer<typeof ContactSchema>;
export type CodingProfile = z.infer<typeof CodingProfileSchema>;
