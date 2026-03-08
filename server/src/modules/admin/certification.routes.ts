import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { validate } from '../../middleware/validate';
import { logAudit } from '../../lib/audit';
import { notFound } from '../../lib/errors';
import { CertificationSchema } from '../../schemas/zod-schemas';

const CertificationUpdateSchema = CertificationSchema.partial().omit({
	id: true,
});

export default async function certificationRoutes(fastify: FastifyInstance) {
	// GET /api/admin/certifications
	fastify.get('/api/admin/certifications', async (_req, reply) => {
		const items = await prisma.certification.findMany({
			orderBy: { date: 'desc' },
		});
		return reply.send({ items });
	});

	// POST /api/admin/certifications
	fastify.post(
		'/api/admin/certifications',
		{ preHandler: [validate(CertificationSchema.omit({ id: true }))] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const data = request.body as Record<string, unknown>;
			const adminId = request.admin!.adminId;

			const cert = await prisma.certification.create({ data: data as any });

			await logAudit({
				adminId,
				action: 'create',
				resourceType: 'Certification',
				resourceId: cert.id,
				changes: data as unknown as Prisma.InputJsonValue,
			});

			return reply.status(201).send(cert);
		},
	);

	// PUT /api/admin/certifications/:id
	fastify.put<{ Params: { id: string } }>(
		'/api/admin/certifications/:id',
		{ preHandler: [validate(CertificationUpdateSchema)] },
		async (request, reply) => {
			const { id } = request.params;
			const data = request.body as Record<string, unknown>;
			const adminId = request.admin!.adminId;

			const existing = await prisma.certification.findUnique({ where: { id } });
			if (!existing) {
				const error = notFound('Certification');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			const cert = await prisma.certification.update({
				where: { id },
				data: data as any,
			});

			await logAudit({
				adminId,
				action: 'update',
				resourceType: 'Certification',
				resourceId: id,
				changes: data as unknown as Prisma.InputJsonValue,
			});

			return reply.send(cert);
		},
	);

	// DELETE /api/admin/certifications/:id
	fastify.delete<{ Params: { id: string } }>(
		'/api/admin/certifications/:id',
		async (request, reply) => {
			const { id } = request.params;
			const adminId = request.admin!.adminId;

			const existing = await prisma.certification.findUnique({ where: { id } });
			if (!existing) {
				const error = notFound('Certification');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			await prisma.certification.delete({ where: { id } });

			await logAudit({
				adminId,
				action: 'delete',
				resourceType: 'Certification',
				resourceId: id,
				changes: { title: existing.title },
			});

			return reply.send({ message: 'Certification deleted' });
		},
	);
}
