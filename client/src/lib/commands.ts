export {
	commandRegistry,
	createCommand,
	registerCommands,
	type CommandContext,
	type CommandExecuteResult,
	type CommandResponse,
	type CommandPlugin,
	type CommandRegistry,
} from './commandSystem';

import { registerCoreCommands } from './coreCommands';
import { commandRegistry } from './commandSystem';
import type { CommandContext, CommandResponse } from './commandSystem';

// Initialize core commands
if (typeof window !== 'undefined') {
	registerCoreCommands();
}

// Wrapper functions for easier usage in components
export async function processCommand(
	input: string,
	currentPath: string = '~',
): Promise<CommandResponse> {
	try {
		if (typeof input !== 'string') {
			return { type: 'error', content: 'Invalid input type.' };
		}

		const sanitized = input.trim().slice(0, 500);
		if (!sanitized) return { type: 'text', content: '' };

		const args = sanitized.split(' ').filter(Boolean);
		const cmd = args.shift()?.toLowerCase();
		if (!cmd) return { type: 'text', content: '' };

		const context: CommandContext = { currentPath, args };
		return await commandRegistry.execute(cmd, context);
	} catch (error) {
		return {
			type: 'error',
			content: `An unexpected error occurred: ${
				error instanceof Error ? error.message : String(error)
			}`,
		};
	}
}

export function getCommandSuggestions(command: string, max: number = 3): string[] {
	return commandRegistry.getSuggestions(command, max);
}
