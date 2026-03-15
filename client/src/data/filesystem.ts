import type { FileSystemItem } from '@/types/file-system';

export type { FileSystemItem };

export const INITIAL_FILE_SYSTEM: FileSystemItem[] = [
	// ─── Profile ────────────────────────────────────────────
	{
		name: 'profile',
		type: 'folder',
		id: 'profile',
		children: [
			{
				name: 'about.me',
				type: 'file',
				id: 'profile/about',
				moduleId: 'about',
				content: 'Full-stack developer with a passion for building elegant solutions.',
			},
			{
				name: 'resume.pdf',
				type: 'file',
				id: 'profile/resume',
				moduleId: 'resume',
				content: 'Download and view my professional resume.',
			},
		],
	},

	// ─── Career ─────────────────────────────────────────────
	{
		name: 'career',
		type: 'folder',
		id: 'career',
		children: [
			{
				name: 'experience.log',
				type: 'file',
				id: 'career/experience',
				moduleId: 'journey',
				content: 'Professional work experience, internships, and open-source contributions.',
			},
			{
				name: 'education.log',
				type: 'file',
				id: 'career/education',
				moduleId: 'journey',
				content: 'Academic background, degrees, and coursework.',
			},
		],
	},

	// ─── Projects ───────────────────────────────────────────
	{
		name: 'projects',
		type: 'folder',
		id: 'projects',
		children: [
			{
				name: 'showcase.app',
				type: 'file',
				id: 'projects/showcase',
				moduleId: 'projects',
				content: 'Browse web apps, AI experiments, and open-source work.',
			},
			{
				name: 'coding-stats.app',
				type: 'file',
				id: 'projects/profiles',
				moduleId: 'profiles',
				content: 'LeetCode, GitHub, and competitive programming stats.',
			},
		],
	},

	// ─── Shelf (achievements, certifications, blog) ─────────
	{
		name: 'shelf',
		type: 'folder',
		id: 'shelf',
		children: [
			{
				name: 'achievements.md',
				type: 'file',
				id: 'shelf/achievements',
				moduleId: 'journey',
				content: 'Hackathon wins, awards, scholarships, and milestones.',
			},
			{
				name: 'certifications.md',
				type: 'file',
				id: 'shelf/certifications',
				moduleId: 'certifications',
				content: 'Professional certifications and credentials.',
			},
			{
				name: 'blog.md',
				type: 'file',
				id: 'shelf/blog',
				moduleId: 'blog',
				content: 'Technical articles, tutorials, and insights.',
			},
		],
	},

	// ─── AI (chatbot) ───────────────────────────────────────
	{
		name: 'ask-anurag.ai',
		type: 'file',
		id: 'ask-anurag',
		moduleId: 'ailab',
		content: '🤖 AI-powered assistant that speaks on behalf of Anurag.',
	},

	// ─── Standalone files ───────────────────────────────────
	{
		name: 'contact.sh',
		type: 'file',
		id: 'contact',
		moduleId: 'contact',
		content: './contact.sh — Get in touch via email, socials, or form.',
	},
	{
		name: 'README.md',
		type: 'file',
		id: 'readme',
		moduleId: 'readme',
		content: '# Welcome\nNavigate the file tree or use the terminal (`help`, `ls`, `open about`).',
	},
];
