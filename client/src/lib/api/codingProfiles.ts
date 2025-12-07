export interface CodingStats {
	github: {
		repos: number;
		followers: number;
		contributions: number;
		stars: number;
	};
	leetcode: {
		totalSolved: number;
		easy: number;
		medium: number;
		hard: number;
		ranking: number;
	};
	codeforces: {
		rating: number;
		rank: string;
		maxRating: number;
		maxRank: string;
	};
}

export const fetchCodingStats = async (): Promise<CodingStats> => {
	// Mock data for initial implementation to ensure UI works first
	// In a real production app, we would hit a Next.js API route that proxies these calls
	// to avoid CORS and hide tokens.

	// Simulating network delay
	await new Promise(resolve => setTimeout(resolve, 1500));

	return {
		github: {
			repos: 24,
			followers: 120,
			contributions: 843,
			stars: 45,
		},
		leetcode: {
			totalSolved: 450,
			easy: 150,
			medium: 250,
			hard: 50,
			ranking: 125000,
		},
		codeforces: {
			rating: 1450,
			rank: 'Specialist',
			maxRating: 1520,
			maxRank: 'Specialist',
		},
	};
};
