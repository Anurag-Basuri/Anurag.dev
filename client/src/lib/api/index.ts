const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export * from '@/types/api';
import {
	Project,
	JourneyEntry,
	BlogPost,
	ContactFormData,
	AboutData,
	BackendStatus,
} from '@/types/api';

import { toast } from 'react-hot-toast';
import { mockProjects, mockAbout, mockJourney, mockBlogPosts } from './mockData';

type StatusListener = (status: BackendStatus, info?: { error?: unknown }) => void;

class ApiClient {
	private baseUrl: string;
	private hasShownError: boolean = false;

	// New: observable backend connectivity
	private status: BackendStatus = 'unknown';
	private lastErrorAt?: number;
	private listeners = new Set<StatusListener>();

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;

		if (typeof window !== 'undefined') {
			window.addEventListener('online', () => this.setStatus('online'));
			window.addEventListener('offline', () => this.setStatus('offline'));
		}
	}

	// New: status helpers
	getStatus() {
		return this.status;
	}
	getLastErrorAt() {
		return this.lastErrorAt;
	}
	onStatusChange(listener: StatusListener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}
	private setStatus(next: BackendStatus, info?: { error?: unknown }) {
		if (this.status !== next) {
			this.status = next;
			if (next === 'offline') this.lastErrorAt = Date.now();
			for (const l of this.listeners) l(next, info);
		}
	}

	private getMockData(
		endpoint: string,
	):
		| { projects: Project[] }
		| AboutData
		| { items: JourneyEntry[] }
		| { posts: BlogPost[] }
		| { status: string; timestamp: string; environment: string }
		| null {
		if (endpoint.includes('/projects')) return { projects: mockProjects };
		if (endpoint.includes('/about')) return mockAbout;
		if (endpoint.includes('/journey')) return { items: mockJourney };
		if (endpoint.includes('/blog')) return { posts: mockBlogPosts };
		if (endpoint.includes('/health'))
			return {
				status: 'offline',
				timestamp: new Date().toISOString(),
				environment: 'development',
			};
		return null;
	}

	// Force mock mode for standalone frontend
	private useMockData = true;

	private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
		// 1. If in mock mode or standalone, return mock data immediately
		if (this.useMockData) {
			const mock = this.getMockData(endpoint);
			if (mock) {
				// Simulate network latency for realism
				await new Promise(resolve => setTimeout(resolve, 600));
				return mock as T;
			}
			console.warn(`No mock data found for ${endpoint}`);
			// Fall through to fetch if you want mixed mode, or throw/return null
		}

		const url = `${this.baseUrl}${endpoint}`;

		// Add timeout to avoid hanging requests
		const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
		const timeout =
			typeof window !== 'undefined'
				? window.setTimeout(() => controller?.abort(), 5000)
				: undefined;

		try {
			const response = await fetch(url, {
				...options,
				signal: controller?.signal,
				headers: {
					'Content-Type': 'application/json',
					...options?.headers,
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			// Mark online if we got a good response
			this.setStatus('online');
			return response.json();
		} catch (error) {
			// Silent fallback to mock data if fetch fails (and we didn't use it already)
			const mockData = this.getMockData(endpoint);
			if (mockData) {
				this.setStatus('offline'); // Just track status, don't toast if we have mocks
				return mockData as T;
			}

			// Only log/toast if we truly have NO data
			console.error(`API Error (${endpoint}):`, error);
			this.setStatus('offline', { error });
			throw error;
		} finally {
			if (timeout !== undefined) clearTimeout(timeout);
		}
	}

	// Health check
	async healthCheck(): Promise<{ status: string; timestamp: string; environment: string }> {
		const res = await this.request<{ status: string; timestamp: string; environment: string }>(
			'/api/health',
		);
		// If request succeeds, status already set to 'online'
		return res;
	}

	// About
	async getAbout(): Promise<AboutData> {
		return this.request('/api/about');
	}

	// Projects
	async getProjects(): Promise<{ projects: Project[] }> {
		return this.request('/api/projects');
	}

	async getProject(id: string): Promise<Project> {
		try {
			return await this.request(`/api/projects/${id}`);
		} catch (error) {
			const project = mockProjects.find(p => p.id === id);
			if (project) return project as Project;
			throw error;
		}
	}

	// Journey
	async getJourney(): Promise<{ items: JourneyEntry[] }> {
		return this.request('/api/journey');
	}

	// Blog
	async getBlogPosts(): Promise<{ posts: BlogPost[] }> {
		return this.request('/api/blog');
	}

	// Contact
	async submitContact(data: ContactFormData): Promise<{ ok: boolean; id: string }> {
		try {
			return await this.request('/api/contact', {
				method: 'POST',
				body: JSON.stringify(data),
			});
		} catch {
			toast.success('Demo mode: Message saved locally.');
			console.log('Offline Contact Submission:', data);
			return { ok: true, id: 'offline-' + Date.now() };
		}
	}
}

export const api = new ApiClient(API_URL);

// Optional convenience exports for hooks/components
export const getBackendStatus = () => api.getStatus();
export const getBackendLastErrorAt = () => api.getLastErrorAt();
export const onBackendStatusChange = (listener: StatusListener) => api.onStatusChange(listener);
