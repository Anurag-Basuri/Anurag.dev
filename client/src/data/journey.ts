import { JourneyEntry } from '@/types/schema';

export const JOURNEY: JourneyEntry[] = [
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
