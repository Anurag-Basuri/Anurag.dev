import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const REQUEST_TIMEOUT = 5000;

// Custom error class for API failures
export class ApiClientError extends Error {
	public readonly status: number;
	public readonly details?: unknown;

	constructor(status: number, message: string, details?: unknown) {
		super(message);
		this.name = 'ApiClientError';
		this.status = status;
		this.details = details;
	}
}

// Token accessor — set by auth store, read by client
let getToken: (() => string | null) | null = null;

export function setTokenAccessor(accessor: () => string | null): void {
	getToken = accessor;
}

// Core fetch wrapper
async function request<T>(
	method: string,
	endpoint: string,
	options: {
		body?: unknown;
		headers?: Record<string, string>;
		timeout?: number;
		auth?: boolean;
	} = {},
): Promise<T> {
	const { body, headers = {}, timeout = REQUEST_TIMEOUT, auth = false } = options;

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	const reqHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
		...headers,
	};

	// Attach auth token if required
	if (auth && getToken) {
		const token = getToken();
		if (token) {
			reqHeaders['Authorization'] = `Bearer ${token}`;
		}
	}

	try {
		const response = await fetch(`${API_BASE}${endpoint}`, {
			method,
			headers: reqHeaders,
			body: body ? JSON.stringify(body) : undefined,
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		// Handle 204 No Content
		if (response.status === 204) {
			return undefined as T;
		}

		const json = await response.json();

		if (!response.ok) {
			const errorBody = json as ApiErrorResponse;
			throw new ApiClientError(
				response.status,
				errorBody.error?.message || response.statusText,
				errorBody.error?.details,
			);
		}

		// Unwrap the { success, data } envelope
		const successBody = json as ApiSuccessResponse<T>;
		return successBody.data;
	} catch (error) {
		clearTimeout(timeoutId);

		if (error instanceof ApiClientError) throw error;

		if (error instanceof Error && error.name === 'AbortError') {
			throw new ApiClientError(408, 'Request timed out');
		}

		throw new ApiClientError(0, error instanceof Error ? error.message : 'Network error');
	}
}

// Public API methods
export const apiClient = {
	get: <T>(endpoint: string, auth = false) =>
		request<T>('GET', endpoint, { auth }),

	post: <T>(endpoint: string, body: unknown, auth = false) =>
		request<T>('POST', endpoint, { body, auth }),

	put: <T>(endpoint: string, body: unknown, auth = true) =>
		request<T>('PUT', endpoint, { body, auth }),

	patch: <T>(endpoint: string, body: unknown, auth = true) =>
		request<T>('PATCH', endpoint, { body, auth }),

	del: <T = void>(endpoint: string, auth = true) =>
		request<T>('DELETE', endpoint, { auth }),
};
