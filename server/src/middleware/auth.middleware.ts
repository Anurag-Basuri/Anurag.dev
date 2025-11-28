import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../modules/auth/auth.service';
import { TokenPayload } from '../types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Authorization token required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyAccessToken(token);

    if (!payload) {
      return reply.status(401).send({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Attach user info to request
    request.user = payload;
  } catch (error) {
    return reply.status(401).send({
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
        timestamp: new Date().toISOString(),
      },
    });
  }
}
