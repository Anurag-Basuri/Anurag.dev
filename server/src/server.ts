import { buildApp } from './app';
import { env } from './config/env';
import { prisma } from './lib/db';

const app = buildApp();

// ─── Process-level error handlers (keep the server alive) ─────────

process.on('uncaughtException', err => {
	console.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', reason => {
	console.error('[UNHANDLED REJECTION]', reason);
});

// ─── Graceful shutdown ────────────────────────────────────────────

async function shutdown() {
	console.log('\nShutting down gracefully...');
	await prisma.$disconnect();
	process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// ─── Start server ─────────────────────────────────────────────────

app.listen(env.PORT, '0.0.0.0', () => {
	console.log(`Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
});
