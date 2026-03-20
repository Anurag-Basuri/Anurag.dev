import { ZodError, type ZodIssue } from 'zod';

/**
 * Centralized API error class.
 *
 * Every thrown ApiError carries:
 *  - statusCode   — HTTP status
 *  - message      — human-readable description
 *  - source       — origin context, e.g. "ProjectController.update"
 *  - details      — structured payload (validation errors, IDs, etc.)
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
			success: false,
			error: {
				code: this.statusCode,
				message: this.message,
				...(this.source && { source: this.source }),
				...(this.details ? { details: this.details } : {}),
			},
			timestamp: new Date().toISOString(),
		};
	}

	// ─── Factory Methods ────────────────────────────────────────────

	static BadRequest(message = 'Bad Request', details?: unknown, source?: string) {
		return new ApiError(400, message, { details, source });
	}

	static Unauthorized(message = 'Unauthorized', source?: string) {
		return new ApiError(401, message, { source });
	}

	static Forbidden(message = 'Forbidden', source?: string) {
		return new ApiError(403, message, { source });
	}

	static NotFound(resource = 'Resource', source?: string) {
		return new ApiError(404, `${resource} not found`, { source });
	}

	static Conflict(message = 'Conflict', details?: unknown, source?: string) {
		return new ApiError(409, message, { details, source });
	}

	static UnprocessableEntity(message = 'Unprocessable Entity', details?: unknown, source?: string) {
		return new ApiError(422, message, { details, source });
	}

	static TooManyRequests(message = 'Too Many Requests', source?: string) {
		return new ApiError(429, message, { source });
	}

	static InternalServerError(message = 'Internal Server Error', details?: unknown) {
		return new ApiError(500, message, { details, isOperational: false });
	}

	static ServiceUnavailable(message = 'Service Unavailable') {
		return new ApiError(503, message, { isOperational: false });
	}

	// ─── Zod Validation → ApiError ──────────────────────────────────

	/**
	 * Converts a ZodError into a 400 ApiError with per-field details.
	 *
	 * Response shape:
	 * ```json
	 * { "field": "techStack", "message": "Expected array, received string", "code": "invalid_type" }
	 * ```
	 */
	static ValidationError(zodError: ZodError, label = 'body'): ApiError {
		const details = zodError.issues.map((issue: ZodIssue) => ({
			field: issue.path.join('.') || '(root)',
			message: issue.message,
			code: issue.code,
			...('expected' in issue ? { expected: issue.expected } : {}),
			...('received' in issue ? { received: issue.received } : {}),
		}));

		return new ApiError(400, `Validation failed (${label})`, {
			details,
			source: `validate:${label}`,
		});
	}

	// ─── Prisma Error → ApiError ────────────────────────────────────

	/**
	 * Translates known Prisma error codes into user-friendly ApiErrors.
	 *
	 * | Prisma Code | HTTP | Meaning                           |
	 * |-------------|------|-----------------------------------|
	 * | P2002       | 409  | Unique constraint violation        |
	 * | P2003       | 400  | Foreign key constraint violation   |
	 * | P2025       | 404  | Record not found                  |
	 */
	static fromPrisma(err: { code: string; meta?: Record<string, unknown>; message: string }): ApiError {
		const meta = err.meta ?? {};

		switch (err.code) {
			case 'P2002': {
				const target = (meta.target as string[]) ?? [];
				const fields = target.length ? target.join(', ') : 'unknown field(s)';
				return new ApiError(409, `A record with this ${fields} already exists`, {
					details: { target, prismaCode: 'P2002' },
					source: 'prisma',
				});
			}

			case 'P2003': {
				const field = (meta.field_name as string) ?? 'unknown';
				return new ApiError(400, `Invalid reference: related ${field} does not exist`, {
					details: { field, prismaCode: 'P2003' },
					source: 'prisma',
				});
			}

			case 'P2025': {
				const model = (meta.modelName as string) ?? 'Record';
				return new ApiError(404, `${model} not found`, {
					details: { prismaCode: 'P2025' },
					source: 'prisma',
				});
			}

			default:
				return new ApiError(500, 'Database error', {
					details: { prismaCode: err.code },
					isOperational: false,
				});
		}
	}
}

function isApiError(err: unknown): err is ApiError {
	return err instanceof ApiError || (err instanceof Error && err.name === 'ApiError');
}

export { ApiError, isApiError };
