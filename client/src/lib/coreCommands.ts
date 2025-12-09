import { createCommand, registerCommands } from './commandSystem';

// Navigation Commands
const helpCommand = createCommand({
	name: 'help',
	aliases: ['h', '?'],
	description: 'Shows a list of available commands.',
	usage: 'help',
	category: 'System',
	execute: (ctx) => {
		const { commandRegistry } = require('./commandSystem');
		const categories = {
			Navigation: [],
			System: [],
			Fun: [],
			Development: [],
			Files: [],
		};

		for (const plugin of commandRegistry.getAll()) {
			if (!plugin.hidden) {
				categories[plugin.category].push(plugin);
			}
		}

		let helpText = 'Welcome to my interactive portfolio! Here are available commands:\n\n';

		for (const [category, commands] of Object.entries(categories)) {
			if (commands.length > 0) {
				helpText += `--- ${category} ---\n`;
				helpText += commands
					.map(cmd => `  ${cmd.name.padEnd(12)} - ${cmd.description}`)
					.join('\n');
				helpText += '\n\n';
			}
		}

		return { ok: true, data: helpText.trim() };
	},
});

const aboutCommand = createCommand({
	name: 'about',
	description: 'Opens the "About Me" section.',
	usage: 'about',
	category: 'Navigation',
	execute: () => ({ 
		ok: true, 
		data: { type: 'open_module', moduleId: 'about' } 
	}),
});

const projectsCommand = createCommand({
	name: 'projects',
	description: 'Lists my key projects.',
	usage: 'projects',
	category: 'Navigation',
	execute: () => ({ 
		ok: true, 
		data: { type: 'open_module', moduleId: 'projects' } 
	}),
});

const journeyCommand = createCommand({
	name: 'journey',
	description: 'Shows my career and education journey.',
	usage: 'journey',
	category: 'Navigation',
	execute: () => ({ 
		ok: true, 
		data: { type: 'open_module', moduleId: 'journey' } 
	}),
});

const contactCommand = createCommand({
	name: 'contact',
	description: 'Provides my contact information.',
	usage: 'contact',
	category: 'Navigation',
	execute: () => ({ 
		ok: true, 
		data: { type: 'open_module', moduleId: 'contact' } 
	}),
});

const socialsCommand = createCommand({
	name: 'socials',
	aliases: ['links'],
	description: 'Displays my social and professional links.',
	usage: 'socials',
	category: 'Navigation',
	execute: () => ({
		ok: true,
		data: `You can find me here:
 - GitHub:   https://github.com/Anurag-Basuri
 - LinkedIn: https://www.linkedin.com/in/anurag-basuri-941546214/
 - Twitter:  https://twitter.com/AnuragBasuri`,
	}),
});

const resumeCommand = createCommand({
	name: 'resume',
	aliases: ['cv'],
	description: 'Opens my resume.',
	usage: 'resume',
	category: 'Navigation',
	execute: () => {
		if (typeof window !== 'undefined') {
			window.open('/resume.pdf', '_blank');
		}
		return { ok: true, data: 'Opening resume in a new tab...' };
	},
});

// System Commands
const clearCommand = createCommand({
	name: 'clear',
	aliases: ['cls'],
	description: 'Clears the terminal screen.',
	usage: 'clear',
	category: 'System',
	execute: () => ({ ok: true, data: { type: 'clear' } }),
});

const themeCommand = createCommand({
	name: 'theme',
	description: 'Changes the UI theme.',
	usage: 'theme <dark|light|toggle>',
	category: 'System',
	validate: (args) => {
		const mode = args[0]?.toLowerCase();
		if (!mode || !['dark', 'light', 'toggle'].includes(mode)) {
			return 'Invalid theme mode';
		}
		return null;
	},
	execute: (ctx) => {
		const mode = ctx.args[0]?.toLowerCase();
		return {
			ok: true,
			data: { type: 'set_theme', theme: mode as 'dark' | 'light' | 'toggle' },
		};
	},
});

const whoamiCommand = createCommand({
	name: 'whoami',
	description: 'Displays the current user.',
	usage: 'whoami',
	category: 'System',
	execute: () => ({ ok: true, data: 'guest' }),
});

// Fun/Hidden Commands
const secretCommand = createCommand({
	name: 'secret',
	description: '???',
	usage: 'secret',
	category: 'Fun',
	hidden: true,
	execute: () => ({ 
		ok: true, 
		data: { type: 'open_module', moduleId: 'secret' } 
	}),
});

const coffeeCommand = createCommand({
	name: 'coffee',
	description: 'Brew some coffee.',
	usage: 'coffee',
	category: 'Fun',
	hidden: true,
	execute: () => ({ 
		ok: false, 
		error: "I'm a teapot" // HTTP 418
	}),
});

// Development Commands
const statsCommand = createCommand({
	name: 'stats',
	aliases: ['coding-stats'],
	description: 'Shows coding statistics.',
	usage: 'stats',
	category: 'Development',
	execute: () => ({ 
		ok: true, 
		data: { type: 'open_module', moduleId: 'coding-stats' } 
	}),
});

const blogCommand = createCommand({
	name: 'blog',
	description: 'Opens the blog section.',
	usage: 'blog',
	category: 'Development',
	execute: () => ({ 
		ok: true, 
		data: { type: 'open_module', moduleId: 'blog' } 
	}),
});

// File Commands
const lsCommand = createCommand({
	name: 'ls',
	aliases: ['dir'],
	description: 'List directory contents.',
	usage: 'ls [path]',
	category: 'Files',
	execute: (ctx) => {
		const path = ctx.args[0] || ctx.currentPath;
		// This would integrate with the file system
		return { 
			ok: true, 
			data: `Contents of ${path}:\n  about/\n  projects/\n  contact/\n  resume.pdf` 
		};
	},
});

const cdCommand = createCommand({
	name: 'cd',
	description: 'Change directory.',
	usage: 'cd <path>',
	category: 'Files',
	validate: (args) => {
		if (args.length === 0) {
			return 'Path required';
		}
		return null;
	},
	execute: (ctx) => {
		const newPath = ctx.args[0];
		// Simple path validation
		if (newPath === '..') {
			return { ok: true, data: { type: 'change_directory', newPath: '~' } };
		}
		if (newPath === '~' || newPath === '/') {
			return { ok: true, data: { type: 'change_directory', newPath: '~' } };
		}
		// For demo, allow navigation to known directories
		const validDirs = ['about', 'projects', 'contact', 'blog'];
		if (validDirs.includes(newPath)) {
			return { ok: true, data: { type: 'change_directory', newPath } };
		}
		return { ok: false, error: `Directory not found: ${newPath}` };
	},
});

// Register all commands
export function registerCoreCommands() {
	registerCommands([
		helpCommand,
		aboutCommand,
		projectsCommand,
		journeyCommand,
		contactCommand,
		socialsCommand,
		resumeCommand,
		clearCommand,
		themeCommand,
		whoamiCommand,
		secretCommand,
		coffeeCommand,
		statsCommand,
		blogCommand,
		lsCommand,
		cdCommand,
	]);
}