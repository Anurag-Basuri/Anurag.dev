import type { MetadataRoute } from 'next';
import { getAllModuleIds, getModulePath } from '@/lib/routes';

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://anuragbasuri.com'; // Update with your actual domain
	const currentDate = new Date();

	// Get all module routes
	const moduleRoutes = getAllModuleIds().map(moduleId => ({
		url: `${baseUrl}${getModulePath(moduleId)}`,
		lastModified: currentDate,
		changeFrequency: 'weekly' as const,
		priority: moduleId === 'about' ? 1.0 : 0.8,
	}));

	return [
		{
			url: baseUrl,
			lastModified: currentDate,
			changeFrequency: 'yearly',
			priority: 1.0,
		},
		{
			url: `${baseUrl}/app`,
			lastModified: currentDate,
			changeFrequency: 'weekly',
			priority: 1.0,
		},
		...moduleRoutes,
	];
}
