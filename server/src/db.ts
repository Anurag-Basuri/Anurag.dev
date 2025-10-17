import dotenv from 'dotenv';
dotenv.config();

// ESM-safe import: pg is CommonJS, so use default import and destructure.
// Keep type-only imports as named (erased at runtime).
import pg, { type PoolClient, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg';

const { Pool } = pg;

// Build a Pool config from env with sane defaults.
function buildPoolConfig(): PoolConfig {
	const {
		DATABASE_URL,
		DB_HOST,
		DB_PORT,
		DB_USER,
		DB_PASSWORD,
		DB_NAME,
		// Pool and timeouts
		PGPOOL_MAX,
		PG_IDLE_TIMEOUT_MS,
		PG_CONNECTION_TIMEOUT_MS,
		// SSL (for many managed providers)
		PGSSLMODE,
		DATABASE_SSL,
		NODE_ENV,
	} = process.env;

	const useSsl =
		(DATABASE_SSL && DATABASE_SSL.toLowerCase() === 'true') || PGSSLMODE === 'require' || false;

	const cfg: PoolConfig = DATABASE_URL
		? {
				connectionString: DATABASE_URL,
				ssl: useSsl ? { rejectUnauthorized: false } : undefined,
			}
		: {
				host: DB_HOST ?? 'localhost',
				port: Number(DB_PORT ?? 5432),
				user: DB_USER,
				password: DB_PASSWORD,
				database: DB_NAME ?? 'personal_portfolio',
				ssl: useSsl ? { rejectUnauthorized: false } : undefined,
			};

	cfg.max = Number(PGPOOL_MAX ?? 10);
	cfg.idleTimeoutMillis = Number(PG_IDLE_TIMEOUT_MS ?? 10_000);
	cfg.connectionTimeoutMillis = Number(PG_CONNECTION_TIMEOUT_MS ?? 10_000);
	// Keep TCP connections alive to traverse NATs/load balancers better
	(cfg as any).keepAlive = true;

	// Helpful in dashboards
	(cfg as any).application_name =
		process.env.PGAPPNAME ?? `personal_portfolio:${NODE_ENV ?? 'dev'}`;

	return cfg;
}

export const pool = new Pool(buildPoolConfig());

// Log unexpected client errors so they don’t get swallowed
pool.on('error', (err) => {
	console.error('[pg] Unexpected client error:', err);
});

// Simple ping with optional timeout (AbortSignal supported by pg)
export async function ping(timeoutMs = 5_000): Promise<void> {
	const ctl = new AbortController();
	const t = setTimeout(() => ctl.abort(), timeoutMs).unref?.();
	try {
		await pool.query({ text: 'SELECT 1', signal: ctl.signal } as any);
	} finally {
		clearTimeout(t as any);
	}
}

// Wait for DB to be reachable with retries/backoff (useful on cold start)
export async function waitForDb(opts?: { attempts?: number; initialDelayMs?: number }) {
	const attempts = opts?.attempts ?? 10;
	let delay = opts?.initialDelayMs ?? 300;
	for (let i = 1; i <= attempts; i++) {
		try {
			await ping();
			return;
		} catch (err) {
			if (i === attempts) throw err;
			await sleep(delay);
			delay = Math.min(delay * 1.8, 5_000);
		}
	}
}

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

// Parameterized query helper
export async function query<T extends QueryResultRow = QueryResultRow>(
	text: string,
	params?: any[],
): Promise<QueryResult<T>> {
	return pool.query<T>(text, params);
}

// Tagged template to build parameterized queries: sql`select * from t where id=${id}`
export function sql(strings: TemplateStringsArray, ...values: any[]) {
	const text = strings.reduce(
		(acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ''),
		'',
	);
	return { text, values };
}

export async function querySql<T extends QueryResultRow = QueryResultRow>(
	strings: TemplateStringsArray,
	...values: any[]
): Promise<QueryResult<T>> {
	const { text, values: params } = sql(strings, ...values);
	return query<T>(text, params);
}

// Transaction helper
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const result = await fn(client);
		await client.query('COMMIT');
		return result;
	} catch (err) {
		try {
			await client.query('ROLLBACK');
		} catch {
			/* ignore rollback error */
		}
		throw err;
	} finally {
		client.release();
	}
}

// Create tables if missing (idempotent)
export async function ensureTables(): Promise<void> {
	// Optional: wait for DB (useful in container orchestration)
	await waitForDb();

	await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
  `);
}

// Graceful shutdown hook
export async function closePool(): Promise<void> {
	await pool.end();
}

// Narrow PG error type guard (useful in route handlers)
export type PgError = { code?: string; detail?: string; constraint?: string };
export function isPgError(err: unknown): err is PgError {
	return !!err && typeof err === 'object' && 'code' in (err as any);
}
