import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logAudit } from '../lib/audit';

const PaginationQuery = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Controller functions for managing contact messages
async function listMessages(req: Request, res: Response): Promise<void> {
	const { page, limit } = PaginationQuery.parse(req.query);
	const skip = (page - 1) * limit;

	const [items, total] = await Promise.all([
		prisma.contactMessage.findMany({
			orderBy: { createdAt: 'desc' },
			skip,
			take: limit,
		}),
		prisma.contactMessage.count(),
	]);

	ApiResponse.paginated(res, items, {
		page,
		limit,
		total,
		totalPages: Math.ceil(total / limit),
	});
}

// Get a specific message by ID and mark it as read if it hasn't been read yet
async function getMessage(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;

	const message = await prisma.contactMessage.findUnique({ where: { id } });
	if (!message) throw ApiError.NotFound('Message');

	if (!message.isRead) {
		await prisma.contactMessage.update({
			where: { id },
			data: { isRead: true },
		});
	}

	ApiResponse.ok(res, { ...message, isRead: true });
}

// Delete a specific message by ID and log the action in the audit log
async function deleteMessage(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	const adminId = req.admin!.adminId;

	const existing = await prisma.contactMessage.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Message');

	await prisma.contactMessage.delete({ where: { id } });

	await logAudit({
		adminId,
		action: 'delete',
		resourceType: 'ContactMessage',
		resourceId: id,
		changes: { from: existing.name, subject: existing.subject },
	});

	ApiResponse.noContent(res);
}

export { listMessages, getMessage, deleteMessage };
