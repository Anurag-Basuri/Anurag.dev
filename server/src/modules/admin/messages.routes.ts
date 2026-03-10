import { Router, Request } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { notFound } from '../../lib/errors';
import { logAudit } from '../../lib/audit';
import { validateQuery } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';

const PaginationQuery = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

const router = Router();

// GET /api/admin/messages — paginated list
router.get(
	'/api/admin/messages',
	validateQuery(PaginationQuery),
	asyncHandler(async (req, res) => {
		const { page, limit } = req.query as unknown as z.infer<typeof PaginationQuery>;
		const skip = (page - 1) * limit;

		const [items, total] = await Promise.all([
			prisma.contactMessage.findMany({
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
			}),
			prisma.contactMessage.count(),
		]);

		res.json({
			items,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		});
	}),
);

// GET /api/admin/messages/:id — get single + mark as read
router.get(
	'/api/admin/messages/:id',
	asyncHandler(async (req: Request<{ id: string }>, res) => {
		const { id } = req.params;

		const message = await prisma.contactMessage.findUnique({ where: { id } });
		if (!message) throw notFound('Message');

		if (!message.isRead) {
			await prisma.contactMessage.update({
				where: { id },
				data: { isRead: true },
			});
		}

		res.json({ ...message, isRead: true });
	}),
);

// DELETE /api/admin/messages/:id
router.delete(
	'/api/admin/messages/:id',
	asyncHandler(async (req: Request<{ id: string }>, res) => {
		const { id } = req.params;
		const adminId = req.admin!.adminId;

		const existing = await prisma.contactMessage.findUnique({ where: { id } });
		if (!existing) throw notFound('Message');

		await prisma.contactMessage.delete({ where: { id } });

		await logAudit({
			adminId,
			action: 'delete',
			resourceType: 'ContactMessage',
			resourceId: id,
			changes: { from: existing.name, subject: existing.subject },
		});

		res.json({ message: 'Message deleted' });
	}),
);

export default router;
