import http from 'node:http';
import app from './app';
import { env } from './config/env';
import { verifyDatabaseConnection, disconnectDatabase } from './lib/prisma';
import { verifyConnection as verifyCloudinary } from './lib/cloudinary';

// Process-Level Error Handlers
process.on('uncaughtException', err => {
	console.error('[UNCAUGHT EXCEPTION]', err);
	process.exit(1);
});

process.on('unhandledRejection', reason => {
	console.error('[UNHANDLED REJECTION]', reason);
});

// Graceful Shutdown
let server: http.Server;
let isShuttingDown = false;

async function shutdown(signal: string) {
	if (isShuttingDown) return;
	isShuttingDown = true;

	console.log(`\n[server] ${signal} received — shutting down gracefully...`);

	server?.close(() => {
		console.log('[server] http server closed');
	});

	try {
		await disconnectDatabase();
		console.log('[server] database disconnected');
	} catch (err) {
		console.error('[server] error during database disconnect:', err);
	}

	process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Bootstrap
async function bootstrap() {
	const startTime = Date.now();

	console.log('\n┌──────────────────────────────────────┐');
	console.log('│       Portfolio API — Starting       │');
	console.log('└──────────────────────────────────────┘\n');

	// 1. Verify external dependencies
	try {
		await verifyDatabaseConnection();
		console.log('  ✓ Database connected');
	} catch (err) {
		console.error('  ✗ Database connection failed:', err instanceof Error ? err.message : err);
		process.exit(1);
	}

	try {
		await verifyCloudinary();
		console.log('  ✓ Cloudinary connected');
	} catch (err) {
		console.error('  ✗ Cloudinary connection failed:', err instanceof Error ? err.message : err);
		process.exit(1);
	}

	// 2. Start HTTP server
	server = http.createServer(app);

	server.listen(env.PORT, '0.0.0.0', () => {
		const elapsed = Date.now() - startTime;

		console.log('\n┌──────────────────────────────────────┐');
		console.log(`│  Environment : ${env.NODE_ENV.padEnd(21)} │`);
		console.log(`│  Port        : ${String(env.PORT).padEnd(21)} │`);
		console.log(`│  API Base    : /api/v1${' '.repeat(15)}│`);
		console.log(`│  Started in  : ${String(elapsed + 'ms').padEnd(21)} │`);
		console.log('└──────────────────────────────────────┘\n');
	});
}

bootstrap();
