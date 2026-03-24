import { useState, useRef, useEffect, useCallback } from 'react';
import { apiClient } from '@/api';

export interface ChatMessageData {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	isStreaming?: boolean;
}

export function useChatSession() {
	const [messages, setMessages] = useState<ChatMessageData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	
	// Create a persistent session ID natively
	const sessionIdRef = useRef<string>('');
	useEffect(() => {
		if (typeof window !== 'undefined') {
			let sid = localStorage.getItem('chat_session_id');
			if (!sid) {
				sid = Math.random().toString(36).substring(2, 15);
				localStorage.setItem('chat_session_id', sid);
			}
			sessionIdRef.current = sid;
		}
	}, []);

	// Send message to the backend
	const sendMessage = useCallback(async (content: string) => {
		if (!content.trim() || isLoading) return;

		const userMsg: ChatMessageData = {
			id: Date.now().toString(),
			role: 'user',
			content,
		};

		setMessages(prev => [...prev, userMsg]);
		setIsLoading(true);

		try {
			const resData = await apiClient.post<{ reply: string; sessionId: string; intents: string[] }>('/chat', {
				message: content,
				sessionId: sessionIdRef.current,
			});

			const assistantMsg: ChatMessageData = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: resData.reply,
			};

			setMessages(prev => [...prev, assistantMsg]);
		} catch (error: any) {
			console.error('Chat error:', error);
			const errMsg: ChatMessageData = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: error?.response?.data?.error?.message || 'Sorry, I am having trouble connecting right now. Please try again later.',
			};
			setMessages(prev => [...prev, errMsg]);
		} finally {
			setIsLoading(false);
		}
	}, [isLoading]);

	const clearSession = useCallback(async () => {
		setMessages([]);
		if (sessionIdRef.current) {
			try {
				await apiClient.post('/chat/reset', { sessionId: sessionIdRef.current });
			} catch (e) {
				// Ignore errors on clear
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
