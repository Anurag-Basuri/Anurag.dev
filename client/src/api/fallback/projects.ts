import type { Project } from '@/api/schema';

export const FALLBACK_PROJECTS: Project[] = [
	{
		id: 'fb-proj-1',
		title: 'AnuragOS',
		description:
			'A terminal-style personal portfolio website with a fully functional file system and window manager.',
		techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Jotai'],
		thumbnail: '/projects/anuragos-thumb.png',
		images: ['/projects/anuragos-1.png', '/projects/anuragos-2.png'],
		githubUrl: 'https://github.com/Anurag-Basuri/personal_portfolio',
		liveUrl: 'https://anurag.dev',
		status: 'completed',
		stars: 120,
		forks: 45,
		createdAt: '2024-01-01T00:00:00.000Z',
		updatedAt: '2024-06-01T00:00:00.000Z',
	},
	{
		id: 'fb-proj-2',
		title: 'StreamFlow',
		description:
			'A real-time video streaming platform with adaptive bitrate streaming, chat, and social features.',
		techStack: ['React', 'Node.js', 'WebRTC', 'Redis', 'PostgreSQL'],
		thumbnail: '/projects/streamflow-thumb.png',
		images: [],
		githubUrl: 'https://github.com/Anurag-Basuri/streamflow',
		liveUrl: null,
		status: 'published',
		stars: 85,
		forks: 20,
		createdAt: '2024-03-15T00:00:00.000Z',
		updatedAt: '2024-07-01T00:00:00.000Z',
	},
	{
		id: 'fb-proj-3',
		title: 'AI Lab',
		description:
			'Experimental AI playground for testing LLM interactions and agent functionalities.',
		techStack: ['Python', 'LangChain', 'OpenAI', 'React', 'FastAPI'],
		thumbnail: '/projects/ailab-thumb.png',
		images: [],
		githubUrl: null,
		liveUrl: null,
		status: 'published',
		stars: null,
		forks: null,
		createdAt: '2024-05-01T00:00:00.000Z',
		updatedAt: '2024-08-01T00:00:00.000Z',
	},
];

