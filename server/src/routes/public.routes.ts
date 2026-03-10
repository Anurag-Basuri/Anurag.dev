import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/db';
import { notFound } from '../lib/errors';

/**
 * Public read-only endpoints.
 * No authentication required. Returns only published content.
 */
export default async function publicRoutes(fastify: FastifyInstance) {
	// ─── Health Check ─────────────────────────────────────────────

	fastify.get('/api/health', async (_req, reply) => {
		return reply.send({
			ok: true,
			env: process.env.NODE_ENV || 'development',
			uptime: Math.floor(process.uptime()),
		});
	});

	// ─── Profile (singleton) ─────────────────────────────────────

	fastify.get('/api/profile', async (_req, reply) => {
		const profile = await prisma.profile.findUnique({ where: { id: 'main' } });
		if (!profile) {
			const error = notFound('Profile');
			return reply.status(error.statusCode).send(error.toJSON());
		}
		return reply.send(profile);
	});

	// ─── Projects ─────────────────────────────────────────────────

	fastify.get('/api/projects', async (_req, reply) => {
		const projects = await prisma.project.findMany({
			where: { status: { in: ['published', 'completed'] } },
			orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
		});
		return reply.send({ items: projects });
	});

	fastify.get(
		'/api/projects/:slug',
		async (request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) => {
			const { slug } = request.params;
			const project = await prisma.project.findUnique({
				where: { slug },
			});

			if (!project || !['published', 'completed'].includes(project.status)) {
				const error = notFound('Project');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			return reply.send(project);
		},
	);

	// ─── Journey ──────────────────────────────────────────────────

	fastify.get('/api/journey', async (_req, reply) => {
		const items = await prisma.journeyEntry.findMany({
			orderBy: { order: 'asc' },
		});
		return reply.send({ items });
	});

	// ─── Certifications ──────────────────────────────────────────

	fastify.get('/api/certifications', async (_req, reply) => {
		const items = await prisma.certification.findMany({
			orderBy: { date: 'desc' },
		});
		return reply.send({ items });
	});

	// ─── Blog ─────────────────────────────────────────────────────

	fastify.get('/api/blog', async (_req, reply) => {
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
		return reply.send({ posts });
	});

	fastify.get(
		'/api/blog/:slug',
		async (request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) => {
			const { slug } = request.params;
			const post = await prisma.blogPost.findUnique({
				where: { slug },
			});

			if (!post || post.status !== 'published') {
				const error = notFound('Blog post');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			return reply.send(post);
		},
	);
}
