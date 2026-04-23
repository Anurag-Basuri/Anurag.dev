import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { env } from '../config/env';

// Prevent multiple PrismaClient instances in development (hot-reload).
// In production, module-level const handles it since the process is long-lived.
const globalForPrisma = globalThis as unknown as {
	__prisma: PrismaClient | undefined;
	__pool: Pool | undefined;
};

function createPrismaClient(): { client: PrismaClient; pool: Pool } {
	const isVercel = process.env.VERCEL === '1';
	const poolMax = isVercel ? 3 : env.NODE_ENV === 'production' ? 20 : 5;

	const pool = new Pool({
		connectionString: env.DATABASE_URL,
		max: poolMax,
		idleTimeoutMillis: 30_000,
		connectionTimeoutMillis: 5_000,
	});

	// Log pool-level errors so they don't crash the process silently
	pool.on('error', err => {
		console.error('[prisma] pg pool background error:', err.message);
	});

	const adapter = new PrismaPg(pool);

	const client = new PrismaClient({
		adapter,
		log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
	});

	return { client, pool };
}

const { client, pool } = globalForPrisma.__prisma
	? { client: globalForPrisma.__prisma, pool: globalForPrisma.__pool! }
	: createPrismaClient();

if (env.NODE_ENV !== 'production') {
	globalForPrisma.__prisma = client;
	globalForPrisma.__pool = pool;
}

// Helper function to verify database connectivity at startup
async function verifyDatabaseConnection(): Promise<void> {
	const pgClient = await pool.connect();
	try {
		await pgClient.query('SELECT 1');
	} finally {
		pgClient.release();
	}
}

// Helper function to gracefully disconnect the database when shutting down
async function disconnectDatabase(): Promise<void> {
	await client.$disconnect();
	await pool.end();
}

export { client as prisma, verifyDatabaseConnection, disconnectDatabase };
