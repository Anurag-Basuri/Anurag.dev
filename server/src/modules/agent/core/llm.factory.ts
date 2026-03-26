import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { env } from '../../../config/env';
import { agentLogger } from './agent.logger';

import { DynamicStructuredTool } from '@langchain/core/tools';

// ─── Singleton State ─────────────────────────────────────────────
// Initialize once on first import, not per-request.

let _primaryLlm: ChatGoogleGenerativeAI | null = null;
let _fallbackLlm: ChatOpenAI | null = null;
let _initialized = false;

export const llmInfo = {
	primaryProvider: '',
	primaryModel: '',
	fallbackProvider: '',
	fallbackModel: '',
	mode: 'NONE' as 'dual' | 'primary-only' | 'fallback-only' | 'NONE',
};

function initLLMs() {
	if (_initialized) return;
	_initialized = true;

	// 1. Configure Primary Model (Gemini)
	if (env.GEMINI_API_KEY || env.AI_PROVIDER === 'gemini') {
		const apiKey = env.GEMINI_API_KEY || process.env.AI_API_KEY;
		if (apiKey) {
			_primaryLlm = new ChatGoogleGenerativeAI({
				model: 'gemini-2.5-flash',
				apiKey: apiKey,
				temperature: 0.3,
				maxOutputTokens: 1000,
			});
			llmInfo.primaryProvider = 'Gemini';
			llmInfo.primaryModel = 'gemini-2.5-flash';
			agentLogger.info('LLM', '🟢 Primary LLM configured', { provider: 'Google Gemini', model: 'gemini-2.5-flash' });
		} else {
			agentLogger.warn('LLM', '⚠️ GEMINI_API_KEY env var present but empty — Gemini skipped');
		}
	}

	// 2. Configure Fallback Model (HuggingFace via OpenAI SDK)
	if (env.HF_TOKEN) {
		_fallbackLlm = new ChatOpenAI({
			model: 'Qwen/Qwen2.5-72B-Instruct',
			apiKey: env.HF_TOKEN,
			configuration: { baseURL: 'https://router.huggingface.co/hf-inference/models/' },
			temperature: 0.3,
			timeout: 30000, // 30s timeout
			maxTokens: 1000,
		});
		llmInfo.fallbackProvider = 'HuggingFace';
		llmInfo.fallbackModel = 'Qwen2.5-72B-Instruct';
		agentLogger.info('LLM', '🟡 Fallback LLM configured', { provider: 'HuggingFace', model: 'Qwen2.5-72B-Instruct' });
	}

	// Determine mode
	if (_primaryLlm && _fallbackLlm) {
		llmInfo.mode = 'dual';
		agentLogger.info('LLM', '🚀 Dual-LLM ready: Gemini (primary) → HuggingFace (fallback)');
	} else if (_primaryLlm) {
		llmInfo.mode = 'primary-only';
		agentLogger.info('LLM', '🚀 Single-LLM ready: Gemini (no fallback configured)');
	} else if (_fallbackLlm) {
		llmInfo.mode = 'fallback-only';
		agentLogger.warn('LLM', '⚠️ Running on HuggingFace only (no primary Gemini configured)');
	} else {
		llmInfo.mode = 'NONE';
		agentLogger.error('SYSTEM', 'FATAL: No AI Providers configured', null, {
			hint: 'Set GEMINI_API_KEY or HF_TOKEN',
		});
	}
}

// Initialize immediately on module load
initLLMs();

/**
 * Returns the bound primary + fallback LLM instances.
 * The caller (agent.service) handles manual fallback logic.
 */
export function getBoundLLMs(tools: DynamicStructuredTool[]) {
	if (llmInfo.mode === 'NONE') {
		throw new Error('No AI Providers configured. Please set GEMINI_API_KEY or HF_TOKEN.');
	}

	return {
		primary: _primaryLlm ? _primaryLlm.bindTools(tools) : null,
		fallback: _fallbackLlm ? _fallbackLlm.bindTools(tools) : null,
		info: llmInfo,
	};
}
