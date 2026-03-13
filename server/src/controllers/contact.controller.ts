import { Request, Response } from 'express';
import sanitizeHtml from 'sanitize-html';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * POST /api/contact
 */
export async function submitContact(req: Request, res: Response): Promise<void> {
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
