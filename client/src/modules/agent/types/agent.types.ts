export type AgentRole = 'user' | 'assistant';

export interface AgentMessage {
	id: string;
	role: AgentRole;
	content: string;
	/** Navigation targets extracted from [NAVIGATE:...] patterns */
	navigationTargets?: string[];
}

export interface AgentApiResponse {
	reply: string;
	intents?: string[];
	sessionId: string;
}
