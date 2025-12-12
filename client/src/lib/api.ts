import {
	Project,
	JourneyEntry,
	BlogPost,
	ContactMessage,
	AboutData,
	Certification,
} from '@/types/schema';
import {
	FALLBACK_PROJECTS,
	FALLBACK_JOURNEY,
	FALLBACK_BLOGS,
	FALLBACK_ABOUT,
	FALLBACK_CERTIFICATIONS,
} from '@/lib/data/fallback';

export type { Project, JourneyEntry, BlogPost, ContactMessage, AboutData, Certification };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
	private async fetchWithFallback<T>(endpoint: string, fallbackData: T): Promise<T> {
		try {
			// Set a short timeout for the check so we don't block the UI too long
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

			const response = await fetch(`${API_BASE_URL}${endpoint}`, {
				signal: controller.signal,
				headers: {
					'Content-Type': 'application/json',
				},
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`API Error: ${response.statusText}`);
			}

			const data = await response.json();
			return data as T;
		} catch (error) {
			console.warn(`[API] Connection failed for ${endpoint}. Using fallback data.`, error);
			return fallbackData;
		}
	}

	async getProjects(): Promise<Project[]> {
		return this.fetchWithFallback<Project[]>('/projects', FALLBACK_PROJECTS);
	}

	async getJourney(): Promise<JourneyEntry[]> {
		return this.fetchWithFallback<JourneyEntry[]>('/journey', FALLBACK_JOURNEY);
	}

	async getBlogPosts(): Promise<BlogPost[]> {
		return this.fetchWithFallback<BlogPost[]>('/blog', FALLBACK_BLOGS);
	}

	async getAbout(): Promise<AboutData> {
		return this.fetchWithFallback<AboutData>('/about', FALLBACK_ABOUT);
	}

	async getCertifications(): Promise<Certification[]> {
		return this.fetchWithFallback<Certification[]>('/certifications', FALLBACK_CERTIFICATIONS);
	}

	async submitContact(data: ContactMessage): Promise<{ success: boolean; message: string }> {
		try {
			const response = await fetch(`${API_BASE_URL}/contact`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) throw new Error('Failed to send message');

			return { success: true, message: 'Message sent successfully!' };
		} catch (error) {
			console.warn('[API] Failed to submit contact form.', error);
			return { success: false, message: 'Offline mode: Message logged (simulated).' };
		}
	}
}

export const api = new ApiService();
