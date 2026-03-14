import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

// Cache-Control middleware for public GET endpoints
function cacheControl(maxAgeSeconds: number) {
	return (_req: Request, res: Response, next: NextFunction) => {
		res.set('Cache-Control', `public, max-age=${maxAgeSeconds}`);

		// Auto-generate ETag from response body
		const originalJson = res.json.bind(res);
		res.json = (body: unknown) => {
			const content = JSON.stringify(body);
			const etag = `"${crypto.createHash('md5').update(content).digest('hex').slice(0, 16)}"`;
			res.set('ETag', etag);
			return originalJson(body);
		};

		next();
	};
}

export { cacheControl };
