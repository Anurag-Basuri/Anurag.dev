import { Request, Response } from 'express';
import { z } from 'zod';
import { processUserMessage, clearSessionMemory } from './agent.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

// Validation schemas for request bodies
const ChatMessageSchema = z.object({
	message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
	sessionId: z.string().min(1, 'Session ID is required'),
	currentUrl: z.string().optional(),
});
const ClearSessionSchema = z.object({
	sessionId: z.string().min(1, 'Session ID is required'),
});

// Controllers for handling agent requests
export async function sendMessage(req: Request, res: Response): Promise<void> {
	try {
		const data = ChatMessageSchema.parse(req.body);
		if (process.env.NODE_ENV === 'development') console.log('[Agent] User Message:', data.message);
		const response = await processUserMessage(data.message, data.sessionId, data.currentUrl);
		if (process.env.NODE_ENV === 'development') console.log('[Agent] Assistant Reply:', response.reply);
		ApiResponse.ok(
			res,
			{
				reply: response.reply,
				intents: [],
				sessionId: response.sessionId,
				messagesRemaining: response.messagesRemaining,
			},
			'Message processed successfully by Agent Proxy',
		);
	} catch (error: any) {
		// Zod validation errors handled by global error handler if rethrown
		if (error?.name === 'ZodError') {
			throw error;
		}
		// Categorize the error for structured logging
		const isRateLimit = error?.message?.includes('Quota') || error?.message?.includes('429');
		const isTimeout = error?.message?.includes('timeout') || error?.message?.includes('AbortError');
		const isNetworkErr = error?.message?.includes('fetch') || error?.message?.includes('ECONNREFUSED');
		const source = 'AgentController.sendMessage';
		console.error('[Agent Proxy] Request failed', {
			sessionId: req.body?.sessionId,
			category: isRateLimit
				? 'RATE_LIMIT'
				: isTimeout
					? 'TIMEOUT'
					: isNetworkErr
						? 'NETWORK'
						: 'INTERNAL',
			error: error.message
		});
		if (isRateLimit) {
			throw ApiError.TooManyRequests(
				"I'm currently experiencing high demand. Please try again in a few moments!",
				source,
			);
		}
		// Throw a structured ApiError so the frontend gets the context
		throw new ApiError(500, error.message || 'Agent proxy failed to process message', {
			source,
			details: { originalError: error.name || 'Unknown' },
			isOperational: true,
		});
	}
}

// Controller to reset a specific agent session memory
export async function resetSession(req: Request, res: Response): Promise<void> {
	try {
		const data = ClearSessionSchema.parse(req.body);
		await clearSessionMemory(data.sessionId);
		console.log(`[Agent Proxy] Session memory cleared for ${data.sessionId}`);
		ApiResponse.ok(res, { cleared: true }, 'Agent session memory cleared on proxy');
	} catch (error) {
		throw error;
	}
}
