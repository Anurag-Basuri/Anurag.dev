import { Project, JourneyEntry, BlogPost, AboutData, Certification } from '@/types/schema';

export const FALLBACK_PROJECTS: Project[] = [
	{
		id: '1',
		title: 'AnuragOS',
		description:
			'A terminal-style personal portfolio website with a fully functional file system and window manager.',
		techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
		githubUrl: 'https://github.com/Anurag-Basuri/personal_portfolio',
		liveUrl: 'https://anurag.dev',
		status: 'Completed',
		stars: 120,
		forks: 45,
		featured: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '2',
		title: 'AI Lab',
		description:
			'Experimental AI playground for testing LLM interactions and agent functionalities.',
		techStack: ['Python', 'LangChain', 'OpenAI', 'React'],
		status: 'draft',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

export const FALLBACK_JOURNEY: JourneyEntry[] = [
	{
		id: '1',
		year: 2024,
		title: 'Full Stack Engineer',
		description: 'Developing high-performance web applications and AI-integrated solutions.',
		category: 'work',
		order: 1,
	},
	{
		id: '2',
		year: 2023,
		title: 'Frontend Developer Intern',
		description: 'Contributed to the core design system and improved UI performance by 40%.',
		category: 'work',
		order: 2,
	},
	{
		id: '3',
		year: 2022,
		title: 'Started Coding',
		description: 'Wrote my first "Hello World" in Python and fell in love with programming.',
		category: 'education',
		order: 3,
	},
];

export const FALLBACK_BLOGS: BlogPost[] = [
	{
		id: '1',
		title: 'Building AnuragOS: A Deep Dive',
		slug: 'building-anuragos',
		content: 'The journey of creating a terminal-based portfolio website...',
		tags: ['Next.js', 'Design', 'Portfolio'],
		status: 'published',
		publishedAt: new Date().toISOString(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '2',
		title: 'The Future of AI Agents',
		slug: 'future-of-ai-agents',
		content: 'How autonomous agents are reshaping the software development landscape.',
		tags: ['AI', 'Agents', 'Future'],
		status: 'published',
		publishedAt: new Date().toISOString(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

export const FALLBACK_ABOUT: AboutData = {
	name: 'Anurag Basuri',
	tagline: 'Full Stack Engineer & AI Enthusiast',
	short: 'I specialize in building scalable web applications and exploring the frontiers of artificial intelligence. With a passion for clean code and intuitive design, I create digital experiences that perform as beautiful as they look.',
	skills: {
		frontend: [
			{ name: 'React/Next.js', level: 95 },
			{ name: 'TypeScript', level: 90 },
			{ name: 'Tailwind CSS', level: 98 },
			{ name: 'Framer Motion', level: 85 },
		],
		backend: [
			{ name: 'Node.js', level: 88 },
			{ name: 'PostgreSQL', level: 85 },
			{ name: 'Prisma', level: 90 },
			{ name: 'Serverless', level: 80 },
		],
		ml: [
			{ name: 'Python', level: 85 },
			{ name: 'LangChain', level: 75 },
			{ name: 'LLM Integration', level: 80 },
			{ name: 'TensorFlow', level: 60 },
		],
	},
};

export const FALLBACK_CERTIFICATIONS: Certification[] = [
	{
		id: '1',
		title: 'AWS Certified Solutions Architect',
		issuer: 'Amazon Web Services',
		date: '2024-01-15',
		credentialUrl: 'https://aws.amazon.com',
		skills: ['Cloud Computing', 'AWS', 'System Design'],
	},
	{
		id: '2',
		title: 'Meta Frontend Developer Certificate',
		issuer: 'Meta / Coursera',
		date: '2023-08-20',
		credentialUrl: 'https://coursera.org',
		skills: ['React', 'UI/UX', 'JavaScript'],
	},
	{
		id: '3',
		title: 'TensorFlow Developer Certificate',
		issuer: 'Google',
		date: '2023-05-10',
		credentialUrl: 'https://tensorflow.org',
		skills: ['Machine Learning', 'Deep Learning', 'Python'],
	},
];
