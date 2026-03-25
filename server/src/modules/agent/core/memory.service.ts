import { BaseMessage, mapChatMessagesToStoredMessages, mapStoredMessagesToChatMessages } from '@langchain/core/messages';
import { BaseListChatMessageHistory } from '@langchain/core/chat_history';
import { prisma } from '../../../lib/prisma';

/**
 * Permanent Chat History implementation for LangChain using PostgreSQL.
 * Used for storing Multi-turn Conversation Context permanently so Anurag can view visitor questions.
 */
class PrismaChatMessageHistory extends BaseListChatMessageHistory {
	lc_namespace = ['langchain', 'stores', 'message', 'prisma'];
	private sessionId: string;

	constructor(sessionId: string) {
		super();
		this.sessionId = sessionId;
	}

	async getMessages(): Promise<BaseMessage[]> {
		const session = await prisma.agentSession.findUnique({
			where: { sessionId: this.sessionId }
		});

		if (!session || !session.history) return [];

		const parsed = typeof session.history === 'string' ? JSON.parse(session.history) : session.history;
		// LangChain's native mapper safely converts raw DB JSON back into ToolMessage, HumanMessage, AIMessage class instances
		return mapStoredMessagesToChatMessages(parsed);
	}

	async addMessage(message: BaseMessage): Promise<void> {
		// First, grab the current history state from the database
		const currentMessages = await this.getMessages();
		
		// Map the new consolidated state to LangChain's safe JSON structure
		currentMessages.push(message);
		const stored = mapChatMessagesToStoredMessages(currentMessages);

		// Upsert the DB row
		await prisma.agentSession.upsert({
			where: { sessionId: this.sessionId },
			update: { history: stored as any },
			create: { sessionId: this.sessionId, history: stored as any }
		});
	}

	async clear(): Promise<void> {
		await prisma.agentSession.deleteMany({
			where: { sessionId: this.sessionId }
		});
	}
}

// Global factory to instantiate Postgres adapters
export function getMessageHistory(sessionId: string): PrismaChatMessageHistory {
	return new PrismaChatMessageHistory(sessionId);
}

export async function clearSessionMemory(sessionId: string) {
	const history = new PrismaChatMessageHistory(sessionId);
	await history.clear();
}
