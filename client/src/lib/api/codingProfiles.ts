export interface CodingStats {
	identity: {
		yearsActive: number;
		totalCommits: number;
		mostUsedLanguage: string;
	};
	languages: {
		name: string;
		percentage: number;
		color: string;
	}[];
	github: {
		repos: number;
		followers: number;
		contributions: number;
		stars: number;
		percentile: number; // e.g. 95 means top 5%
	};
	leetcode: {
		totalSolved: number;
		easy: number;
		medium: number;
		hard: number;
		ranking: number;
		globalPercentile: number;
	};
	codeforces: {
		rating: number;
		rank: string;
		maxRating: number;
		maxRank: string;
		topPercentile: number;
	};
}

export const fetchCodingStats = async (): Promise<CodingStats> => {
	// Mock data for initial implementation
	// Simulating network delay
	await new Promise(resolve => setTimeout(resolve, 800));

	return {
		identity: {
			yearsActive: 4,
			totalCommits: 3450,
			mostUsedLanguage: 'TypeScript',
		},
		languages: [
			{ name: 'TypeScript', percentage: 45, color: '#3178c6' },
			{ name: 'Python', percentage: 25, color: '#3572A5' },
			{ name: 'Rust', percentage: 15, color: '#dea584' },
			{ name: 'Go', percentage: 10, color: '#00ADD8' },
			{ name: 'Other', percentage: 5, color: '#ededed' },
		],
		github: {
			repos: 28,
			followers: 142,
			contributions: 943,
			stars: 120,
			percentile: 92, // Top 8%
		},
		leetcode: {
			totalSolved: 480,
			easy: 160,
			medium: 260,
			hard: 60,
			ranking: 98000,
			globalPercentile: 15, // Top 15%
		},
		codeforces: {
			rating: 1520,
			rank: 'Specialist',
			maxRating: 1580,
			maxRank: 'Specialist',
			topPercentile: 25, // Top 25%
		},
	};
};
