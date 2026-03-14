import type { BlogPost } from '@/types/schema';

export const FALLBACK_BLOG_POSTS: BlogPost[] = [
	{
		id: 'fb-blog-1',
		title: 'Building an OS-Themed Portfolio with Next.js',
		slug: 'os-themed-portfolio-nextjs',
		summary:
			'How I built a fully interactive operating system-themed portfolio using Next.js, TypeScript, and Framer Motion.',
		content: 'Full article content here...',
		coverImage: '/blog/os-portfolio-cover.png',
		tags: ['Next.js', 'Portfolio', 'Web Design', 'TypeScript'],
		status: 'published',
		featured: true,
		publishedAt: '2024-06-15T00:00:00.000Z',
		readingTime: 8,
		createdAt: '2024-06-10T00:00:00.000Z',
		updatedAt: '2024-06-15T00:00:00.000Z',
	},
	{
		id: 'fb-blog-2',
		title: 'The Complete Guide to API Versioning',
		slug: 'complete-guide-api-versioning',
		summary:
			'A deep dive into API versioning strategies — URL-based, header-based, and query parameter approaches.',
		content: 'Full article content here...',
		coverImage: '/blog/api-versioning-cover.png',
		tags: ['API', 'Backend', 'Best Practices'],
		status: 'published',
		featured: false,
		publishedAt: '2024-05-01T00:00:00.000Z',
		readingTime: 12,
		createdAt: '2024-04-25T00:00:00.000Z',
		updatedAt: '2024-05-01T00:00:00.000Z',
	},
];
