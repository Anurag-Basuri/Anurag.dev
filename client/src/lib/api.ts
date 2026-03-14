import {
	Project,
	JourneyEntry,
	Achievement,
	BlogPost,
	ContactMessage,
	AboutData,
	Certification,
	CodingStats,
} from '@/types/schema';
import { PROJECTS } from '@/data/projects';
import { JOURNEY } from '@/data/journey';
import { ACHIEVEMENTS } from '@/data/achievements';
import { BLOG_POSTS } from '@/data/blog';
import { PROFILE } from '@/data/profile';
import { CERTIFICATIONS } from '@/data/certifications';
import { CODING_PROFILES } from '@/data/coding-profiles';

export type {
	Project,
	JourneyEntry,
	Achievement,
	BlogPost,
	ContactMessage,
	AboutData,
	Certification,
	CodingStats,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Circuit Breaker Configuration
const CIRCUIT_BREAKER_CONFIG = {
	FAILURE_THRESHOLD: 3, // Number of failures before opening circuit
	RESET_TIMEOUT: 60000, // Wait 1 minute before trying backend again
	REQUEST_TIMEOUT: 3000, // 3s before aborting a request
};

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
	private failures: number = 0;
	private circuitOpen: boolean = false;
	private nextTry: number = 0;
	private isOnline: boolean = false; // Optimistic initial state, updates on interaction

	// Returns the current status of the API service
	public getStatus(): { online: boolean; usingFallback: boolean } {
		return {
			online: this.isOnline,
			usingFallback: this.circuitOpen,
		};
	}

	// Main wrapper for data fetching with Circuit Breaker pattern.
	private async fetchWithFallback<T>(endpoint: string, fallbackData: T): Promise<T> {
		const now = Date.now();

		// 1. Fast Fail: If circuit is open and we haven't waited long enough, return fallback immediately.
		if (this.circuitOpen) {
			if (now < this.nextTry) {
				return fallbackData;
			} else {
				// Cooldown over, let's try one request to see if it's back
				this.circuitOpen = false;
				this.failures = 0;
			}
		}

		try {
			// 2. Attempt Request
			const controller = new AbortController();
			const timeoutId = setTimeout(
				() => controller.abort(),
				CIRCUIT_BREAKER_CONFIG.REQUEST_TIMEOUT,
			);

			const response = await fetch(`${API_BASE_URL}${endpoint}`, {
				signal: controller.signal,
				headers: {
					'Content-Type': 'application/json',
				},
				cache: 'no-store',
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`API Error: ${response.statusText}`);
			}

			// 3. Success: Reset failure counters
			const data = await response.json();
			this.failures = 0;
			this.isOnline = true;
			return data as T;
		} catch (error) {
			const errorType = classifyError(error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';

			// 4. Handle Failure
			this.failures++;

			if (this.failures >= CIRCUIT_BREAKER_CONFIG.FAILURE_THRESHOLD) {
				this.circuitOpen = true;
				this.nextTry = Date.now() + CIRCUIT_BREAKER_CONFIG.RESET_TIMEOUT;
				this.isOnline = false;
				console.warn(
					`[Circuit Breaker] Opened. Backend considered offline for ${
						CIRCUIT_BREAKER_CONFIG.RESET_TIMEOUT / 1000
					}s. Reason: ${errorMessage}`,
				);
			} else {
				console.warn(
					`[API:${errorType}] ${endpoint} failed (${this.failures}/${CIRCUIT_BREAKER_CONFIG.FAILURE_THRESHOLD}): ${errorMessage}`,
				);
			}

			return fallbackData;
		}
	}

	async getProjects(): Promise<Project[]> {
		return this.fetchWithFallback<Project[]>('/projects', PROJECTS);
	}

	async getJourney(): Promise<JourneyEntry[]> {
		return this.fetchWithFallback<JourneyEntry[]>('/journey', JOURNEY);
	}

	async getAchievements(): Promise<Achievement[]> {
		return this.fetchWithFallback<Achievement[]>('/achievements', ACHIEVEMENTS);
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
		if (this.circuitOpen) {
			return {
				success: false,
				message: 'System is offline. Message recorded locally (Simulated).',
			};
		}

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

			// Special handling for contact form: We don't necessarily want to open the circuit just for one failed POST,
			// but we can if we want to be strict. For now, just return error.
			return {
				success: false,
				message:
					errorType === 'TIMEOUT'
						? 'Request timed out. Please try again.'
						: 'Unable to reach server. Please try again later.',
			};
		}
	}
}

export const api = new ApiService();
