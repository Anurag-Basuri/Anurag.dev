import { Certification } from '@/types/schema';

export const CERTIFICATIONS: Certification[] = [
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
