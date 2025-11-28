import { validateEnv } from './config/env';
import { buildApp } from './app';

async function start() {
  try {
    // Validate environment variables
    const env = validateEnv();
    
    console.log('🔧 Environment validated successfully');
    console.log(`📦 Environment: ${env.NODE_ENV}`);
    
    // Build and start the Fastify app
    const app = await buildApp();
    
    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });
    
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    
    if (env.NODE_ENV === 'development') {
      console.log(`📚 API Documentation: http://localhost:${env.PORT}/api-docs`);
    }
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
