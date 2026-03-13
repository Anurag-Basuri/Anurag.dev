import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

// Middleware to validate request bodies against a Zod schema
export function validate(schema: ZodSchema) {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			req.body = schema.parse(req.body);
			next();
		} catch (err) {
			if (err instanceof ZodError) {
				const details = err.errors.map(e => ({
					field: e.path.join('.'),
					message: e.message,
				}));
				next(new ApiError(400, 'Validation failed', { details }));
				return;
			}
			next(err);
		}
	};
}

// Optional: validate route parameters as well
export function validateParams(schema: ZodSchema) {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			req.params = schema.parse(req.params) as any;
			next();
		} catch (err) {
			if (err instanceof ZodError) {
				const details = err.errors.map(e => ({
					field: e.path.join('.'),
					message: e.message,
				}));
				next(new ApiError(400, 'Invalid parameters', { details }));
				return;
			}
			next(err);
		}
	};
}

// Optional: validate query parameters as well
export function validateQuery(schema: ZodSchema) {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			req.query = schema.parse(req.query) as any;
			next();
		} catch (err) {
			if (err instanceof ZodError) {
				const details = err.errors.map(e => ({
					field: e.path.join('.'),
					message: e.message,
				}));
				next(new ApiError(400, 'Invalid query parameters', { details }));
				return;
			}
			next(err);
		}
	};
}
