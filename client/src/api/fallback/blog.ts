import type { BlogPost } from '@/api/schema';

export const FALLBACK_BLOG_POSTS: BlogPost[] = [
	{
		id: 'fb-blog-1',
		title: 'Building an OS-Themed Portfolio with Next.js',
		content: 'Full article content here...',
		coverImage: '/blog/os-portfolio-cover.png',
		tags: ['Next.js', 'Portfolio', 'Web Design', 'TypeScript'],
		otherImages: [],
		status: 'published',
		publishedAt: '2024-06-15T00:00:00.000Z',
		order: 0,
		createdAt: '2024-06-10T00:00:00.000Z',
		updatedAt: '2024-06-15T00:00:00.000Z',
	},
	{
		id: 'fb-blog-2',
		title: 'The Complete Guide to API Versioning',
		content: 'Full article content here...',
		coverImage: '/blog/api-versioning-cover.png',
		tags: ['API', 'Backend', 'Best Practices'],
		otherImages: [],
		status: 'published',
		publishedAt: '2024-05-01T00:00:00.000Z',
		order: 1,
		createdAt: '2024-04-25T00:00:00.000Z',
		updatedAt: '2024-05-01T00:00:00.000Z',
	},
];

