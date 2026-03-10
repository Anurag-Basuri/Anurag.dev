import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../modules/auth/auth.service';
import { unauthorized } from '../lib/errors';

// Augment Express Request to include admin data
declare global {
	namespace Express {
		interface Request {
			admin?: TokenPayload;
		}
	}
}

/**
 * Authentication middleware — verifies Bearer token and attaches admin info to request.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		next(unauthorized('Authorization token required'));
		return;
	}

	const token = authHeader.substring(7);
	const payload = verifyAccessToken(token);

	if (!payload) {
		next(unauthorized('Invalid or expired token'));
		return;
	}

	req.admin = payload;
	next();
}
