import { BlogPost } from '@/types/schema';

export const BLOG_POSTS: BlogPost[] = [
	{
		id: '1',
		title: 'Building AnuragOS: A Deep Dive',
		slug: 'building-anuragos',
		summary: 'The journey of creating a terminal-based portfolio website from scratch.',
		content: 'The journey of creating a terminal-based portfolio website...',
		tags: ['Next.js', 'Design', 'Portfolio'],
		status: 'published',
		featured: true,
		readingTime: 5,
		publishedAt: new Date().toISOString(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '2',
		title: 'The Future of AI Agents',
		slug: 'future-of-ai-agents',
		summary: 'How autonomous agents are reshaping the software landscape.',
		content: 'How autonomous agents are reshaping the software development landscape.',
		tags: ['AI', 'Agents', 'Future'],
		status: 'published',
		featured: false,
		readingTime: 8,
		publishedAt: new Date().toISOString(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];
