import { Router, Request } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * Public read-only endpoints.
 * No authentication required. Returns only published content.
 */

// ─── Health Check ─────────────────────────────────────────────

router.get(
	'/api/health',
	asyncHandler(async (_req, res) => {
		ApiResponse.ok(res, {
			env: process.env.NODE_ENV || 'development',
			uptime: Math.floor(process.uptime()),
		});
	}),
);

// ─── Profile (singleton) ─────────────────────────────────────

router.get(
	'/api/profile',
	asyncHandler(async (_req, res) => {
		const profile = await prisma.profile.findUnique({ where: { id: 'main' } });
		if (!profile) throw ApiError.NotFound('Profile not found');
		ApiResponse.ok(res, profile);
	}),
);

// ─── Projects ─────────────────────────────────────────────────

router.get(
	'/api/projects',
	asyncHandler(async (_req, res) => {
		const projects = await prisma.project.findMany({
			where: { status: { in: ['published', 'completed'] } },
			orderBy: { createdAt: 'desc' },
		});
		ApiResponse.ok(res, projects);
	}),
);

router.get(
	'/api/projects/:slug',
	asyncHandler(async (req: Request<{ slug: string }>, res) => {
		const { slug } = req.params;
		const project = await prisma.project.findUnique({ where: { slug } });

		if (!project || !['published', 'completed'].includes(project.status)) {
			throw ApiError.NotFound('Project not found');
		}

		ApiResponse.ok(res, project);
	}),
);

// ─── Journey ──────────────────────────────────────────────────

router.get(
	'/api/journey',
	asyncHandler(async (_req, res) => {
		const items = await prisma.journeyEntry.findMany({
			orderBy: { order: 'asc' },
			include: { achievements: { orderBy: { order: 'asc' } } },
		});
		ApiResponse.ok(res, items);
	}),
);

// ─── Achievements ──────────────────────────────────────────

router.get(
	'/api/achievements',
	asyncHandler(async (_req, res) => {
		const items = await (prisma as any).achievement.findMany({
			orderBy: { order: 'asc' },
			include: { journeyEntry: { select: { id: true, title: true, type: true } } },
		});
		ApiResponse.ok(res, items);
	}),
);

// ─── Certifications ──────────────────────────────────────────

router.get(
	'/api/certifications',
	asyncHandler(async (_req, res) => {
		const items = await prisma.certification.findMany({
			orderBy: { startDate: 'desc' },
		});
		ApiResponse.ok(res, items);
	}),
);

// ─── Blog ─────────────────────────────────────────────────────

router.get(
	'/api/blog',
	asyncHandler(async (_req, res) => {
		const posts = await prisma.blogPost.findMany({
			where: { status: 'published' },
			orderBy: { publishedAt: 'desc' },
			select: {
				id: true,
				title: true,
				slug: true,
				coverImage: true,
				tags: true,
				publishedAt: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		ApiResponse.ok(res, posts);
	}),
);

router.get(
	'/api/blog/:slug',
	asyncHandler(async (req: Request<{ slug: string }>, res) => {
		const { slug } = req.params;
		const post = await prisma.blogPost.findUnique({ where: { slug } });

		if (!post || post.status !== 'published') {
			throw ApiError.NotFound('Blog post not found');
		}

		ApiResponse.ok(res, post);
	}),
);

export default router;
