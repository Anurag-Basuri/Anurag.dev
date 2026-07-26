import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient, ApiClientError } from '@/api/client';
import type { AgentMessage, AgentApiResponse } from '../types/agent.types';

/** Regex to find [NAVIGATE:/some/path] tokens in agent replies */
const NAV_REGEX = /\[NAVIGATE:([\w\-\/]+)\]/g;

export function useAgentSession() {
	const [messages, setMessages] = useState<AgentMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [messagesRemaining, setMessagesRemaining] = useState<number | null>(null);
	const router = useRouter();
	const pathname = usePathname();

	// Use a ref to prevent stale closure issues with isLoading
	const isLoadingRef = useRef(false);

	// Persistent Session ID across reloads
	const sessionIdRef = useRef<string>('');

	useEffect(() => {
		if (typeof window !== 'undefined') {
			let sid = sessionStorage.getItem('agent_session_id');
			if (!sid) {
				sid = Math.random().toString(36).substring(2, 15);
				sessionStorage.setItem('agent_session_id', sid);
			}
			sessionIdRef.current = sid;
		}
	}, []);

	const sendMessage = useCallback(
		async (content: string) => {
			if (!content.trim() || isLoadingRef.current || messagesRemaining === 0) return;

			const userMsg: AgentMessage = {
				id: Date.now().toString(),
				role: 'user',
				content,
			};

			setMessages(prev => [...prev, userMsg]);
			setIsLoading(true);
			isLoadingRef.current = true;
			if (process.env.NODE_ENV === 'development') console.log('[Agent] User Message:', content);

			try {
				const resData = await apiClient.post<AgentApiResponse>(
					'/chat',
					{
						message: content,
						sessionId: sessionIdRef.current,
						currentUrl:
							pathname ||
							(typeof window !== 'undefined' ? window.location.pathname : undefined),
					},
					false, // auth
					60_000, // 60s timeout for agent — LLM + tool loops take time
				);

				let rawReply = resData.reply;
				if (process.env.NODE_ENV === 'development') console.log('[Agent] Assistant Reply:', rawReply);

				// Extract navigation targets for rendering as buttons
				const navigationTargets: string[] = [];
				let match: RegExpExecArray | null;
				const regex = new RegExp(NAV_REGEX.source, NAV_REGEX.flags);
				while ((match = regex.exec(rawReply)) !== null) {
					if (match[1]) navigationTargets.push(match[1]);
				}

				// Strip the [NAVIGATE:...] tokens from visible text
				const cleanReply = rawReply.replace(NAV_REGEX, '').trim();

				// NOTE: Navigation is handled by buttons in AgentMessageBubble
				// which properly normalizes routes (e.g., /projects → /portfolio/projects)

				const assistantMsg: AgentMessage = {
					id: (Date.now() + 1).toString(),
					role: 'assistant',
					content: cleanReply,
					navigationTargets: navigationTargets.length > 0 ? navigationTargets : undefined,
				};

				setMessages(prev => [...prev, assistantMsg]);
				
				if (resData.messagesRemaining !== undefined) {
					setMessagesRemaining(resData.messagesRemaining);
				}
			} catch (error: any) {
				console.error('[useAgentSession] Error:', error);

				let errorText =
					'Sorry, I am having trouble connecting right now. Please try again later.';
				let status = 0;
				let details = '';
				let source = '';

				if (error instanceof ApiClientError) {
					status = error.status;
					details = error.message;
					source = error.source || '';
				} else if (error instanceof Error) {
					details = error.message;
				}

				// Friendly error mapping
				if (status === 408)
					errorText = 'Request timed out. The server might be busy or cold-starting.';
				if (status === 429)
					errorText = "I'm receiving too many requests right now. Please wait a moment.";
				if (status === 0)
					errorText =
						'Network error. Please check your internet connection or if the server is running.';

				const errMsg: AgentMessage = {
					id: (Date.now() + 1).toString(),
					role: 'assistant',
					content: errorText,
					isError: true,
					error: {
						status,
						message: details,
						code: error?.name || 'Error',
						source,
					},
				};
				setMessages(prev => [...prev, errMsg]);
			} finally {
				setIsLoading(false);
				isLoadingRef.current = false;
			}
		},
		[pathname],
	);

	const retryMessage = useCallback(
		(messageId: string) => {
			// Find the message that failed (it's an assistant message)
			const failedMsgIndex = messages.findIndex(m => m.id === messageId);
			if (failedMsgIndex === -1) return;

			// Find the previous user message to re-send
			let userMsgContent = '';
			for (let i = failedMsgIndex - 1; i >= 0; i--) {
				if (messages[i].role === 'user') {
					userMsgContent = messages[i].content;
					break;
				}
			}

			if (!userMsgContent) return;

			// Remove the failed message and its associated user message from the list
			setMessages(prev => prev.filter((_, i) => i !== failedMsgIndex));

			// Re-send the content
			sendMessage(userMsgContent);
		},
		[messages, sendMessage],
	);

	const clearSession = useCallback(async () => {
		setMessages([]);
		if (sessionIdRef.current) {
			try {
				await apiClient.post('/chat/reset', { sessionId: sessionIdRef.current });
				const newSid = Math.random().toString(36).substring(2, 15);
				sessionStorage.setItem('agent_session_id', newSid);
				sessionIdRef.current = newSid;
				setMessagesRemaining(null);
			} catch (e) {
				console.error('[useAgentSession] Failed to reset memory:', e);
			}
		}
	}, []);

	return {
		messages,
		isLoading,
		isOpen,
		messagesRemaining,
		setIsOpen,
		sendMessage,
		retryMessage,
		clearSession,
	};
}
