import { Request, Response, NextFunction } from 'express';
import { tooManyRequests } from '../lib/errors';

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

// In-memory store — perfectly fine for single-instance portfolio backend
const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(
	() => {
		const now = Date.now();
		for (const [key, entry] of store) {
			if (entry.resetAt <= now) {
				store.delete(key);
			}
		}
	},
	5 * 60 * 1000,
).unref();

interface RateLimitOptions {
	/** Max requests allowed in the window */
	max: number;
	/** Window duration in seconds */
	windowSeconds: number;
	/** Optional prefix for the key (to separate different limiters) */
	prefix?: string;
}

/**
 * Creates an in-memory rate limiter middleware.
 * Keys by client IP + optional prefix.
 */
export function rateLimit(options: RateLimitOptions) {
	const { max, windowSeconds, prefix = 'rl' } = options;

	return (req: Request, _res: Response, next: NextFunction) => {
		const ip = req.ip || req.socket.remoteAddress || 'unknown';
		const key = `${prefix}:${ip}`;
		const now = Date.now();

		const entry = store.get(key);

		if (!entry || entry.resetAt <= now) {
			// First request or window expired
			store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
			next();
			return;
		}

		if (entry.count >= max) {
			const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
			next(tooManyRequests(`Rate limit exceeded. Try again in ${retryAfter}s`));
			return;
		}

		entry.count++;
		next();
	};
}
