import http from 'node:http';
import app from './app';
import { env } from './config/env';
import { verifyDatabaseConnection, disconnectDatabase } from './lib/prisma';
import { verifyConnection as verifyCloudinary } from './lib/cloudinary';

// ─── Process-Level Error Handlers ────────────────────────────
process.on('uncaughtException', err => {
	console.error('[UNCAUGHT EXCEPTION]', err);
	process.exit(1);
});

process.on('unhandledRejection', reason => {
	console.error('[UNHANDLED REJECTION]', reason);
});

// ─── Graceful Shutdown ───────────────────────────────────────
let server: http.Server;
let isShuttingDown = false;

async function shutdown(signal: string) {
	if (isShuttingDown) return;
	isShuttingDown = true;

	console.log(`\n[server] ${signal} received — shutting down gracefully...`);

	// Stop accepting new connections, then wait for in-flight requests to finish
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

// ─── Bootstrap ───────────────────────────────────────────────
async function bootstrap() {
	// 1. Verify external dependencies before accepting traffic
	try {
		await verifyDatabaseConnection();
		console.log('[server] database connected');
	} catch (err) {
		console.error(
			'[server] database connection failed:',
			err instanceof Error ? err.message : err,
		);
		process.exit(1);
	}

	try {
		await verifyCloudinary();
		console.log('[server] cloudinary connected');
	} catch (err) {
		console.error(
			'[server] cloudinary connection failed:',
			err instanceof Error ? err.message : err,
		);
		process.exit(1);
	}

	// 2. Start HTTP server
	server = http.createServer(app);

	server.listen(env.PORT, '0.0.0.0', () => {
		console.log(`[server] listening on http://0.0.0.0:${env.PORT} [${env.NODE_ENV}]`);
	});
}

bootstrap();
