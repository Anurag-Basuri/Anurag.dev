import { Response } from 'express';

interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

interface ApiResponseBody<T> {
	success: true;
	data: T;
	message?: string;
	meta?: PaginationMeta;
	timestamp: string;
}

// Standardized API response utility
class ApiResponse {
	// 200 OK
	static ok<T>(res: Response, data: T, message?: string): void {
		const body: ApiResponseBody<T> = {
			success: true,
			data,
			timestamp: new Date().toISOString(),
		};
		if (message) body.message = message;
		res.status(200).json(body);
	}

	// 201 Created
	static created<T>(res: Response, data: T, message = 'Created successfully'): void {
		res.status(201).json({
			success: true,
			data,
			message,
			timestamp: new Date().toISOString(),
		} satisfies ApiResponseBody<T>);
	}

	// 200 OK with pagination
	static paginated<T>(res: Response, items: T[], meta: PaginationMeta): void {
		res.status(200).json({
			success: true,
			data: items,
			meta,
			timestamp: new Date().toISOString(),
		} satisfies ApiResponseBody<T[]>);
	}

	// 204 No Content
	static noContent(res: Response): void {
		res.status(204).send();
	}
}

export { ApiResponse };
export type { ApiResponseBody, PaginationMeta };
