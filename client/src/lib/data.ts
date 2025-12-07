import { FileSystemItem } from '@/types/file-system';
export * from '@/types/file-system';

export const initialFileSystem: FileSystemItem[] = [
	{
		name: 'about',
		type: 'folder',
		id: 'about',
		children: [
			{ name: 'whoami.md', type: 'file', id: 'about/whoami.md' },
			{ name: 'skills.json', type: 'file', id: 'about/skills.json' },
			{ name: 'experience.log', type: 'file', id: 'about/experience.log' },
		],
	},
	{
		name: 'projects',
		type: 'folder',
		id: 'projects',
		children: [
			{ name: 'featured', type: 'folder', id: 'projects/featured', children: [] },
			{ name: 'all-projects.json', type: 'file', id: 'projects/all-projects.json' },
		],
	},
	{
		name: 'journey',
		type: 'folder',
		id: 'journey',
		children: [{ name: 'timeline.md', type: 'file', id: 'journey/timeline.md' }],
	},
	{
		name: 'ai-lab',
		type: 'folder',
		id: 'ai-lab',
		children: [
			{ name: 'models', type: 'folder', id: 'ai-lab/models', children: [] },
			{ name: 'demos.py', type: 'file', id: 'ai-lab/demos.py' },
		],
	},
	{
		name: 'blog',
		type: 'folder',
		id: 'blog',
		children: [],
	},
	{
		name: 'contact',
		type: 'folder',
		id: 'contact',
		children: [
			{ name: 'email.txt', type: 'file', id: 'contact/email.txt' },
			{ name: 'socials.json', type: 'file', id: 'contact/socials.json' },
		],
	},
	{
		name: 'tools',
		type: 'folder',
		id: 'tools',
		children: [
			{ name: 'resume.pdf', type: 'file', id: 'tools/resume.pdf' },
			{ name: 'stats.exe', type: 'file', id: 'stats.exe' },
		],
	},
	{
		name: 'secret',
		type: 'folder',
		id: 'secret',
		children: [{ name: 'dont_open.exe', type: 'file', id: 'secret/dont_open.exe' }],
	},
];
