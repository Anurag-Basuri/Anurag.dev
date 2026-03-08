// ─── Custom Application Errors ────────────────────────────────────
// Provides typed, consistent error responses across all routes.

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly code: string;
	public readonly details?: unknown;

	constructor(statusCode: number, code: string, message: string, details?: unknown) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;
		Object.setPrototypeOf(this, AppError.prototype);
	}

	toJSON() {
		return {
			error: {
				code: this.code,
				message: this.message,
				...(this.details ? { details: this.details } : {}),
				timestamp: new Date().toISOString(),
			},
		};
	}
}

// ─── Factory helpers ──────────────────────────────────────────────

export const notFound = (resource = 'Resource') =>
	new AppError(404, 'NOT_FOUND', `${resource} not found`);

export const unauthorized = (message = 'Authentication required') =>
	new AppError(401, 'UNAUTHORIZED', message);

export const forbidden = (message = 'Access denied') => new AppError(403, 'FORBIDDEN', message);

export const badRequest = (message: string, details?: unknown) =>
	new AppError(400, 'BAD_REQUEST', message, details);

export const conflict = (message: string) => new AppError(409, 'CONFLICT', message);

export const tooManyRequests = (message = 'Too many requests') =>
	new AppError(429, 'TOO_MANY_REQUESTS', message);

export const internal = (message = 'Internal server error') =>
	new AppError(500, 'INTERNAL_ERROR', message);
