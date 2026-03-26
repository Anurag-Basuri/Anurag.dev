import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const leetcodeTool = tool(
	async ({ username }) => {
		try {
			// Using alfa-leetcode-api (maintained, deployed on Render)
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

			const res = await fetch(
				`https://alfa-leetcode-api.onrender.com/userProfile/${username}`,
				{ signal: controller.signal },
			);
			clearTimeout(timeout);

			if (!res.ok) {
				return `The LeetCode stats API returned status ${res.status}. Tell the user you can't fetch live LeetCode stats right now but they can check the coding profiles section.`;
			}

			const text = await res.text();
			let data: any;
			try {
				data = JSON.parse(text);
			} catch (e) {
				return `The LeetCode API returned an invalid response (likely an HTML error page). Tell the user the service is temporarily down.`;
			}

			if (data.errors || data.status === 'error') {
				return `LeetCode account "${username}" not found or private.`;
			}

			// Format for the LLM — adapt to alfa-leetcode-api response shape
			let result = `LeetCode Profile: ${username}\n`;
			result += `Total Solved: ${data.totalSolved ?? 'N/A'} / ${data.totalQuestions ?? 'N/A'}`;
			if (data.ranking) result += ` (Global Ranking: ${data.ranking})`;
			result += '\n';
			result += `Difficulty Breakdown:\n`;
			result += `- Easy: ${data.easySolved ?? 'N/A'} / ${data.totalEasy ?? '?'}\n`;
			result += `- Medium: ${data.mediumSolved ?? 'N/A'} / ${data.totalMedium ?? '?'}\n`;
			result += `- Hard: ${data.hardSolved ?? 'N/A'} / ${data.totalHard ?? '?'}\n`;

			if (data.acceptanceRate) {
				result += `Acceptance Rate: ${data.acceptanceRate}%\n`;
			}
			if (data.contributionPoints) {
				result += `Contribution Points: ${data.contributionPoints}\n`;
			}
			if (data.reputation !== undefined) {
				result += `Reputation: ${data.reputation}\n`;
			}

			return result;
		} catch (error: any) {
			console.error('[leetcode.tool] Error:', error);
			if (error?.name === 'AbortError') {
				return 'LeetCode API timed out. Tell the user the service is slow right now, but they can check the coding profiles section on the portfolio.';
			}
			return `Error fetching LeetCode data: ${error.message}. Tell the user to check the coding profiles section instead.`;
		}
	},
	{
		name: 'get_leetcode_stats',
		description:
			"Fetch Anurag's live LeetCode competitive programming stats (problems solved, ranking, etc).",
		schema: z.object({
			username: z
				.string()
				.default('avijit-basuri')
				.describe('The LeetCode username to fetch. Always defaults to "avijit-basuri".'),
		}),
	},
);
