import { Project, JourneyEntry, BlogPost, AboutData } from '@/types/api';

export const mockProjects: Project[] = [
	{
		id: '1',
		title: 'AnuragOS',
		description:
			'A personal portfolio website designed like a terminal-based operating system.',
		techStack: ['TypeScript', 'TailwindCSS', 'Framer Motion'],
		githubUrl: 'https://github.com/Anurag-Basuri/personal_portfolio',
		liveUrl: 'https://anuragos.vercel.app',
		status: 'In Progress',
		stars: 12,
		forks: 2,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		featured: true,
	},
	{
		id: '2',
		title: 'AI Code Assistant',
		description:
			'An intelligent coding assistant that helps developers write better code faster.',
		techStack: ['Python', 'PyTorch', 'FastAPI', 'React'],
		githubUrl: 'https://github.com/example/ai-assistant',
		status: 'Completed',
		stars: 45,
		forks: 8,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '3',
		title: 'E-Commerce Platform',
		description: 'A full-stack e-commerce solution with real-time inventory management.',
		techStack: ['Node.js', 'Express', 'MongoDB', 'Redux'],
		liveUrl: 'https://example-store.com',
		status: 'Completed',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

export const mockAbout: AboutData = {
	name: 'Anurag Basuri',
	tagline: 'Full-Stack Engineer & Machine Intelligence Explorer',
	short: 'It started with "Hello, World!" and grew into a passion for building intelligent systems that make an impact. I\'m a CSE undergrad who loves building at the intersection of full-stack engineering and machine intelligence — designing clean, scalable user experiences with MERN & Modern Tech, while diving deep into AI/ML, LLMs, and NLP to understand how machines learn, reason, and adapt.',
	currentStatus: ['Building AnuragOS', 'Learning Rust', 'Exploring Agentic AI'],
	philosophy: 'Build things that matter, and make them look good while doing it.',
	callToAction: 'Check out my projects or say hello!',
	skills: {
		frontend: [
			{ name: 'React', level: 95 },
			{ name: 'TypeScript', level: 90 },
			{ name: 'TailwindCSS', level: 95 },
			{ name: 'Framer Motion', level: 85 },
			{ name: 'Next.js', level: 92 },
		],
		backend: [
			{ name: 'Node.js', level: 88 },
			{ name: 'Express', level: 90 },
			{ name: 'PostgreSQL', level: 85 },
			{ name: 'MongoDB', level: 88 },
			{ name: 'Supabase', level: 82 },
		],
		ml: [
			{ name: 'Python', level: 90 },
			{ name: 'PyTorch', level: 80 },
			{ name: 'Transformers', level: 75 },
			{ name: 'RAG Systems', level: 85 },
			{ name: 'LangChain', level: 82 },
		],
	},
};

export const mockJourney: JourneyEntry[] = [
	{
		id: '1',
		year: 2024,
		title: 'Senior Frontend Engineer',
		description: 'Leading the frontend team at TechCorp, building scalable web applications.',
		category: 'work',
		order: 1,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '2',
		year: 2022,
		title: 'Graduated University',
		description: 'Bachelor of Science in Computer Science with Honors.',
		category: 'education',
		order: 2,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

export const mockBlogPosts: BlogPost[] = [
	{
		id: '1',
		title: 'Building a Terminal Portfolio',
		slug: 'building-terminal-portfolio',
		content: 'How I built AnuragOS using Next.js and TailwindCSS...',
		tags: ['Portfolio', 'Design'],
		status: 'published',
		publishedAt: new Date().toISOString(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];
