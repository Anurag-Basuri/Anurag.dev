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

	static BadRequest(message = 'Bad Request', details = null) {
		return new ApiError(400, message, details);
	}

	static Unauthorized(message = 'Unauthorized', details = null) {
		return new ApiError(401, message, details);
	}

	static Forbidden(message = 'Forbidden', details = null) {
		return new ApiError(403, message, details);
	}

	static NotFound(message = 'Not Found', details = null) {
		return new ApiError(404, message, details);
	}

	static Conflict(message = 'Conflict', details = null) {
		return new ApiError(409, message, details);
	}

	static UnprocessableEntity(message = 'Unprocessable Entity', details = null) {
		return new ApiError(422, message, details);
	}

	static InternalServerError(message = 'Internal Server Error', details = null) {
		return new ApiError(500, message, details);
	}

    static TooManyRequests(message = 'Too Many Requests', details = null) {
        return new ApiError(429, message, details);
    }

    static ServiceUnavailable(message = 'Service Unavailable', details = null) {
        return new ApiError(503, message, details);
    }

    static GatewayTimeout(message = 'Gateway Timeout', details = null) {
        return new ApiError(504, message, details);
    }
}

export { ApiError };
