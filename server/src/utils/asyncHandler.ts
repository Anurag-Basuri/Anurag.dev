import { Request, Response, NextFunction } from 'express';

type AsyncRouteHandler = (req: Request<any>, res: Response, next: NextFunction) => Promise<void>;

/**
 * Wraps an async route handler to catch errors and forward them to Express error middleware.
 * Eliminates the need for try/catch blocks in every route.
 */
export const asyncHandler = (fn: AsyncRouteHandler) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};
