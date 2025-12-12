import { AboutData } from '@/types/schema';

export const PROFILE: AboutData = {
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
