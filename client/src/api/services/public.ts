import { apiClient } from '../client';
import { withFallback } from '../fallback/with-fallback';
import {
	FALLBACK_PROFILE,
	FALLBACK_PROJECTS,
	FALLBACK_JOURNEY,
	FALLBACK_ACHIEVEMENTS,
	FALLBACK_CERTIFICATIONS,
	FALLBACK_BLOG_POSTS,
	FALLBACK_README,
} from '../fallback';
import type {
	Project,
	JourneyEntry,
	Achievement,
	Certification,
	BlogPost,
	AboutData,
	CodingStats,
	ReadmeData,
} from '@/api/schema';

// Public-facing API service — falls back to hardcoded data if backend is unreachable

async function getProfile() {
	return withFallback(() => apiClient.get<AboutData>('/profile'), FALLBACK_PROFILE, 'profile');
}

async function getProjects() {
	return withFallback(() => apiClient.get<Project[]>('/projects'), FALLBACK_PROJECTS, 'projects');
}

async function getProjectBySlug(slug: string) {
	const fallbackProject = FALLBACK_PROJECTS.find(p => p.slug === slug) || FALLBACK_PROJECTS[0];
	return withFallback(
		() => apiClient.get<Project>(`/projects/${slug}`),
		fallbackProject,
		`project:${slug}`,
	);
}

async function getJourney() {
	return withFallback(
		() => apiClient.get<JourneyEntry[]>('/journey'),
		FALLBACK_JOURNEY,
		'journey',
	);
}

async function getAchievements() {
	return withFallback(
		() => apiClient.get<Achievement[]>('/achievements'),
		FALLBACK_ACHIEVEMENTS,
		'achievements',
	);
}

async function getCertifications() {
	return withFallback(
		() => apiClient.get<Certification[]>('/certifications'),
		FALLBACK_CERTIFICATIONS,
		'certifications',
	);
}

async function getBlogPosts() {
	return withFallback(() => apiClient.get<BlogPost[]>('/blog'), FALLBACK_BLOG_POSTS, 'blog');
}

async function getBlogPostBySlug(slug: string) {
	const fallbackPost = FALLBACK_BLOG_POSTS.find(p => p.slug === slug) || FALLBACK_BLOG_POSTS[0];
	return withFallback(
		() => apiClient.get<BlogPost>(`/blog/${slug}`),
		fallbackPost,
		`blog:${slug}`,
	);
}

async function submitContact(data: {
	name: string;
	email: string;
	subject: string;
	message: string;
}): Promise<null> {
	return apiClient.post<null>('/contact', data);
}

const EMPTY_PLATFORM = { username: '', url: '', stats: undefined };
const FALLBACK_CODING_STATS: CodingStats = {
	leetcode: EMPTY_PLATFORM,
	codeforces: EMPTY_PLATFORM,
	github: EMPTY_PLATFORM,
};

async function getCodingStats() {
	return withFallback(() => apiClient.get<CodingStats>('/coding-stats'), FALLBACK_CODING_STATS, 'coding-stats');
}

async function getReadme() {
	return withFallback(() => apiClient.get<ReadmeData>('/docs/readme'), FALLBACK_README, 'readme');
}

export const publicService = {
	getProfile,
	getProjects,
	getProjectBySlug,
	getJourney,
	getAchievements,
	getCertifications,
	getBlogPosts,
	getBlogPostBySlug,
	getCodingStats,
	submitContact,
	getReadme,
};
