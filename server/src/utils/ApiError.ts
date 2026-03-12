// Custom error class for API errors.
class ApiError extends Error {
	public readonly statusCode: number;
	public readonly details?: unknown;
	public readonly name: string;

	constructor(statusCode: number, message: string, details?: unknown) {
		super(message);
		this.name = 'ApiError';
		this.statusCode = statusCode;
		this.details = details;
		Error.captureStackTrace(this, this.constructor);
	}

	toJSON() {
		return {
			error: {
				code: this.statusCode,
				message: this.message,
				...(this.details ? { details: this.details } : {}),
				timestamp: new Date().toISOString(),
			},
		};
	}

	static BadRequest(message = 'Bad Request', details?: unknown) {
		return new ApiError(400, message, details);
	}

	static Unauthorized(message = 'Unauthorized', details?: unknown) {
		return new ApiError(401, message, details);
	}

	static Forbidden(message = 'Forbidden', details?: unknown) {
		return new ApiError(403, message, details);
	}

	static NotFound(message = 'Not Found', details?: unknown) {
		return new ApiError(404, message, details);
	}

	static Conflict(message = 'Conflict', details?: unknown) {
		return new ApiError(409, message, details);
	}

	static UnprocessableEntity(message = 'Unprocessable Entity', details?: unknown) {
		return new ApiError(422, message, details);
	}

	static TooManyRequests(message = 'Too Many Requests', details?: unknown) {
		return new ApiError(429, message, details);
	}

	static InternalServerError(message = 'Internal Server Error', details?: unknown) {
		return new ApiError(500, message, details);
	}

	static ServiceUnavailable(message = 'Service Unavailable', details?: unknown) {
		return new ApiError(503, message, details);
	}

	static GatewayTimeout(message = 'Gateway Timeout', details?: unknown) {
		return new ApiError(504, message, details);
	}
}

// Type guard to check if an error is an ApiError.
function isApiError(err: unknown): err is ApiError {
	return err instanceof ApiError || (err instanceof Error && err.name === 'ApiError');
}

export { ApiError, isApiError };
