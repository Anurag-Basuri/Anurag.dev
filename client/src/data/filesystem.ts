import { FileSystemItem } from '@/types/file-system';
export type { FileSystemItem };

export const INITIAL_FILE_SYSTEM: FileSystemItem[] = [
	{
		name: 'README.md',
		type: 'file',
		id: 'root/readme',
		content:
			'# Welcome to AnuragOS\n\nI am a Full Stack Engineer passionate about building elegant solutions.\n\nType `help` to see available commands, or explore the directories below:\n\n- `bio/`: About me, my journey, and resume\n- `work/`: My projects, AI experiments, and coding stats\n- `connect/`: Contact info, social links, and blog',
	},
	{
		name: 'bio',
		type: 'folder',
		id: 'bio',
		children: [
			{
				name: 'about.md',
				type: 'file',
				id: 'bio/about',
				moduleId: 'about',
				content: 'Opening About module...',
			},
			{
				name: 'journey.md',
				type: 'file',
				id: 'bio/journey',
				moduleId: 'journey',
				content: 'Opening Journey module...',
			},
			{
				name: 'certifications.md',
				type: 'file',
				id: 'bio/certs',
				moduleId: 'certifications',
				content: 'Opening Certifications module...',
			},
			{
				name: 'resume.pdf',
				type: 'file',
				id: 'resume',
				content: '[Binary PDF Data]',
			},
		],
	},
	{
		name: 'work',
		type: 'folder',
		id: 'work',
		children: [
			{
				name: 'projects.app',
				type: 'file',
				id: 'work/projects',
				moduleId: 'projects',
				content: '[Executable App] Run to view projects.',
			},
			{
				name: 'ai-lab.app',
				type: 'file',
				id: 'work/ailab',
				moduleId: 'ailab',
				content: '[Executable App] Run to enter AI Lab.',
			},
			{
				name: 'coding-stats.app',
				type: 'file',
				id: 'work/stats',
				moduleId: 'coding-stats',
				content: '[Executable App] Run to view coding statistics.',
			},
		],
	},
	{
		name: 'connect',
		type: 'folder',
		id: 'connect',
		children: [
			{
				name: 'contact.md',
				type: 'file',
				id: 'connect/contact',
				moduleId: 'contact',
				content: 'Opening Contact module...',
			},
			{
				name: 'socials.md',
				type: 'file',
				id: 'connect/socials',
				content:
					'Find me on:\n\n- GitHub: https://github.com/Anurag-Basuri\n- LinkedIn: https://www.linkedin.com/in/anuragbasuri/\n- Twitter: https://twitter.com/AnuragBasuri',
			},
			{
				name: 'blog.app',
				type: 'file',
				id: 'connect/blog',
				moduleId: 'blog',
				content: '[Executable App] Run to read blog.',
			},
		],
	},
];
