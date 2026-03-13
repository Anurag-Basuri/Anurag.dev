import { ApiError } from '../utils/ApiError';

/**
 * Convenience error factory functions.
 * Thin wrappers around ApiError static methods for cleaner controller code.
 */

export const notFound = (resource: string) => ApiError.NotFound(`${resource} not found`);

export const unauthorized = (message = 'Unauthorized') => ApiError.Unauthorized(message);

export const conflict = (message: string) => ApiError.Conflict(message);

export const badRequest = (message: string, details?: unknown) =>
	ApiError.BadRequest(message, details);
