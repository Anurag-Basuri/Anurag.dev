import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { validate } from '../../middleware/validate';
import { logAudit } from '../../lib/audit';
import { ProfileSchema } from '../../schemas/zod-schemas';

const SINGLETON_ID = 'main';

export default async function profileRoutes(fastify: FastifyInstance) {
	// GET /api/admin/profile — fetch profile
	fastify.get('/api/admin/profile', async (_request: FastifyRequest, reply: FastifyReply) => {
		const profile = await prisma.profile.findUnique({ where: { id: SINGLETON_ID } });
		return reply.send(profile ?? null);
	});

	// PUT /api/admin/profile — upsert singleton profile
	fastify.put(
		'/api/admin/profile',
		{ preHandler: [validate(ProfileSchema)] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const data = request.body as Record<string, unknown>;
			const adminId = request.admin!.adminId;

			const profile = await prisma.profile.upsert({
				where: { id: SINGLETON_ID },
				create: { id: SINGLETON_ID, ...(data as any) },
				update: data as any,
			});

			await logAudit({
				adminId,
				action: 'update',
				resourceType: 'Profile',
				resourceId: SINGLETON_ID,
				changes: data as unknown as Prisma.InputJsonValue,
			});

			return reply.send(profile);
		},
	);
}
