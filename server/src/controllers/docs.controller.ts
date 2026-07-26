import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

// Get README.md handler
export async function getReadme(_req: Request, res: Response): Promise<void> {
	try {
		// Try checking relative to server directory and then monorepo root
		const pathsToTry = [
			path.resolve(process.cwd(), '../README.md'),
			path.resolve(process.cwd(), 'README.md'),
		];

		let targetPath = '';
		for (const p of pathsToTry) {
			if (fs.existsSync(p)) {
				targetPath = p;
				break;
			}
		}

		if (!targetPath) {
			throw ApiError.NotFound('README.md not found in project root');
		}

		const stats = fs.statSync(targetPath);
		const content = fs.readFileSync(targetPath, 'utf-8');

		const lines = content.split('\n').length;
		const words = content.trim().split(/\s+/).length;

		ApiResponse.ok(
			res,
			{
				metadata: {
					sizeBytes: stats.size,
					lastModified: stats.mtime.toISOString(),
					lines,
					words,
				},
				content,
			},
			'System Document retrieved securely',
		);
	} catch (error) {
		if (error instanceof ApiError) throw error;

		console.error('Failed to read README.md', error);
		throw new ApiError(500, 'Failed to extract system document data');
	}
}
