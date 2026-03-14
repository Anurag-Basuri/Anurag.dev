import { Request } from 'express';

// Type-safe request types for route params
type IdRequest = Request<{ id: string }>;
type SlugRequest = Request<{ slug: string }>;

export type { IdRequest, SlugRequest };
