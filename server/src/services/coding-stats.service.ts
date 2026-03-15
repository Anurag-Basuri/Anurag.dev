import { env } from '../config/env';
import { prisma } from '../lib/prisma';

// ─── Types ──────────────────────────────────────────────────────

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
		prs?: number;
		issues?: number;
	};
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

// ─── GitHub API ─────────────────────────────────────────────────

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
		// Fetch user profile and repos in parallel
		const [userRes, reposRes] = await Promise.all([
			fetch(`https://api.github.com/users/${username}`, { headers }),
			fetch(
				`https://api.github.com/users/${username}/repos?per_page=100&sort=stars&direction=desc`,
				{ headers },
			),
		]);

		if (!userRes.ok) return base;

		const user = (await userRes.json()) as { followers?: number };
		let totalStars = 0;

		if (reposRes.ok) {
			const repos = (await reposRes.json()) as Array<{ stargazers_count: number }>;
			totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
		}

		// Optionally fetch PR and issue counts if we have a token (uses search API)
		let prs = 0;
		let issues = 0;
		if (env.GITHUB_TOKEN) {
			const [prRes, issueRes] = await Promise.all([
				fetch(`https://api.github.com/search/issues?q=author:${username}+type:pr`, {
					headers,
				}),
				fetch(`https://api.github.com/search/issues?q=author:${username}+type:issue`, {
					headers,
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
		}

		return {
			username,
			url: `https://github.com/${username}`,
			stats: {
				stars: totalStars,
				followers: user.followers || 0,
				prs,
				issues,
			},
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
		const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);

		if (!res.ok) return base;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const json = (await res.json()) as any;
		if (json.status !== 'OK' || !json.result?.[0]) return base;

		const user = json.result[0];

		return {
			username: handle,
			url: `https://codeforces.com/profile/${handle}`,
			stats: {
				rating: user.rating,
				maxRating: user.maxRating,
			},
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
