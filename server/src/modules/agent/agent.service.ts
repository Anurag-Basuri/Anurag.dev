import { getBoundLLM, getActiveProviderInfo } from './core/llm.factory';
import { agentTools } from './tools';
import { SYSTEM_PERSONA } from './core/prompts';
import { getMessageHistory } from './core/memory.service';
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { getBasePortfolioContext } from './rag/context.builder';
import { agentLogger } from './core/agent.logger';

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
	const { provider, model } = getActiveProviderInfo();

	agentLogger.info('SYSTEM', `━━━ New Request ━━━`, {
		sessionId,
		provider,
		model,
		currentUrl: currentUrl || 'N/A',
		messagePreview: message.substring(0, 80),
	});

	const llmWithTools = getBoundLLM(agentTools);

	const memory = getMessageHistory(sessionId);
	const history = await memory.getMessages();
	agentLogger.debug('MEMORY', `Loaded ${history.length} messages from session history`, { sessionId });

	const portfolioContext = await getBasePortfolioContext();
	const locationContext = currentUrl
		? `\n[SCREEN CONTEXT]\nThe user is currently looking at the page: ${currentUrl}. If they use words like "this" or "here", they are referring to this page.\n[END SCREEN CONTEXT]`
		: '';

	const systemPrompt = new SystemMessage(
		`${SYSTEM_PERSONA}\n\n[PORTFOLIO CONTEXT]\n${portfolioContext}\n[END CONTEXT]${locationContext}`,
	);

	// Prepare messages array for the current turn
	const turnMessages = [systemPrompt, ...history, new HumanMessage(message)];

	// Ensure user message is saved to memory first
	await memory.addMessage(new HumanMessage(message));

	let callCount = 0;
	const MAX_LOOPS = 4;

	while (callCount < MAX_LOOPS) {
		const llmStartTime = agentLogger.llmStart(provider, model);

		let aiMsg;
		try {
			aiMsg = await llmWithTools.invoke(turnMessages);
		} catch (llmError: any) {
			agentLogger.llmError(llmStartTime, llmError);
			throw llmError; // Re-throw so the controller can handle it gracefully
		}

		const toolCalls = aiMsg.tool_calls ?? [];
		agentLogger.llmSuccess(llmStartTime, toolCalls.length > 0, toolCalls.length);

		turnMessages.push(aiMsg);
		await memory.addMessage(aiMsg);

		if (toolCalls.length > 0) {
			agentLogger.info('TOOL', `Agent requested ${toolCalls.length} tool(s)`, {
				tools: toolCalls.map((tc: any) => tc.name),
				loop: callCount + 1,
			});

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
			// Finished execution — final reply
			const totalDuration = Date.now() - requestStartTime;
			agentLogger.info('SYSTEM', `━━━ Request Complete ━━━`, {
				sessionId,
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
