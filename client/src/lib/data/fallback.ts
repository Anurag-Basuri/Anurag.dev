import { Project, JourneyEntry, BlogPost, AboutData, Certification } from '@/types/schema';

export const FALLBACK_PROJECTS: Project[] = [
	{
		id: '1',
		title: 'AnuragOS',
		slug: 'anuragos-portfolio',
		description:
			'A terminal-style personal portfolio website with a fully functional file system and window manager.',
		content: 'Full case study of AnuragOS...',
		techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
		tags: ['Portfolio', 'Operating System', 'Web Design'],
		githubUrl: 'https://github.com/Anurag-Basuri/personal_portfolio',
		liveUrl: 'https://anurag.dev',
		status: 'completed',
		featured: true,
		priority: 10,
		stars: 120,
		forks: 45,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	{
		id: '2',
		title: 'AI Lab',
		slug: 'ai-lab-experiments',
		description:
			'Experimental AI playground for testing LLM interactions and agent functionalities.',
		techStack: ['Python', 'LangChain', 'OpenAI', 'React'],
		tags: ['AI', 'LLM', 'Agents'],
		status: 'draft',
		featured: false,
		priority: 5,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

export const FALLBACK_JOURNEY: JourneyEntry[] = [
	{
		id: '1',
		type: 'work',
		title: 'Full Stack Engineer',
		company: 'Tech Innovators Inc.',
		location: 'San Francisco, CA',
		date: '2024 - Present',
		startDate: '2024-01-01',
		description:
			'Developing high-performance web applications and AI-integrated solutions. Leading the frontend migration to Next.js.',
		skills: ['React', 'Node.js', 'AWS', 'System Design'],
		order: 1,
	},
	{
		id: '2',
		type: 'work',
		title: 'Frontend Developer Intern',
		company: 'Creative Solutions',
		location: 'Remote',
		date: '2023 - 2024',
		startDate: '2023-05-01',
		endDate: '2023-12-31',
		description:
			'Contributed to the core design system and improved UI performance by 40%. Implemented accessible components.',
		skills: ['TypeScript', 'Tailwind CSS', 'Storybook'],
		order: 2,
	},
	{
		id: '3',
		type: 'education',
		title: 'Bachelor of Computer Science',
		company: 'University of Technology',
		location: 'City, Country',
		date: '2020 - 2024',
		startDate: '2020-09-01',
		endDate: '2024-05-01',
		description:
			'Specialized in Artificial Intelligence and Software Engineering. Graduated with Honors.',
		skills: ['Algorithms', 'Data Structures', 'CS Fundamentals'],
		order: 3,
	},
];

export const FALLBACK_BLOGS: BlogPost[] = [
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

export const FALLBACK_ABOUT: AboutData = {
	name: 'Anurag Basuri',
	role: 'Full Stack Engineer',
	tagline: 'Building the Future with Code & AI',
	summary:
		'I specialize in building scalable web applications and exploring the frontiers of artificial intelligence. With a passion for clean code and intuitive design, I create digital experiences that perform as beautiful as they look.',
	bio: 'Full biography content goes here...',
	location: 'San Francisco, CA',
	avatarUrl: '/logo.png',
	experienceYears: 2,
	projectsCount: 15,
	skills: {
		frontend: [
			{ category: 'Frontend', name: 'React/Next.js', level: 95 },
			{ category: 'Frontend', name: 'TypeScript', level: 90 },
			{ category: 'Frontend', name: 'Tailwind CSS', level: 98 },
			{ category: 'Frontend', name: 'Framer Motion', level: 85 },
		],
		backend: [
			{ category: 'Backend', name: 'Node.js', level: 88 },
			{ category: 'Backend', name: 'PostgreSQL', level: 85 },
			{ category: 'Backend', name: 'Prisma', level: 90 },
			{ category: 'Backend', name: 'Serverless', level: 80 },
		],
		ml: [
			{ category: 'AI/ML', name: 'Python', level: 85 },
			{ category: 'AI/ML', name: 'LangChain', level: 75 },
			{ category: 'AI/ML', name: 'LLM Integration', level: 80 },
			{ category: 'AI/ML', name: 'TensorFlow', level: 60 },
		],
	},
	socials: [
		{ platform: 'GitHub', url: 'https://github.com/Anurag-Basuri' },
		{ platform: 'LinkedIn', url: 'https://linkedin.com/in/anuragbasuri' },
		{ platform: 'Twitter', url: 'https://twitter.com/AnuragBasuri' },
	],
};
