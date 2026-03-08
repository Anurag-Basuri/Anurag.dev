import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import sanitizeHtml from 'sanitize-html';
import { prisma } from '../../lib/db';
import { validate } from '../../middleware/validate';
import { rateLimit } from '../../middleware/rate-limit';
import { ContactSchema } from '../../schemas/zod-schemas';

/**
 * Public contact form submission endpoint.
 * Rate-limited to 5 submissions per hour per IP.
 */
export default async function contactRoutes(fastify: FastifyInstance) {
	fastify.post(
		'/api/contact',
		{
			preHandler: [
				rateLimit({ max: 5, windowSeconds: 60 * 60, prefix: 'contact' }),
				validate(ContactSchema),
			],
		},
		async (request: FastifyRequest, reply: FastifyReply) => {
			const body = request.body as {
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
					ipAddress: request.ip,
				},
			});

			return reply.status(201).send({
				message: 'Message sent successfully. Thank you for reaching out!',
			});
		},
	);
}
