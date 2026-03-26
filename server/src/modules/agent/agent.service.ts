import { getBoundLLMs, llmInfo } from './core/llm.factory';
import { agentTools } from './tools';
import { SYSTEM_PERSONA } from './core/prompts';
import { getMessageHistory } from './core/memory.service';
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { getBasePortfolioContext } from './rag/context.builder';
import { agentLogger } from './core/agent.logger';

const LLM_TIMEOUT_MS = 30_000; // 30 seconds — abort if LLM hangs longer

/** Race an LLM call against a timeout. Prevents 3-minute SDK retry hangs. */
async function invokeWithTimeout(llm: any, messages: any[], label: string): Promise<any> {
	return Promise.race([
		llm.invoke(messages),
		new Promise((_, reject) =>
			setTimeout(() => reject(new Error(`${label} timed out after ${LLM_TIMEOUT_MS / 1000}s`)), LLM_TIMEOUT_MS),
		),
	]);
}

export interface AgentResponse {
	reply: string;
	sessionId: string;
}

export async function processUserMessage(
	message: string,
	sessionId: string,
	currentUrl?: string,
): Promise<AgentResponse> {
	const requestStartTime = Date.now();

	agentLogger.info('SYSTEM', `━━━ New Request ━━━`, {
		sessionId,
		llmMode: llmInfo.mode,
		primary: llmInfo.primaryProvider || 'NONE',
		fallback: llmInfo.fallbackProvider || 'NONE',
		currentUrl: currentUrl || 'N/A',
		messagePreview: message.substring(0, 80),
	});

	const { primary, fallback } = getBoundLLMs(agentTools);

	const memory = getMessageHistory(sessionId);
	const history = await memory.getMessages();
	agentLogger.debug('MEMORY', `Loaded ${history.length} messages from session history`, {
		sessionId,
	});

	const portfolioContext = await getBasePortfolioContext();
	const locationContext = currentUrl
		? `\n[SCREEN CONTEXT]\nThe user is currently looking at the page: ${currentUrl}. If they use words like "this" or "here", they are referring to this page.\n[END SCREEN CONTEXT]`
		: '';

	const systemPrompt = new SystemMessage(
		`${SYSTEM_PERSONA}\n\n[PORTFOLIO CONTEXT]\n${portfolioContext}\n[END CONTEXT]${locationContext}`,
	);

	const turnMessages = [systemPrompt, ...history, new HumanMessage(message)];
	await memory.addMessage(new HumanMessage(message));

	let callCount = 0;
	const MAX_LOOPS = 4;

	while (callCount < MAX_LOOPS) {
		// ─── LLM Invocation with Manual Fallback ────────────────────
		let aiMsg: any;
		let usedProvider = llmInfo.primaryProvider || llmInfo.fallbackProvider;

		if (primary) {
			const llmStart = agentLogger.llmStart(llmInfo.primaryProvider, llmInfo.primaryModel);
			try {
				aiMsg = await invokeWithTimeout(primary, turnMessages, 'Gemini');
				agentLogger.llmSuccess(
					llmStart,
					(aiMsg.tool_calls?.length ?? 0) > 0,
					aiMsg.tool_calls?.length ?? 0,
				);
				usedProvider = llmInfo.primaryProvider;
			} catch (primaryError: any) {
				agentLogger.llmError(llmStart, primaryError);

				// ─── Manual Fallback ────────────────────────────────
				if (fallback) {
					agentLogger.info(
						'LLM',
						`🔄 Primary (${llmInfo.primaryProvider}) failed — switching to fallback (${llmInfo.fallbackProvider})`,
					);
					const fallbackStart = agentLogger.llmStart(
						llmInfo.fallbackProvider,
						llmInfo.fallbackModel,
					);
					try {
						aiMsg = await invokeWithTimeout(fallback, turnMessages, 'HuggingFace');
						agentLogger.llmSuccess(
							fallbackStart,
							(aiMsg.tool_calls?.length ?? 0) > 0,
							aiMsg.tool_calls?.length ?? 0,
						);
						usedProvider = llmInfo.fallbackProvider;
					} catch (fallbackError: any) {
						agentLogger.llmError(fallbackStart, fallbackError);
						agentLogger.error(
							'LLM',
							'💀 Both primary AND fallback LLMs failed',
							fallbackError,
							{
								primaryError: primaryError.message?.substring(0, 100),
							},
						);
						throw fallbackError; // Let controller handle gracefully
					}
				} else {
					agentLogger.error(
						'LLM',
						'💀 Primary LLM failed and no fallback configured',
						primaryError,
					);
					throw primaryError;
				}
			}
		} else if (fallback) {
			// No primary — use fallback directly
			const llmStart = agentLogger.llmStart(llmInfo.fallbackProvider, llmInfo.fallbackModel);
			try {
				aiMsg = await invokeWithTimeout(fallback, turnMessages, 'HuggingFace');
				agentLogger.llmSuccess(
					llmStart,
					(aiMsg.tool_calls?.length ?? 0) > 0,
					aiMsg.tool_calls?.length ?? 0,
				);
				usedProvider = llmInfo.fallbackProvider;
			} catch (err: any) {
				agentLogger.llmError(llmStart, err);
				throw err;
			}
		} else {
			throw new Error('No LLM providers available');
		}

		// ─── Process Response ───────────────────────────────────────
		turnMessages.push(aiMsg);
		await memory.addMessage(aiMsg);

		const toolCalls = aiMsg.tool_calls ?? [];

		if (toolCalls.length > 0) {
			agentLogger.info(
				'TOOL',
				`Agent (${usedProvider}) requested ${toolCalls.length} tool(s)`,
				{
					tools: toolCalls.map((tc: any) => tc.name),
					loop: callCount + 1,
				},
			);

			for (const toolCall of toolCalls) {
				const selectedTool = agentTools.find(tool => tool.name === toolCall.name);
				if (!selectedTool) {
					agentLogger.warn('TOOL', `Tool "${toolCall.name}" not found in registry`, {
						available: agentTools.map(t => t.name),
					});
					const toolMsg = new ToolMessage({
						tool_call_id: toolCall.id!,
						content: `Tool ${toolCall.name} not found.`,
						name: toolCall.name,
					});
					turnMessages.push(toolMsg);
					await memory.addMessage(toolMsg);
					continue;
				}

				const toolStart = agentLogger.toolStart(toolCall.name, toolCall.args || {});
				try {
					const toolOutput = await (selectedTool as any).invoke(toolCall.args);
					const outputStr = String(toolOutput);
					agentLogger.toolSuccess(toolCall.name, toolStart, outputStr);

					const toolMsg = new ToolMessage({
						tool_call_id: toolCall.id!,
						content: outputStr,
						name: toolCall.name,
					});
					turnMessages.push(toolMsg);
					await memory.addMessage(toolMsg);
				} catch (e: any) {
					agentLogger.toolError(toolCall.name, toolStart, e);

					const errorMsg = new ToolMessage({
						tool_call_id: toolCall.id!,
						content: `Failed to execute tool: ${e.message}`,
						name: toolCall.name,
					});
					turnMessages.push(errorMsg);
					await memory.addMessage(errorMsg);
				}
			}
			callCount++;
		} else {
			// Finished — final reply
			const totalDuration = Date.now() - requestStartTime;
			agentLogger.info('SYSTEM', `━━━ Request Complete ━━━`, {
				sessionId,
				usedProvider,
				totalDurationMs: totalDuration,
				llmLoops: callCount + 1,
				replyPreview: String(aiMsg.content).substring(0, 100),
			});

			return {
				reply: String(aiMsg.content),
				sessionId,
			};
		}
	}

	const totalDuration = Date.now() - requestStartTime;
	agentLogger.warn('SYSTEM', `Agent hit MAX_LOOPS (${MAX_LOOPS}) — forced stop`, {
		sessionId,
		totalDurationMs: totalDuration,
	});

	return {
		reply: 'I had to think too long about that. Could you try asking in a different way?',
		sessionId,
	};
}
