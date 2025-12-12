import { CodingStats } from '@/types/schema';

export const CODING_STATS: CodingStats = {
	identity: {
		yearsActive: 3,
		totalCommits: 2450,
		mostUsedLanguage: 'TypeScript',
	},
	languages: [
		{ name: 'TypeScript', percentage: 65, color: '#3178c6' },
		{ name: 'Python', percentage: 20, color: '#3776ab' },
		{ name: 'Rust', percentage: 10, color: '#dea584' },
		{ name: 'Go', percentage: 5, color: '#00add8' },
	],
	leetcode: {
		totalSolved: 342,
		easy: 120,
		medium: 180,
		hard: 42,
		globalPercentile: 94.5,
	},
	codeforces: {
		rating: 1450,
		rank: 'Specialist',
		maxRating: 1520,
		maxRank: 'Specialist',
	},
	github: {
		totalCommits: 2450,
		stars: 180,
		followers: 45,
		percentile: 92,
	},
};
