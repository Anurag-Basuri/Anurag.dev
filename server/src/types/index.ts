// Common types used across the application

export interface TokenPayload {
	adminId: string;
	username: string;
	iat?: number;
	exp?: number;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
	expiresIn: string;
}

export interface PaginationQuery {
	page?: number;
	limit?: number;
}

export interface PaginatedResult<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export type ContentStatus = 'draft' | 'published' | 'archived' | 'completed';
export type JourneyType = 'work' | 'education' | 'volunteering' | 'research' | 'other';
export type AchievementCategory =
	| 'hackathon'
	| 'competition'
	| 'award'
	| 'opensource'
	| 'publication'
	| 'scholarship';
export type AuditAction = 'create' | 'update' | 'delete';
