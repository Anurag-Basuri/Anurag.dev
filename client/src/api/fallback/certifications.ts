import type { Certification } from '@/api/schema';

export const FALLBACK_CERTIFICATIONS: Certification[] = [
	{
		id: 'fb-cert-1',
		title: 'AWS Certified Cloud Practitioner',
		issuer: 'Amazon Web Services',
		credentialId: 'AWS-CCP-2024',
		credentialUrl: 'https://www.credly.com/badges/example',
		certificateUrl: '/certifications/aws-ccp.png',
		skills: ['AWS', 'Cloud Computing', 'Infrastructure'],
		startDate: '2024-06-01T00:00:00.000Z',
		endDate: '2027-06-01T00:00:00.000Z',
		order: 0,
		createdAt: '2024-06-01T00:00:00.000Z',
		updatedAt: '2024-06-01T00:00:00.000Z',
	},
	{
		id: 'fb-cert-2',
		title: 'Meta Front-End Developer Professional Certificate',
		issuer: 'Meta (via Coursera)',
		credentialId: 'META-FED-2024',
		credentialUrl: 'https://coursera.org/verify/example',
		skills: ['React', 'JavaScript', 'CSS', 'UI/UX'],
		startDate: '2024-02-15T00:00:00.000Z',
		order: 1,
		createdAt: '2024-02-15T00:00:00.000Z',
		updatedAt: '2024-02-15T00:00:00.000Z',
	},
	{
		id: 'fb-cert-3',
		title: 'Machine Learning Specialization',
		issuer: 'Stanford Online (via Coursera)',
		credentialId: 'STANFORD-ML-2023',
		skills: ['Machine Learning', 'Python', 'TensorFlow', 'Neural Networks'],
		startDate: '2023-11-01T00:00:00.000Z',
		order: 2,
		createdAt: '2023-11-01T00:00:00.000Z',
		updatedAt: '2023-11-01T00:00:00.000Z',
	},
];

