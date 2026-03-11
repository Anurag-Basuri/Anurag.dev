import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	PORT: z.coerce.number().default(4000),

	// Database (NeonDB)
	DATABASE_URL: z.string().url(),

	// JWT
	JWT_SECRET: z.string().min(32),
	JWT_REFRESH_SECRET: z.string().min(32),
	JWT_ACCESS_EXPIRY: z.string().default('15m'),
	JWT_REFRESH_EXPIRY: z.string().default('7d'),

	// CORS
	CORS_ORIGIN: z.string().default('http://localhost:3000'),

	// Cloudinary
	CLOUDINARY_CLOUD_NAME: z.string().min(1),
	CLOUDINARY_API_KEY: z.string().min(1),
	CLOUDINARY_API_SECRET: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
	console.error('❌ Environment validation failed:');
	console.error(parsed.error.format());
	process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
