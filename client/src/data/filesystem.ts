import type { FileSystemItem } from '@/types/file-system';

export type { FileSystemItem };

export const INITIAL_FILE_SYSTEM: FileSystemItem[] = [
	{
		name: 'bio',
		type: 'folder',
		id: 'bio',
		children: [
			{
				name: 'about.app',
				type: 'file',
				id: 'bio/about',
				moduleId: 'about',
				content: '[Executable App] Run to launch About Me.',
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
				content: '[Executable App] Run to launch Projects.',
			},
		],
	},
	{
		name: 'career',
		type: 'folder',
		id: 'career',
		children: [
			{
				name: 'journey.app',
				type: 'file',
				id: 'career/journey',
				moduleId: 'journey',
				content: '[Executable App] Run to launch My Journey.',
			},
			{
				name: 'certifications.app',
				type: 'file',
				id: 'career/certifications',
				moduleId: 'certifications',
				content: '[Executable App] Run to launch Certifications.',
			},
		],
	},
	{
		name: 'blog.app',
		type: 'file',
		id: 'blog',
		moduleId: 'blog',
		content: '[Executable App] Run to launch Blog.',
	},
	{
		name: 'lab',
		type: 'folder',
		id: 'lab',
		children: [
			{
				name: 'ailab.app',
				type: 'file',
				id: 'lab/ailab',
				moduleId: 'ailab',
				content: '[Executable App] Run to launch AI Lab.',
			},
		],
	},
	{
		name: 'profiles.app',
		type: 'file',
		id: 'profiles',
		moduleId: 'profiles',
		content: '[Executable App] Run to launch Coding Profiles.',
	},
	{
		name: 'contact.app',
		type: 'file',
		id: 'contact',
		moduleId: 'contact',
		content: '[Executable App] Run to launch Contact.',
	},
	{
		name: 'README.md',
		type: 'file',
		id: 'readme',
		content:
			"# Welcome to Anurag's Portfolio\n\nNavigate through the file tree to explore different sections.\nUse the terminal below to run commands like `help`, `ls`, or `open about`.",
	},
];
