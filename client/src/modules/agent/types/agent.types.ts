export type AgentRole = 'user' | 'assistant';

export interface AgentMessage {
	id: string;
	role: AgentRole;
	content: string;
	/** Whether this message is currently being streamed token by token */
	isStreaming?: boolean;
	/** Current phase of the message if streaming */
	statusPhase?: 'routing' | 'thinking' | 'executing' | 'generating';
	/** Current tool execution name if any */
	currentTool?: string;
	/** Navigation targets extracted from [NAVIGATE:...] patterns */
	navigationTargets?: string[];
	/** Flag indicating user exceeded rate limit (429) */
	isRateLimit?: boolean;
	/** Flag indicating session message limit was reached (403) */
	isLimitReached?: boolean;
	/** Error state details */
	isError?: boolean;
	error?: {
		status?: number;
		message?: string;
		code?: string;
		source?: string;
	};
}

export interface AgentApiResponse {
	reply: string;
	intents?: string[];
	sessionId: string;
	messagesRemaining?: number;
}
