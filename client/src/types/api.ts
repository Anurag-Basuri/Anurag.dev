// API response envelope types (mirrors backend ApiResponse / ApiError)

export interface ApiSuccessResponse<T> {
	success: true;
	data: T;
	message?: string;
	meta?: PaginationMeta;
	timestamp: string;
}

export interface ApiErrorResponse {
	success: false;
	error: {
		code: number;
		message: string;
		details?: unknown;
		source?: string;
	};
	timestamp: string;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface PaginatedResponse<T> {
	items: T[];
	meta: PaginationMeta;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}
