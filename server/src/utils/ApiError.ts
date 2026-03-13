/**
 * Centralized API error class.
 *
 * Every thrown ApiError carries:
 *  - statusCode  — HTTP status
 *  - message     — human-readable description
 *  - source      — origin context, e.g. "ProjectController.update" (optional)
 *  - details     — structured payload (validation errors, IDs, etc.)
 *  - isOperational — true = expected business error, false = programming bug
 *  - stack        — full stack trace (auto-captured)
 */
class ApiError extends Error {
	public readonly statusCode: number;
	public readonly source?: string;
	public readonly details?: unknown;
	public readonly isOperational: boolean;

	constructor(
		statusCode: number,
		message: string,
		options: { source?: string; details?: unknown; isOperational?: boolean } = {},
	) {
		super(message);
		this.name = 'ApiError';
		this.statusCode = statusCode;
		this.source = options.source;
		this.details = options.details;
		this.isOperational = options.isOperational ?? true;
		Error.captureStackTrace(this, this.constructor);
	}

	toJSON() {
		return {
			error: {
				code: this.statusCode,
				message: this.message,
				...(this.source && { source: this.source }),
				...(this.details ? { details: this.details } : {}),
				timestamp: new Date().toISOString(),
			},
		};
	}

	// ─── Factory Methods ──────────────────────────────────────────

	static BadRequest(message = 'Bad Request', details?: unknown) {
		return new ApiError(400, message, { details });
	}

	static Unauthorized(message = 'Unauthorized') {
		return new ApiError(401, message);
	}

	static Forbidden(message = 'Forbidden') {
		return new ApiError(403, message);
	}

	static NotFound(resource = 'Resource') {
		return new ApiError(404, `${resource} not found`);
	}

	static Conflict(message = 'Conflict') {
		return new ApiError(409, message);
	}

	static UnprocessableEntity(message = 'Unprocessable Entity', details?: unknown) {
		return new ApiError(422, message, { details });
	}

	static TooManyRequests(message = 'Too Many Requests') {
		return new ApiError(429, message);
	}

	static InternalServerError(message = 'Internal Server Error', details?: unknown) {
		return new ApiError(500, message, { details, isOperational: false });
	}

	static ServiceUnavailable(message = 'Service Unavailable') {
		return new ApiError(503, message, { isOperational: false });
	}
}

function isApiError(err: unknown): err is ApiError {
	return err instanceof ApiError || (err instanceof Error && err.name === 'ApiError');
}

export { ApiError, isApiError };
