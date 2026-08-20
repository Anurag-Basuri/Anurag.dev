import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import type { AgentMessage } from '../types/agent.types';

/** Regex to find [NAVIGATE:/some/path] tokens in agent replies */
const NAV_REGEX = /\[NAVIGATE:([\w\-\/]+)\]/g;

/** Base Agent API URL with fallback */
const AGENT_API_BASE =
	process.env.NEXT_PUBLIC_AGENT_API_URL ||
	process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') ||
	'http://localhost:4000';

export function useAgentSession() {
	const [messages, setMessages] = useState<AgentMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [messagesRemaining, setMessagesRemaining] = useState<number | null>(null);
	const pathname = usePathname();

	// Avoid stale closures and multiple concurrent streams
	const isLoadingRef = useRef(false);
	const abortControllerRef = useRef<AbortController | null>(null);
	const sessionIdRef = useRef<string>('');

	// Persistent Session ID across reloads (survives tab refresh, dies on tab close)
	useEffect(() => {
		if (typeof window !== 'undefined') {
			let sid = sessionStorage.getItem('agent_session_id');
			if (!sid) {
				sid = 'guest_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
				sessionStorage.setItem('agent_session_id', sid);
			}
			sessionIdRef.current = sid;
		}
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	const sendMessage = useCallback(
		async (content: string) => {
			const trimmed = content.trim();
			if (!trimmed || isLoadingRef.current || messagesRemaining === 0) return;

			// Abort any existing stream
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
			const controller = new AbortController();
			abortControllerRef.current = controller;

			const userMsgId = Date.now().toString();
			const assistantMsgId = (Date.now() + 1).toString();

			const userMsg: AgentMessage = {
				id: userMsgId,
				role: 'user',
				content: trimmed,
			};

			const initialAssistantMsg: AgentMessage = {
				id: assistantMsgId,
				role: 'assistant',
				content: '',
				isStreaming: true,
				statusPhase: 'routing',
			};

			setMessages(prev => [...prev, userMsg, initialAssistantMsg]);
			setIsLoading(true);
			isLoadingRef.current = true;

			try {
				const streamUrl = `${AGENT_API_BASE.replace(/\/$/, '')}/api/public/stream`;
				const response = await fetch(streamUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						message: trimmed,
						session_id: sessionIdRef.current,
						current_url:
							pathname || (typeof window !== 'undefined' ? window.location.pathname : undefined),
					}),
					signal: controller.signal,
				});

				// Rate Limit Exceeded (429)
				if (response.status === 429) {
					setMessages(prev =>
						prev.map(msg =>
							msg.id === assistantMsgId
								? {
										...msg,
										content:
											"You have reached the temporary rate limit for the public portfolio chat. Please wait a moment or switch over to the full autonomous agent platform.",
										isStreaming: false,
										isRateLimit: true,
										isError: true,
										error: {
											status: 429,
											message: 'Rate limit exceeded for public session.',
											code: 'RATE_LIMIT_EXCEEDED',
										},
								  }
								: msg,
						),
					);
					return;
				}

				// Session Message Cap Exceeded (403)
				if (response.status === 403) {
					setMessagesRemaining(0);
					setMessages(prev =>
						prev.map(msg =>
							msg.id === assistantMsgId
								? {
										...msg,
										content:
											"You have completed your 20-message guest session on the portfolio. To continue the conversation with persistent memory and advanced tools, please visit the Agent platform.",
										isStreaming: false,
										isLimitReached: true,
										isError: true,
										error: {
											status: 403,
											message: 'Session message cap reached.',
											code: 'SESSION_CAP_REACHED',
										},
								  }
								: msg,
						),
					);
					return;
				}

				if (!response.ok) {
					throw new Error(`Server returned error status ${response.status}`);
				}

				if (!response.body) {
					throw new Error('ReadableStream not supported on this browser.');
				}

				const reader = response.body.getReader();
				const decoder = new TextDecoder('utf-8');
				let buffer = '';
				let accumulatedText = '';
				let currentPhase: 'routing' | 'thinking' | 'executing' | 'generating' = 'routing';
				let currentToolName = '';

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split('\n');
					buffer = lines.pop() || '';

					for (const line of lines) {
						const trimmedLine = line.trim();
						if (!trimmedLine || !trimmedLine.startsWith('data:')) continue;

						const dataStr = trimmedLine.replace(/^data:\s*/, '').trim();
						if (!dataStr) continue;

						try {
							const event = JSON.parse(dataStr);

							if (event.type === 'status') {
								currentPhase = event.phase;
								setMessages(prev =>
									prev.map(msg =>
										msg.id === assistantMsgId
											? { ...msg, statusPhase: currentPhase }
											: msg,
									),
								);
							} else if (event.type === 'tool_start') {
								currentPhase = 'executing';
								currentToolName = event.name || '';
								setMessages(prev =>
									prev.map(msg =>
										msg.id === assistantMsgId
											? {
													...msg,
													statusPhase: 'executing',
													currentTool: currentToolName,
											  }
											: msg,
									),
								);
							} else if (event.type === 'tool_end') {
								currentToolName = '';
								setMessages(prev =>
									prev.map(msg =>
										msg.id === assistantMsgId
											? { ...msg, currentTool: undefined }
											: msg,
									),
								);
							} else if (event.type === 'token') {
								if (event.content) {
									accumulatedText += event.content;
									const visibleText = accumulatedText.replace(NAV_REGEX, '').trim();

									setMessages(prev =>
										prev.map(msg =>
											msg.id === assistantMsgId
												? {
														...msg,
														content: visibleText,
														isStreaming: true,
														statusPhase: 'generating',
												  }
												: msg,
										),
									);
								}
							} else if (event.type === 'error') {
								const errMsg = event.message || 'Stream processing failed.';
								const isLimit =
									errMsg.toLowerCase().includes('limit reached') ||
									errMsg.toLowerCase().includes('message cap');

								setMessages(prev =>
									prev.map(msg =>
										msg.id === assistantMsgId
											? {
													...msg,
													content: isLimit
														? "You've reached the public session message limit. Hop over to our dedicated Agent web app to unlock unlimited conversations!"
														: errMsg,
													isStreaming: false,
													isLimitReached: isLimit,
													isError: true,
													error: {
														status: isLimit ? 403 : 500,
														message: errMsg,
														code: isLimit ? 'SESSION_CAP' : 'STREAM_ERROR',
													},
											  }
											: msg,
									),
								);
							} else if (event.type === 'done') {
								// Extract navigation targets
								const navigationTargets: string[] = [];
								let match: RegExpExecArray | null;
								const regex = new RegExp(NAV_REGEX.source, NAV_REGEX.flags);
								while ((match = regex.exec(accumulatedText)) !== null) {
									if (match[1]) navigationTargets.push(match[1]);
								}

								const cleanReply = accumulatedText.replace(NAV_REGEX, '').trim();

								setMessages(prev =>
									prev.map(msg =>
										msg.id === assistantMsgId
											? {
													...msg,
													content: cleanReply || msg.content,
													isStreaming: false,
													statusPhase: undefined,
													currentTool: undefined,
													navigationTargets:
														navigationTargets.length > 0
															? navigationTargets
															: undefined,
											  }
											: msg,
									),
								);

								setMessagesRemaining(prev => (prev !== null ? Math.max(0, prev - 1) : null));
							}
						} catch (jsonErr) {
							console.warn('[useAgentSession] Failed to parse SSE JSON:', dataStr, jsonErr);
						}
					}
				}
			} catch (error: any) {
				if (error?.name === 'AbortError') {
					return;
				}

				console.error('[useAgentSession] Streaming Error:', error);

				let errorText =
					'Sorry, I am having trouble connecting right now. Please verify the agent service is running.';
				let status = 0;

				if (error instanceof Error) {
					errorText = error.message;
				}

				setMessages(prev =>
					prev.map(msg =>
						msg.id === assistantMsgId
							? {
									...msg,
									content:
										'Sorry, connection was interrupted. Please ensure the agent backend is operational.',
									isStreaming: false,
									isError: true,
									error: {
										status,
										message: errorText,
										code: 'NETWORK_ERROR',
										source: 'public_stream',
									},
							  }
							: msg,
					),
				);
			} finally {
				setIsLoading(false);
				isLoadingRef.current = false;
				abortControllerRef.current = null;
			}
		},
		[pathname, messagesRemaining],
	);

	const retryMessage = useCallback(
		(messageId: string) => {
			const failedMsgIndex = messages.findIndex(m => m.id === messageId);
			if (failedMsgIndex === -1) return;

			let userMsgContent = '';
			for (let i = failedMsgIndex - 1; i >= 0; i--) {
				if (messages[i].role === 'user') {
					userMsgContent = messages[i].content;
					break;
				}
			}

			if (!userMsgContent) return;

			// Remove the failed assistant message and preceding user message
			setMessages(prev => prev.filter((_, i) => i !== failedMsgIndex && i !== failedMsgIndex - 1));
			sendMessage(userMsgContent);
		},
		[messages, sendMessage],
	);

	const clearSession = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		setMessages([]);
		const newSid = 'guest_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
		if (typeof window !== 'undefined') {
			sessionStorage.setItem('agent_session_id', newSid);
		}
		sessionIdRef.current = newSid;
		setMessagesRemaining(null);
		setIsLoading(false);
		isLoadingRef.current = false;
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
