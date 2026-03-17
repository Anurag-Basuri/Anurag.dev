import type { PlatformStats } from '@/api/schema';

export function hasStats(platform: PlatformStats | undefined | null): boolean {
	if (!platform?.stats) return false;
	return Object.values(platform.stats).some(v => v !== undefined && v !== null && v !== 0);
}
