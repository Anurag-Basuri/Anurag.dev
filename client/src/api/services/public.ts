import { apiClient } from '../client';
import { withFallback } from '../fallback/with-fallback';
import {
	FALLBACK_PROFILE,
	FALLBACK_PROJECTS,
	FALLBACK_JOURNEY,
	FALLBACK_ACHIEVEMENTS,
	FALLBACK_CERTIFICATIONS,
	FALLBACK_BLOG_POSTS,
} from '../fallback';
import type {
	Project,
	JourneyEntry,
	Achievement,
	Certification,
	BlogPost,
	AboutData,
} from '@/types/schema';

// Public-facing API service — falls back to hardcoded data if backend is unreachable

async function getProfile() {
	return withFallback(
		() => apiClient.get<AboutData>('/profile'),
		FALLBACK_PROFILE,
		'profile',
	);
}

async function getProjects() {
	return withFallback(
		() => apiClient.get<Project[]>('/projects'),
		FALLBACK_PROJECTS,
		'projects',
	);
}

async function getProjectBySlug(slug: string) {
	const fallbackProject = FALLBACK_PROJECTS.find((p) => p.slug === slug) || FALLBACK_PROJECTS[0];
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
	return withFallback(
		() => apiClient.get<BlogPost[]>('/blog'),
		FALLBACK_BLOG_POSTS,
		'blog',
	);
}

async function getBlogPostBySlug(slug: string) {
	const fallbackPost = FALLBACK_BLOG_POSTS.find((p) => p.slug === slug) || FALLBACK_BLOG_POSTS[0];
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
}): Promise<{ data: null; source: 'api' | 'fallback' }> {
	return withFallback(
		() => apiClient.post<null>('/contact', data),
		null,
		'contact',
	);
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
	submitContact,
};
