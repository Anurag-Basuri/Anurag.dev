import type { ApiSuccessResponse, ApiErrorResponse } from './types';

const _RAW_URL =
	process.env.NEXT_PUBLIC_API_URL ||
	'https://personalportfolio-production-ecaf.up.railway.app/api/v1';
const _NORMALIZED_API_BASE = _RAW_URL.endsWith('/api/v1')
	? _RAW_URL
	: `${_RAW_URL.replace(/\/$/, '')}/api/v1`;
const _IS_BROWSER = typeof window !== 'undefined';
const _IS_PRODUCTION = process.env.NODE_ENV === 'production';
const _IS_LOCALHOST_API = /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3})(?::\d+)?(?:\/|$)/i.test(
	_NORMALIZED_API_BASE,
);

// Guard against accidental production builds pointing to localhost.
export const API_BASE =
	_IS_BROWSER && _IS_PRODUCTION && _IS_LOCALHOST_API
		? 'https://personalportfolio-production-ecaf.up.railway.app/api/v1'
		: _NORMALIZED_API_BASE;

const parseTimeout = (value: string | undefined): number | null => {
	if (!value) return null;
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) return null;
	return Math.floor(parsed);
};

const ENV_REQUEST_TIMEOUT = parseTimeout(process.env.NEXT_PUBLIC_API_TIMEOUT_MS);
const DEFAULT_REQUEST_TIMEOUT = ENV_REQUEST_TIMEOUT ?? 5000;
const MOBILE_REQUEST_TIMEOUT = Math.max(DEFAULT_REQUEST_TIMEOUT, 10000);

const isMobileUserAgent = (): boolean => {
	if (!_IS_BROWSER) return false;
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		window.navigator.userAgent,
	);
};

const REQUEST_TIMEOUT = isMobileUserAgent() ? MOBILE_REQUEST_TIMEOUT : DEFAULT_REQUEST_TIMEOUT;
const TRANSIENT_RETRYABLE_STATUSES = new Set([0, 408]);
const DEFAULT_RETRIES = 2;

// Custom error class for API failures
export class ApiClientError extends Error {
	public readonly status: number;
	public readonly details?: unknown;
	public readonly source?: string;

	constructor(status: number, message: string, details?: unknown, source?: string) {
		super(message);
		this.name = 'ApiClientError';
		this.status = status;
		this.details = details;
		this.source = source;
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
				errorBody.error?.source,
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

async function requestWithRetry<T>(
	method: string,
	endpoint: string,
	options: Parameters<typeof request<T>>[2] = {},
	retries = DEFAULT_RETRIES,
): Promise<T> {
	let attempts = 0;
	let lastError: ApiClientError | null = null;

	while (attempts <= retries) {
		try {
			return await request<T>(method, endpoint, options);
		} catch (error) {
			if (!(error instanceof ApiClientError)) throw error;
			lastError = error;

			const canRetry = TRANSIENT_RETRYABLE_STATUSES.has(error.status) && attempts < retries;
			if (!canRetry) throw error;

			const delayMs = 200 * 2 ** attempts;
			await new Promise(resolve => setTimeout(resolve, delayMs));
			attempts += 1;
		}
	}

	throw lastError ?? new ApiClientError(0, 'Request failed after retries');
}

// Public API methods
export const apiClient = {
	get: <T>(endpoint: string, auth = false) => requestWithRetry<T>('GET', endpoint, { auth }),

	post: <T>(endpoint: string, body: unknown, auth = false, timeout?: number) =>
		request<T>('POST', endpoint, { body, auth, ...(timeout ? { timeout } : {}) }),

	put: <T>(endpoint: string, body: unknown, auth = true) =>
		request<T>('PUT', endpoint, { body, auth }),

	patch: <T>(endpoint: string, body: unknown, auth = true) =>
		request<T>('PATCH', endpoint, { body, auth }),

	del: <T = void>(endpoint: string, body?: unknown, auth = true) =>
		request<T>('DELETE', endpoint, { body, auth }),

	upload: <T>(endpoint: string, formData: FormData, auth = true) =>
		request<T>('POST', endpoint, { body: formData, auth, isFormData: true, timeout: 30000 }),

	uploadPut: <T>(endpoint: string, formData: FormData, auth = true) =>
		request<T>('PUT', endpoint, { body: formData, auth, isFormData: true, timeout: 30000 }),
};
