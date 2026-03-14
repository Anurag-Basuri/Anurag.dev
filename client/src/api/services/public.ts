import { apiClient } from '../client';
import type {
	Project,
	JourneyEntry,
	Achievement,
	Certification,
	BlogPost,
	AboutData,
} from '@/types/schema';

// Public-facing API service — no auth required

async function getProfile(): Promise<AboutData> {
	return apiClient.get<AboutData>('/profile');
}

async function getProjects(): Promise<Project[]> {
	return apiClient.get<Project[]>('/projects');
}

async function getProjectBySlug(slug: string): Promise<Project> {
	return apiClient.get<Project>(`/projects/${slug}`);
}

async function getJourney(): Promise<JourneyEntry[]> {
	return apiClient.get<JourneyEntry[]>('/journey');
}

async function getAchievements(): Promise<Achievement[]> {
	return apiClient.get<Achievement[]>('/achievements');
}

async function getCertifications(): Promise<Certification[]> {
	return apiClient.get<Certification[]>('/certifications');
}

async function getBlogPosts(): Promise<BlogPost[]> {
	return apiClient.get<BlogPost[]>('/blog');
}

async function getBlogPostBySlug(slug: string): Promise<BlogPost> {
	return apiClient.get<BlogPost>(`/blog/${slug}`);
}

async function submitContact(data: {
	name: string;
	email: string;
	subject: string;
	message: string;
}): Promise<null> {
	return apiClient.post<null>('/contact', data);
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
