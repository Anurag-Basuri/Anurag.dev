import { Request, Response, NextFunction } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const asyncHandler = (fn: AsyncRouteHandler) => {
	// Early validation during middleware setup
	if (typeof fn !== 'function') {
		throw new TypeError('asyncHandler requires a function argument');
	}

	return (req: Request, res: Response, next: NextFunction) => {
		// Handle both async functions and synchronous errors
		Promise.resolve(fn(req, res, next)).catch((error: Record<string, unknown>) => {
			// Ensure error has a statusCode and message
			if (!error.statusCode) error.statusCode = 500;
			if (!error.message) error.message = 'Internal Server Error';
			// Optionally log the error for debugging
			console.error('Async error:', error);
			next(error);
		});
	};
};

export { asyncHandler };
