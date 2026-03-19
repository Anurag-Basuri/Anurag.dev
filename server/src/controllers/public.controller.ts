import { Request, Response } from 'express';
import sanitizeHtml from 'sanitize-html';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import type { IdRequest } from '../utils/types';

// Health check
async function healthCheck(_req: Request, res: Response): Promise<void> {
	ApiResponse.ok(res, {
		env: process.env.NODE_ENV || 'development',
		uptime: Math.floor(process.uptime()),
	});
}

// Get the public profile (singleton)
async function getPublicProfile(_req: Request, res: Response): Promise<void> {
	const profile = await prisma.profile.findUnique({
		where: { id: 'main' },
		include: { socialLinks: true },
	});
	if (!profile) throw ApiError.NotFound('Profile');

	ApiResponse.ok(res, profile);
}

// List all published/completed projects
async function getPublicProjects(_req: Request, res: Response): Promise<void> {
	const projects = await prisma.project.findMany({
		where: { status: { in: ['published', 'completed'] } },
		orderBy: { createdAt: 'desc' },
	});

	ApiResponse.ok(res, projects);
}

// Get a single project by slug
async function getPublicProjectById(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const project = await prisma.project.findUnique({ where: { id } });

	if (!project || !['published', 'completed'].includes(project.status)) {
		throw ApiError.NotFound('Project');
	}

	ApiResponse.ok(res, project);
}

// List all journey entries with achievements
async function getPublicJourney(_req: Request, res: Response): Promise<void> {
	const items = await prisma.journeyEntry.findMany({
		orderBy: { order: 'asc' },
		include: {
			achievements: { orderBy: { order: 'asc' } },
			documents: { orderBy: { createdAt: 'desc' } },
		},
	});

	ApiResponse.ok(res, items);
}

// List all achievements
async function getPublicAchievements(_req: Request, res: Response): Promise<void> {
	const items = await prisma.achievement.findMany({
		orderBy: { order: 'asc' },
		include: { journeyEntry: { select: { id: true, title: true, type: true } } },
	});

	ApiResponse.ok(res, items);
}

// List all certifications
async function getPublicCertifications(_req: Request, res: Response): Promise<void> {
	const items = await prisma.certification.findMany({
		orderBy: { startDate: 'desc' },
	});

	ApiResponse.ok(res, items);
}

// List published blog posts (summary fields only)
async function getPublicBlogPosts(_req: Request, res: Response): Promise<void> {
	const posts = await prisma.blogPost.findMany({
		where: { status: 'published' },
		orderBy: { publishedAt: 'desc' },
	});

	ApiResponse.ok(res, posts);
}

// Get a single blog post by slug (published only)
async function getPublicBlogPostById(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const post = await prisma.blogPost.findUnique({ where: { id } });

	if (!post || post.status !== 'published') {
		throw ApiError.NotFound('Blog post');
	}

	ApiResponse.ok(res, post);
}

// Submit a contact message (public, rate-limited)
async function submitContact(req: Request, res: Response): Promise<void> {
	const { name, email, subject, message } = req.body;

	await prisma.contactMessage.create({
		data: {
			name: sanitizeHtml(name, { allowedTags: [] }),
			email,
			subject: sanitizeHtml(subject, { allowedTags: [] }),
			message: sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} }),
			ipAddress: req.ip || req.socket.remoteAddress,
		},
	});

	ApiResponse.created(res, null, 'Message sent successfully. Thank you for reaching out!');
}

export {
	healthCheck,
	getPublicProfile,
	getPublicProjects,
	getPublicProjectById,
	getPublicJourney,
	getPublicAchievements,
	getPublicCertifications,
	getPublicBlogPosts,
	getPublicBlogPostById,
	submitContact,
};
