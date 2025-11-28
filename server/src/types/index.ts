// Common types used across the application

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface PaginationDto {
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

export type ContentStatus = 'draft' | 'published';
export type JourneyCategory = 'education' | 'work' | 'project' | 'achievement';
export type AuditAction = 'create' | 'update' | 'delete' | 'rollback';
export type JobType = 'github-sync' | 'thumbnail-generation';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';
