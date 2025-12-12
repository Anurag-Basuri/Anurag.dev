import { CODING_PROFILES } from '@/data/coding-profiles';

export interface PlatformStats {
	username: string;
	url: string;
	stats?: {
		rating?: number;
		globalRank?: string | number;
		solved?: number;
		stars?: number;
		commits?: number;
		followers?: number;
	};
}

export interface AllCodingStats {
	leetcode: PlatformStats;
	codeforces: PlatformStats;
	codechef: PlatformStats;
	github: PlatformStats;
}

const getLeetCodeStats = async (username: string) => {
	try {
		const query = `
            query userProblemsSolved($username: String!) {
                matchedUser(username: $username) {
                    submitStats {
                        acSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                    }
                    profile {
                        ranking
                    }
                }
            }
        `;

		const response = await fetch('https://leetcode.com/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				query,
				variables: { username },
			}),
		});

		if (!response.ok) throw new Error('LeetCode API failed');

		const data = await response.json();
		const stats = data.data?.matchedUser?.submitStats?.acSubmissionNum;
		const totalSolved = stats?.find((s: any) => s.difficulty === 'All')?.count || 0;
		const rank = data.data?.matchedUser?.profile?.ranking || 0;

		return {
			solved: totalSolved,
			globalRank: rank,
		};
	} catch (error) {
		console.warn('Error fetching LeetCode stats:', error);
		return { solved: 0, globalRank: 0 };
	}
};

const getCodeforcesStats = async (username: string) => {
	try {
		const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
		const data = await response.json();
		if (data.status !== 'OK') throw new Error('Codeforces API failed');

		const user = data.result[0];
		return {
			rating: user.rating || 0,
			globalRank: user.rank || 'Unrated',
			solved: 0, // Codeforces API doesn't give solved count easily in user.info
		};
	} catch (error) {
		console.warn('Error fetching Codeforces stats:', error);
		return { rating: 0, globalRank: 'Unrated' };
	}
};

const getCodeChefStats = async (username: string) => {
	try {
		// Note: Direct scraping from client-side usually fails due to CORS.
		// This is a best-effort implementation assuming a proxy or permissive environment.
		const response = await fetch(`https://www.codechef.com/users/${username}`, {
			headers: {
				Accept: 'text/html',
			},
		});
		if (!response.ok) throw new Error('CodeChef profile fetch failed');

		const text = await response.text();
		const parser = new DOMParser();
		const doc = parser.parseFromString(text, 'text/html');

		// Selector for rating (may change if CodeChef updates UI)
		const ratingElement = doc.querySelector('.rating-number');
		const rating = ratingElement ? parseInt(ratingElement.textContent || '0', 10) : 0;

		const rankElement = doc.querySelector('.rating-ranks .inline-list li a strong');
		const globalRank = rankElement ? rankElement.textContent : '0';

		return {
			rating,
			globalRank,
		};
	} catch (error) {
		// console.warn("Error fetching CodeChef stats (likely CORS):", error);
		// Silent fail or fallback
		return { rating: 0, globalRank: 0 };
	}
};

const getGitHubStats = async (username: string) => {
	try {
		const response = await fetch(`https://api.github.com/users/${username}`);
		if (!response.ok) throw new Error('GitHub API failed');
		const user = await response.json();

		// For stars, we need to fetch repos (limited to first page here for perf)
		const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
		const repos = await reposRes.json();
		const stars = Array.isArray(repos)
			? repos.reduce((acc: number, repo: any) => acc + (repo.stargazers_count || 0), 0)
			: 0;

		return {
			followers: user.followers,
			stars,
			commits: 0, // Requires a separate complex query or scraping
		};
	} catch (error) {
		console.warn('Error fetching GitHub stats:', error);
		return { followers: 0, stars: 0 };
	}
};

export const codingStatsService = {
	async getAllStats(): Promise<AllCodingStats> {
		const [leetcode, codeforces, codechef, github] = await Promise.all([
			getLeetCodeStats(CODING_PROFILES.leetcode.username).then(stats => ({
				...CODING_PROFILES.leetcode,
				stats,
			})),
			getCodeforcesStats(CODING_PROFILES.codeforces.username).then(stats => ({
				...CODING_PROFILES.codeforces,
				stats,
			})),
			getCodeChefStats(CODING_PROFILES.codechef!.username).then(stats => ({
				...CODING_PROFILES.codechef!, // Asserting existence as it was added in previous steps
				stats,
			})),
			getGitHubStats(CODING_PROFILES.github.username).then(stats => ({
				...CODING_PROFILES.github,
				stats,
			})),
		]);

		return {
			leetcode,
			codeforces,
			codechef,
			github,
		};
	},
};
