import { FileSystemItem } from '@/types/file-system';
export * from '@/types/file-system';

export const initialFileSystem: FileSystemItem[] = [
	{
		name: 'about',
		type: 'folder',
		id: 'about',
		children: [{ name: 'README.md', type: 'file', id: 'about/README.md' }],
	},
	{
		name: 'projects',
		type: 'folder',
		id: 'projects',
		children: [{ name: 'README.md', type: 'file', id: 'projects/README.md' }],
	},
	{
		name: 'journey',
		type: 'folder',
		id: 'journey',
		children: [{ name: 'README.md', type: 'file', id: 'journey/README.md' }],
	},
	{
		name: 'certifications',
		type: 'folder',
		id: 'certifications',
		children: [{ name: 'README.md', type: 'file', id: 'certifications/README.md' }],
	},
	{
		name: 'ai-lab',
		type: 'folder',
		id: 'ailab',
		children: [{ name: 'README.md', type: 'file', id: 'ailab/README.md' }],
	},
	{
		name: 'blog',
		type: 'folder',
		id: 'blog',
		children: [{ name: 'README.md', type: 'file', id: 'blog/README.md' }],
	},
	{
		name: 'contact',
		type: 'folder',
		id: 'contact',
		children: [{ name: 'README.md', type: 'file', id: 'contact/README.md' }],
	},
	{
		name: 'tools',
		type: 'folder',
		id: 'tools',
		children: [
			{ name: 'resume.pdf', type: 'file', id: 'tools/resume.pdf' },
			{ name: 'stats.exe', type: 'file', id: 'tools/stats.exe' },
		],
	},
];
