import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import { getLLM } from './core/llm.factory';
import { agentTools } from './tools';
import { SYSTEM_PERSONA } from './core/prompts';
import { getMessageHistory } from './core/memory.service';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import { getBasePortfolioContext } from './rag/context.builder';

// ─── LangChain Agent Setup ─────────────────────────────────────

let agentExecutorWithMemory: RunnableWithMessageHistory<any, any> | null = null;

async function initializeAgent() {
	if (agentExecutorWithMemory) return agentExecutorWithMemory;

	const llm = getLLM();

	// Construct the dynamic prompt template
	const prompt = ChatPromptTemplate.fromMessages([
		['system', '{system_persona}\n\n[PORTFOLIO CONTEXT]\n{portfolio_context}\n[END CONTEXT]'],
		new MessagesPlaceholder('chat_history'),
		['human', '{input}'],
		new MessagesPlaceholder('agent_scratchpad'), // Required by ToolCallingAgent
	]);

	// Create the agent that figures out when to call tools
	const agent = createToolCallingAgent({
		llm,
		tools: agentTools,
		prompt,
	});

	// The executor actually runs the tools
	const agentExecutor = new AgentExecutor({
		agent,
		tools: agentTools,
	});

	// Wrap the executor to automatically manage session-based chat history
	agentExecutorWithMemory = new RunnableWithMessageHistory({
		runnable: agentExecutor,
		getMessageHistory: sessionId => getMessageHistory(sessionId),
		inputMessagesKey: 'input',
		historyMessagesKey: 'chat_history',
	});

	return agentExecutorWithMemory;
}

// ─── Main Interface ─────────────────────────────────────────────

export interface AgentResponse {
	reply: string;
	sessionId: string;
}

export async function processUserMessage(message: string, sessionId: string): Promise<AgentResponse> {
	console.log(`[agent.service] Processing message for session: ${sessionId}`);
	
	const agent = await initializeAgent();
	const portfolioContext = await getBasePortfolioContext();

	// Invoke the chain
	const result = await agent.invoke(
		{
			input: message,
			system_persona: SYSTEM_PERSONA,
			portfolio_context: portfolioContext,
		},
		{
			configurable: {
				sessionId: sessionId,
			},
		}
	);

	return {
		reply: result.output,
		sessionId,
	};
}
