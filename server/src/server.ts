import dotenv from 'dotenv';
dotenv.config();

import chalk from 'chalk';
import type { Server } from 'http';
import app from './app.js';
import { ensureTables, pool } from './db.js';

const DEFAULT_PORT = 4000;

function normalizePort(value: string | undefined): number {
	if (!value) return DEFAULT_PORT;
	const port = Number(value);
	if (!Number.isFinite(port) || port <= 0) {
		console.warn(chalk.yellow(`Invalid PORT "${value}", falling back to ${DEFAULT_PORT}`));
		return DEFAULT_PORT;
	}
	return port;
}

const PORT = normalizePort(process.env.PORT);
let server: Server | undefined;
let shuttingDown = false;

async function start() {
	try {
		console.log(chalk.cyan('Initializing database…'));
		await ensureTables();
		console.log(chalk.green('Database ready.'));

		server = app.listen(PORT);
		// Tighten timeouts to avoid slowloris-style hangs
		server.keepAliveTimeout = 65_000;
		server.headersTimeout = 66_000;
		server.requestTimeout = 60_000;

		server.on('listening', () => {
			const mode = process.env.NODE_ENV ?? 'development';
			console.log(
				chalk.bold.green(
					`✔ Server listening on ${chalk.underline(`http://localhost:${PORT}`)} (${mode})`,
				),
			);
		});

		server.on('error', onServerError);
	} catch (err) {
		logFatal('Failed to start server', err);
		process.exit(1);
	}
}

function onServerError(err: NodeJS.ErrnoException) {
	if (err.code === 'EACCES') {
		logFatal(`Port ${PORT} requires elevated privileges`, err);
		process.exit(1);
	}
	if (err.code === 'EADDRINUSE') {
		logFatal(`Port ${PORT} is already in use`, err);
		process.exit(1);
	}
	logFatal('Server error', err);
	process.exit(1);
}

function logFatal(msg: string, err: unknown) {
	console.error(chalk.bgRed.white.bold(' FATAL '), chalk.red(msg));
	console.error(chalk.red(formatError(err)));
}

function formatError(err: unknown): string {
	if (err instanceof Error) return `${err.name}: ${err.message}\n${err.stack ?? ''}`;
	try {
		return JSON.stringify(err);
	} catch {
		return String(err);
	}
}

async function shutdown(signal: NodeJS.Signals) {
	if (shuttingDown) return;
	shuttingDown = true;

	console.log(chalk.yellow(`\n${signal} received. Starting graceful shutdown…`));

	const forceTimeout = setTimeout(() => {
		console.error(chalk.bgRed.white(' Force exit after timeout '));
		process.exit(1);
	}, 10_000).unref();

	try {
		if (server) {
			await new Promise<void>((resolve) => server!.close(() => resolve()));
			console.log(chalk.gray('HTTP server closed.'));
		}

		await pool.end();
		console.log(chalk.gray('Database pool drained.'));
		clearTimeout(forceTimeout);
		console.log(chalk.green('Shutdown complete. Bye!'));
		process.exit(0);
	} catch (err) {
		clearTimeout(forceTimeout);
		logFatal('Error during shutdown', err);
		process.exit(1);
	}
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
	console.error(chalk.bgRed.white(' Unhandled Rejection '), chalk.red(formatError(reason)));
});
process.on('uncaughtException', (err) => {
	console.error(chalk.bgRed.white(' Uncaught Exception '), chalk.red(formatError(err)));
	// Prefer restart after an uncaught exception
	shutdown('SIGTERM' as NodeJS.Signals).catch(() => process.exit(1));
});

start();
