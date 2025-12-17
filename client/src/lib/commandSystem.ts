import { ReactNode } from 'react';

export interface CommandContext {
	currentPath: string;
	args: string[];
}

export type CommandExecuteResult =
	| { ok: true; data?: string | Record<string, unknown> }
	| { ok: false; error: string; hint?: string };

export type CommandResponse = {
	type:
		| 'text'
		| 'error'
		| 'success'
		| 'component'
		| 'clear'
		| 'open_module'
		| 'change_directory'
		| 'set_theme';
	content: string | ReactNode;
	moduleId?: string;
	newPath?: string;
	theme?: 'light' | 'dark' | 'toggle';
};

export interface CommandPlugin {
	name: string;
	aliases?: string[];
	description: string;
	usage: string;
	category: 'Navigation' | 'System' | 'Fun' | 'Development' | 'Files';
	hidden?: boolean;
	execute: (ctx: CommandContext) => Promise<CommandExecuteResult> | CommandExecuteResult;
	autocomplete?: (input: string) => string[];
	validate?: (args: string[]) => string | null;
}

export interface CommandRegistry {
	register(plugin: CommandPlugin): void;
	unregister(name: string): void;
	get(name: string): CommandPlugin | undefined;
	getAll(): CommandPlugin[];
	getByCategory(category: CommandPlugin['category']): CommandPlugin[];
	findByAlias(alias: string): CommandPlugin | undefined;
	getSuggestions(input: string, max?: number): string[];
	execute(name: string, ctx: CommandContext): Promise<CommandResponse>;
}

class CommandRegistryImpl implements CommandRegistry {
	private plugins = new Map<string, CommandPlugin>();
	private aliasMap = new Map<string, string>();
	private normalize(name: string): string {
		return name.trim().toLowerCase();
	}

	register(plugin: CommandPlugin): void {
		// Validate plugin
		if (!plugin.name || !plugin.description || !plugin.usage || !plugin.execute) {
			throw new Error('Invalid plugin: missing required properties');
		}

		const name = this.normalize(plugin.name);
		if (this.plugins.has(name)) {
			console.warn(
				`[CommandRegistry] Command '${plugin.name}' is already registered. Skipping duplicate.`,
			);
			return;
		}

		const aliases = (plugin.aliases || []).map(this.normalize).filter(Boolean);
		const safeAliases: string[] = [];

		for (const alias of aliases) {
			if (alias === name) continue;
			if (this.plugins.has(alias)) {
				console.warn(
					`[CommandRegistry] Alias '${alias}' for '${plugin.name}' conflicts with an existing command. Skipping this alias.`,
				);
				continue;
			}
			const mapped = this.aliasMap.get(alias);
			if (mapped && mapped !== name) {
				console.warn(
					`[CommandRegistry] Alias '${alias}' already points to '${mapped}'. Skipping this alias for '${plugin.name}'.`,
				);
				continue;
			}
			safeAliases.push(alias);
		}

		this.plugins.set(name, { ...plugin, aliases });
		for (const alias of safeAliases) {
			this.aliasMap.set(alias, name);
		}
	}

	unregister(name: string): void {
		const key = this.normalize(name);
		const plugin = this.plugins.get(key);
		if (!plugin) return;

		// Remove main command
		this.plugins.delete(key);

		// Remove aliases
		for (const alias of plugin.aliases || []) {
			this.aliasMap.delete(this.normalize(alias));
		}
	}

	get(name: string): CommandPlugin | undefined {
		return this.plugins.get(this.normalize(name));
	}

	getAll(): CommandPlugin[] {
		return Array.from(this.plugins.values());
	}

	getByCategory(category: CommandPlugin['category']): CommandPlugin[] {
		return this.getAll().filter(plugin => plugin.category === category);
	}

	findByAlias(alias: string): CommandPlugin | undefined {
		const mainName = this.aliasMap.get(this.normalize(alias));
		return mainName ? this.plugins.get(mainName) : undefined;
	}

	getSuggestions(input: string, max: number = 3): string[] {
		const normalizedInput = this.normalize(input);
		if (!normalizedInput) return [];

		const allCommands = this.getAll()
			.filter(cmd => !cmd.hidden)
			.flatMap(cmd => [cmd.name, ...(cmd.aliases || [])]);
		const uniqueCommands = [...new Set(allCommands)];

		// Simple scoring algorithm
		const scored = uniqueCommands
			.map(name => {
				const lowerName = name.toLowerCase();
				const startsWith = lowerName.startsWith(normalizedInput);
				const contains = lowerName.includes(normalizedInput);
				const distance = this.levenshtein(normalizedInput, lowerName);

				return {
					name,
					starts: startsWith,
					contains,
					distance,
				};
			})
			.filter(item => item.starts || item.contains || item.distance <= 2)
			.sort((a, b) => {
				if (a.starts !== b.starts) return a.starts ? -1 : 1;
				if (a.contains !== b.contains) return a.contains ? -1 : 1;
				if (a.distance !== b.distance) return a.distance - b.distance;
				return a.name.length - b.name.length;
			});

		return scored.slice(0, max).map(item => item.name);
	}

	async execute(name: string, ctx: CommandContext): Promise<CommandResponse> {
		try {
			const normalizedName = this.normalize(name);
			const plugin = this.get(normalizedName) || this.findByAlias(normalizedName);

			if (!plugin) {
				const suggestion = this.getSuggestions(name, 1)[0];
				let errorMsg = `Command not found: '${name}'.`;
				if (suggestion) {
					errorMsg += ` Did you mean "${suggestion}"?`;
				} else {
					errorMsg += ' Type "help" for a list of commands.';
				}
				return { type: 'error', content: errorMsg };
			}

			// Validate arguments if validator exists
			if (plugin.validate) {
				const validationError = plugin.validate(ctx.args);
				if (validationError) {
					return {
						type: 'error',
						content: `${validationError}\nUsage: ${plugin.usage}`,
					};
				}
			}

			const result = await plugin.execute(ctx);

			if (result.ok) {
				if (typeof result.data === 'string') {
					return { type: 'text', content: result.data };
				}
				if (typeof result.data === 'object' && result.data !== null) {
					const data = result.data as Record<string, unknown>;
					return {
						type: (data.type as CommandResponse['type']) || 'component',
						content: (data.content as string | ReactNode) || '',
						...data,
					};
				}
				return { type: 'success', content: '' };
			} else {
				const errorResult = result as { ok: false; error: string; hint?: string };
				return {
					type: 'error',
					content: `${errorResult.error}${
						errorResult.hint ? `\nHint: ${errorResult.hint}` : ''
					}`,
				};
			}
		} catch (error) {
			return {
				type: 'error',
				content: `An unexpected error occurred: ${
					error instanceof Error ? error.message : String(error)
				}`,
			};
		}
	}

	private levenshtein(a: string, b: string): number {
		const m = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
		for (let i = 0; i <= a.length; i++) m[i][0] = i;
		for (let j = 0; j <= b.length; j++) m[0][j] = j;
		for (let i = 1; i <= a.length; i++) {
			for (let j = 1; j <= b.length; j++) {
				const cost = a[i - 1] === b[j - 1] ? 0 : 1;
				m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + cost);
			}
		}
		return m[a.length][b.length];
	}
}

// Global registry instance
export const commandRegistry = new CommandRegistryImpl();

// Helper function to create plugins
export function createCommand(plugin: CommandPlugin): CommandPlugin {
	return plugin;
}

// Helper function to batch register plugins
export function registerCommands(plugins: CommandPlugin[]): void {
	for (const plugin of plugins) {
		commandRegistry.register(plugin);
	}
}
