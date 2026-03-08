import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { validate } from '../../middleware/validate';
import { logAudit } from '../../lib/audit';
import { AboutSchema, CodingProfileSchema } from '../../schemas/zod-schemas';

export default async function profileRoutes(fastify: FastifyInstance) {
	// PUT /api/admin/profile — upsert profile
	fastify.put(
		'/api/admin/profile',
		{ preHandler: [validate(AboutSchema)] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const data = request.body as Record<string, unknown>;
			const adminId = request.admin!.adminId;

			const existing = await prisma.profile.findFirst();

			let profile;
			if (existing) {
				profile = await prisma.profile.update({
					where: { id: existing.id },
					data: data as any,
				});
				await logAudit({
					adminId,
					action: 'update',
					resourceType: 'Profile',
					resourceId: profile.id,
					changes: data as unknown as Prisma.InputJsonValue,
				});
			} else {
				profile = await prisma.profile.create({ data: data as any });
				await logAudit({
					adminId,
					action: 'create',
					resourceType: 'Profile',
					resourceId: profile.id,
					changes: data as unknown as Prisma.InputJsonValue,
				});
			}

			return reply.send(profile);
		},
	);

	// PUT /api/admin/coding-profiles — upsert coding profiles
	fastify.put(
		'/api/admin/coding-profiles',
		{ preHandler: [validate(CodingProfileSchema)] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const data = request.body as Record<string, unknown>;
			const adminId = request.admin!.adminId;

			const existing = await prisma.codingProfile.findFirst();

			let profiles;
			if (existing) {
				profiles = await prisma.codingProfile.update({
					where: { id: existing.id },
					data: data as any,
				});
				await logAudit({
					adminId,
					action: 'update',
					resourceType: 'CodingProfile',
					resourceId: profiles.id,
					changes: data as unknown as Prisma.InputJsonValue,
				});
			} else {
				profiles = await prisma.codingProfile.create({ data: data as any });
				await logAudit({
					adminId,
					action: 'create',
					resourceType: 'CodingProfile',
					resourceId: profiles.id,
					changes: data as unknown as Prisma.InputJsonValue,
				});
			}

			return reply.send(profiles);
		},
	);
}
