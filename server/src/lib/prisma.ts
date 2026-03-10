import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { env } from '../config/env';

// Prevent multiple PrismaClient instances in development (hot-reload).
// In production, module-level const handles it since the process is long-lived.
const globalForPrisma = globalThis as unknown as {
	__prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
	const pool = new Pool({
		connectionString: env.DATABASE_URL,
		max: env.NODE_ENV === 'production' ? 20 : 5,
		idleTimeoutMillis: 30_000,
		connectionTimeoutMillis: 5_000,
	});

	const adapter = new PrismaPg(pool);

	return new PrismaClient({
		adapter,
		log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
	});
}

export const prisma = globalForPrisma.__prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
	globalForPrisma.__prisma = prisma;
}
