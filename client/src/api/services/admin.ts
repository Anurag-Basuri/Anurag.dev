import { apiClient } from '../client';
import type {
	Project,
	JourneyEntry,
	Achievement,
	Certification,
	BlogPost,
	AboutData,
	ContactMessage,
} from '@/types/schema';

// Admin API service — all endpoints require auth

// Profile
async function getProfile(): Promise<AboutData> {
	return apiClient.get<AboutData>('/admin/profile', true);
}

async function updateProfile(data: Partial<AboutData>): Promise<AboutData> {
	return apiClient.put<AboutData>('/admin/profile', data);
}

// Projects
async function getProjects(): Promise<Project[]> {
	return apiClient.get<Project[]>('/admin/projects', true);
}

async function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
	return apiClient.post<Project>('/admin/projects', data, true);
}

async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
	return apiClient.put<Project>(`/admin/projects/${id}`, data);
}

async function updateProjectStatus(id: string, status: Project['status']): Promise<Project> {
	return apiClient.patch<Project>(`/admin/projects/${id}/status`, { status });
}

async function deleteProject(id: string): Promise<void> {
	await apiClient.del(`/admin/projects/${id}`);
}

// Journey
async function getJourney(): Promise<JourneyEntry[]> {
	return apiClient.get<JourneyEntry[]>('/admin/journey', true);
}

async function createJourney(data: Omit<JourneyEntry, 'id'>): Promise<JourneyEntry> {
	return apiClient.post<JourneyEntry>('/admin/journey', data, true);
}

async function updateJourney(id: string, data: Partial<JourneyEntry>): Promise<JourneyEntry> {
	return apiClient.put<JourneyEntry>(`/admin/journey/${id}`, data);
}

async function reorderJourney(items: { id: string; order: number }[]): Promise<null> {
	return apiClient.patch<null>('/admin/journey/reorder', { items });
}

async function deleteJourney(id: string): Promise<void> {
	await apiClient.del(`/admin/journey/${id}`);
}

// Achievements
async function getAchievements(): Promise<Achievement[]> {
	return apiClient.get<Achievement[]>('/admin/achievements', true);
}

async function createAchievement(data: Omit<Achievement, 'id'>): Promise<Achievement> {
	return apiClient.post<Achievement>('/admin/achievements', data, true);
}

async function updateAchievement(id: string, data: Partial<Achievement>): Promise<Achievement> {
	return apiClient.put<Achievement>(`/admin/achievements/${id}`, data);
}

async function reorderAchievements(items: { id: string; order: number }[]): Promise<null> {
	return apiClient.patch<null>('/admin/achievements/reorder', { items });
}

async function deleteAchievement(id: string): Promise<void> {
	await apiClient.del(`/admin/achievements/${id}`);
}

// Certifications
async function getCertifications(): Promise<Certification[]> {
	return apiClient.get<Certification[]>('/admin/certifications', true);
}

async function createCertification(data: Omit<Certification, 'id'>): Promise<Certification> {
	return apiClient.post<Certification>('/admin/certifications', data, true);
}

async function updateCertification(id: string, data: Partial<Certification>): Promise<Certification> {
	return apiClient.put<Certification>(`/admin/certifications/${id}`, data);
}

async function deleteCertification(id: string): Promise<void> {
	await apiClient.del(`/admin/certifications/${id}`);
}

// Blog
async function getBlogPosts(): Promise<BlogPost[]> {
	return apiClient.get<BlogPost[]>('/admin/blog', true);
}

async function createBlogPost(data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost> {
	return apiClient.post<BlogPost>('/admin/blog', data, true);
}

async function updateBlogPost(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
	return apiClient.put<BlogPost>(`/admin/blog/${id}`, data);
}

async function updateBlogPostStatus(id: string, status: BlogPost['status']): Promise<BlogPost> {
	return apiClient.patch<BlogPost>(`/admin/blog/${id}/status`, { status });
}

async function deleteBlogPost(id: string): Promise<void> {
	await apiClient.del(`/admin/blog/${id}`);
}

// Messages
async function getMessages(page = 1, limit = 20) {
	return apiClient.get<ContactMessage[]>(`/admin/messages?page=${page}&limit=${limit}`, true);
}

async function getMessage(id: string): Promise<ContactMessage> {
	return apiClient.get<ContactMessage>(`/admin/messages/${id}`, true);
}

async function deleteMessage(id: string): Promise<void> {
	await apiClient.del(`/admin/messages/${id}`);
}

export const adminService = {
	getProfile,
	updateProfile,
	getProjects,
	createProject,
	updateProject,
	updateProjectStatus,
	deleteProject,
	getJourney,
	createJourney,
	updateJourney,
	reorderJourney,
	deleteJourney,
	getAchievements,
	createAchievement,
	updateAchievement,
	reorderAchievements,
	deleteAchievement,
	getCertifications,
	createCertification,
	updateCertification,
	deleteCertification,
	getBlogPosts,
	createBlogPost,
	updateBlogPost,
	updateBlogPostStatus,
	deleteBlogPost,
	getMessages,
	getMessage,
	deleteMessage,
};
