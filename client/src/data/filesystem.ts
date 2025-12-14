import { FileSystemItem } from '@/types/file-system';
export type { FileSystemItem };

export const INITIAL_FILE_SYSTEM: FileSystemItem[] = [
	{
		name: 'about',
		type: 'folder',
		id: 'about',
		children: [
			{
				name: 'README.md',
				type: 'file',
				id: 'about/README.md',
				content:
					"# About Me\n\nHi, I'm Anurag Basuri - a Full Stack Engineer passionate about building elegant solutions.",
			},
		],
	},
	{
		name: 'projects',
		type: 'folder',
		id: 'projects',
		children: [
			{
				name: 'README.md',
				type: 'file',
				id: 'projects/README.md',
				content:
					'# Projects\n\n- AnuragOS Portfolio\n- AI Lab Experiments\n- Dynamic Web Apps',
			},
		],
	},
	{
		name: 'journey',
		type: 'folder',
		id: 'journey',
		children: [
			{
				name: 'README.md',
				type: 'file',
				id: 'journey/README.md',
				content: '# My Journey\n\nFrom curious beginner to Full Stack Engineer...',
			},
		],
	},
	{
		name: 'certifications',
		type: 'folder',
		id: 'certifications',
		children: [
			{
				name: 'README.md',
				type: 'file',
				id: 'certifications/README.md',
				content: '# Certifications\n\nProfessional certifications and achievements.',
			},
		],
	},
	{
		name: 'ai-lab',
		type: 'folder',
		id: 'ailab',
		children: [
			{
				name: 'README.md',
				type: 'file',
				id: 'ailab/README.md',
				content: '# AI Lab\n\nExperimental AI projects and research.',
			},
		],
	},
	{
		name: 'blog',
		type: 'folder',
		id: 'blog',
		children: [
			{
				name: 'README.md',
				type: 'file',
				id: 'blog/README.md',
				content: '# Blog\n\nThoughts on development, AI, and technology.',
			},
		],
	},
	{
		name: 'contact',
		type: 'folder',
		id: 'contact',
		children: [
			{
				name: 'README.md',
				type: 'file',
				id: 'contact/README.md',
				content: '# Contact\n\nEmail: contact@anurag.dev\nGitHub: @Anurag-Basuri',
			},
		],
	},
	{
		name: 'resume.pdf',
		type: 'file',
		id: 'resume',
		content: '[Binary PDF Data]',
	},
	{
		name: 'coding-profiles',
		type: 'folder',
		id: 'coding-profiles',
		moduleId: 'coding-stats',
		children: [
			{
				name: 'README.md',
				type: 'file',
				id: 'coding-profiles/README.md',
				content:
					'# Coding Profiles\n\nLeetCode, Codeforces, CodeChef, and GitHub statistics.',
			},
		],
	},
];
