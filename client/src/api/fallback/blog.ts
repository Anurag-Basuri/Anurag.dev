import type { BlogPost } from '@/api/schema';

export const FALLBACK_BLOG_POSTS: BlogPost[] = [
	{
		id: '12b84da0-9f5e-4efd-a128-403d15a5f22e',
		title: 'Your LLM is Smart, But It Has Amnesia: How RAG and Vector DB Fix That',
		content: `Large Language Models (LLMs) are phenomenal at synthesis, reasoning, and code generation. However, their static parametric weights mean they cannot access private, current, or domain-specific knowledge out of the box without catastrophic forgetting or high fine-tuning costs.

Retrieval-Augmented Generation (RAG) resolves this by dynamically grounding model prompts in external vector databases. By encoding documents into high-dimensional embedding spaces, we can perform semantic cosine similarity lookups in sub-10ms and inject authoritative context directly into the prompt context window.`,
		tags: ['LLM', 'RAG', 'Vector Database', 'LangChain', 'AI Systems'],
		coverImage: 'https://res.cloudinary.com/drshc8zwk/image/upload/v1774328116/portfolio/blog/cover/i7ldu7m2nd22kdbprows.jpg',
		otherImages: [],
		link: 'https://medium.com/@anurag12024/your-llm-is-smart-but-it-has-amnesia-heres-how-rag-and-vector-db-fix-that-3771d932bfbd',
		status: 'published',
		publishedAt: '2026-04-09T00:00:00.000Z',
		order: 0,
		createdAt: '2026-04-09T05:43:23.207Z',
		updatedAt: '2026-04-09T05:45:45.335Z',
	},
	{
		id: '8a549d06-b70e-4e4c-8064-8b7bd5388137',
		title: 'DSA vs. Development : A Tier 3 College Perspective',
		content: `Data Structures and Algorithms (DSA) and Development are both critical components of software engineering, each with its own focus. DSA emphasizes problem-solving, logic, and efficiency, allowing you to create optimal, scalable solutions. In contrast, development is the process of creating functional, user-centric products using modern languages and frameworks.

While DSA provides a solid basis for producing clean code, development helps put these concepts into practice. For students attending Tier 3 colleges, succeeding in both is critical to standing out and demonstrating end-to-end engineering versatility.`,
		tags: ['DSA', 'Web Development', 'Career', 'Software Engineering'],
		coverImage: 'https://res.cloudinary.com/drshc8zwk/image/upload/v1774328116/portfolio/blog/cover/i7ldu7m2nd22kdbprows.jpg',
		otherImages: [],
		link: 'https://leetcode.com/discuss/post/5750947/dsa-vs-development-a-tier-3-college-pers-0e9g/',
		status: 'published',
		publishedAt: '2024-09-07T00:00:00.000Z',
		order: 1,
		createdAt: '2026-03-24T04:46:34.730Z',
		updatedAt: '2026-03-24T04:55:19.888Z',
	},
	{
		id: '7a7dfedb-813a-4f3c-bdfd-61bdb854a823',
		title: 'Dynamic Programming vs. Recursion: A Comparative Analysis',
		content: `Recursion and dynamic programming (DP) are two effective methods for resolving complex computational issues, particularly ones with optimal substructure and overlapping subproblems.

Recursion solves problems by dividing them into smaller self-similar subproblems. Dynamic programming optimizes this process by memoizing or tabulating subproblem solutions to prevent redundant calculations, reducing exponential time complexity down to polynomial.`,
		tags: ['Algorithms', 'Dynamic Programming', 'Recursion', 'Optimization'],
		coverImage: 'https://res.cloudinary.com/drshc8zwk/image/upload/v1774941479/portfolio/blog/cover/al6q7m3xgsmbbxhb67e3.png',
		otherImages: [],
		link: 'https://leetcode.com/discuss/post/5508819/dynamic-programming-vs-recursion-a-compa-9opm/',
		status: 'published',
		publishedAt: '2024-07-10T00:00:00.000Z',
		order: 2,
		createdAt: '2026-03-24T04:33:01.114Z',
		updatedAt: '2026-03-31T07:18:59.410Z',
	},
];
