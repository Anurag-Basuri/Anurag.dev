import { Request, Response } from 'express';
import { z } from 'zod';
import { chat, clearSession } from '../services/chat.service';
import { isAIEnabled } from '../config/ai';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

// ─── Validation ─────────────────────────────────────────────────

const ChatMessageSchema = z.object({
	message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
	sessionId: z.string().min(1, 'Session ID is required'),
});

const ClearSessionSchema = z.object({
	sessionId: z.string().min(1, 'Session ID is required'),
});

// ─── Controllers ───────────────────────────────────────────────

export async function sendMessage(req: Request, res: Response): Promise<void> {
	try {
		if (!isAIEnabled()) {
			throw ApiError.ServiceUnavailable('AI Chatbot is not configured on this server');
		}

		const data = ChatMessageSchema.parse(req.body);

		const response = await chat(data.message, data.sessionId);

		ApiResponse.ok(
			res,
			{
				reply: response.reply,
				intents: response.intents,
				sessionId: response.sessionId,
			},
			'Message processed successfully',
		);
	} catch (error) {
		// Specific error for rate limiting or AI provider errors
		if (error instanceof Error && error.message.includes('Quota')) {
			throw ApiError.ServiceUnavailable('AI service is currently overloaded. Please try again later.');
		}
		throw error;
	}
}

export async function resetSession(req: Request, res: Response): Promise<void> {
	try {
		const data = ClearSessionSchema.parse(req.body);
		await clearSession(data.sessionId);
		ApiResponse.ok(res, { cleared: true }, 'Chat session cleared');
	} catch (error) {
		throw error;
	}
}
