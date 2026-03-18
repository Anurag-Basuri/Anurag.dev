import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export async function getReadme(_req: Request, res: Response): Promise<void> {
	try {
		// Project root is expected to be one level up from server (if server is in d:/.../server)
		const readmePath = path.resolve(__dirname, '../../../README.md');
		const relativeFallback = path.resolve(process.cwd(), '../README.md');
        
        let targetPath = readmePath;
        if (!fs.existsSync(targetPath)) {
            if (fs.existsSync(relativeFallback)) {
                targetPath = relativeFallback;
            } else {
                throw ApiError.NotFound('README.md not found in project root');
            }
        }

		const stats = fs.statSync(targetPath);
		const content = fs.readFileSync(targetPath, 'utf-8');

		const lines = content.split('\n').length;
		const words = content.trim().split(/\s+/).length;

		ApiResponse.ok(res, {
			metadata: {
				sizeBytes: stats.size,
				lastModified: stats.mtime.toISOString(),
				lines,
				words,
			},
			content,
		}, 'System Document retrieved securely');
	} catch (error) {
		if (error instanceof ApiError) throw error;
		
        console.error('Failed to read README.md', error);
		throw new ApiError(500, 'Failed to extract system document data');
	}
}
