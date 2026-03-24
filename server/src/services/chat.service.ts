import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { getAIModel, SYSTEM_PROMPT } from '../config/ai';
import { classifyIntent, buildContext, getProjectsContext } from './rag.service';
import { fetchGithubActivity, fetchLeetCodeStats } from './external.service';
import { submitContactLead } from './actions.service';

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

const SESSION_TTL = 1800;
const MAX_HISTORY = 10;

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

// ─── AGENT TOOLS (Function Declarations) ────────────────────────

const agentFunctions: FunctionDeclaration[] = [
	{
		name: 'search_projects',
		description: 'Search Anurag\'s portfolio projects by keyword or tech stack',
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				query: { type: SchemaType.STRING, description: 'The search query or technology name (e.g. React, Python, E-commerce)' },
			},
			required: ['query'],
		},
	},
	{
		name: 'get_github_activity',
		description: 'Fetch Anurag\'s live GitHub profile stats and recent public activity',
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				username: { type: SchemaType.STRING, description: 'GitHub username, default to anurag-basuri' },
			},
			required: ['username'],
		},
	},
	{
		name: 'get_leetcode_stats',
		description: 'Fetch Anurag\'s live LeetCode competitive programming stats',
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				username: { type: SchemaType.STRING, description: 'LeetCode username, default to anuragbasuri' },
			},
			required: ['username'],
		},
	},
	{
		name: 'submit_contact_lead',
		description: 'Submit an inquiry or contact message to Anurag. Always ask the user for their name, email, and message before calling this tool.',
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				name: { type: SchemaType.STRING, description: 'Visitor\'s full name' },
				email: { type: SchemaType.STRING, description: 'Visitor\'s email address' },
				message: { type: SchemaType.STRING, description: 'The message or inquiry' },
			},
			required: ['name', 'email', 'message'],
		},
	},
];

// Execution map for the tools
async function executeTool(name: string, args: Record<string, any>): Promise<any> {
	console.log(`[agent] Executing tool: ${name}`, args);
	try {
		switch (name) {
			case 'search_projects':
				return { result: await getProjectsContext(args.query) };
			case 'get_github_activity':
				return { result: await fetchGithubActivity(args.username || 'anurag-basuri') };
			case 'get_leetcode_stats':
				return { result: await fetchLeetCodeStats(args.username || 'avijit-basuri') }; // Fallback to provided username if known 
			case 'submit_contact_lead':
				const res = await submitContactLead(args.name, args.email, args.message);
				return JSON.parse(res);
			default:
				return { error: `Tool ${name} not found.` };
		}
	} catch (error: any) {
		return { error: error.message || 'Tool execution failed' };
	}
}

// ─── Main Chat Function ────────────────────────────────────────

export async function chat(message: string, sessionId: string): Promise<ChatResponse> {
	// 1. Pre-warm context via Intents
	const intents = classifyIntent(message);
	// We still pull basic RAG context so the LLM doesn't have to tool-call for simple things like "Who are you?"
	const baseContext = await buildContext(intents, message);
	
	const history = await getHistory(sessionId);
	const historyForModel = history.map(msg => ({
		role: msg.role as 'user' | 'model',
		parts: [{ text: msg.content }],
	}));

	const model = getAIModel();
	const chatSession = model.startChat({
		tools: [{ functionDeclarations: agentFunctions }],
		history: [
			{
				role: 'user',
				parts: [{ text: 'System instructions: ' + SYSTEM_PROMPT }],
			},
			{
				role: 'model',
				parts: [{ text: 'Understood. I will act as Anurag, use the provided tools if needed, and respond according to instructions.' }],
			},
			...historyForModel,
		],
	});

	// Inject base context only on the first message turn to save tokens
	const prompt = baseContext
		? `[BASE PORTFOLIO DATA]\n${baseContext}\n[END DATA]\n\nVisitor says: ${message}`
		: `Visitor says: ${message}`;

	// 2. Agentic Execution Loop
	let result = await chatSession.sendMessage([{ text: prompt }]);
	
	// Handle potential function calls (up to 3 chained calls to prevent infinite loops)
	let callCount = 0;
	while (result.response.functionCalls() && callCount < 3) {
		const calls = result.response.functionCalls()!;
		// Gemini can technically return multiple parallel calls, we handle them all
		const functionResponses = await Promise.all(
			calls.map(async call => {
				const response = await executeTool(call.name, call.args);
				return {
					functionResponse: {
						name: call.name,
						response,
					},
				};
			})
		);

		// Send tool results back to the model
		result = await chatSession.sendMessage(functionResponses);
		callCount++;
	}

	const reply = result.response.text();

	// 3. Save to history
	history.push({ role: 'user', content: message });
	history.push({ role: 'model', content: reply });
	await saveHistory(sessionId, history);

	return { reply, intents, sessionId };
}
