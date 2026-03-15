import type { ApiSuccessResponse, ApiErrorResponse } from './types';

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

// Token management — set by auth hook, read by client
let tokenStore = {
	getAccess: (): string | null => null,
	getRefresh: (): string | null => null,
	setTokens: (_access: string, _refresh: string) => {},
	clearTokens: () => {},
};

export function setTokenStore(store: typeof tokenStore): void {
	tokenStore = store;
}

// Track whether a refresh is in-flight (prevents concurrent refresh loops)
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
	if (isRefreshing && refreshPromise) return refreshPromise;

	isRefreshing = true;
	refreshPromise = (async () => {
		const refreshToken = tokenStore.getRefresh();
		if (!refreshToken) return false;

		try {
			const response = await fetch(`${API_BASE}/auth/refresh`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refreshToken }),
			});

			if (!response.ok) return false;

			const json = (await response.json()) as ApiSuccessResponse<{
				accessToken: string;
				refreshToken: string;
			}>;
			tokenStore.setTokens(json.data.accessToken, json.data.refreshToken);
			return true;
		} catch {
			return false;
		} finally {
			isRefreshing = false;
			refreshPromise = null;
		}
	})();

	return refreshPromise;
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
		isFormData?: boolean;
	} = {},
): Promise<T> {
	const {
		body,
		headers = {},
		timeout = REQUEST_TIMEOUT,
		auth = false,
		isFormData = false,
	} = options;

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	const reqHeaders: Record<string, string> = { ...headers };

	// Don't set Content-Type for FormData — browser sets it with boundary
	if (!isFormData) {
		reqHeaders['Content-Type'] = 'application/json';
	}

	if (auth) {
		const token = tokenStore.getAccess();
		if (token) reqHeaders['Authorization'] = `Bearer ${token}`;
	}

	try {
		const response = await fetch(`${API_BASE}${endpoint}`, {
			method,
			headers: reqHeaders,
			body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		// Handle 204 No Content
		if (response.status === 204) return undefined as T;

		const json = await response.json();

		// Auto-refresh on 401 (once)
		if (response.status === 401 && auth && !isRefreshing) {
			const refreshed = await attemptRefresh();
			if (refreshed) {
				return request<T>(method, endpoint, options);
			}
			// Refresh failed — clear tokens, let error propagate
			tokenStore.clearTokens();
		}

		if (!response.ok) {
			const errorBody = json as ApiErrorResponse;
			throw new ApiClientError(
				response.status,
				errorBody.error?.message || response.statusText,
				errorBody.error?.details,
			);
		}

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
	get: <T>(endpoint: string, auth = false) => request<T>('GET', endpoint, { auth }),

	post: <T>(endpoint: string, body: unknown, auth = false) =>
		request<T>('POST', endpoint, { body, auth }),

	put: <T>(endpoint: string, body: unknown, auth = true) =>
		request<T>('PUT', endpoint, { body, auth }),

	patch: <T>(endpoint: string, body: unknown, auth = true) =>
		request<T>('PATCH', endpoint, { body, auth }),

	del: <T = void>(endpoint: string, auth = true) => request<T>('DELETE', endpoint, { auth }),

	upload: <T>(endpoint: string, formData: FormData, auth = true) =>
		request<T>('POST', endpoint, { body: formData, auth, isFormData: true, timeout: 30000 }),
};
