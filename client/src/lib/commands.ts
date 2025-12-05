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
	'ls',
	'cd',
	'open',
	'about',
	'projects',
	'journey',
	'ai-lab',
	'blog',
	'contact',
	'whoami',
	'date',
	'echo',
	'theme',
	'clear',
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

export function processCommand(input: string, currentPath: string = '~'): CommandResponse {
	const trimmed = input.trim();
	if (!trimmed) return { type: 'text', content: '' };

	const [cmd, ...args] = trimmed.split(/\s+/);
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
			if (item.id === 'root') return { type: 'change_directory', content: '', newPath: '~' };

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
				return { type: 'set_theme', theme: 'dark', content: 'Setting theme to dark...' };
			}
			if (subCmd === 'light') {
				return { type: 'set_theme', theme: 'light', content: 'Setting theme to light...' };
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
		default:
			return {
				type: 'error',
				content: `Command not found: ${command}. Type 'help' for available commands.`,
			};
	}
}
