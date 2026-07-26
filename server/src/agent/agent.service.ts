import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

// Interface for the response from the Personal Agent Backend
export interface AgentResponse {
	reply: string;
	sessionId: string;
	messagesRemaining?: number;
}

// Process user message to Personal Agent Backend
export async function processUserMessage(
	message: string,
	sessionId: string,
	currentUrl?: string,
): Promise<AgentResponse> {
	if (!env.AGENT_BACKEND_URL) {
		throw new Error('AGENT_BACKEND_URL is not configured in the environment.');
	}

	const url = `${env.AGENT_BACKEND_URL.replace(/\/$/, '')}/api/public/chat`;

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message,
				session_id: sessionId,
				current_url: currentUrl,
			}),
		});

		if (!response.ok) {
			const text = await response.text();
			if (response.status === 429) {
				throw ApiError.TooManyRequests('You have reached the message limit for this session.');
			}
			throw new Error(`Personal Agent Backend returned ${response.status}: ${text}`);
		}

		const data: any = await response.json();
		return {
			reply: data.data?.reply || data.reply || 'No reply received from agent.',
			sessionId: data.data?.session_id || data.session_id || sessionId,
			messagesRemaining: data.data?.messages_remaining || data.messages_remaining,
		};
	} catch (error: any) {
		if (error instanceof ApiError) throw error;
		console.error('[Agent Proxy] Error connecting to Personal Agent Backend:', error);
		throw new Error('Failed to connect to the Personal Agent backend. Please try again later.');
	}
}

export async function clearSessionMemory(sessionId: string): Promise<void> {
	// The session memory is ephemeral on the backend
	// No explicit DB clear is needed anymore
	console.log(`[Agent Proxy] clearSessionMemory called for session ${sessionId}. No-op on proxy.`);
}
