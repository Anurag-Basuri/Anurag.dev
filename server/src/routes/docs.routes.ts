import { Router, Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { getReadme } from '../controllers/docs.controller';

const router = Router();

// API documentation manifest
const API_DOCS = {
	version: 'v1',
	baseUrl: '/api/v1',
	endpoints: {
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
		auth: [
			{ method: 'POST', path: '/auth/login', description: 'Admin login' },
			{ method: 'POST', path: '/auth/refresh', description: 'Refresh access token' },
			{ method: 'POST', path: '/auth/logout', description: 'Logout (discard tokens)' },
			{ method: 'GET', path: '/auth/me', description: 'Get current admin info', auth: true },
		],
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
		],
	},
};

router.get('/docs', (_req: Request, res: Response) => {
	ApiResponse.ok(res, API_DOCS, 'API documentation');
});

router.get('/docs/readme', getReadme);

export default router;
