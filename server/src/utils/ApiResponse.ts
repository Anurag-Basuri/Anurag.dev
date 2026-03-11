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
}

// Api Response Utility Class
class ApiResponse {
	// 200 OK — Standard success response with optional message.
	static ok<T>(res: Response, data: T, message?: string): void {
		const body: ApiResponseBody<T> = { success: true, data };
		if (message) body.message = message;
		res.status(200).json(body);
	}

	// 201 Created — Resource created successfully.
	static created<T>(res: Response, data: T, message = 'Created successfully'): void {
		res.status(201).json({ success: true, data, message } satisfies ApiResponseBody<T>);
	}

	// 200 OK — List of items with pagination metadata.
	static paginated<T>(res: Response, items: T[], meta: PaginationMeta): void {
		res.status(200).json({
			success: true,
			data: items,
			meta,
		} satisfies ApiResponseBody<T[]>);
	}

	// 204 No Content — Action completed, nothing to return (e.g. delete).
	static noContent(res: Response): void {
		res.status(204).send();
	}
}

export { ApiResponse };
export type { ApiResponseBody, PaginationMeta };
