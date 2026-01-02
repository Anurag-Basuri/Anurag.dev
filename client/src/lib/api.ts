import {
	Project,
	JourneyEntry,
	BlogPost,
	ContactMessage,
	AboutData,
	Certification,
	CodingStats,
} from '@/types/schema';
import { PROJECTS } from '@/data/projects';
import { JOURNEY } from '@/data/journey';
import { BLOG_POSTS } from '@/data/blog';
import { PROFILE } from '@/data/profile';
import { CERTIFICATIONS } from '@/data/certifications';
import { CODING_PROFILES } from '@/data/coding-profiles';

export type {
	Project,
	JourneyEntry,
	BlogPost,
	ContactMessage,
	AboutData,
	Certification,
	CodingStats,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Error type classification for better debugging
function classifyError(error: unknown): string {
	if (error instanceof Error) {
		if (error.name === 'AbortError') return 'TIMEOUT';
		if (error.message.includes('fetch')) return 'NETWORK';
		if (error.message.includes('API Error')) return 'API';
	}
	return 'UNKNOWN';
}

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
			const errorType = classifyError(error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';

			// Log with error classification for easier debugging
			console.warn(`[API:${errorType}] ${endpoint} failed: ${errorMessage}. Using fallback.`);
			return fallbackData;
		}
	}

	async getProjects(): Promise<Project[]> {
		return this.fetchWithFallback<Project[]>('/projects', PROJECTS);
	}

	async getJourney(): Promise<JourneyEntry[]> {
		return this.fetchWithFallback<JourneyEntry[]>('/journey', JOURNEY);
	}

	async getBlogPosts(): Promise<BlogPost[]> {
		return this.fetchWithFallback<BlogPost[]>('/blog', BLOG_POSTS);
	}

	async getAbout(): Promise<AboutData> {
		return this.fetchWithFallback<AboutData>('/about', PROFILE);
	}

	async getCertifications(): Promise<Certification[]> {
		return this.fetchWithFallback<Certification[]>('/certifications', CERTIFICATIONS);
	}

	async getCodingStats(): Promise<CodingStats> {
		return this.fetchWithFallback<CodingStats>('/stats', CODING_PROFILES);
	}

	async submitContact(data: ContactMessage): Promise<{ success: boolean; message: string }> {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout for POST

			const response = await fetch(`${API_BASE_URL}/contact`, {
				method: 'POST',
				signal: controller.signal,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			clearTimeout(timeoutId);

			if (!response.ok) throw new Error('Failed to send message');

			return { success: true, message: 'Message sent successfully!' };
		} catch (error) {
			const errorType = classifyError(error);
			console.warn(`[API:${errorType}] Contact form submission failed.`);

			const message =
				errorType === 'TIMEOUT'
					? 'Request timed out. Please try again.'
					: 'Offline mode: Message logged (simulated).';

			return { success: false, message };
		}
	}
}

export const api = new ApiService();
