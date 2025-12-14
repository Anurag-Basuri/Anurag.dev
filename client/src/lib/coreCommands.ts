import { createCommand, registerCommands, commandRegistry } from './commandSystem';
import { INITIAL_FILE_SYSTEM, FileSystemItem } from '@/data/filesystem';

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
			item: { name: '~', type: 'folder', id: 'root', children: INITIAL_FILE_SYSTEM },
			absolutePath: '~',
		};
	}

	// Walk the tree
	let currentItems = INITIAL_FILE_SYSTEM;
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

// --- Commands ---

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
			Files: [],
			Development: [],
			Fun: [],
		};

		for (const plugin of commandRegistry.getAll()) {
			if (!plugin.hidden) {
				categories[plugin.category].push(plugin);
			}
		}

		let helpText = 'Available commands:\n\n';

		for (const [category, commands] of Object.entries(categories)) {
			if (commands.length > 0) {
				helpText += `[${category}]\n`;
				helpText += commands
					.map(cmd => `  ${cmd.name.padEnd(14)} ${cmd.description}`)
					.join('\n');
				helpText += '\n\n';
			}
		}

		return { ok: true, data: helpText.trim() };
	},
});

const lsCommand = createCommand({
	name: 'ls',
	aliases: ['dir', 'll'],
	description: 'List directory contents.',
	usage: 'ls [path]',
	category: 'Files',
	execute: ctx => {
		// Default to current directory '.' instead of using currentPath as relative path
		const targetPath = ctx.args[0] || '.';

		const { item } = resolvePath(targetPath, ctx.currentPath);

		if (!item) {
			return { ok: false, error: `ls: ${targetPath}: No such file or directory` };
		}

		if (item.type !== 'folder') {
			return { ok: true, data: item.name };
		}

		const children = item.children || [];
		if (children.length === 0) {
			return { ok: true, data: '(empty)' };
		}

		// Format output: Folders in blue (conceptually), files in white
		const output = children
			.map(child => (child.type === 'folder' ? `${child.name}/` : child.name))
			.join('\n');

		return { ok: true, data: output };
	},
});

const treeCommand = createCommand({
	name: 'tree',
	description: 'List contents of directories in a tree-like format.',
	usage: 'tree [path]',
	category: 'Files',
	execute: ctx => {
		const targetPath = ctx.args[0] || '.';
		const { item } = resolvePath(targetPath, ctx.currentPath);

		if (!item) {
			return { ok: false, error: `tree: ${targetPath}: No such file or directory` };
		}

		if (item.type !== 'folder') {
			return { ok: true, data: item.name };
		}

		const buildTree = (items: FileSystemItem[], prefix = ''): string => {
			let result = '';
			const length = items.length;

			items.forEach((item, index) => {
				const isLast = index === length - 1;
				const connector = isLast ? '└── ' : '├── ';
				const childPrefix = isLast ? '    ' : '│   ';

				result += `${prefix}${connector}${item.name}\n`;

				if (item.type === 'folder' && item.children) {
					result += buildTree(item.children, prefix + childPrefix);
				}
			});
			return result;
		};

		const rootName =
			targetPath === '.'
				? ctx.currentPath === '~'
					? '~'
					: ctx.currentPath.split('/').pop()
				: item.name;
		const tree = `${rootName || '.'}\n${buildTree(item.children || [])}`;
		return { ok: true, data: tree };
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

		return {
			ok: true,
			data: item.content || '[Empty file]',
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

		// 1. Direct Module ID (if file metadata has it)
		if (item.moduleId) {
			return {
				ok: true,
				data: { type: 'open_module', moduleId: item.moduleId },
			};
		}

		// 2. Resume PDF Special Case
		if (item.name === 'resume.pdf') {
			if (typeof window !== 'undefined') window.open('/resume.pdf', '_blank');
			return { ok: true, data: 'Opening resume...' };
		}

		// 3. Fallback for executables or special files not caught above
		if (item.name.endsWith('.app') || item.name.endsWith('.exe')) {
			return { ok: false, error: `open: ${item.name}: No executable handler found.` };
		}

		// 4. Fallback for text files (act like cat but with a message)
		if (item.type === 'file') {
			return { ok: true, data: `Opened ${item.name}\n\n${item.content}` };
		}

		return { ok: true, data: `Opened ${item.name}` };
	},
});

const echoCommand = createCommand({
	name: 'echo',
	description: 'Display a line of text.',
	usage: 'echo [text...]',
	category: 'System',
	execute: ctx => ({
		ok: true,
		data: ctx.args.join(' '),
	}),
});

const dateCommand = createCommand({
	name: 'date',
	description: 'Display current date and time.',
	usage: 'date',
	category: 'System',
	execute: () => ({
		ok: true,
		data: new Date().toString(),
	}),
});

const pwdCommand = createCommand({
	name: 'pwd',
	description: 'Print working directory.',
	usage: 'pwd',
	category: 'Files',
	execute: ctx => ({ ok: true, data: ctx.currentPath === '~' ? '/' : `/${ctx.currentPath}` }),
});

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

// Shortcut commands to open modules directly
const makeModuleCommand = (name: string, description: string) =>
	createCommand({
		name,
		description,
		usage: name,
		category: 'Navigation',
		execute: () => ({
			ok: true,
			data: { type: 'open_module', moduleId: name },
		}),
	});

const projectsCommand = makeModuleCommand('projects', 'Lists my key projects.');
const aboutCommand = makeModuleCommand('about', 'Opens the "About Me" section.');
const journeyCommand = makeModuleCommand('journey', 'Shows my career and education journey.');
const contactCommand = makeModuleCommand('contact', 'Provides my contact information.');
const certificationsCommand = makeModuleCommand(
	'certifications',
	'View my certifications and achievements.',
);
const blogCommand = makeModuleCommand('blog', 'Opens the blog section.');
const ailabCommand = makeModuleCommand('ailab', 'Opens the AI Lab section.');

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
 - LinkedIn: https://www.linkedin.com/in/anuragbasuri/
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

const rmCommand = createCommand({
	name: 'rm',
	description: 'Remove files.',
	usage: 'rm <file>',
	category: 'Files',
	hidden: true,
	execute: () => ({ ok: false, error: 'rm: Permission denied (read-only file system)' }),
});

const touchCommand = createCommand({
	name: 'touch',
	description: 'Create or update file.',
	usage: 'touch <file>',
	category: 'Files',
	hidden: true,
	execute: () => ({ ok: false, error: 'touch: Permission denied (read-only file system)' }),
});

const statsCommand = createCommand({
	name: 'stats',
	aliases: ['coding-stats'],
	description: 'Shows coding statistics.',
	usage: 'stats',
	category: 'Development',
	execute: () => ({
		ok: true,
		data: { type: 'open_module', moduleId: 'profiles' },
	}),
});

// Register all commands
export function registerCoreCommands() {
	registerCommands([
		helpCommand,
		lsCommand,
		treeCommand,
		cdCommand,
		catCommand,
		openCommand,
		pwdCommand,
		echoCommand,
		dateCommand,
		clearCommand,
		themeCommand,
		whoamiCommand,
		projectsCommand,
		aboutCommand,
		journeyCommand,
		contactCommand,
		certificationsCommand,
		blogCommand,
		ailabCommand,
		socialsCommand,
		resumeCommand,
		secretCommand,
		coffeeCommand,
		sudoCommand,
		mkdirCommand,
		rmCommand,
		touchCommand,
		statsCommand,
	]);
}
