import { getAIModel, SYSTEM_PROMPT } from '../config/ai';
import { classifyIntent, buildContext } from './rag.service';


// ─── Types ──────────────────────────────────────────────────────

interface ChatMessage {
	role: 'user' | 'model';
	content: string;
}

interface ChatResponse {
	reply: string;
	intents: string[];
	sessionId: string;
}

const SESSION_TTL = 1800; // 30 minutes
const MAX_HISTORY = 10; // Keep last 10 messages for context

// Simple in-memory session store (since there's no Redis client yet)
const sessionStore = new Map<string, { messages: ChatMessage[]; expiresAt: number }>();

async function getHistory(sessionId: string): Promise<ChatMessage[]> {
	const session = sessionStore.get(sessionId);
	if (!session) return [];
	if (session.expiresAt < Date.now()) {
		sessionStore.delete(sessionId);
		return [];
	}
	return session.messages;
}

async function saveHistory(sessionId: string, messages: ChatMessage[]): Promise<void> {
	const trimmed = messages.slice(-MAX_HISTORY);
	sessionStore.set(sessionId, {
		messages: trimmed,
		expiresAt: Date.now() + SESSION_TTL * 1000,
	});
}

export async function clearSession(sessionId: string): Promise<void> {
	sessionStore.delete(sessionId);
}

// ─── Main Chat Function ────────────────────────────────────────

export async function chat(message: string, sessionId: string): Promise<ChatResponse> {
	// 1. Classify intent
	const intents = classifyIntent(message);

	// 2. Retrieve relevant context via RAG
	const context = await buildContext(intents, message);

	// 3. Get conversation history
	const history = await getHistory(sessionId);

	// 4. Build the prompt
	const model = getAIModel();

	// Build conversation history for the model
	const historyForModel = history.map(msg => ({
		role: msg.role as 'user' | 'model',
		parts: [{ text: msg.content }],
	}));

	const chatSession = model.startChat({
		history: [
			{
				role: 'user',
				parts: [{ text: 'System instructions: ' + SYSTEM_PROMPT }],
			},
			{
				role: 'model',
				parts: [{ text: 'Understood. I will respond as Anurag Basuri, using first person, based only on the portfolio data provided. I will be professional, concise, and helpful.' }],
			},
			...historyForModel,
		],
	});

	// 5. Send message with context
	const promptWithContext = context
		? `[PORTFOLIO DATA FOR CONTEXT]\n${context}\n[END CONTEXT]\n\nVisitor's question: ${message}`
		: `Visitor's question: ${message}`;

	const result = await chatSession.sendMessage(promptWithContext);
	const reply = result.response.text();

	// 6. Save to history
	history.push({ role: 'user', content: message });
	history.push({ role: 'model', content: reply });
	await saveHistory(sessionId, history);

	return { reply, intents, sessionId };
}
