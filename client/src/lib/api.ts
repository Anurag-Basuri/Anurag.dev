// API client for backend communication

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

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
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
    return this.request(`/api/projects/${id}`);
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
    return this.request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient(API_URL);
