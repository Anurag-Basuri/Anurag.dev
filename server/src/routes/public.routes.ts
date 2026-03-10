import { Router, Request } from 'express';
import { prisma } from '../lib/prisma';
import { notFound } from '../lib/errors';
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
		res.json({
			ok: true,
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
		if (!profile) throw notFound('Profile');
		res.json(profile);
	}),
);

// ─── Projects ─────────────────────────────────────────────────

router.get(
	'/api/projects',
	asyncHandler(async (_req, res) => {
		const projects = await prisma.project.findMany({
			where: { status: { in: ['published', 'completed'] } },
			orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
		});
		res.json({ items: projects });
	}),
);

router.get(
	'/api/projects/:slug',
	asyncHandler(async (req: Request<{ slug: string }>, res) => {
		const { slug } = req.params;
		const project = await prisma.project.findUnique({ where: { slug } });

		if (!project || !['published', 'completed'].includes(project.status)) {
			throw notFound('Project');
		}

		res.json(project);
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
		res.json({ items });
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
		res.json({ items });
	}),
);

// ─── Certifications ──────────────────────────────────────────

router.get(
	'/api/certifications',
	asyncHandler(async (_req, res) => {
		const items = await prisma.certification.findMany({
			orderBy: { startDate: 'desc' },
		});
		res.json({ items });
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
				summary: true,
				coverImage: true,
				tags: true,
				featured: true,
				publishedAt: true,
				readingTime: true,
				createdAt: true,
				updatedAt: true,
			},
		});
		res.json({ posts });
	}),
);

router.get(
	'/api/blog/:slug',
	asyncHandler(async (req: Request<{ slug: string }>, res) => {
		const { slug } = req.params;
		const post = await prisma.blogPost.findUnique({ where: { slug } });

		if (!post || post.status !== 'published') {
			throw notFound('Blog post');
		}

		res.json(post);
	}),
);

export default router;
