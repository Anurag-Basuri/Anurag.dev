import type { Profile } from '@/api/schema';

export const FALLBACK_PROFILE: Profile = {
	id: 'main',

	name: 'Anurag Basuri',
	pronouns: 'he/him',
	email: 'basurianurag@gmail.com',
	phone: '+91 9876543210',

	header: 'Full Stack Engineer | Building the Future with Code & AI',
	bio: `I'm a Full Stack Engineer with a deep passion for building scalable, user-centric web applications. My journey began with a curiosity about how things work on the internet, which quickly evolved into a career in software development.

I specialize in the React ecosystem (Next.js, TypeScript) and modern backend architectures. I strongly believe in writing clean, maintainable code and testing thoroughly. Beyond coding, I'm an advocate for developer experience and often contribute to open-source projects.

When I'm not pushing commits, you can find me exploring new AI technologies, reading sci-fi novels, or capturing moments through my camera lens.`,

	Currentlocation: 'Jamshedpur, Jharkhand, India',
	Originallocation: 'Jamshedpur, Jharkhand, India',

	openToWork: true,
	availableFrom: 'Immediately',
	noticePeriod: 'Immediate',

	workPreferences: { remote: true, hybrid: true, onsite: false, relocation: false },
	jobTypes: ['full-time', 'internship'],

	avatarUrl: '/logo.png',
	coverUrl: '/about-cover.jpg',
	resumeUrl: null,

	experienceYears: 2,
	projectsCount: 15,

	skills: {
		Frontend: ['React/Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
		Backend: ['Node.js', 'PostgreSQL', 'Prisma', 'Express'],
		'AI/ML': ['Python', 'LangChain', 'LLM Integration', 'TensorFlow'],
	},

	languages: ['English', 'Hindi'],

	socials: [
		{ platform: 'GitHub', url: 'https://github.com/Anurag-Basuri' },
		{ platform: 'LinkedIn', url: 'https://linkedin.com/in/anuragbasuri' },
		{ platform: 'Twitter', url: 'https://twitter.com/AnuragBasuri' },
	],
	website: null,

	github: 'https://github.com/Anurag-Basuri',
	leetcode: 'https://leetcode.com/u/Anurag_Basuri',
	codeforces: 'https://codeforces.com/profile/Anurag_Basuri',
	codechef: 'https://www.codechef.com/users/anurag_basuri',
	gfg: null,
	kaggle: null,
	otherProfiles: [],

	seoTitle: null,
	seoDesc: null,
	seoKeywords: [],

	createdAt: '2024-01-01T00:00:00.000Z',
	updatedAt: '2024-06-01T00:00:00.000Z',
};

