import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { getEnv } from './config/env';

export async function buildApp(): Promise<FastifyInstance> {
  const env = getEnv();
  
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      } : undefined,
    },
  });

  // Register CORS
  await app.register(cors, {
    origin: env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] // Update with actual domain
      : true,
    credentials: true,
  });

  // Register JWT
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    },
  });

  // Register Swagger (only in development)
  if (env.NODE_ENV === 'development') {
    await app.register(swagger, {
      openapi: {
        info: {
          title: 'AnuragOS Backend API',
          description: 'REST API for developer portfolio system',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${env.PORT}`,
            description: 'Development server',
          },
        ],
        tags: [
          { name: 'auth', description: 'Authentication endpoints' },
          { name: 'projects', description: 'Project management' },
          { name: 'journey', description: 'Journey timeline' },
          { name: 'blog', description: 'Blog posts' },
          { name: 'media', description: 'Media management' },
          { name: 'contact', description: 'Contact form' },
          { name: 'admin', description: 'Admin operations' },
        ],
      },
    });

    await app.register(swaggerUi, {
      routePrefix: '/api-docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
    });
  }

  // Health check endpoint
  app.get('/api/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    };
  });

  // Register routes (will be added as we implement modules)
  // await app.register(authRoutes, { prefix: '/api/auth' });
  // await app.register(projectRoutes, { prefix: '/api' });
  // ... more routes

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    
    // Don't expose internal errors in production
    const message = env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message;
    
    reply.status(error.statusCode || 500).send({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message,
        timestamp: new Date().toISOString(),
      },
    });
  });

  return app;
}
