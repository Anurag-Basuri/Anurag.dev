import { commandRegistry } from './commandSystem';
import type { CommandResponse } from './commandSystem';

export type { CommandContext, CommandExecuteResult, CommandResponse, CommandPlugin, CommandRegistry } from './commandSystem';
export { commandRegistry, createCommand, registerCommands } from './commandSystem';

// Lazy-loaded command initialization — defers 20KB of coreCommands until first use
let initialized = false;

async function ensureInitialized() {
	if (initialized) return;
	initialized = true;
	const { registerCoreCommands } = await import('./coreCommands');
	registerCoreCommands();
}

// Pre-initialize when terminal input gets focus (called from useTerminalState)
export function preloadCommands() {
	if (typeof window !== 'undefined') ensureInitialized();
}

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

		await ensureInitialized();

		const args = sanitized.split(' ').filter(Boolean);
		const cmd = args.shift()?.toLowerCase();
		if (!cmd) return { type: 'text', content: '' };

		return await commandRegistry.execute(cmd, { currentPath, args });
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
	// Suggestions use the registry synchronously — returns empty until commands are loaded
	if (!initialized) return [];
	return commandRegistry.getSuggestions(command, max);
}
