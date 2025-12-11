import { createCommand, registerCommands, commandRegistry } from './commandSystem';
import { initialFileSystem, FileSystemItem } from './data';

// File System Helper - Dynamic Path Resolution
const resolvePath = (
	path: string,
	currentPath: string,
): { item: FileSystemItem | undefined; absolutePath: string } => {
	// Resolve path parts
	let parts: string[] = [];

	if (path === '/' || path === '~' || path === '') {
		parts = [];
	} else if (path.startsWith('/') || path.startsWith('~')) {
		parts = path
			.replace(/^[~/]+/, '')
			.split('/')
			.filter(Boolean);
	} else {
		// Relative path
		const currentParts = currentPath === '~' ? [] : currentPath.split('/').filter(Boolean);
		const targetParts = path.split('/').filter(Boolean);

		parts = [...currentParts];
		for (const part of targetParts) {
			if (part === '.' || part === '') continue;
			if (part === '..') {
				parts.pop();
			} else {
				parts.push(part);
			}
		}
	}

	// Root directory
	if (parts.length === 0) {
		return {
			item: { name: '~', type: 'folder', id: 'root', children: initialFileSystem },
			absolutePath: '~',
		};
	}

	// Walk the tree
	let currentItems = initialFileSystem;
	let currentItem: FileSystemItem | undefined;

	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		currentItem = currentItems.find(item => item.name === part);

		if (!currentItem) return { item: undefined, absolutePath: '' };

		if (currentItem.type === 'folder') {
			currentItems = currentItem.children || [];
		} else if (i < parts.length - 1) {
			return { item: undefined, absolutePath: '' };
		}
	}

	const absolutePath = parts.join('/');
	return { item: currentItem, absolutePath };
};

// Navigation Commands
const helpCommand = createCommand({
	name: 'help',
	aliases: ['h', '?'],
	description: 'Shows a list of available commands.',
	usage: 'help',
	category: 'System',
	execute: () => {
		const categories: Record<string, (typeof helpCommand)[]> = {
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
		data: { type: 'open_module', moduleId: 'about' },
	}),
});

const projectsCommand = createCommand({
	name: 'projects',
	description: 'Lists my key projects.',
	usage: 'projects',
	category: 'Navigation',
	execute: () => ({
		ok: true,
		data: { type: 'open_module', moduleId: 'projects' },
	}),
});

const journeyCommand = createCommand({
	name: 'journey',
	description: 'Shows my career and education journey.',
	usage: 'journey',
	category: 'Navigation',
	execute: () => ({
		ok: true,
		data: { type: 'open_module', moduleId: 'journey' },
	}),
});

const contactCommand = createCommand({
	name: 'contact',
	description: 'Provides my contact information.',
	usage: 'contact',
	category: 'Navigation',
	execute: () => ({
		ok: true,
		data: { type: 'open_module', moduleId: 'contact' },
	}),
});

const certificationsCommand = createCommand({
	name: 'certifications',
	aliases: ['certs'],
	description: 'View my certifications and achievements.',
	usage: 'certifications',
	category: 'Navigation',
	execute: () => ({
		ok: true,
		data: { type: 'open_module', moduleId: 'certifications' },
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
	validate: args => {
		const mode = args[0]?.toLowerCase();
		if (!mode || !['dark', 'light', 'toggle'].includes(mode)) {
			return 'Invalid theme mode';
		}
		return null;
	},
	execute: ctx => {
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
		data: { type: 'open_module', moduleId: 'secret' },
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
		error: "I'm a teapot", // HTTP 418
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
		data: { type: 'open_module', moduleId: 'coding-stats' },
	}),
});

const blogCommand = createCommand({
	name: 'blog',
	description: 'Opens the blog section.',
	usage: 'blog',
	category: 'Development',
	execute: () => ({
		ok: true,
		data: { type: 'open_module', moduleId: 'blog' },
	}),
});

const ailabCommand = createCommand({
	name: 'ailab',
	aliases: ['ai'],
	description: 'Opens the AI Lab section.',
	usage: 'ailab',
	category: 'Development',
	execute: () => ({
		ok: true,
		data: { type: 'open_module', moduleId: 'ailab' },
	}),
});

// File Commands
const lsCommand = createCommand({
	name: 'ls',
	aliases: ['dir'],
	description: 'List directory contents.',
	usage: 'ls [path]',
	category: 'Files',
	execute: ctx => {
		const path = ctx.args[0] || ctx.currentPath;
		// This would integrate with the file system
		return {
			ok: true,
			data: `Contents of ${path}:\n  about/\n  projects/\n  contact/\n  resume.pdf`,
		};
	},
});

const cdCommand = createCommand({
	name: 'cd',
	description: 'Change directory.',
	usage: 'cd [path]',
	category: 'Files',
	execute: ctx => {
		const targetPath = ctx.args[0] || '~';
		const { item, absolutePath } = resolvePath(targetPath, ctx.currentPath);

		if (!item) {
			return { ok: false, error: `cd: ${targetPath}: No such file or directory` };
		}

		if (item.type !== 'folder') {
			return { ok: false, error: `cd: ${targetPath}: Not a directory` };
		}

		return {
			ok: true,
			data: {
				type: 'change_directory',
				newPath: absolutePath || '~',
			},
		};
	},
});

const catCommand = createCommand({
	name: 'cat',
	description: 'Display file contents.',
	usage: 'cat <file>',
	category: 'Files',
	execute: ctx => {
		if (!ctx.args[0]) return { ok: false, error: 'Usage: cat <filename>' };

		const { item } = resolvePath(ctx.args[0], ctx.currentPath);

		if (!item) {
			return { ok: false, error: `cat: ${ctx.args[0]}: No such file or directory` };
		}

		if (item.type === 'folder') {
			return { ok: false, error: `cat: ${ctx.args[0]}: Is a directory` };
		}

		if (item.name.endsWith('.pdf')) {
			return { ok: true, data: '[Binary PDF Data] (Use "open" to view)' };
		}

		if (item.name === 'stats.exe') {
			return { ok: true, data: '[Binary Executable] (Use "stats" or "open" to run)' };
		}

		const contentMap: Record<string, string> = {
			'about/README.md':
				"# About Me\n\nHi, I'm Anurag Basuri - a Full Stack Engineer passionate about building elegant solutions.",
			'projects/README.md':
				'# Projects\n\n- AnuragOS Portfolio\n- AI Lab Experiments\n- Dynamic Web Apps',
			'journey/README.md': '# My Journey\n\nFrom curious beginner to Full Stack Engineer...',
			'contact/README.md': '# Contact\n\nEmail: contact@anurag.dev\nGitHub: @Anurag-Basuri',
			'blog/README.md': '# Blog\n\nThoughts on development, AI, and technology.',
			'certifications/README.md':
				'# Certifications\n\nProfessional certifications and achievements.',
			'ailab/README.md': '# AI Lab\n\nExperimental AI projects and research.',
		};

		return {
			ok: true,
			data: contentMap[item.id] || `# ${item.name}\n\nContent preview...`,
		};
	},
});

const openCommand = createCommand({
	name: 'open',
	aliases: ['start'],
	description: 'Open a file or module.',
	usage: 'open <file>',
	category: 'System',
	execute: ctx => {
		if (!ctx.args[0]) return { ok: false, error: 'Usage: open <filename>' };

		const { item } = resolvePath(ctx.args[0], ctx.currentPath);

		if (!item) {
			return { ok: false, error: `open: ${ctx.args[0]}: No such file or directory` };
		}

		const moduleMap: Record<string, string> = {
			about: 'about',
			projects: 'projects',
			journey: 'journey',
			contact: 'contact',
			blog: 'blog',
			certifications: 'certifications',
			ailab: 'ailab',
			'ai-lab': 'ailab',
			tools: 'tools',
		};

		if (moduleMap[item.id] || moduleMap[item.name]) {
			return {
				ok: true,
				data: { type: 'open_module', moduleId: moduleMap[item.id] || moduleMap[item.name] },
			};
		}

		if (item.name === 'resume.pdf') {
			if (typeof window !== 'undefined') window.open('/resume.pdf', '_blank');
			return { ok: true, data: 'Opening resume...' };
		}

		if (item.name === 'stats.exe') {
			return { ok: true, data: { type: 'open_module', moduleId: 'coding-stats' } };
		}

		return { ok: true, data: `Opened ${item.name}` };
	},
});

const sudoCommand = createCommand({
	name: 'sudo',
	description: 'Execute command with elevated privileges.',
	usage: 'sudo <command>',
	category: 'System',
	hidden: true,
	execute: () => ({
		ok: false,
		error: 'User is not in the sudoers file. This incident will be reported.',
	}),
});

const mkdirCommand = createCommand({
	name: 'mkdir',
	description: 'Create directory.',
	usage: 'mkdir <name>',
	category: 'Files',
	hidden: true,
	execute: () => ({ ok: false, error: 'mkdir: Permission denied (read-only file system)' }),
});

const touchCommand = createCommand({
	name: 'touch',
	description: 'Create or update file.',
	usage: 'touch <file>',
	category: 'Files',
	hidden: true,
	execute: () => ({ ok: false, error: 'touch: Permission denied (read-only file system)' }),
});

const rmCommand = createCommand({
	name: 'rm',
	description: 'Remove files.',
	usage: 'rm <file>',
	category: 'Files',
	hidden: true,
	execute: () => ({ ok: false, error: 'rm: Permission denied (read-only file system)' }),
});

const pwdCommand = createCommand({
	name: 'pwd',
	description: 'Print working directory.',
	usage: 'pwd',
	category: 'Files',
	execute: ctx => ({ ok: true, data: ctx.currentPath === '~' ? '/' : `/${ctx.currentPath}` }),
});

// Register all commands
export function registerCoreCommands() {
	registerCommands([
		helpCommand,
		aboutCommand,
		projectsCommand,
		journeyCommand,
		contactCommand,
		certificationsCommand,
		socialsCommand,
		resumeCommand,
		clearCommand,
		themeCommand,
		whoamiCommand,
		secretCommand,
		coffeeCommand,
		statsCommand,
		blogCommand,
		ailabCommand,
		lsCommand,
		cdCommand,
		catCommand,
		openCommand,
		pwdCommand,
		sudoCommand,
		mkdirCommand,
		touchCommand,
		rmCommand,
	]);
}
