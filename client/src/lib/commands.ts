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

export const commandsList = [
	'help',
	'about',
	'projects',
	'journey',
	'ai-lab',
	'blog',
	'contact',
	'ls',
	'cd',
	'pwd',
	'whoami',
	'date',
	'open',
	'clear',
	'theme',
	// Easter eggs
	'matrix',
	'coffee',
	'konami',
];

// Helper to resolve a path string to a FileSystemItem or null
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

// Helper to parse arguments, handling quoted strings
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

export function processCommand(input: string, currentPath: string = '~'): CommandResponse {
	try {
		const trimmed = input.trim();
		if (!trimmed) return { type: 'text', content: '' };

		const args = parseArgs(trimmed);
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
