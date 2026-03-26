import { Router, Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { getReadme } from '../controllers/docs.controller';
import { llmInfo } from '../modules/agent/core/llm.factory';

const router = Router();

// ─── API Documentation Manifest ─────────────────────────────────

const API_DOCS = {
	version: 'v1',
	baseUrl: '/api/v1',
	endpoints: {
		// ─── Public ─────────────────────────────────────────────
		public: [
			{ method: 'GET', path: '/health', description: 'Health check' },
			{ method: 'GET', path: '/profile', description: 'Get public profile' },
			{ method: 'GET', path: '/projects', description: 'List published projects' },
			{ method: 'GET', path: '/projects/:id', description: 'Get project by id' },
			{ method: 'GET', path: '/journey', description: 'List journey entries' },
			{ method: 'GET', path: '/achievements', description: 'List achievements' },
			{ method: 'GET', path: '/certifications', description: 'List certifications' },
			{ method: 'GET', path: '/blog', description: 'List published blog posts' },
			{ method: 'GET', path: '/blog/:id', description: 'Get blog post by id' },
			{
				method: 'POST',
				path: '/contact',
				description: 'Submit contact message (rate-limited)',
			},
		],

		// ─── AI Agent ───────────────────────────────────────────
		agent: [
			{
				method: 'POST',
				path: '/chat',
				description: 'Send a message to the AI Agent (rate-limited: 15/min)',
				body: {
					message: 'string (required, max 1000 chars)',
					sessionId: 'string (required — persistent browser ID)',
					currentUrl: 'string (optional — page the user is viewing)',
				},
				response: {
					reply: 'string — Agent markdown response',
					intents: '[] — Reserved for future use',
					sessionId: 'string — Echo of the session ID',
				},
				notes: [
					'The Agent uses a dual-LLM architecture with automatic failover',
					'Supports autonomous tool execution (GitHub, LeetCode, Portfolio search, Contact)',
					'May include [NAVIGATE:/path] tokens for client-side routing',
					'All errors return HTTP 200 with a graceful fallback reply — never crashes',
				],
			},
			{
				method: 'POST',
				path: '/chat/reset',
				description: 'Clear the Agent session memory for a given session ID',
				body: { sessionId: 'string (required)' },
				response: { cleared: 'boolean' },
			},
		],

		// ─── Auth ───────────────────────────────────────────────
		auth: [
			{ method: 'POST', path: '/auth/login', description: 'Admin login' },
			{ method: 'POST', path: '/auth/refresh', description: 'Refresh access token' },
			{ method: 'POST', path: '/auth/logout', description: 'Logout (discard tokens)' },
			{ method: 'GET', path: '/auth/me', description: 'Get current admin info', auth: true },
		],

		// ─── Admin ──────────────────────────────────────────────
		admin: [
			{ method: 'GET', path: '/admin/profile', description: 'Get admin profile', auth: true },
			{ method: 'PUT', path: '/admin/profile', description: 'Update profile', auth: true },
			{
				method: 'GET',
				path: '/admin/profile/social-links',
				description: 'List social links',
				auth: true,
			},
			{
				method: 'POST',
				path: '/admin/profile/social-links',
				description: 'Create social link',
				auth: true,
			},
			{
				method: 'PUT',
				path: '/admin/profile/social-links/:id',
				description: 'Update social link',
				auth: true,
			},
			{
				method: 'DELETE',
				path: '/admin/profile/social-links/:id',
				description: 'Delete social link',
				auth: true,
			},
			{
				method: 'GET',
				path: '/admin/projects',
				description: 'List all projects',
				auth: true,
			},
			{ method: 'POST', path: '/admin/projects', description: 'Create project', auth: true },
			{
				method: 'PUT',
				path: '/admin/projects/:id',
				description: 'Update project',
				auth: true,
			},
			{
				method: 'PATCH',
				path: '/admin/projects/:id/status',
				description: 'Update project status',
				auth: true,
			},
			{
				method: 'POST',
				path: '/admin/projects/:id/thumbnail',
				description: 'Upload project thumbnail',
				auth: true,
			},
			{
				method: 'POST',
				path: '/admin/projects/:id/images',
				description: 'Append project images',
				auth: true,
			},
			{
				method: 'PUT',
				path: '/admin/projects/:id/images',
				description: 'Replace project images',
				auth: true,
			},
			{
				method: 'DELETE',
				path: '/admin/projects/:id/images',
				description: 'Delete project images',
				auth: true,
			},
			{
				method: 'DELETE',
				path: '/admin/projects/:id',
				description: 'Delete project',
				auth: true,
			},
			{
				method: 'GET',
				path: '/admin/journey',
				description: 'List journey entries',
				auth: true,
			},
			{
				method: 'POST',
				path: '/admin/journey',
				description: 'Create journey entry',
				auth: true,
			},
			{
				method: 'PUT',
				path: '/admin/journey/:id',
				description: 'Update journey entry',
				auth: true,
			},
			{
				method: 'PATCH',
				path: '/admin/journey/reorder',
				description: 'Reorder journey entries',
				auth: true,
			},
			{
				method: 'GET',
				path: '/admin/journey/:id/documents',
				description: 'List journey documents',
				auth: true,
			},
			{
				method: 'POST',
				path: '/admin/journey/:id/documents',
				description: 'Create journey document',
				auth: true,
			},
			{
				method: 'PUT',
				path: '/admin/journey/documents/:id',
				description: 'Update journey document',
				auth: true,
			},
			{
				method: 'DELETE',
				path: '/admin/journey/documents/:id',
				description: 'Delete journey document',
				auth: true,
			},
			{
				method: 'DELETE',
				path: '/admin/journey/:id',
				description: 'Delete journey entry',
				auth: true,
			},
			{
				method: 'GET',
				path: '/admin/achievements',
				description: 'List achievements',
				auth: true,
			},
			{
				method: 'POST',
				path: '/admin/achievements',
				description: 'Create achievement',
				auth: true,
			},
			{
				method: 'PUT',
				path: '/admin/achievements/:id',
				description: 'Update achievement',
				auth: true,
			},
			{
				method: 'PATCH',
				path: '/admin/achievements/reorder',
				description: 'Reorder achievements',
				auth: true,
			},
			{
				method: 'POST',
				path: '/admin/achievements/:id/proof',
				description: 'Upload achievement proof',
				auth: true,
			},
			{
				method: 'DELETE',
				path: '/admin/achievements/:id/proof',
				description: 'Delete achievement proof',
				auth: true,
			},
			{
				method: 'DELETE',
				path: '/admin/achievements/:id',
				description: 'Delete achievement',
				auth: true,
			},
			{
				method: 'GET',
				path: '/admin/certifications',
				description: 'List certifications',
				auth: true,
			},
			{
				method: 'POST',
				path: '/admin/certifications',
				description: 'Create certification',
				auth: true,
			},
			{
				method: 'PUT',
				path: '/admin/certifications/:id',
				description: 'Update certification',
				auth: true,
			},
			{
				method: 'POST',
				path: '/admin/certifications/:id/certificate',
				description: 'Upload certification file',
				auth: true,
			},
			{
				method: 'DELETE',
				path: '/admin/certifications/:id/certificate',
				description: 'Delete certification file',
				auth: true,
			},
			{
				method: 'DELETE',
				path: '/admin/certifications/:id',
				description: 'Delete certification',
				auth: true,
			},
			{ method: 'GET', path: '/admin/blog', description: 'List all blog posts', auth: true },
			{ method: 'POST', path: '/admin/blog', description: 'Create blog post', auth: true },
			{ method: 'PUT', path: '/admin/blog/:id', description: 'Update blog post', auth: true },
			{
				method: 'PATCH',
				path: '/admin/blog/:id/status',
				description: 'Update blog post status',
				auth: true,
			},
			{
				method: 'POST',
				path: '/admin/blog/:id/cover',
				description: 'Upload blog cover image',
				auth: true,
			},
			{
				method: 'POST',
				path: '/admin/blog/:id/images',
				description: 'Append blog images',
				auth: true,
			},
			{
				method: 'PUT',
				path: '/admin/blog/:id/images',
				description: 'Replace blog images',
				auth: true,
			},
			{
				method: 'DELETE',
				path: '/admin/blog/:id/images',
				description: 'Delete blog images',
				auth: true,
			},
			{
				method: 'DELETE',
				path: '/admin/blog/:id',
				description: 'Delete blog post',
				auth: true,
			},
			{
				method: 'GET',
				path: '/admin/messages',
				description: 'List contact messages (paginated)',
				auth: true,
			},
			{
				method: 'GET',
				path: '/admin/messages/:id',
				description: 'Get message (marks as read)',
				auth: true,
			},
			{
				method: 'DELETE',
				path: '/admin/messages/:id',
				description: 'Delete message',
				auth: true,
			},
			{
				method: 'GET',
				path: '/admin/agent-sessions',
				description: 'List AI Agent chat sessions (paginated)',
				auth: true,
			},
			{
				method: 'DELETE',
				path: '/admin/agent-sessions/:id',
				description: 'Delete AI Agent session',
				auth: true,
			},
		],

		// ─── Docs ───────────────────────────────────────────────
		docs: [
			{ method: 'GET', path: '/docs', description: 'This API documentation manifest' },
			{ method: 'GET', path: '/docs/readme', description: 'Project README.md contents' },
			{ method: 'GET', path: '/docs/agent', description: 'Live AI Agent architecture status' },
		],
	},
};

// ─── Routes ─────────────────────────────────────────────────────

router.get('/docs', (_req: Request, res: Response) => {
	ApiResponse.ok(res, API_DOCS, 'API documentation');
});

router.get('/docs/readme', getReadme);

/**
 * Live AI Agent Architecture Status
 * Returns real-time info about which LLMs are configured, their mode, and available tools.
 */
router.get('/docs/agent', (_req: Request, res: Response) => {
	ApiResponse.ok(
		res,
		{
			architecture: {
				mode: llmInfo.mode,
				primary: {
					provider: llmInfo.primaryProvider || null,
					model: llmInfo.primaryModel || null,
				},
				fallback: {
					provider: llmInfo.fallbackProvider || null,
					model: llmInfo.fallbackModel || null,
				},
				features: [
					'Dual-LLM with automatic failover',
					'Sticky fallback — if primary fails once in a request, all subsequent loops use fallback',
					'30-second timeout per LLM invocation',
					'Persistent session memory (PostgreSQL)',
					'Screen-aware context injection (currentUrl)',
					'Autonomous navigation via [NAVIGATE:] tokens',
				],
			},
			tools: [
				{
					name: 'get_github_activity',
					description: "Fetch Anurag's GitHub profile stats and recent activity",
				},
				{
					name: 'read_github_readme',
					description: 'Read raw README.md from any public GitHub repository',
				},
				{
					name: 'get_leetcode_stats',
					description: "Fetch Anurag's live LeetCode stats (problems solved, ranking)",
				},
				{
					name: 'search_projects',
					description: 'Search published portfolio projects by keyword',
				},
				{
					name: 'submit_contact_lead',
					description: 'Submit a contact message from the chat interface',
				},
			],
			errorHandling: {
				strategy: 'Graceful degradation — all errors return HTTP 200 with a friendly fallback reply',
				categories: ['RATE_LIMIT', 'TIMEOUT', 'NETWORK', 'INTERNAL'],
				note: 'The Agent never returns HTTP 500 to the frontend',
			},
		},
		'AI Agent architecture status',
	);
});

export default router;
