import { FastifyInstance } from "fastify";
import {
  loginUser,
  rotateRefreshToken,
  logoutAllForUser,
} from "./auth.service";
import { loginSchema } from "../../schemas/zod-schemas";
import { authMiddleware } from "../../middleware/auth.middleware";

export default async function authRoutes(fastify: FastifyInstance) {
  // Login endpoint
  fastify.post(
    "/api/auth/login",
    {
      schema: {
        body: loginSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              expiresIn: { type: 'number' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { username, password } = request.body as any;
        const result = await loginUser(username, password);
        
        if (!result) {
          return reply.status(401).send({
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Invalid username or password",
              timestamp: new Date().toISOString(),
            },
          });
        }

        return reply.send({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: 15 * 60, // 15 minutes in seconds
          user: result.user,
        });
      } catch (error: any) {
        if (error.message === 'ACCOUNT_LOCKED') {
          return reply.status(403).send({
            error: {
              code: "ACCOUNT_LOCKED",
              message: "Account is temporarily locked due to multiple failed login attempts",
              timestamp: new Date().toISOString(),
            },
          });
        }
        throw error;
      }
    }
  );

  // Refresh token endpoint
  fastify.post("/api/auth/refresh", async (request, reply) => {
    const { refreshToken } = request.body as any;
    
    if (!refreshToken) {
      return reply.status(400).send({
        error: {
          code: "MISSING_REFRESH_TOKEN",
          message: "Refresh token is required",
          timestamp: new Date().toISOString(),
        },
      });
    }

    const tokens = await rotateRefreshToken(refreshToken);
    
    if (!tokens) {
      return reply.status(401).send({
        error: {
          code: "INVALID_REFRESH_TOKEN",
          message: "Invalid or expired refresh token",
          timestamp: new Date().toISOString(),
        },
      });
    }

    return reply.send(tokens);
  });

  // Logout endpoint (requires authentication)
  fastify.post(
    "/api/auth/logout",
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const userId = request.user?.userId;
      
      if (!userId) {
        return reply.status(400).send({
          error: {
            code: "MISSING_USER_ID",
            message: "User ID is required",
            timestamp: new Date().toISOString(),
          },
        });
      }

      await logoutAllForUser(userId);
      
      return reply.send({
        success: true,
        message: "Logged out successfully",
      });
    }
  );
}
