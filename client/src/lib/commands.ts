import { ReactNode } from 'react';
import { getModuleComponent } from '@/lib/moduleRegistry';

export type CommandResponse = {
	type: 'text' | 'error' | 'success' | 'component' | 'clear' | 'open_module';
	content: string | ReactNode;
	moduleId?: string;
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
	'exit',
];

export function processCommand(input: string): CommandResponse {
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
  about     - Open About module
  projects  - Open Projects Hub
  journey   - Open Journey Mode
  ai-lab    - Open AI Lab
  blog      - List blog posts
  contact   - Open Contact form
  whoami    - Display current user
  date      - Display current date and time
  echo      - Display a line of text
  theme     - Toggle theme (light/dark)
  clear     - Clear terminal
  exit      - End session`,
			};
		case 'clear':
			return { type: 'clear', content: '' };
		case 'ls':
			return {
				type: 'text',
				content: 'about  projects  journey  ai-lab  blog  contact  tools  secret',
			};
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
		case 'theme':
			// This is a placeholder as theme toggling needs to happen in the component
			// We'll handle the 'theme' command in CLI.tsx specially or return a special type
			return {
				type: 'text',
				content: 'Use the theme toggle button in the top bar for now.',
			};
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
				return { type: 'error', content: 'Usage: open [module_name]' };
			}
			const moduleId = args[0].toLowerCase();

			// Validate by attempting to resolve the component.
			try {
				const component = getModuleComponent(moduleId);
				if (!component) {
					return {
						type: 'error',
						content: `Error: Module '${moduleId}' not found.`,
					};
				}
			} catch {
				return {
					type: 'error',
					content: `Error: Module '${moduleId}' not found.`,
				};
			}

			return {
				type: 'open_module',
				content: `Opening ${moduleId}...`,
				moduleId,
				// Pass args as initial props if needed
			};
		}
		default:
			return {
				type: 'error',
				content: `Command not found: ${command}. Type 'help' for available commands.`,
			};
	}
}
