import { buildApp } from './app';
import { env } from './config/env';
import { verifyDatabaseConnection, disconnectDatabase } from './lib/prisma';
import { verifyConnection as verifyCloudinary } from './lib/cloudinary';

const app = buildApp();

// ─── Process-level error handlers ────────────────────────────────

process.on('uncaughtException', err => {
	console.error('[UNCAUGHT EXCEPTION]', err);
	process.exit(1);
});

process.on('unhandledRejection', reason => {
	console.error('[UNHANDLED REJECTION]', reason);
});

// ─── Graceful shutdown ───────────────────────────────────────────

let isShuttingDown = false;

async function shutdown(signal: string) {
	if (isShuttingDown) return;
	isShuttingDown = true;

	console.log(`\n[server] ${signal} received — shutting down...`);

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

// ─── Startup ─────────────────────────────────────────────────────

async function start() {
	// 1. Verify database connection
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

	// 2. Verify Cloudinary connection
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

	// 3. Start HTTP server
	app.listen(env.PORT, '0.0.0.0', () => {
		console.log(`[server] listening on port ${env.PORT} [${env.NODE_ENV}]`);
	});
}

start();
