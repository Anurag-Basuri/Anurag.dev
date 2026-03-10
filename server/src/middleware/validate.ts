import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { badRequest } from '../lib/errors';

/**
 * Creates middleware that validates request.body against a Zod schema.
 * On failure, forwards a structured error to the error handler.
 */
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
				next(badRequest('Validation failed', details));
				return;
			}
			next(err);
		}
	};
}

/**
 * Creates middleware that validates request.params against a Zod schema.
 */
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
				next(badRequest('Invalid parameters', details));
				return;
			}
			next(err);
		}
	};
}

/**
 * Creates middleware that validates request.query against a Zod schema.
 */
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
				next(badRequest('Invalid query parameters', details));
				return;
			}
			next(err);
		}
	};
}
