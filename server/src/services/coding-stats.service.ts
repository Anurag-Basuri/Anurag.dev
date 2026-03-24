import { env } from '../config/env';
import { prisma } from '../lib/prisma';

// ─── Types ──────────────────────────────────────────────────────

interface ContributionDay {
	date: string;      // YYYY-MM-DD
	count: number;     // contribution count
	level: number;     // 0-4 intensity level
}

interface RatingHistoryEntry {
	date: string;      // ISO date
	rating: number;
	contestName?: string;
}

interface PlatformStats {
	username: string;
	url: string;
	stats?: {
		solved?: number;
		easy?: number;
		medium?: number;
		hard?: number;
		linesOfCode?: number;
		rating?: number;
		maxRating?: number;
		globalRank?: string | number;
		stars?: number;
		followers?: number;
		following?: number;
		prs?: number;
		issues?: number;
		repos?: number;
		gists?: number;
		commits?: number;
	};
	/** GitHub: 52 weeks of daily contribution data */
	contributionHeatmap?: ContributionDay[];
	/** Contest rating history (LeetCode / Codeforces) */
	ratingHistory?: RatingHistoryEntry[];
}

interface CodingStatsResult {
	leetcode: PlatformStats;
	codeforces: PlatformStats;
	codechef: PlatformStats;
	gfg: PlatformStats;
	github: PlatformStats;
}

// ─── In-memory cache ────────────────────────────────────────────

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

let cachedResult: CodingStatsResult | null = null;
let cachedAt = 0;

// ─── Username extraction from profile URLs ──────────────────────

function extractUsername(url: string | null | undefined, pattern: RegExp): string | null {
	if (!url) return null;
	const match = url.match(pattern);
	return match?.[1] ?? null;
}

const GITHUB_PATTERN = /github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})\/?$/;
const LEETCODE_PATTERN = /leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]+)\/?$/;
const CODEFORCES_PATTERN = /codeforces\.com\/profile\/([a-zA-Z0-9_.]+)\/?$/;
const CODECHEF_PATTERN = /codechef\.com\/users\/([a-zA-Z0-9_]+)\/?$/;
const GFG_PATTERN = /geeksforgeeks\.org\/user\/([a-zA-Z0-9_]+)\/?$/;

// ─── GitHub API (REST + GraphQL) ────────────────────────────────

const GITHUB_CONTRIBUTIONS_QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}`;

const CONTRIBUTION_LEVELS: Record<string, number> = {
	NONE: 0,
	FIRST_QUARTILE: 1,
	SECOND_QUARTILE: 2,
	THIRD_QUARTILE: 3,
	FOURTH_QUARTILE: 4,
};

async function fetchGitHub(username: string): Promise<PlatformStats> {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
		'User-Agent': 'portfolio-app',
	};
	if (env.GITHUB_TOKEN) {
		headers['Authorization'] = `Bearer ${env.GITHUB_TOKEN}`;
	}

	const base: PlatformStats = {
		username,
		url: `https://github.com/${username}`,
	};

	try {
		// Fetch user profile, repos, and contributions in parallel
		const fetches: Promise<Response>[] = [
			fetch(`https://api.github.com/users/${username}`, { headers }),
			fetch(
				`https://api.github.com/users/${username}/repos?per_page=100&sort=stars&direction=desc`,
				{ headers },
			),
		];

		// GraphQL for contributions (needs token)
		let contributionsPromise: Promise<ContributionDay[] | null> = Promise.resolve(null);
		if (env.GITHUB_TOKEN) {
			contributionsPromise = fetch('https://api.github.com/graphql', {
				method: 'POST',
				headers: {
					...headers,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					query: GITHUB_CONTRIBUTIONS_QUERY,
					variables: { username },
				}),
			})
				.then(async (res) => {
					if (!res.ok) return null;
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const json = (await res.json()) as any;
					const weeks = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
					if (!weeks) return null;

					const days: ContributionDay[] = [];
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					for (const week of weeks as any[]) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						for (const day of week.contributionDays as any[]) {
							days.push({
								date: day.date,
								count: day.contributionCount,
								level: CONTRIBUTION_LEVELS[day.contributionLevel] ?? 0,
							});
						}
					}
					return days;
				})
				.catch(() => null);
		}

		const [userRes, reposRes] = await Promise.all(fetches);
		const contributionHeatmap = await contributionsPromise;

		if (!userRes.ok) return base;

		const user = (await userRes.json()) as { followers?: number; following?: number; public_repos?: number; public_gists?: number };
		let totalStars = 0;

		if (reposRes.ok) {
			const repos = (await reposRes.json()) as Array<{ stargazers_count: number }>;
			totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
		}

		// Optionally fetch PR, issue, and commit counts if we have a token
		let prs = 0;
		let issues = 0;
		let commits = 0;
		if (env.GITHUB_TOKEN) {
			const [prRes, issueRes, commitRes] = await Promise.all([
				fetch(`https://api.github.com/search/issues?q=author:${username}+type:pr`, {
					headers,
				}),
				fetch(`https://api.github.com/search/issues?q=author:${username}+type:issue`, {
					headers,
				}),
				fetch(`https://api.github.com/search/commits?q=author:${username}`, {
					headers: { ...headers, Accept: 'application/vnd.github.cloak-preview+json' },
				}),
			]);
			if (prRes.ok) {
				const prData = (await prRes.json()) as { total_count?: number };
				prs = prData.total_count || 0;
			}
			if (issueRes.ok) {
				const issueData = (await issueRes.json()) as { total_count?: number };
				issues = issueData.total_count || 0;
			}
			if (commitRes.ok) {
				const commitData = (await commitRes.json()) as { total_count?: number };
				commits = commitData.total_count || 0;
			}
		}

		return {
			username,
			url: `https://github.com/${username}`,
			stats: {
				stars: totalStars,
				followers: user.followers || 0,
				following: user.following || 0,
				repos: user.public_repos || 0,
				gists: user.public_gists || 0,
				prs,
				issues,
				commits,
			},
			contributionHeatmap: contributionHeatmap ?? undefined,
		};
	} catch {
		return base;
	}
}

// ─── LeetCode GraphQL API ───────────────────────────────────────

const LEETCODE_QUERY = `
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      ranking
    }
    submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
  userContestRanking(username: $username) {
    rating
    globalRanking
  }
  userContestRankingHistory(username: $username) {
    attended
    rating
    contest {
      title
      startTime
    }
  }
}`;

async function fetchLeetCode(username: string): Promise<PlatformStats> {
	const base: PlatformStats = {
		username,
		url: `https://leetcode.com/u/${username}`,
	};

	try {
		const res = await fetch('https://leetcode.com/graphql/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Referer: 'https://leetcode.com/',
				Origin: 'https://leetcode.com',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
			},
			body: JSON.stringify({
				query: LEETCODE_QUERY,
				variables: { username },
			}),
		});

		if (!res.ok) return base;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const json = (await res.json()) as any;
		const user = json.data?.matchedUser;
		if (!user) return base;

		const submissions = user.submitStatsGlobal?.acSubmissionNum || [];
		const findCount = (difficulty: string) =>
			submissions.find(
				(s: { difficulty: string; count: number }) => s.difficulty === difficulty,
			)?.count || 0;

		const contestRanking = json.data?.userContestRanking;

		// Parse rating history — only include contests the user attended
		const ratingHistory: RatingHistoryEntry[] = [];
		const historyData = json.data?.userContestRankingHistory;
		if (Array.isArray(historyData)) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			for (const entry of historyData as any[]) {
				if (entry.attended && entry.rating > 0) {
					ratingHistory.push({
						date: new Date(entry.contest.startTime * 1000).toISOString(),
						rating: Math.round(entry.rating),
						contestName: entry.contest.title,
					});
				}
			}
		}

		return {
			username,
			url: `https://leetcode.com/u/${username}`,
			stats: {
				solved: findCount('All'),
				easy: findCount('Easy'),
				medium: findCount('Medium'),
				hard: findCount('Hard'),
				rating: contestRanking ? Math.round(contestRanking.rating) : undefined,
				globalRank: contestRanking?.globalRanking || undefined,
			},
			ratingHistory: ratingHistory.length > 0 ? ratingHistory : undefined,
		};
	} catch {
		return base;
	}
}

// ─── Codeforces API ─────────────────────────────────────────────

async function fetchCodeforces(handle: string): Promise<PlatformStats> {
	const base: PlatformStats = {
		username: handle,
		url: `https://codeforces.com/profile/${handle}`,
	};

	try {
		// Fetch user info and rating history in parallel
		const [userRes, ratingRes] = await Promise.all([
			fetch(`https://codeforces.com/api/user.info?handles=${handle}`),
			fetch(`https://codeforces.com/api/user.rating?handle=${handle}`),
		]);

		if (!userRes.ok) return base;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const userJson = (await userRes.json()) as any;
		if (userJson.status !== 'OK' || !userJson.result?.[0]) return base;

		const user = userJson.result[0];

		// Parse rating history
		const ratingHistory: RatingHistoryEntry[] = [];
		if (ratingRes.ok) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const ratingJson = (await ratingRes.json()) as any;
			if (ratingJson.status === 'OK' && Array.isArray(ratingJson.result)) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				for (const entry of ratingJson.result as any[]) {
					ratingHistory.push({
						date: new Date(entry.ratingUpdateTimeSeconds * 1000).toISOString(),
						rating: entry.newRating,
						contestName: entry.contestName,
					});
				}
			}
		}

		return {
			username: handle,
			url: `https://codeforces.com/profile/${handle}`,
			stats: {
				rating: user.rating,
				maxRating: user.maxRating,
			},
			ratingHistory: ratingHistory.length > 0 ? ratingHistory : undefined,
		};
	} catch {
		return base;
	}
}

// ─── Main service function ──────────────────────────────────────

const EMPTY_PLATFORM: PlatformStats = { username: '', url: '', stats: undefined };

export async function getCodingStatsData(): Promise<CodingStatsResult> {
	// Check cache
	if (cachedResult && Date.now() - cachedAt < CACHE_TTL_MS) {
		return cachedResult;
	}

	// Get profile from DB to extract platform URLs
	const profile = await prisma.profile.findFirst();

	const githubUsername = extractUsername(profile?.github, GITHUB_PATTERN);
	const leetcodeUsername = extractUsername(profile?.leetcode, LEETCODE_PATTERN);
	const codeforcesHandle = extractUsername(profile?.codeforces, CODEFORCES_PATTERN);
	const codechefUsername = extractUsername(profile?.codechef, CODECHEF_PATTERN);
	const gfgUsername = extractUsername(profile?.gfg, GFG_PATTERN);

	// Fetch all platforms in parallel — each handles its own errors
	const [github, leetcode, codeforces] = await Promise.all([
		githubUsername ? fetchGitHub(githubUsername) : Promise.resolve(EMPTY_PLATFORM),
		leetcodeUsername ? fetchLeetCode(leetcodeUsername) : Promise.resolve(EMPTY_PLATFORM),
		codeforcesHandle ? fetchCodeforces(codeforcesHandle) : Promise.resolve(EMPTY_PLATFORM),
	]);

	// CodeChef and GFG have no public API — pass through as link-only
	const codechef: PlatformStats = codechefUsername
		? { username: codechefUsername, url: `https://www.codechef.com/users/${codechefUsername}` }
		: EMPTY_PLATFORM;
	const gfg: PlatformStats = gfgUsername
		? { username: gfgUsername, url: `https://www.geeksforgeeks.org/user/${gfgUsername}` }
		: EMPTY_PLATFORM;

	const result: CodingStatsResult = { leetcode, codeforces, codechef, gfg, github };

	// Update cache
	cachedResult = result;
	cachedAt = Date.now();

	return result;
}
