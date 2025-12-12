import { Project } from '@/types/schema';

export const PROJECTS: Project[] = [
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
