import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { query } from './db.js';

// Configure app
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// CORS (configurable via CORS_ORIGIN="http://localhost:5173,https://yourdomain.com")
const parsedOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(',')
			.map((o) => o.trim())
			.filter(Boolean)
	: [];
const allowList = parsedOrigins.length ? parsedOrigins : '*';
app.use(
	cors({
		origin: allowList,
		credentials: parsedOrigins.length > 0,
		methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	}),
);

// JSON body parsing (limit to 1MB)
app.use(express.json({ limit: '1mb' }));

// Minimal request logger
app.use((req, res, next) => {
	const start = process.hrtime.bigint();
	res.on('finish', () => {
		const ms = Number(process.hrtime.bigint() - start) / 1e6;
		// Keep logs concise; enhance with a logger later
		console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} ${ms.toFixed(1)}ms`);
	});
	next();
});

// Sensible default for API responses
app.use((_req, res, next) => {
	res.setHeader('Cache-Control', 'no-store');
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('X-Frame-Options', 'SAMEORIGIN');
	res.setHeader('Referrer-Policy', 'no-referrer');
	next();
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({
		ok: true,
		uptime: process.uptime(),
		env: process.env.NODE_ENV ?? 'development',
	});
});

// --- Users API ---------------------------------------------------------------

type UserRow = { id: number; name: string; email: string };

app.get('/api/users', async (req: Request, res: Response) => {
	const limit = clampInt(req.query.limit as string | undefined, 1, 100, 50);
	const offset = clampInt(req.query.offset as string | undefined, 0, 10_000, 0);

	const result = await query<UserRow>(
		'SELECT id, name, email FROM users ORDER BY id DESC LIMIT $1 OFFSET $2',
		[limit, offset],
	);
	res.json({ items: result.rows, limit, offset, count: result.rowCount ?? result.rows.length });
});

app.post('/api/users', async (req: Request, res: Response) => {
	const { name, email } = sanitizeCreateUser(req.body);

	if (!name || !email) {
		return res.status(400).json({
			error: 'validation_error',
			details: { name: 'required string', email: 'valid email required' },
		});
	}

	try {
		const result = await query<UserRow>(
			'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email',
			[name, email],
		);
		const created = result.rows[0];
		if (!created) {
			// Safeguard in case the DB did not return a row
			return res.status(500).json({ error: 'db_error', message: 'Insert returned no rows' });
		}
		res.status(201).location(`/api/users/${created.id}`).json(created);
	} catch (err) {
		// Map common PG errors
		if (isPgError(err)) {
			// Unique violation
			if (err.code === '23505') {
				return res.status(409).json({ error: 'conflict', message: 'Email already exists' });
			}
			// Fallback for other DB errors
			return res.status(500).json({ error: 'db_error', code: err.code, detail: err.detail });
		}
		throw err; // Let global error handler deal with unknown errors
	}
});

// --- 404 handler -------------------------------------------------------------

app.use((req, res) => {
	res.status(404).json({ error: 'not_found', path: req.originalUrl });
});

// --- Error handlers ----------------------------------------------------------

// JSON parse errors and other bad requests
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
	if (isJsonParseError(err)) {
		return res.status(400).json({ error: 'invalid_json', message: 'Malformed JSON body' });
	}
	next(err);
});

// Final error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
	// Do not leak internals in production
	const isProd = (process.env.NODE_ENV ?? 'development') === 'production';
	const payload = {
		error: 'internal_server_error',
		message: isProd ? 'Internal server error' : formatError(err),
	};
	console.error('[ERROR]', formatError(err));
	res.status(500).json(payload);
});

// --- Helpers ----------------------------------------------------------------

function clampInt(value: string | undefined, min: number, max: number, fallback: number): number {
	const n = Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.min(Math.max(Math.trunc(n), min), max);
}

function sanitizeCreateUser(body: unknown): { name?: string; email?: string } {
	if (!body || typeof body !== 'object') return {};
	const { name, email } = body as Record<string, unknown>;
	const n = typeof name === 'string' ? name.trim() : undefined;
	const e = typeof email === 'string' ? email.trim().toLowerCase() : undefined;
	if (n && n.length > 255) return {};
	if (e && (!emailRegex.test(e) || e.length > 320)) return {};
	const out: { name?: string; email?: string } = {};
	if (n !== undefined) out.name = n;
	if (e !== undefined) out.email = e;
	return out;
}

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

function isPgError(err: unknown): err is { code?: string; detail?: string } {
	return !!err && typeof err === 'object' && 'code' in (err as any);
}

function isJsonParseError(err: unknown): boolean {
	// Express sets type = 'entity.parse.failed' on body parse errors
	return (
		err instanceof SyntaxError ||
		(typeof err === 'object' &&
			err !== null &&
			'type' in err &&
			(err as any).type === 'entity.parse.failed')
	);
}

function formatError(err: unknown): string {
	if (err instanceof Error) return `${err.name}: ${err.message}\n${err.stack ?? ''}`;
	try {
		return JSON.stringify(err);
	} catch {
		return String(err);
	}
}

export default app;
