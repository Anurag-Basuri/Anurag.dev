import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

// Shared helper
function zodToApiError(err: ZodError, label: 'body' | 'params' | 'query'): ApiError {
	return ApiError.ValidationError(err, label);
}

// Body validation
export function validate(schema: ZodSchema) {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			req.body = schema.parse(req.body);
			next();
		} catch (err) {
			if (err instanceof ZodError) {
				next(zodToApiError(err, 'body'));
				return;
			}
			next(err);
		}
	};
}

// Route params validation
export function validateParams(schema: ZodSchema) {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			req.params = schema.parse(req.params) as any;
			next();
		} catch (err) {
			if (err instanceof ZodError) {
				next(zodToApiError(err, 'params'));
				return;
			}
			next(err);
		}
	};
}

// Query params validation
export function validateQuery(schema: ZodSchema) {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			req.query = schema.parse(req.query) as any;
			next();
		} catch (err) {
			if (err instanceof ZodError) {
				next(zodToApiError(err, 'query'));
				return;
			}
			next(err);
		}
	};
}
