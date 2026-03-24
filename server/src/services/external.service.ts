import { env } from '../config/env';

export async function fetchGithubActivity(username: string) {
	try {
		const headers: Record<string, string> = {
			'User-Agent': 'Anurag-Portfolio-Agent',
			Accept: 'application/vnd.github.v3+json',
		};
		if (env.GITHUB_TOKEN) {
			headers['Authorization'] = `token ${env.GITHUB_TOKEN}`;
		}

		// Fetch recent events
		const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public?per_page=5`, { headers });
		const events = eventsRes.ok ? (await eventsRes.json() as any[]) : [];

		// Fetch user profile info
		const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
		const user = userRes.ok ? (await userRes.json() as any) : null;

		if (!user) {
			return `Could not fetch GitHub data for username: ${username}`;
		}

		const formattedEvents = events
			.slice(0, 5)
			.map((e: any) => `- ${e.type} on ${e.repo?.name} (${new Date(e.created_at).toLocaleDateString()})`)
			.join('\n');

		return `
GITHUB PROFILE (${username}):
Followers: ${user.followers} | Following: ${user.following}
Public Repos: ${user.public_repos}
Bio: ${user.bio || 'No bio'}

RECENT ACTIVITY:
${formattedEvents || 'No recent public activity.'}
		`.trim();
	} catch (error) {
		console.error('[github] Failed to fetch:', error);
		return `Error fetching GitHub data for ${username}.`;
	}
}

export async function fetchLeetCodeStats(username: string) {
	try {
		// Using a popular public proxy for LeetCode stats since they only have GraphQL
		const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
		const data = (await res.json()) as any;

		if (data.status === 'error') {
			return `LeetCode account "${username}" not found or private.`;
		}

		return `
LEETCODE STATS (${username}):
Total Solved: ${data.totalSolved} / ${data.totalQuestions}
- Easy: ${data.easySolved}
- Medium: ${data.mediumSolved}
- Hard: ${data.hardSolved}

Acceptance Rate: ${data.acceptanceRate}%
Ranking: ${data.ranking}
Contribution Points: ${data.contributionPoints}
		`.trim();
	} catch (error) {
		console.error('[leetcode] Failed to fetch:', error);
		return `Error fetching LeetCode data for ${username}.`;
	}
}
