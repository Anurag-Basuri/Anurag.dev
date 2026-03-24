import { prisma } from '../lib/prisma';
import sanitizeHtml from 'sanitize-html';

export async function submitContactLead(name: string, email: string, message: string) {
	try {
		// Basic validation
		if (!name || !email || !message) {
			return JSON.stringify({ error: 'Name, email, and message are all required.' });
		}

		// Optional: basic email regex validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return JSON.stringify({ error: 'Invalid email format.' });
		}

		const cleanName = sanitizeHtml(name, { allowedTags: [] });
		const cleanEmail = sanitizeHtml(email, { allowedTags: [] });
		const cleanMessage = sanitizeHtml(message, { allowedTags: [] });

		await prisma.contactMessage.create({
			data: {
				name: cleanName,
				email: cleanEmail,
				subject: 'Contact Form via AI Agent',
				message: cleanMessage,
				isRead: false,
			},
		});

		return JSON.stringify({
			success: true,
			status: 'Lead saved successfully. Anurag will be notified and will reply shortly.',
		});
	} catch (error) {
		console.error('[actions] Failed to save contact lead:', error);
		return JSON.stringify({ error: 'Failed to save the contact information to the database.' });
	}
}
