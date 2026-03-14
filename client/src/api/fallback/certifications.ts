import type { Certification } from '@/types/schema';

export const FALLBACK_CERTIFICATIONS: Certification[] = [
	{
		id: 'fb-cert-1',
		title: 'AWS Certified Cloud Practitioner',
		issuer: 'Amazon Web Services',
		date: '2024-06-01T00:00:00.000Z',
		expirationDate: '2027-06-01T00:00:00.000Z',
		credentialId: 'AWS-CCP-2024',
		credentialUrl: 'https://www.credly.com/badges/example',
		skills: ['AWS', 'Cloud Computing', 'Infrastructure'],
		image: '/certifications/aws-ccp.png',
	},
	{
		id: 'fb-cert-2',
		title: 'Meta Front-End Developer Professional Certificate',
		issuer: 'Meta (via Coursera)',
		date: '2024-02-15T00:00:00.000Z',
		credentialId: 'META-FED-2024',
		credentialUrl: 'https://coursera.org/verify/example',
		skills: ['React', 'JavaScript', 'CSS', 'UI/UX'],
	},
	{
		id: 'fb-cert-3',
		title: 'Machine Learning Specialization',
		issuer: 'Stanford Online (via Coursera)',
		date: '2023-11-01T00:00:00.000Z',
		credentialId: 'STANFORD-ML-2023',
		skills: ['Machine Learning', 'Python', 'TensorFlow', 'Neural Networks'],
	},
];
