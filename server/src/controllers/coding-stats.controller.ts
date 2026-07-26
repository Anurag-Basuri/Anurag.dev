import { Request, Response } from 'express';
import { getCodingStatsData } from '../services/coding-stats.service';
import { ApiResponse } from '../utils/ApiResponse';

// Get coding stats handler
async function getCodingStats(_req: Request, res: Response): Promise<void> {
	const stats = await getCodingStatsData();
	ApiResponse.ok(res, stats);
}

export { getCodingStats };
