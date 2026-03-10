import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { ZodError } from 'zod';

/**
 * Centralized error handling middleware.
 * Must be registered LAST in the middleware chain (4-arg signature).
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
	// Known application errors
	if (err instanceof AppError) {
		res.status(err.statusCode).json(err.toJSON());
		return;
	}

	// Zod validation errors (fallback — normally caught by validate middleware)
	if (err instanceof ZodError) {
		const details = err.errors.map(e => ({
			field: e.path.join('.'),
			message: e.message,
		}));
		res.status(400).json({
			error: {
				code: 'VALIDATION_ERROR',
				message: 'Validation failed',
				details,
				timestamp: new Date().toISOString(),
			},
		});
		return;
	}

	// Log unexpected errors
	console.error('[ERROR]', err);

	// Never leak internal details in production
	const statusCode =
		'statusCode' in err && typeof (err as any).statusCode === 'number'
			? (err as any).statusCode
			: 500;

	res.status(statusCode).json({
		error: {
			code: statusCode === 500 ? 'INTERNAL_ERROR' : 'ERROR',
			message: statusCode === 500 ? 'Internal server error' : err.message,
			timestamp: new Date().toISOString(),
		},
	});
}
