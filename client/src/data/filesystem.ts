import { FileSystemItem } from '@/types/file-system';
export type { FileSystemItem };
import { FileSystemBuilder as fs } from '@/lib/filesystem-builder';

// The root ID is intentionally implicit for top-level items, or we can define them explicitly.
// Here we define the structure.

export const INITIAL_FILE_SYSTEM: FileSystemItem[] = [
	fs.folder('README.md', 'root/readme', []), // Hack: Using folder logic to create a root-level item if needed, but actually root items usually have their own IDs.
	// Wait, the builder 'file' returns a function waiting for a parentId.
	// Let's manually create the root readme to match exact ID 'root/readme'.
	{
		name: 'README.md',
		type: 'file',
		id: 'root/readme',
		content:
			'# Welcome to AnuragOS\n\nI am a Full Stack Engineer passionate about building elegant solutions.\n\nType `help` to see available commands, or explore the directories below:\n\n- `bio/`: About me, my journey, and resume\n- `work/`: My projects, AI experiments, and coding stats\n- `connect/`: Contact info, social links, and blog',
	},

	fs.folder('bio', 'bio', [
		fs.app('about', { name: 'about.md' }), // Using app shortcut for About
		fs.app('journey', { name: 'journey.md' }),
		fs.app('certifications', { name: 'certifications.md', id: 'bio/certs' }), // Custom ID override if needed to match legacy
		fs.file('resume.pdf', '[Binary PDF Data]'), // Standard file
	]),

	fs.folder('work', 'work', [
		fs.app('projects'), // Default: projects.app, id: work/projects
		fs.app('ailab'), // Default: ailab.app, id: work/ailab
		fs.app('profiles'), // Default: profiles.app, id: work/profiles
	]),

	fs.folder('connect', 'connect', [
		fs.app('contact', { name: 'contact.md' }),
		fs.file(
			'socials.md',
			'Find me on:\n\n- GitHub: https://github.com/Anurag-Basuri\n- LinkedIn: https://www.linkedin.com/in/anuragbasuri/\n- Twitter: https://twitter.com/AnuragBasuri',
		),
		fs.app('blog'),
	]),
];
