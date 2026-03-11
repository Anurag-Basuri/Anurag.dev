import { Router } from 'express';
import sanitizeHtml from 'sanitize-html';
import { prisma } from '../../lib/prisma';
import { validate } from '../../middleware/validate.middleware';
import { rateLimit } from '../../middleware/rate-limit.middleware';
import { ContactSchema } from '../../schemas/zod-schemas';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

/**
 * Public contact form submission endpoint.
 * Rate-limited to 5 submissions per hour per IP.
 */
router.post(
	'/api/contact',
	rateLimit({ max: 5, windowSeconds: 60 * 60, prefix: 'contact' }),
	validate(ContactSchema),
	asyncHandler(async (req, res) => {
		const body = req.body as {
			name: string;
			email: string;
			subject: string;
			message: string;
		};

		// Sanitize HTML from message to prevent XSS in admin dashboard
		const sanitizedMessage = sanitizeHtml(body.message, {
			allowedTags: [],
			allowedAttributes: {},
		});

		await prisma.contactMessage.create({
			data: {
				name: sanitizeHtml(body.name, { allowedTags: [] }),
				email: body.email,
				subject: sanitizeHtml(body.subject, { allowedTags: [] }),
				message: sanitizedMessage,
				ipAddress: req.ip || req.socket.remoteAddress,
			},
		});

		res.status(201).json({
			message: 'Message sent successfully. Thank you for reaching out!',
		});
	}),
);

export default router;
