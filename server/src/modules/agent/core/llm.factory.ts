import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { env } from '../../../config/env';

import { DynamicStructuredTool } from '@langchain/core/tools';

/**
 * Returns a configured LangChain LLM fully bound to MCP tools with fallback capabilities.
 * Primary: Google Gemini 2.0 Flash
 * Fallback: Hugging Face Qwen 2.5 72B Instruct (Triggered on API errors or Rate Limits)
 */
export function getBoundLLM(tools: DynamicStructuredTool[]) {
	let primaryLlm = null;
	let fallbackLlm = null;

	// 1. Configure Primary Model (Gemini)
	if (env.GEMINI_API_KEY || env.AI_PROVIDER === 'gemini') {
		const apiKey = env.GEMINI_API_KEY || process.env.AI_API_KEY; // backwards compatibility
		if (apiKey) {
			primaryLlm = new ChatGoogleGenerativeAI({
				model: 'gemini-2.5-flash',
				apiKey: apiKey,
				temperature: 0.3,
				maxOutputTokens: 1000,
			});
		}
	}

	// 2. Configure Fallback Model (Hugging Face Serverless via OpenAI SDK)
	if (env.HF_TOKEN) {
		fallbackLlm = new ChatOpenAI({
			model: 'Qwen/Qwen2.5-72B-Instruct',
			apiKey: env.HF_TOKEN,
			configuration: { baseURL: 'https://api-inference.huggingface.co/models/' },
			temperature: 0.3,
			maxTokens: 1000,
		});
	}

	// 3. Orchestrate and Bind Tools
	if (primaryLlm && fallbackLlm) {
		console.log('[Agent] Dual-LLM initialized: Gemini (Primary) -> Hugging Face (Fallback)');
		return primaryLlm.bindTools(tools).withFallbacks({
			fallbacks: [fallbackLlm.bindTools(tools)],
		});
	} else if (primaryLlm) {
		console.log('[Agent] LLM initialized: Gemini (Standalone)');
		return primaryLlm.bindTools(tools);
	} else if (fallbackLlm) {
		console.log('[Agent] LLM initialized: Hugging Face (Standalone)');
		return fallbackLlm.bindTools(tools);
	} else {
		throw new Error('No AI Providers configured. Please set GEMINI_API_KEY or HF_TOKEN.');
	}
}
