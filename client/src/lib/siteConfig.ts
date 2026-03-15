// Site-wide configuration and metadata
// Centralized for easy maintenance and reuse

export const siteKeywords: string[] = [
	'Anurag Basuri',
	'Full Stack Engineer',
	'Web Developer',
	'Portfolio',
	'React',
	'Next.js',
	'TypeScript',
	'AI',
	'Machine Learning',
];

export const siteConfig = {
	name: 'Anurag Basuri',
	title: 'Anurag Basuri | Software Developer',
	description:
		'Full-stack engineer passionate about building elegant solutions. Explore my portfolio of web applications, AI experiments, and technical articles.',
	url: 'https://anuragbasuri.com',
	ogImage: '/og-image.png',
	links: {
		github: 'https://github.com/Anurag-Basuri',
		twitter: '@AnuragBasuri',
	},
	creator: 'Anurag Basuri',
};

export type SiteConfig = typeof siteConfig;

