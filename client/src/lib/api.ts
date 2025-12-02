const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Project {
	id: string;
	title: string;
	description: string;
	techStack: string[];
	githubUrl?: string;
	liveUrl?: string;
	status: string;
	stars?: number;
	forks?: number;
	commits?: number;
	createdAt: string;
	updatedAt: string;
}

export interface JourneyEntry {
	id: string;
	year: number;
	title: string;
	description: string;
	category: string;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface BlogPost {
	id: string;
	title: string;
	slug: string;
	content: string;
	tags: string[];
	status: string;
	publishedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface ContactFormData {
	name: string;
	email: string;
	subject?: string;
	message: string;
}

export interface AboutData {
	name: string;
	tagline: string;
	short: string;
	skills: {
		frontend: string[];
		backend: string[];
		ml: string[];
	};
}

import { toast } from 'react-hot-toast';
import { mockProjects, mockAbout, mockJourney, mockBlogPosts } from './mockData';

class ApiClient {
	private baseUrl: string;
    private hasShownError: boolean = false;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

    private getMockData(endpoint: string): any {
        if (endpoint.includes('/projects')) return { projects: mockProjects };
        if (endpoint.includes('/about')) return mockAbout;
        if (endpoint.includes('/journey')) return { items: mockJourney };
        if (endpoint.includes('/blog')) return { posts: mockBlogPosts };
        if (endpoint.includes('/health')) return { status: 'offline', timestamp: new Date().toISOString(), environment: 'development' };
        return null;
    }

	private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;

		try {
			const response = await fetch(url, {
				...options,
				headers: {
					'Content-Type': 'application/json',
					...options?.headers,
				},
			});

			if (!response.ok) {
				const error = await response.json().catch(() => ({}));
				throw new Error(error.error?.message || `HTTP ${response.status}`);
			}

			return response.json();
		} catch (error) {
			console.error(`API Error (${endpoint}):`, error);
            
            // Fallback to mock data
            const mockData = this.getMockData(endpoint);
            if (mockData) {
                if (!this.hasShownError) {
                    toast.error('Backend unreachable. Showing demo data.', {
                        id: 'backend-error', // Prevent duplicates
                        duration: 5000,
                    });
                    this.hasShownError = true;
                }
                return mockData as T;
            }

			throw error;
		}
	}

	// Health check
	async healthCheck(): Promise<{ status: string; timestamp: string; environment: string }> {
		return this.request('/api/health');
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
        // For individual project, we filter from mock data if request fails
        try {
		    return await this.request(`/api/projects/${id}`);
        } catch (error) {
            const project = mockProjects.find(p => p.id === id);
            if (project) return project;
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
        } catch (error) {
            toast.success('Offline mode: Message logged to console.');
            console.log('Offline Contact Submission:', data);
            return { ok: true, id: 'offline-' + Date.now() };
        }
	}
}

export const api = new ApiClient(API_URL);
