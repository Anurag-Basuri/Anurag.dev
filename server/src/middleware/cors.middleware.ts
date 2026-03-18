import cors from 'cors';
import { env } from '../config/env';

const allowedOrigins = env.CORS_ORIGIN.split(',')
	.map(o => o.trim())
	.filter(Boolean);

const corsOptions: cors.CorsOptions = {
	origin: allowedOrigins.includes('*') ? true : allowedOrigins,
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	maxAge: 86400, // 24 hours
};

export default cors(corsOptions);
