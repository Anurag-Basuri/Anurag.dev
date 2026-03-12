import { Request, Response, NextFunction } from 'express';
import { isApiError } from './ApiError';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncRouteHandler = (
	req: Request<any, any, any, any>,
	res: Response,
	next: NextFunction,
) => Promise<void>;

const asyncHandler = (fn: AsyncRouteHandler) => {
	if (typeof fn !== 'function') {
		throw new TypeError('asyncHandler requires a function argument');
	}

	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch((err: unknown) => {
			if (!isApiError(err)) {
				console.error('[asyncHandler] unexpected error:', err);
			}
			next(err);
		});
	};
};

export { asyncHandler };
