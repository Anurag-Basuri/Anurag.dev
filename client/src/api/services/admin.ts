import { apiClient } from '../client';
import type {
	Project,
	JourneyEntry,
	JourneyDocument,
	Achievement,
	Certification,
	BlogPost,
	AboutData,
	SocialLink,
	ContactMessage,
	AgentSession,
} from '@/api/schema';

// Admin API service — all endpoints require auth

// Profile
async function getProfile(): Promise<AboutData> {
	return apiClient.get<AboutData>('/admin/profile', true);
}

async function updateProfile(data: Partial<AboutData>): Promise<AboutData> {
	return apiClient.put<AboutData>('/admin/profile', data);
}

async function uploadAvatar(file: File): Promise<AboutData> {
	const formData = new FormData();
	formData.append('avatar', file);
	return apiClient.upload<AboutData>('/admin/profile/avatar', formData);
}

async function uploadCover(file: File): Promise<AboutData> {
	const formData = new FormData();
	formData.append('cover', file);
	return apiClient.upload<AboutData>('/admin/profile/cover', formData);
}

async function uploadResume(file: File): Promise<AboutData> {
	const formData = new FormData();
	formData.append('resume', file);
	return apiClient.upload<AboutData>('/admin/profile/resume', formData);
}

// Social Links
async function getSocialLinks(): Promise<SocialLink[]> {
	return apiClient.get<SocialLink[]>('/admin/profile/social-links', true);
}

async function createSocialLink(data: { platform: string; url: string; customLabel?: string }): Promise<SocialLink> {
	return apiClient.post<SocialLink>('/admin/profile/social-links', data, true);
}

async function updateSocialLink(id: string, data: Partial<SocialLink>): Promise<SocialLink> {
	return apiClient.put<SocialLink>(`/admin/profile/social-links/${id}`, data);
}

async function deleteSocialLink(id: string): Promise<void> {
	await apiClient.del(`/admin/profile/social-links/${id}`);
}

// Projects
async function getProjects(): Promise<Project[]> {
	return apiClient.get<Project[]>('/admin/projects', true);
}

async function createProject(
	data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Project> {
	return apiClient.post<Project>('/admin/projects', data, true);
}

async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
	return apiClient.put<Project>(`/admin/projects/${id}`, data);
}

async function updateProjectStatus(id: string, status: Project['status']): Promise<Project> {
	return apiClient.patch<Project>(`/admin/projects/${id}/status`, { status });
}

async function reorderProjects(items: { id: string; order: number }[]): Promise<null> {
	return apiClient.put<null>('/admin/projects/reorder', { items });
}

async function deleteProject(id: string): Promise<void> {
	await apiClient.del(`/admin/projects/${id}`);
}

async function uploadProjectThumbnail(id: string, file: File): Promise<Project> {
	const formData = new FormData();
	formData.append('thumbnail', file);
	return apiClient.upload<Project>(`/admin/projects/${id}/thumbnail`, formData);
}

async function uploadProjectImages(id: string, files: File[]): Promise<Project> {
	const formData = new FormData();
	files.forEach(f => formData.append('images', f));
	return apiClient.upload<Project>(`/admin/projects/${id}/images`, formData);
}

async function replaceProjectImages(id: string, files: File[]): Promise<Project> {
	const formData = new FormData();
	files.forEach(f => formData.append('images', f));
	return apiClient.uploadPut<Project>(`/admin/projects/${id}/images`, formData);
}

async function deleteProjectImages(id: string, urls: string[]): Promise<void> {
	await apiClient.del(`/admin/projects/${id}/images`, { urls });
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

// Journey Documents
async function getJourneyDocuments(entryId: string): Promise<JourneyDocument[]> {
	return apiClient.get<JourneyDocument[]>(`/admin/journey/${entryId}/documents`, true);
}

async function uploadJourneyDocument(
	entryId: string,
	file: File,
	data: { title: string; type: string; issuer?: string; issuedAt?: string; notes?: string },
): Promise<JourneyDocument> {
	const formData = new FormData();
	formData.append('document', file);
	Object.entries(data).forEach(([k, v]) => {
		if (v) formData.append(k, v);
	});
	return apiClient.upload<JourneyDocument>(`/admin/journey/${entryId}/documents`, formData);
}

async function updateJourneyDocument(
	entryId: string,
	docId: string,
	data: Partial<JourneyDocument>,
): Promise<JourneyDocument> {
	return apiClient.put<JourneyDocument>(`/admin/journey/${entryId}/documents/${docId}`, data);
}

async function deleteJourneyDocument(entryId: string, docId: string): Promise<void> {
	await apiClient.del(`/admin/journey/${entryId}/documents/${docId}`);
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

async function uploadAchievementProof(id: string, file: File): Promise<Achievement> {
	const formData = new FormData();
	formData.append('proof', file);
	return apiClient.upload<Achievement>(`/admin/achievements/${id}/proof`, formData);
}

async function deleteAchievementProof(id: string): Promise<void> {
	await apiClient.del(`/admin/achievements/${id}/proof`);
}

// Certifications
async function getCertifications(): Promise<Certification[]> {
	return apiClient.get<Certification[]>('/admin/certifications', true);
}

async function createCertification(data: Omit<Certification, 'id'>): Promise<Certification> {
	return apiClient.post<Certification>('/admin/certifications', data, true);
}

async function updateCertification(
	id: string,
	data: Partial<Certification>,
): Promise<Certification> {
	return apiClient.put<Certification>(`/admin/certifications/${id}`, data);
}

async function reorderCertifications(items: { id: string; order: number }[]): Promise<null> {
	return apiClient.put<null>('/admin/certifications/reorder', { items });
}

async function deleteCertification(id: string): Promise<void> {
	await apiClient.del(`/admin/certifications/${id}`);
}

async function uploadCertificateFile(id: string, file: File): Promise<Certification> {
	const formData = new FormData();
	formData.append('certificate', file);
	return apiClient.upload<Certification>(`/admin/certifications/${id}/certificate`, formData);
}

async function deleteCertificateFile(id: string): Promise<void> {
	await apiClient.del(`/admin/certifications/${id}/certificate`);
}

// Blog
async function getBlogPosts(): Promise<BlogPost[]> {
	return apiClient.get<BlogPost[]>('/admin/blog', true);
}

async function createBlogPost(
	data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<BlogPost> {
	return apiClient.post<BlogPost>('/admin/blog', data, true);
}

async function updateBlogPost(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
	return apiClient.put<BlogPost>(`/admin/blog/${id}`, data);
}

async function updateBlogPostStatus(id: string, status: BlogPost['status']): Promise<BlogPost> {
	return apiClient.patch<BlogPost>(`/admin/blog/${id}/status`, { status });
}

async function reorderBlogPosts(items: { id: string; order: number }[]): Promise<null> {
	return apiClient.put<null>('/admin/blog/reorder', { items });
}

async function deleteBlogPost(id: string): Promise<void> {
	await apiClient.del(`/admin/blog/${id}`);
}

async function uploadBlogCover(id: string, file: File): Promise<BlogPost> {
	const formData = new FormData();
	formData.append('cover', file);
	return apiClient.upload<BlogPost>(`/admin/blog/${id}/cover`, formData);
}

async function uploadBlogImages(id: string, files: File[]): Promise<BlogPost> {
	const formData = new FormData();
	files.forEach(f => formData.append('images', f));
	return apiClient.upload<BlogPost>(`/admin/blog/${id}/images`, formData);
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

// ─── AGENT SESSIONS ────────────────────────────────────────────────────────

async function getAgentSessions(page = 1, limit = 50): Promise<any> {
	return apiClient.get<any>(`/admin/agent-sessions?page=${page}&limit=${limit}`, true);
}

async function deleteAgentSession(id: string): Promise<void> {
	await apiClient.del(`/admin/agent-sessions/${id}`);
}

export const adminService = {
	getProfile,
	updateProfile,
	uploadAvatar,
	uploadCover,
	uploadResume,
	getSocialLinks,
	createSocialLink,
	updateSocialLink,
	deleteSocialLink,
	getProjects,
	createProject,
	updateProject,
	updateProjectStatus,
	reorderProjects,
	deleteProject,
	uploadProjectThumbnail,
	uploadProjectImages,
	replaceProjectImages,
	deleteProjectImages,
	getJourney,
	createJourney,
	updateJourney,
	reorderJourney,
	deleteJourney,
	getJourneyDocuments,
	uploadJourneyDocument,
	updateJourneyDocument,
	deleteJourneyDocument,
	getAchievements,
	createAchievement,
	updateAchievement,
	reorderAchievements,
	deleteAchievement,
	uploadAchievementProof,
	deleteAchievementProof,
	getCertifications,
	createCertification,
	updateCertification,
	reorderCertifications,
	deleteCertification,
	uploadCertificateFile,
	deleteCertificateFile,
	getBlogPosts,
	createBlogPost,
	updateBlogPost,
	updateBlogPostStatus,
	reorderBlogPosts,
	deleteBlogPost,
	uploadBlogCover,
	uploadBlogImages,
	getMessages,
	getMessage,
	deleteMessage,

	// Agent Sessions
	getAgentSessions,
	deleteAgentSession,
};
