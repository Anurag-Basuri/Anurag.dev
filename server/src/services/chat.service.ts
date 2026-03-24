import { getAIClient, AI_MODEL, SYSTEM_PROMPT } from '../config/ai';
import { classifyIntent, buildContext, getProjectsContext } from './rag.service';
import { fetchGithubActivity, fetchLeetCodeStats } from './external.service';
import { submitContactLead } from './actions.service';

// ─── Types ──────────────────────────────────────────────────────

interface ChatMessage {
	role: 'system' | 'user' | 'assistant' | 'tool';
	content?: string;
	name?: string; // used for tool role
	tool_calls?: any[]; // used for assistant role when calling tools
}

interface ChatResponse {
	reply: string;
	intents: string[];
	sessionId: string;
}

const SESSION_TTL = 1800; // 30 minutes
const MAX_HISTORY = 10; // Keep last 10 messages for context

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
	// Only keep normal user/assistant message history across sessions to avoid token bloat
	const trimmed = messages.filter(m => m.role === 'user' || m.role === 'assistant' && m.content).slice(-MAX_HISTORY);
	sessionStore.set(sessionId, {
		messages: trimmed,
		expiresAt: Date.now() + SESSION_TTL * 1000,
	});
}

export async function clearSession(sessionId: string): Promise<void> {
	sessionStore.delete(sessionId);
}

// ─── AGENT TOOLS (OpenAI / HuggingFace Format) ──────────────────

const agentTools = [
	{
		type: 'function',
		function: {
			name: 'search_projects',
			description: 'Search Anurag\'s portfolio projects by keyword or tech stack',
			parameters: {
				type: 'object',
				properties: {
					query: { type: 'string', description: 'The search query or technology name (e.g. React, Python, E-commerce)' },
				},
				required: ['query'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'get_github_activity',
			description: 'Fetch Anurag\'s live GitHub profile stats and recent public activity',
			parameters: {
				type: 'object',
				properties: {
					username: { type: 'string', description: 'GitHub username, default to anurag-basuri' },
				},
				required: ['username'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'get_leetcode_stats',
			description: 'Fetch Anurag\'s live LeetCode competitive programming stats',
			parameters: {
				type: 'object',
				properties: {
					username: { type: 'string', description: 'LeetCode username, default to anuragbasuri' },
				},
				required: ['username'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'submit_contact_lead',
			description: 'Submit an inquiry or contact message to Anurag. Always ask the user for their name, email, and message before calling this tool.',
			parameters: {
				type: 'object',
				properties: {
					name: { type: 'string', description: 'Visitor\'s full name' },
					email: { type: 'string', description: 'Visitor\'s email address' },
					message: { type: 'string', description: 'The message or inquiry' },
				},
				required: ['name', 'email', 'message'],
			},
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
				return { result: await fetchLeetCodeStats(args.username || 'avijit-basuri') };
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
	const baseContext = await buildContext(intents, message);
	
	const history = await getHistory(sessionId);
	const hf = getAIClient();

	const messages: any[] = [
		{ role: 'system', content: SYSTEM_PROMPT },
		...history
	];

	// Inject base context only on the active turn
	const prompt = baseContext
		? `[BASE PORTFOLIO DATA]\n${baseContext}\n[END DATA]\n\nVisitor says: ${message}`
		: `Visitor says: ${message}`;

	messages.push({ role: 'user', content: prompt });

	// 2. Agentic Execution Loop
	let callCount = 0;
	let currentResponse: any = null;

	while (callCount < 3) {
		try {
			currentResponse = await hf.chatCompletion({
				model: AI_MODEL,
				messages: messages,
				tools: agentTools as any,
				max_tokens: 1000,
			});

			const responseMessage = currentResponse.choices[0].message;

			// If the model wants to call a tool
			if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
				// Append the assistant's tool calls to the history
				messages.push(responseMessage);

				// Execute all requested tools
				for (const toolCall of responseMessage.tool_calls) {
					let args = {};
					try {
						args = JSON.parse(toolCall.function.arguments);
					} catch (e) {
						console.error('Failed to parse tool arguments:', toolCall.function.arguments);
					}

					const toolResult = await executeTool(toolCall.function.name, args);

					// Append the tool result
					messages.push({
						role: 'tool',
						name: toolCall.function.name,
						content: JSON.stringify(toolResult),
					});
				}

				callCount++;
				// Loop continues to let the model generate the final response with tool outputs
				continue;
			}

			// If no tool calls, this is the final answer
			messages.push({ role: 'assistant', content: responseMessage.content });
			break;
		} catch (error: any) {
			console.error('[hf.inference] Error:', error);
			throw error;
		}
	}

	const reply = messages[messages.length - 1].content || 'I encountered an issue processing that. Could you rephrase?';

	// 3. Save to memory
	await saveHistory(sessionId, messages);

	return { reply, intents, sessionId };
}
