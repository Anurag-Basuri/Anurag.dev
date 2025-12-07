import { ReactNode } from 'react';
import { getModuleComponent } from '@/lib/moduleRegistry';
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
	print: (lines: string | string[]) => void;
	clear: () => void;
	setBusy: (busy: boolean) => void;
	getState: () => unknown;
};

export type CommandResult =
	| { ok: true; data?: unknown }
	| { ok: false; error: string; hint?: string };

// Static list of supported command names for autocomplete and suggestions.
// Keep in sync with `processCommand` cases and shortcuts below.
export const commandsList: string[] = [
	'help',
	'ls',
	'cd',
	'open',
	'whoami',
	'date',
	'echo',
	'theme',
	'clear',
	// Shortcuts / modules
	'about',
	'projects',
	'journey',
	'ai-lab',
	'blog',
	'contact',
	// Easter eggs
	'matrix',
	'coffee',
	'konami',
];

export const registry: Record<string, CommandSpec> = {
	help: {
		name: 'help',
		aliases: ['h', '?'],
		description: 'Show available commands or details of a command.',
		usage: 'help [command]',
		examples: ['help', 'help project'],
		run: (_ctx, args) => {
			if (!args.length) return { ok: true, data: formatAllHelp(registry) };
			const t = resolveSpec(args[0]);
			if (!t)
				return { ok: false, error: `Unknown command "${args[0]}"`, hint: suggest(args[0]) };
			return { ok: true, data: formatHelp(t) };
		},
	},
	clear: {
		name: 'clear',
		description: 'Clear the terminal output.',
		usage: 'clear',
		run: ctx => {
			ctx.clear();
			return { ok: true };
		},
	},
	open: {
		name: 'open',
		description: 'Open an app or section.',
		usage: 'open <about|blog|projects|contact|journey>',
		examples: ['open about', 'open projects'],
		run: (_ctx, args) =>
			args[0]
				? { ok: true, data: `Opening "${args[0]}"...` }
				: { ok: false, error: 'Missing target', hint: 'Usage: open <section>' },
	},
	theme: {
		name: 'theme',
		description: 'Set or toggle theme.',
		usage: 'theme <dark|light|system>',
		aliases: ['th'],
		examples: ['theme dark', 'theme system'],
		run: (_ctx, args) =>
			args[0]
				? { ok: true, data: `Theme set to ${args[0]}` }
				: { ok: false, error: 'Missing mode', hint: 'Usage: theme <dark|light|system>' },
	},
	project: {
		name: 'project',
		description: 'Manage projects.',
		usage: 'project <list|add|remove> [...options]',
		subcommands: {
			list: {
				name: 'project list',
				description: 'List projects',
				usage: 'project list [--tag <tag>] [--json]',
				run: _ctx => ({ ok: true, data: 'Listing projects...' }),
			},
			add: {
				name: 'project add',
				description: 'Add a project',
				usage: 'project add --name <n> --url <u>',
				run: (_ctx, args) => ({ ok: true, data: `Adding project: ${args.join(' ')}` }),
			},
			remove: {
				name: 'project remove',
				description: 'Remove a project',
				usage: 'project remove --id <id>',
				run: (_ctx, args) =>
					args[0]
						? { ok: true, data: `Removing project ${args[0]}` }
						: {
								ok: false,
								error: 'Missing id',
								hint: 'Usage: project remove --id <id>',
						  },
			},
		},
	},
	search: {
		name: 'search',
		description: 'Search across content.',
		usage: 'search "<query>" [--section <name>]',
		run: (_ctx, args) =>
			args.length
				? { ok: true, data: `Searching for ${args.join(' ')}` }
				: { ok: false, error: 'Missing query', hint: 'Usage: search "<query>"' },
	},
};

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
	lines.push('Type "help <command>" for details.');
	return lines.join('\n');
}

export function formatHelp(spec: CommandSpec): string {
	const lines = [`${spec.name}`, `Usage: ${spec.usage}`, `Description: ${spec.description}`];
	if (spec.examples?.length) {
		lines.push('Examples:');
		for (const ex of spec.examples) lines.push(`  ${ex}`);
	}
	if (spec.options && Object.keys(spec.options).length) {
		lines.push('Options:');
		for (const [opt, meta] of Object.entries(spec.options)) {
			lines.push(`  --${opt}${meta.alias ? `, -${meta.alias}` : ''} - ${meta.description}`);
		}
	}
	if (spec.subcommands && Object.keys(spec.subcommands).length) {
		lines.push('Subcommands:');
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

	// Resolve parts
	let currentItems = initialFileSystem;
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
		// Validate input type and length
		if (typeof input !== 'string') {
			return { type: 'error', content: 'Invalid input type.' };
		}

		// Limit input length to prevent abuse
		const sanitized = input.trim().slice(0, 500);
		if (!sanitized) return { type: 'text', content: '' };

		const args = parseArgs(sanitized);
		const cmd = args.shift(); // Remove command from args
		if (!cmd) return { type: 'text', content: '' };

		const command = cmd.toLowerCase();

		switch (command) {
			case 'help':
				return {
					type: 'text',
					content: `Available commands:
  help      - Show this help message
  ls        - List directory contents
  cd        - Change directory
  open      - Open a file or module
  whoami    - Display current user
  date      - Display current date and time
  echo      - Display a line of text
  theme     - Toggle theme (light/dark)
  clear     - Clear terminal
  
  Shortcuts:
  about, projects, journey, ai-lab, blog, contact`,
				};
			case 'clear':
				return { type: 'clear', content: '' };
			case 'ls': {
				const target = args.length > 0 ? args[0] : '.';
				const item = resolvePath(currentPath, target);

				if (!item) {
					return {
						type: 'error',
						content: `ls: cannot access '${target}': No such file or directory`,
					};
				}

				if (item.type === 'file') {
					return { type: 'text', content: item.name };
				}

				if (item.children) {
					const names = item.children.map(child => {
						return child.type === 'folder' ? `${child.name}/` : child.name;
					});
					return { type: 'text', content: names.join('  ') };
				}
				return { type: 'text', content: '' };
			}
			case 'cd': {
				if (args.length === 0) {
					return { type: 'change_directory', content: '', newPath: '~' };
				}
				const target = args[0];
				const item = resolvePath(currentPath, target);

				if (!item) {
					return { type: 'error', content: `cd: no such file or directory: ${target}` };
				}
				if (item.type !== 'folder') {
					return { type: 'error', content: `cd: not a directory: ${target}` };
				}

				// Construct new path string
				if (item.id === 'root')
					return { type: 'change_directory', content: '', newPath: '~' };

				// For this app, IDs are paths like "about" or "projects/featured"
				// So we can just use the ID prepended with ~
				return { type: 'change_directory', content: '', newPath: `~/${item.id}` };
			}
			case 'whoami':
				return {
					type: 'text',
					content: 'guest@anuragos',
				};
			case 'date':
				return {
					type: 'text',
					content: new Date().toString(),
				};
			case 'echo':
				return {
					type: 'text',
					content: args.join(' '),
				};
			case 'theme': {
				const subCmd = args[0]?.toLowerCase();
				if (subCmd === 'dark') {
					return {
						type: 'set_theme',
						theme: 'dark',
						content: 'Setting theme to dark...',
					};
				}
				if (subCmd === 'light') {
					return {
						type: 'set_theme',
						theme: 'light',
						content: 'Setting theme to light...',
					};
				}
				return { type: 'set_theme', theme: 'toggle', content: 'Toggling theme...' };
			}
			case 'about':
			case 'projects':
			case 'journey':
			case 'ai-lab':
			case 'blog':
			case 'contact':
				return {
					type: 'open_module',
					content: `Opening ${command}...`,
					moduleId: command,
				};
			case 'open': {
				if (args.length === 0) {
					return { type: 'error', content: 'Usage: open [filename]' };
				}
				const target = args[0];
				const item = resolvePath(currentPath, target);

				if (!item) {
					return { type: 'error', content: `open: ${target}: No such file or directory` };
				}

				if (item.type === 'folder') {
					return { type: 'error', content: `open: ${target}: Is a directory` };
				}

				// Extract module ID from the file ID (e.g. "about/whoami.md" -> "about")
				let moduleId = item.id;
				if (moduleId.includes('/')) {
					moduleId = moduleId.split('/')[0];
				}

				const component = getModuleComponent(moduleId);
				if (component) {
					return {
						type: 'open_module',
						content: `Opening ${item.name}...`,
						moduleId: moduleId,
					};
				}

				return {
					type: 'text',
					content: `Opened ${item.name} (Preview not implemented for this file type)`,
				};
			}

			// Easter Eggs
			case 'matrix':
				return {
					type: 'success',
					content: `Following the white rabbit...

01100100 01101111 01110111 01101110
01110100 01101000 01100101
01110010 01100001 01100010 01100010
01101001 01110100 01101000 01101111
01101100 01100101

Wake up, Neo... The Matrix has you.
Try exploring 'projects' to see the real world! 💊`,
				};

			case 'coffee':
				return {
					type: 'success',
					content: `      ( (
       ) )
    ........
    |      |]
    \\      /
     \`----'

☕ Brewing a fresh cup...

Take a break! You've been exploring for a while.
When you're ready, check out 'about' or 'projects'! 🚀`,
				};

			case 'konami':
				return {
					type: 'success',
					content: `⬆️ ⬆️ ⬇️ ⬇️ ⬅️ ➡️ ⬅️ ➡️ B A START

🎮 ACHIEVEMENT UNLOCKED! 🎮

✨ Secret Discovered: You found the Konami Code! ✨

You've unlocked 30 extra lives... in your career!
Now go check out my 'projects' and 'journey'! 🚀`,
				};

			default: {
				// Simple suggestion logic
				const suggestion = commandsList.find(c => {
					// Check for Levenshtein distance or simple inclusion
					// For simplicity, just check if it starts with or is close
					return c.startsWith(command) || (command.length > 2 && c.includes(command));
				});

				let errorMsg = `Hmm, I don't recognize '${command}'. 🤔`;
				if (suggestion) {
					errorMsg += `\n\nDid you mean '${suggestion}'? Type 'help' to see all commands!`;
				} else {
					errorMsg += `\n\nType 'help' to see what I can do! 💡`;
				}

				return {
					type: 'error',
					content: errorMsg,
				};
			}
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
