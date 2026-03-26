import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/api';
import type { AgentMessage, AgentApiResponse } from '../types/agent.types';

/** Regex to find [NAVIGATE:/some/path] tokens in agent replies */
const NAV_REGEX = /\[NAVIGATE:([\w\-\/]+)\]/g;

export function useAgentSession() {
	const [messages, setMessages] = useState<AgentMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	// Use a ref to prevent stale closure issues with isLoading
	const isLoadingRef = useRef(false);

	// Persistent Session ID across reloads
	const sessionIdRef = useRef<string>('');

	useEffect(() => {
		if (typeof window !== 'undefined') {
			let sid = localStorage.getItem('agent_session_id');
			if (!sid) {
				sid = Math.random().toString(36).substring(2, 15);
				localStorage.setItem('agent_session_id', sid);
			}
			sessionIdRef.current = sid;
		}
	}, []);

	const sendMessage = useCallback(async (content: string) => {
		if (!content.trim() || isLoadingRef.current) return;

		const userMsg: AgentMessage = {
			id: Date.now().toString(),
			role: 'user',
			content,
		};

		setMessages(prev => [...prev, userMsg]);
		setIsLoading(true);
		isLoadingRef.current = true;

		try {
			const resData = await apiClient.post<AgentApiResponse>('/chat', {
				message: content,
				sessionId: sessionIdRef.current,
				currentUrl: pathname || (typeof window !== 'undefined' ? window.location.pathname : undefined),
			});

			let rawReply = resData.reply;

			// Extract navigation targets for rendering as buttons
			const navigationTargets: string[] = [];
			let match: RegExpExecArray | null;
			const regex = new RegExp(NAV_REGEX.source, NAV_REGEX.flags);
			while ((match = regex.exec(rawReply)) !== null) {
				if (match[1]) navigationTargets.push(match[1]);
			}

			// Strip the [NAVIGATE:...] tokens from visible text
			const cleanReply = rawReply.replace(NAV_REGEX, '').trim();

			// Navigate to the first target automatically
			if (navigationTargets.length > 0) {
				const target = navigationTargets[0].startsWith('/')
					? navigationTargets[0]
					: `/${navigationTargets[0]}`;
				router.push(target);
			}

			const assistantMsg: AgentMessage = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: cleanReply,
				navigationTargets: navigationTargets.length > 0 ? navigationTargets : undefined,
			};

			setMessages(prev => [...prev, assistantMsg]);
		} catch (error: any) {
			console.error('[useAgentSession] Error:', error);

			let errorText = 'Sorry, I am having trouble connecting right now. Please try again later.';
			if (error?.message && typeof error.message === 'string' && error.message !== 'Network error') {
				errorText = error.message;
			}

			const errMsg: AgentMessage = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: errorText,
			};
			setMessages(prev => [...prev, errMsg]);
		} finally {
			setIsLoading(false);
			isLoadingRef.current = false;
		}
	}, [router, pathname]);

	const clearSession = useCallback(async () => {
		setMessages([]);
		if (sessionIdRef.current) {
			try {
				await apiClient.post('/chat/reset', { sessionId: sessionIdRef.current });
				const newSid = Math.random().toString(36).substring(2, 15);
				localStorage.setItem('agent_session_id', newSid);
				sessionIdRef.current = newSid;
			} catch (e) {
				console.error('[useAgentSession] Failed to reset memory:', e);
			}
		}
	}, []);

	return {
		messages,
		isLoading,
		isOpen,
		setIsOpen,
		sendMessage,
		clearSession,
	};
}
