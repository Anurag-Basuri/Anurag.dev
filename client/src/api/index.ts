// Barrel export — single import point for the entire API layer

// Client
export { apiClient, ApiClientError } from './client';

// Types
export type {
	ApiSuccessResponse,
	ApiErrorResponse,
	PaginationMeta,
	PaginatedResponse,
	AuthTokens,
} from './types';

// Services
export { publicService } from './services/public';
export { authService } from './services/auth';
export { adminService } from './services/admin';

// Hooks
export { useApi, useLazyApi } from './hooks/use-api';
export { useAuth } from './hooks/use-auth';

// Validations
export { contactSchema } from './validations/contact';
export type { ContactFormData } from './validations/contact';
export { loginSchema } from './validations/auth';
export type { LoginFormData } from './validations/auth';

// Store
export { accessTokenAtom, refreshTokenAtom, isAuthenticatedAtom } from './store/auth';

// Fallback
export { withFallback } from './fallback/with-fallback';
export {
	FALLBACK_PROFILE,
	FALLBACK_PROJECTS,
	FALLBACK_JOURNEY,
	FALLBACK_ACHIEVEMENTS,
	FALLBACK_CERTIFICATIONS,
	FALLBACK_BLOG_POSTS,
} from './fallback';

