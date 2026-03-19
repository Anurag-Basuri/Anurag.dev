import { Request } from 'express';

// Type-safe request types for route params
type IdRequest = Request<{ id: string }>;

export type { IdRequest };
