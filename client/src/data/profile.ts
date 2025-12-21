import { AboutData } from '@/types/schema';

export const PROFILE: AboutData = {
	name: 'Anurag Basuri',
	role: 'Full Stack Engineer',
	tagline: 'Building the Future with Code & AI',
	summary:
		'I specialize in building scalable web applications and exploring the frontiers of artificial intelligence. With a passion for clean code and intuitive design, I create digital experiences that perform as beautiful as they look.',
	bio: `I'm a Full Stack Engineer with a deep passion for building scalable, user-centric web applications. My journey began with a curiosity about how things work on the internet, which quickly evolved into a career in software development.

	I specialize in the React ecosystem (Next.js, TypeScript) and modern backend architectures. I strongly believe in writing clean, maintainable code and testing thoroughly. Beyond coding, I'm an advocate for developer experience and often contribute to open-source projects.

	When I'm not pushing commits, you can find me exploring new AI technologies, reading sci-fi novels, or capturing moments through my camera lens.`,
	location: 'San Francisco, CA',
	avatarUrl: '/logo.png',
	coverUrl: '/about-cover.jpg',
	experienceYears: 2,
	projectsCount: 15,
	currentStatus: {
		label: 'Building the future of web',
		description: 'Currently focused on scalable architectures and AI integration',
	},
	focusAreas: [
		'Full-Stack Development',
		'AI/ML Integration',
		'System Architecture',
		'Developer Experience',
	],
	highlights: [
		{ label: 'Code Quality', value: '98%', icon: 'Code2' },
		{ label: 'Projects Delivered', value: '15+', icon: 'CheckCircle' },
		{ label: 'Client Satisfaction', value: '100%', icon: 'Star' },
	],
	languages: ['English (Native)', 'Hindi (Native)', 'Japanese (Elementary)'],
	hobbies: ['Photography', 'Sci-Fi Literature', 'Chess', 'Hiking'],
	workPreferences: {
		remote: true,
		hybrid: true,
		onsite: false,
		timezone: 'PST (UTC-8)',
	},
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
