import { z } from "zod";

export const SkillSchema = z.object({
	category: z.string(),
	name: z.string(),
	level: z.number().min(0).max(100),
});

export const AboutSchema = z.object({
	id: z.string().optional(),
	name: z.string(),
	role: z.string(),
	avatarUrl: z.string().url(),
	summary: z.string(),
	bio: z.string(),
	experience: z.number(),
	projects: z.number(),
	skills: z.array(SkillSchema),
});

export const ProjectSchema = z.object({
	id: z.string().optional(),
	title: z.string(),
	subtitle: z.string().optional(),
	description: z.string(),
	tags: z.array(z.string()),
	image: z.string().url(),
	githubUrl: z.string().url().nullable(),
	liveUrl: z.string().url().nullable(),
	content: z.string().optional(),
});

export const JourneyItemSchema = z.object({
	id: z.string().optional(),
	year: z.number(),
	title: z.string(),
	description: z.string(),
	icon: z.string().optional(),
});

export const CertificationSchema = z.object({
	id: z.string().optional(),
	title: z.string(),
	issuer: z.string(),
	date: z.string(),
	certificateUrl: z.string().url().optional(),
	description: z.string().optional(),
});


export const BlogPostSchema = z.object({
	id: z.string().optional(),
	title: z.string(),
	summary: z.string(),
	coverImage: z.string().url(),
	tags: z.array(z.string()),
	date: z.string(),
	content: z.string(), // markdown
});

export const AiModuleSchema = z.object({
	id: z.string().optional(),
	name: z.string(),
	description: z.string(),
	status: z.enum(['online', 'offline', 'beta']),
});

export const ContactSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	message: z.string().min(10),
});
  