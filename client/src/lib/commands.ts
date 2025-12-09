import { ReactNode } from 'react';
import { commandRegistry } from './commandSystem';
import { registerCoreCommands } from './coreCommands';

// Initialize core commands
if (typeof window !== 'undefined') {
	registerCoreCommands();
}

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

export type CommandContext = {
	currentPath: string;
	args: string[];
};

export type CommandResult =
	| { ok: true; data?: string | Record<string, unknown> }
	| { ok: false; error: string; hint?: string };

export type CommandRun = (
	ctx: CommandContext,
	args: string[],
) => Promise<CommandResult> | CommandResult;

export type CommandSpec = {
	name: string;
	aliases?: string[];
	description: string;
	usage: string;
	category: 'Navigation' | 'System' | 'Fun';
	hidden?: boolean;
	run?: CommandRun;
};

// The registry is the single source of truth for all commands.
export const registry: Record<string, CommandSpec> = {
	help: {
		name: 'help',
		aliases: ['h', '?'],
		description: 'Shows a list of available commands.',
		usage: 'help',
		category: 'System',
		run: () => ({ ok: true, data: formatAllHelp(registry) }),
	},
	about: {
		name: 'about',
		description: 'Opens the "About Me" section.',
		usage: 'about',
		category: 'Navigation',
		run: () => ({ ok: true, data: { type: 'open_module', moduleId: 'about' } }),
	},
	projects: {
		name: 'projects',
		description: 'Lists my key projects.',
		usage: 'projects',
		category: 'Navigation',
		run: () => ({ ok: true, data: { type: 'open_module', moduleId: 'projects' } }),
	},
	journey: {
		name: 'journey',
		description: 'Shows my career and education journey.',
		usage: 'journey',
		category: 'Navigation',
		run: () => ({ ok: true, data: { type: 'open_module', moduleId: 'journey' } }),
	},
	contact: {
		name: 'contact',
		description: 'Provides my contact information.',
		usage: 'contact',
		category: 'Navigation',
		run: () => ({ ok: true, data: { type: 'open_module', moduleId: 'contact' } }),
	},
	socials: {
		name: 'socials',
		aliases: ['links'],
		description: 'Displays my social and professional links.',
		usage: 'socials',
		category: 'Navigation',
		run: () => ({
			ok: true,
			data: `You can find me here:
- GitHub:   https://github.com/Anurag-Basuri
- LinkedIn: https://www.linkedin.com/in/anurag-basuri-941546214/
- Twitter:  https://twitter.com/AnuragBasuri`,
		}),
	},
	resume: {
		name: 'resume',
		aliases: ['cv'],
		description: 'Opens my resume.',
		usage: 'resume',
		category: 'Navigation',
		run: () => {
			if (typeof window !== 'undefined') {
				window.open('/resume.pdf', '_blank');
			}
			return { ok: true, data: 'Opening resume in a new tab...' };
		},
	},
	clear: {
		name: 'clear',
		aliases: ['cls'],
		description: 'Clears the terminal screen.',
		usage: 'clear',
		category: 'System',
		run: () => ({ ok: true, data: { type: 'clear' } }),
	},
	theme: {
		name: 'theme',
		description: 'Changes the UI theme.',
		usage: 'theme <dark|light|toggle>',
		category: 'System',
		run: (_ctx, args) => {
			const mode = args[0]?.toLowerCase();
			if (mode === 'dark' || mode === 'light' || mode === 'toggle') {
				return {
					ok: true,
					data: { type: 'set_theme', theme: mode as 'dark' | 'light' | 'toggle' },
				};
			}
			return {
				ok: false,
				error: 'Invalid theme',
				hint: 'Usage: theme <dark|light|toggle>',
			};
		},
	},
	whoami: {
		name: 'whoami',
		description: 'Displays the current user.',
		usage: 'whoami',
		category: 'System',
		run: () => ({ ok: true, data: 'guest' }),
	},
	secret: {
		name: 'secret',
		description: '???',
		usage: 'secret',
		category: 'Fun',
		hidden: true,
		run: () => ({ ok: true, data: { type: 'open_module', moduleId: 'secret' } }),
	},
	coffee: {
		name: 'coffee',
		description: 'Brew some coffee.',
		usage: 'coffee',
		category: 'Fun',
		hidden: true,
		run: () => ({ ok: false, error: "I'm a teapot" }), // HTTP 418
	},
};

// Parses command line arguments.
function parseArgs(input: string): string[] {
	return input.split(' ').filter(Boolean);
}

// Processes a command input and returns appropriate response.
export async function processCommand(input: string, currentPath: string = '~'): Promise<CommandResponse> {
	try {
		if (typeof input !== 'string') {
			return { type: 'error', content: 'Invalid input type.' };
		}

		const sanitized = input.trim().slice(0, 500);
		if (!sanitized) return { type: 'text', content: '' };

		const args = parseArgs(sanitized);
		const cmd = args.shift()?.toLowerCase();
		if (!cmd) return { type: 'text', content: '' };

		const spec = findCommandSpec(cmd);

		if (spec && spec.run) {
			const context: CommandContext = { currentPath, args };
			const result = await spec.run(context, args);

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
				return {
					type: 'error',
					content: `${result.error}${result.hint ? `\nHint: ${result.hint}` : ''}`,
				};
			}
		}

		const suggestion = getCommandSuggestions(cmd, 1)[0];
		let errorMsg = `Command not found: '${cmd}'.`;
		if (suggestion) {
			errorMsg += ` Did you mean "${suggestion}"?`;
		} else {
			errorMsg += ' Type "help" for a list of commands.';
		}

		return {
			type: 'error',
			content: errorMsg,
		};
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
	const normalizedInput = command.toLowerCase();
	if (!normalizedInput) return [];

	const allCommands = Object.values(registry)
		.filter(cmd => !cmd.hidden)
		.flatMap(cmd => [cmd.name, ...(cmd.aliases || [])]);
	const uniqueCommands = [...new Set(allCommands)];

	const scored = uniqueCommands
		.map(name => {
			const lowerName = name.toLowerCase();
			const startsWith = lowerName.startsWith(normalizedInput);
			const distance = levenshtein(normalizedInput, lowerName) + (startsWith ? 0 : 1);
			return { name, startsWith, distance };
		})
		.filter(item => item.startsWith || item.distance <= 2)
		.sort((a, b) => {
			if (a.startsWith !== b.startsWith) return a.startsWith ? -1 : 1;
			if (a.distance !== b.distance) return a.distance - b.distance;
			return a.name.length - b.name.length;
		});

	return scored.slice(0, max).map(item => item.name);
}

export function findCommandSpec(name: string): CommandSpec | undefined {
	const lowerName = name.toLowerCase();
	for (const spec of Object.values(registry)) {
		if (spec.name.toLowerCase() === lowerName || (spec.aliases?.some(a => a.toLowerCase() === lowerName))) {
			return spec;
		}
	}
	return undefined;
}

export function formatAllHelp(reg: Record<string, CommandSpec>): string {
	const categories: Record<string, CommandSpec[]> = {
		Navigation: [],
		System: [],
		Fun: [],
	};

	for (const spec of Object.values(reg)) {
		if (!spec.hidden) {
			categories[spec.category].push(spec);
		}
	}

	let helpText = 'Welcome to my interactive portfolio! Here are the available commands:\n\n';

	helpText += '--- Navigation ---\n';
	helpText += categories.Navigation.map(
		spec => `  ${spec.name.padEnd(10)} - ${spec.description}`,
	).join('\n');
	helpText += '\n\n';

	helpText += '--- System ---\n';
	helpText += categories.System.map(
		spec => `  ${spec.name.padEnd(10)} - ${spec.description}`,
	).join('\n');
	helpText += '\n\n';

	helpText += '--- Fun ---\n';
	helpText += categories.Fun.map(
		spec => `  ${spec.name.padEnd(10)} - ${spec.description}`,
	).join('\n');

	return helpText;
}

function levenshtein(a: string, b: string): number {
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
