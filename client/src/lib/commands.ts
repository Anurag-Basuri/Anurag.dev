import { ReactNode } from 'react';
import { initialFileSystem, FileSystemItem } from '@/lib/data';

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

export type CommandRun = (
	ctx: CommandContext,
	args: string[],
) => Promise<CommandResult> | CommandResult;

export type CommandSpec = {
	name: string;
	aliases?: string[];
	description: string;
	usage: string;
	examples?: string[];
	options?: Record<
		string,
		{
			description: string;
			alias?: string;
			type?: 'string' | 'boolean' | 'number';
			default?: unknown;
		}
	>;
	subcommands?: Record<string, CommandSpec>;
	hidden?: boolean;
	run?: CommandRun;
};

export type CommandContext = {
	currentPath: string;
};

export type CommandResult = { ok: true; data?: string | Record<string, unknown> } | { ok: false; error: string; hint?: string };

// The registry is now the single source of truth for all commands.
export const registry: Record<string, CommandSpec> = {
	help: {
		name: 'help',
		aliases: ['h', '?'],
		description: 'Show available commands or details of a command.',
		usage: 'help [command]',
		examples: ['help', 'help projects'],
		run: (_ctx, args) => {
			if (!args.length) return { ok: true, data: formatAllHelp(registry) };
			const spec = findCommandSpec(args[0]);
			if (!spec)
				return { ok: false, error: `Unknown command "${args[0]}"`, hint: suggest(args[0]) };
			return { ok: true, data: formatHelp(spec) };
		},
	},
	clear: {
		name: 'clear',
		aliases: ['cls'],
		description: 'Clear the terminal output.',
		usage: 'clear',
		run: () => ({ ok: true, data: { type: 'clear' } }),
	},
	ls: {
		name: 'ls',
		description: 'List files and directories.',
		usage: 'ls [path]',
		run: ({ currentPath }, args) => {
			const targetPath = args[0] || '.';
			const item = resolvePath(currentPath, targetPath);

			if (!item) {
				return {
					ok: false,
					error: `ls: cannot access '${targetPath}': No such file or directory`,
				};
			}

			if (item.type === 'file') {
				return { ok: true, data: item.name };
			}

			if (!item.children || item.children.length === 0) {
				return { ok: true, data: '' };
			}

			const output = item.children
				.map(child => {
					const isDir = child.type === 'folder';
					return `${isDir ? 'd' : '-'}rw-r--r-- 1 root root 4096 Dec 8 12:00 ${
						child.name
					}${isDir ? '/' : ''}`;
				})
				.join('\n');

			return { ok: true, data: output };
		},
	},
	cd: {
		name: 'cd',
		description: 'Change the current directory.',
		usage: 'cd <path>',
		run: ({ currentPath }, args) => {
			const targetPath = args[0] || '~';
			const item = resolvePath(currentPath, targetPath);

			if (!item || item.type !== 'folder') {
				return { ok: false, error: `cd: not a directory: ${targetPath}` };
			}

			let newPath = '~';
			if (item.id !== 'root') {
				// This part needs a function to derive path from item, for now, we simplify
				if (targetPath.startsWith('/') || targetPath.startsWith('~')) {
					newPath = targetPath;
				} else {
					newPath = [currentPath.replace(/\/$/, ''), targetPath].join('/');
				}
				// Basic normalization
				newPath = newPath.replace(/^~?\/?/, '');
				newPath = '~/' + newPath;
				newPath = newPath.replace(/\/+/g, '/').replace(/\/$/, '');
				if (newPath === '~/') newPath = '~';
			}

			return { ok: true, data: { type: 'change_directory', newPath } };
		},
	},
	open: {
		name: 'open',
		description: 'Open an app or a file.',
		usage: 'open <module_name_or_path>',
		examples: ['open about', 'open /apps/projects.app'],
		run: ({ currentPath }, args) => {
			const target = args[0];
			if (!target) {
				return { ok: false, error: 'Missing target', hint: 'Usage: open <module | path>' };
			}

			const moduleNames = ['about', 'projects', 'journey', 'blog', 'contact', 'secret'];
			if (moduleNames.includes(target.toLowerCase())) {
				return { ok: true, data: { type: 'open_module', moduleId: target.toLowerCase() } };
			}

			const item = resolvePath(currentPath, target);
			if (!item) {
				return { ok: false, error: `open: file not found: ${target}` };
			}
			if (item.type === 'folder') {
				return { ok: false, error: `open: cannot open directory: ${target}` };
			}

			return { ok: true, data: { type: 'open_module', moduleId: item.id } };
		},
	},
	whoami: {
		name: 'whoami',
		description: 'Display the current user.',
		usage: 'whoami',
		run: () => ({ ok: true, data: 'root' }),
	},
	date: {
		name: 'date',
		description: 'Display the current date and time.',
		usage: 'date',
		run: () => ({ ok: true, data: new Date().toString() }),
	},
	echo: {
		name: 'echo',
		description: 'Display a line of text.',
		usage: 'echo [text...]',
		run: (_ctx, args) => ({ ok: true, data: args.join(' ') }),
	},
	theme: {
		name: 'theme',
		description: 'Set or toggle the UI theme.',
		usage: 'theme <dark|light|toggle>',
		aliases: ['th'],
		examples: ['theme dark', 'theme toggle'],
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
	// Module shortcuts
	about: {
		name: 'about',
		description: 'Open the About section.',
		usage: 'about',
		run: () => ({ ok: true, data: { type: 'open_module', moduleId: 'about' } }),
	},
	projects: {
		name: 'projects',
		description: 'Open the Projects section.',
		usage: 'projects',
		run: () => ({ ok: true, data: { type: 'open_module', moduleId: 'projects' } }),
	},
	journey: {
		name: 'journey',
		description: 'Open the Journey section.',
		usage: 'journey',
		run: () => ({ ok: true, data: { type: 'open_module', moduleId: 'journey' } }),
	},
	blog: {
		name: 'blog',
		description: 'Open the Blog section.',
		usage: 'blog',
		run: () => ({ ok: true, data: { type: 'open_module', moduleId: 'blog' } }),
	},
	contact: {
		name: 'contact',
		description: 'Open the Contact section.',
		usage: 'contact',
		run: () => ({ ok: true, data: { type: 'open_module', moduleId: 'contact' } }),
	},
	secret: {
		name: 'secret',
		description: '???',
		usage: 'secret',
		hidden: true,
		run: () => ({ ok: true, data: { type: 'open_module', moduleId: 'secret' } }),
	},

	// Easter eggs
	matrix: {
		name: 'matrix',
		description: 'Enter the Matrix.',
		usage: 'matrix',
		hidden: true,
		run: () => ({ ok: true, data: { type: 'component', content: 'Entering the matrix...' } }),
	},
	coffee: {
		name: 'coffee',
		description: 'Brew some coffee.',
		usage: 'coffee',
		hidden: true,
		run: () => ({ ok: false, error: "I'm a teapot" }), // HTTP 418
	},
	konami: {
		name: 'konami',
		description: 'Konami code.',
		usage: 'konami',
		hidden: true,
		run: () => ({ ok: true, data: 'Konami code activated! 🎉' }),
	},
};

// Dynamically generate the commands list from the registry.
export const commandsList: string[] = Object.keys(registry);

// Finds a command spec by name or alias.
export function findCommandSpec(name: string): CommandSpec | undefined {
	const key = name.toLowerCase();
	const direct = registry[key];
	if (direct) return direct;
	for (const spec of Object.values(registry)) {
		if (spec.aliases?.includes(key)) return spec;
	}
	return undefined;
}

export function resolveSpec(name: string): CommandSpec | undefined {
	const key = name.toLowerCase();
	const direct = registry[key];
	if (direct) return direct;
	for (const spec of Object.values(registry)) {
		if (spec.aliases?.includes(key)) return spec;
		if (spec.subcommands) {
			for (const [subName, subSpec] of Object.entries(spec.subcommands)) {
				if (subName.split(' ').pop() === key) return subSpec;
			}
		}
	}
	return undefined;
}

export function formatAllHelp(reg: Record<string, CommandSpec>): string {
	const lines: string[] = ['Available commands:'];
	for (const [name, spec] of Object.entries(reg)) {
		if (spec.hidden) continue;
		lines.push(`  ${name.padEnd(10)} - ${spec.description}`);
	}
	lines.push('\nType "help <command>" for details.');
	return lines.join('\n');
}

export function formatHelp(spec: CommandSpec): string {
	const lines = [`Usage: ${spec.usage}`, `\n${spec.description}`];
	if (spec.aliases?.length) {
		lines.push(`Aliases: ${spec.aliases.join(', ')}`);
	}
	if (spec.examples?.length) {
		lines.push('\nExamples:');
		for (const ex of spec.examples) lines.push(`  ${ex}`);
	}
	if (spec.options && Object.keys(spec.options).length) {
		lines.push('\nOptions:');
		for (const [opt, meta] of Object.entries(spec.options)) {
			lines.push(`  --${opt}${meta.alias ? `, -${meta.alias}` : ''} - ${meta.description}`);
		}
	}
	if (spec.subcommands && Object.keys(spec.subcommands).length) {
		lines.push('\nSubcommands:');
		for (const [sub, subSpec] of Object.entries(spec.subcommands)) {
			lines.push(`  ${sub} - ${subSpec.description}`);
		}
	}
	return lines.join('\n');
}

export function suggest(input: string): string | undefined {
	const keys = Object.keys(registry);
	const scored = keys
		.map(k => ({ k, score: levenshtein(input, k) }))
		.sort((a, b) => a.score - b.score)[0];
	return scored && scored.score <= 3 ? `Did you mean "${scored.k}"?` : undefined;
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

// Resolves a file system path (absolute or relative) to a FileSystemItem.
function resolvePath(currentPath: string, targetPath: string): FileSystemItem | null {
	// Normalize paths
	if (targetPath === '~' || targetPath === '/')
		return { type: 'folder', name: 'root', id: 'root', children: initialFileSystem };

	let pathParts: string[] = [];

	// Handle absolute path (starting with / or ~)
	if (targetPath.startsWith('/') || targetPath.startsWith('~')) {
		pathParts = targetPath
			.replace(/^~?\/?/, '')
			.split('/')
			.filter(Boolean);
	} else {
		// Relative path
		const currentParts =
			currentPath === '~'
				? []
				: currentPath
						.replace(/^~?\/?/, '')
						.split('/')
						.filter(Boolean);
		pathParts = [...currentParts, ...targetPath.split('/')].filter(Boolean);
	}

	// Start from root
	let currentItem: FileSystemItem | null = {
		type: 'folder',
		name: 'root',
		id: 'root',
		children: initialFileSystem,
	};

	// Handle ".." and "."
	const resolvedParts: string[] = [];
	for (const part of pathParts) {
		if (part === '.') continue;
		if (part === '..') {
			resolvedParts.pop();
		} else {
			resolvedParts.push(part);
		}
	}

	// Traverse
	for (const part of resolvedParts) {
		if (!currentItem || currentItem.type !== 'folder' || !currentItem.children) return null;

		const found: FileSystemItem | undefined = currentItem.children.find(
			item => item.name.toLowerCase() === part.toLowerCase(),
		);
		if (!found) return null;

		currentItem = found;
	}

	return currentItem;
}

// Parses command line arguments, respecting quoted strings.
function parseArgs(input: string): string[] {
	const args: string[] = [];
	let current = '';
	let inQuote = false;

	for (let i = 0; i < input.length; i++) {
		const char = input[i];
		if (char === '"') {
			inQuote = !inQuote;
		} else if (char === ' ' && !inQuote) {
			if (current) {
				args.push(current);
				current = '';
			}
		} else {
			current += char;
		}
	}
	if (current) {
		args.push(current);
	}
	return args;
}

// Processes a command input and returns the appropriate response.
export function processCommand(input: string, currentPath: string = '~'): CommandResponse {
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
			const context: CommandContext = { currentPath };
			const resultOrPromise = spec.run(context, args);

			if (resultOrPromise instanceof Promise) {
				// If the result is a Promise, throw an error or handle async appropriately
				throw new Error(
					'processCommand does not support async commands. Use an async handler.',
				);
			}

			const result = resultOrPromise;

			if (result.ok) {
				// Handle successful commands
				if (typeof result.data === 'string') {
					return { type: 'text', content: result.data };
				}
				if (typeof result.data === 'object' && result.data !== null) {
					return { 
						type: (result.data && typeof (result.data as Record<string, unknown>).type === 'string')
							? (result.data as Record<string, unknown>).type as CommandResponse['type']
							: 'component',
						...result.data, 
						content: (
							result.data && 
							typeof (result.data as Record<string, unknown>).content !== 'undefined'
						) 
							? (result.data as Record<string, unknown>).content as string | ReactNode 
							: '' 
					};
				}
				return { type: 'success', content: '' }; // Default success response
			} else {
				// Handle failed commands
				return {
					type: 'error',
					content: `${result.error}${result.hint ? `\nHint: ${result.hint}` : ''}`,
				};
			}
		}

		// Command not found, provide a suggestion.
		const suggestion = getCommandSuggestions(cmd, 1)[0];
		let errorMsg = `Hmm, I don't recognize '${cmd}'. 🤔`;
		if (suggestion) {
			errorMsg += ` Did you mean "${suggestion}"?`;
		} else {
			errorMsg += ' Type "help" to see a list of available commands.';
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
export function getCommandSuggestions(command: string, max: number): string[] {
	const normalizedInput = command.toLowerCase();
	if (!normalizedInput) return [];

	const allCommands = Object.values(registry).flatMap(cmd => [cmd.name, ...(cmd.aliases || [])]);
	const uniqueCommands = [...new Set(allCommands)];

	const scored = uniqueCommands
		.map(name => {
			const lowerName = name.toLowerCase();
			const startsWith = lowerName.startsWith(normalizedInput);
			// Penalize non-starting matches to prioritize prefixes
			const distance = levenshtein(normalizedInput, lowerName) + (startsWith ? 0 : 1);

			return { name, startsWith, distance };
		})
		.filter(
			item =>
				item.startsWith ||
				item.distance <= Math.max(2, Math.floor(normalizedInput.length / 2)),
		)
		.sort((a, b) => {
			if (a.startsWith !== b.startsWith) return a.startsWith ? -1 : 1;
			if (a.distance !== b.distance) return a.distance - b.distance;
			return a.name.length - b.name.length;
		});

	return scored.slice(0, max).map(item => item.name);
}
