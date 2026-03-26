import { Request, Response } from 'express';
import { z } from 'zod';
import { processUserMessage } from './agent.service';
import { clearSessionMemory } from './core/memory.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { agentLogger } from './core/agent.logger';

// ─── Validation ─────────────────────────────────────────────────

const ChatMessageSchema = z.object({
	message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
	sessionId: z.string().min(1, 'Session ID is required'),
	currentUrl: z.string().optional(),
});

const ClearSessionSchema = z.object({
	sessionId: z.string().min(1, 'Session ID is required'),
});

// ─── Controllers ───────────────────────────────────────────────

export async function sendMessage(req: Request, res: Response): Promise<void> {
	try {
		const data = ChatMessageSchema.parse(req.body);

		const response = await processUserMessage(data.message, data.sessionId, data.currentUrl);

		ApiResponse.ok(
			res,
			{
				reply: response.reply,
				intents: [], // Legacy compatibility
				sessionId: response.sessionId,
			},
			'Message processed successfully by Agent',
		);
	} catch (error: any) {
		// Zod validation errors should still throw (bad request from client)
		if (error?.name === 'ZodError') {
			agentLogger.warn('CTRL', 'Zod validation failed', { issues: error.issues });
			throw error;
		}

		// Categorize the error for structured logging
		const isRateLimit = error?.message?.includes('Quota') || error?.message?.includes('429');
		const isTimeout = error?.message?.includes('timeout') || error?.message?.includes('AbortError');
		const isNetworkErr = error?.message?.includes('fetch') || error?.message?.includes('ECONNREFUSED');

		agentLogger.error('CTRL', 'Request failed — returning graceful fallback', error, {
			sessionId: req.body?.sessionId,
			category: isRateLimit ? 'RATE_LIMIT' : isTimeout ? 'TIMEOUT' : isNetworkErr ? 'NETWORK' : 'INTERNAL',
		});

		// Rate limit → specific message
		if (isRateLimit) {
			ApiResponse.ok(
				res,
				{
					reply: 'I\'m currently experiencing high demand. Please try again in a few moments!',
					intents: [],
					sessionId: req.body?.sessionId || '',
				},
				'Rate limited',
			);
			return;
		}

		// ALL other errors: return a graceful fallback chat message (HTTP 200)
		ApiResponse.ok(
			res,
			{
				reply: 'I ran into a hiccup processing that. Could you try rephrasing your question?',
				intents: [],
				sessionId: req.body?.sessionId || '',
			},
			'Agent encountered an internal error but recovered gracefully',
		);
	}
}

export async function resetSession(req: Request, res: Response): Promise<void> {
	try {
		const data = ClearSessionSchema.parse(req.body);
		clearSessionMemory(data.sessionId);
		agentLogger.info('MEMORY', `Session memory cleared`, { sessionId: data.sessionId });
		ApiResponse.ok(res, { cleared: true }, 'Agent session memory cleared');
	} catch (error) {
		throw error;
	}
}
