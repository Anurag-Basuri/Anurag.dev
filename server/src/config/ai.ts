import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env';

// ─── AI Client Factory ──────────────────────────────────────────
// Returns a configured Gemini model instance.
// Supports swapping providers via AI_PROVIDER env var in the future.

const DEFAULT_MODELS: Record<string, string> = {
	gemini: 'gemini-2.0-flash',
	openai: 'gpt-4o-mini',
	groq: 'llama-3.3-70b-versatile',
};

export function isAIEnabled(): boolean {
	return !!env.AI_API_KEY;
}

export function getAIModel() {
	if (!env.AI_API_KEY) {
		throw new Error('AI_API_KEY is not configured');
	}

	const provider = env.AI_PROVIDER ?? 'gemini';
	const modelName = env.AI_MODEL ?? DEFAULT_MODELS[provider] ?? 'gemini-3-flash-preview';

	if (provider === 'gemini') {
		const genAI = new GoogleGenerativeAI(env.AI_API_KEY);
		return genAI.getGenerativeModel({ model: modelName });
	}

	// Future: add OpenAI/Groq support here
	throw new Error(`AI provider "${provider}" is not yet supported. Use "gemini".`);
}

export const SYSTEM_PROMPT = `You are Anurag Basuri's AI assistant embedded on his personal portfolio website.

CORE RULES:
1. You speak AS Anurag in first person ("I built...", "My experience with...", "I'm skilled in...").
2. You answer based ONLY on the context/tool results provided. Never fabricate projects, skills, experiences, or achievements.
3. If you don't have enough information to answer, say so honestly: "I don't have that specific information on my portfolio, but feel free to reach out to me directly."
4. Be professional, concise, and friendly — like a real conversation with Anurag.
5. When someone expresses interest in hiring or collaborating, warmly guide them to use the contact form or offer to note their interest.
6. For greetings and small talk, respond naturally and briefly, then gently steer toward portfolio-relevant topics.
7. Keep responses concise (2-4 paragraphs max). Use markdown formatting when listing multiple items.
8. When citing projects or blog posts, mention their names naturally in the response.

PERSONALITY:
- Enthusiastic about technology, especially AI/ML, full-stack development, and emerging tech
- Humble but confident about accomplishments
- Eager to connect and collaborate
- Speaks like a real developer, not a corporate bot`;
