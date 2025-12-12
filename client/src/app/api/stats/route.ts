import { NextResponse } from 'next/server';
import { codingStatsService } from '@/lib/stats';

export async function GET() {
	try {
		const stats = await codingStatsService.getAllStats();
		return NextResponse.json(stats);
	} catch (error) {
		console.error('Error fetching stats:', error);
		return NextResponse.json({ error: 'Failed to fetch coding stats' }, { status: 500 });
	}
}
