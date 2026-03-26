import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { env } from '../../../config/env';
import { agentLogger } from './agent.logger';

import { DynamicStructuredTool } from '@langchain/core/tools';

// Track the active provider for per-request logging
let activeProvider = 'UNKNOWN';
let activeModel = 'UNKNOWN';

export function getActiveProviderInfo() {
	return { provider: activeProvider, model: activeModel };
}

/**
 * Returns a configured LangChain LLM fully bound to MCP tools with fallback capabilities.
 * Primary: Google Gemini 2.5 Flash
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
			agentLogger.info('LLM', '🟢 Primary LLM configured', { provider: 'Google Gemini', model: 'gemini-2.5-flash' });
		} else {
			agentLogger.warn('LLM', '⚠️ GEMINI_API_KEY env var is set but empty — Gemini skipped');
		}
	} else {
		agentLogger.debug('LLM', 'Gemini not configured (no GEMINI_API_KEY or AI_PROVIDER=gemini)');
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
		agentLogger.info('LLM', '🟡 Fallback LLM configured', { provider: 'HuggingFace', model: 'Qwen2.5-72B-Instruct' });
	} else {
		agentLogger.debug('LLM', 'HuggingFace fallback not configured (no HF_TOKEN)');
	}

	// 3. Orchestrate and Bind Tools
	const toolNames = tools.map(t => t.name);

	if (primaryLlm && fallbackLlm) {
		activeProvider = 'Gemini → HuggingFace';
		activeModel = 'gemini-2.5-flash → Qwen2.5-72B';
		agentLogger.info('LLM', `🚀 Dual-LLM initialized: ${activeProvider}`, {
			mode: 'primary+fallback',
			toolsBound: toolNames,
		});
		return primaryLlm.bindTools(tools).withFallbacks({
			fallbacks: [fallbackLlm.bindTools(tools)],
		});
	} else if (primaryLlm) {
		activeProvider = 'Gemini';
		activeModel = 'gemini-2.5-flash';
		agentLogger.info('LLM', `🚀 Single-LLM initialized: ${activeProvider}`, {
			mode: 'standalone',
			toolsBound: toolNames,
		});
		return primaryLlm.bindTools(tools);
	} else if (fallbackLlm) {
		activeProvider = 'HuggingFace';
		activeModel = 'Qwen2.5-72B-Instruct';
		agentLogger.warn('LLM', `⚠️ Running on fallback-only: ${activeProvider} (No primary configured!)`, {
			mode: 'fallback-only',
			toolsBound: toolNames,
		});
		return fallbackLlm.bindTools(tools);
	} else {
		agentLogger.error('SYSTEM', 'FATAL: No AI Providers configured', null, {
			hint: 'Set GEMINI_API_KEY or HF_TOKEN environment variables',
		});
		throw new Error('No AI Providers configured. Please set GEMINI_API_KEY or HF_TOKEN.');
	}
}
