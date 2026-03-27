import cors from 'cors';
import { env } from '../config/env';

const allowedOrigins = env.CORS_ORIGIN.split(',')
	.map(o => o.trim())
	.filter(Boolean);

const allowAnyOrigin = allowedOrigins.includes('*');

const corsOptions: cors.CorsOptions = {
	origin: allowAnyOrigin ? true : allowedOrigins,
	credentials: !allowAnyOrigin,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	maxAge: 86400, // 24 hours
};

export default cors(corsOptions);
