'use client';

import { useEffect, useState, useMemo } from 'react';
import { publicService } from '@/api';
import type { CodingStats, PlatformStats, Profile } from '@/api/schema';

import { Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { staggerContainer } from '@/animations/motion';

import { PLATFORMS, type PlatformConfig } from './constants';
import { hasStats } from './utils';
import {
	CodingStatsSkeleton,
	LinkOnlyCard,
	LeetCodeCard,
	GitHubCard,
	CompetitiveCard,
} from './components';

// ═══════════════════════════════════════════════════════════════════
// MAIN MODULE
// ═══════════════════════════════════════════════════════════════════

export function CodingStatsModule() {
	const [stats, setStats] = useState<CodingStats | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		async function fetchData() {
			try {
				const [statsRes, profileRes] = await Promise.all([
					publicService.getCodingStats(),
					publicService.getProfile(),
				]);
				if (!cancelled) {
					setStats(statsRes.data);
					setProfile(profileRes.data);
				}
			} catch (err) {
				console.error('Failed to load coding stats', err);
				if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		fetchData();
		return () => { cancelled = true; };
	}, []);

	// Determine which platforms have data
	const platformEntries = useMemo(() => {
		if (!stats && !profile) return [];

		const entries: Array<{ config: PlatformConfig; platform: PlatformStats | null; hasData: boolean }> = [];

		for (const cfg of PLATFORMS) {
			let p = stats ? (stats as unknown as Record<string, PlatformStats | undefined>)[cfg.key] ?? null : null;
			
			// Inject from profile if fallback needed
			if (!p && profile) {
				const profileUrl = (profile as unknown as Record<string, string | null>)[cfg.key];
				if (profileUrl) {
					const cleanUrl = profileUrl.endsWith('/') ? profileUrl.slice(0, -1) : profileUrl;
					const fallbackUsername = cleanUrl.split('/').pop() || cfg.name;
					p = { url: cleanUrl, username: fallbackUsername, stats: {} };
				}
			}

			if (p && p.username && p.url) {
				entries.push({ config: cfg, platform: p, hasData: hasStats(p) });
			}
		}

		return entries;
	}, [stats, profile]);

	if (loading) return <CodingStatsSkeleton />;

	if (error || platformEntries.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-32 text-center max-w-7xl mx-auto">
				<div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-6 shadow-inner">
					<Terminal className="w-8 h-8 text-orange-400" />
				</div>
				<p className="text-xl font-bold text-white mb-2 tracking-tight">
					{error ? 'Failed to Sync Telemetry' : 'No Profiles Configured'}
				</p>
				<p className="text-sm text-white/50 mb-8 max-w-sm">
					{error || "Connect your coding profiles in the admin dashboard to see your stats here."}
				</p>
			</div>
		);
	}

	return (
		<div className="h-full w-full">
			<div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto pb-24 sm:pb-32">
				<SectionHeader
					icon={Terminal}
					label="Telemetry"
					title="Coding Profiles"
					description="Live performance metrics and activity across competitive programming, problem solving, and open source platforms."
					accent="orange"
				/>

				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: '-20px' }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16"
				>
					{platformEntries.map(({ config, platform, hasData }) => {
						if (!platform) return null;

						// No stats available → show link-only card
						if (!hasData) {
							return (
								<LinkOnlyCard
									key={config.key}
									config={config}
									url={platform.url}
									username={platform.username}
								/>
							);
						}

						// LeetCode → large featured card
						if (config.key === 'leetcode') {
							return <LeetCodeCard key={config.key} platform={platform} config={config} />;
						}

						// GitHub → stats grid card
						if (config.key === 'github') {
							return <GitHubCard key={config.key} platform={platform} config={config} />;
						}

						// Codeforces / CodeChef / others → competitive rating card
						return <CompetitiveCard key={config.key} platform={platform} config={config} />;
					})}
				</motion.div>
			</div>
		</div>
	);
}
