'use client';

import { useEffect, useState, useMemo } from 'react';
import { publicService } from '@/api';
import type { CodingStats, PlatformStats, Profile } from '@/api/schema';

import { Terminal, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { staggerContainer } from '@/animations/motion';

import { PLATFORMS, type PlatformConfig } from './constants';
import { hasStats } from './utils';
import {
	CodingStatsSkeleton,
	LinkOnlyCard,
	ProblemSolvingCard,
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
		const processedUrls = new Set<string>();

		// 1. Process standard platforms (LeetCode, GitHub, etc)
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
				processedUrls.add(p.url.toLowerCase());
			}
		}

		// 2. Process otherProfiles from Profile to show as LinkOnlyCards
		if (profile?.otherProfiles && profile.otherProfiles.length > 0) {
			for (const url of profile.otherProfiles) {
				const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
				if (processedUrls.has(cleanUrl.toLowerCase())) continue;
				
				let domain = 'Website';
				try {
					const urlObj = new URL(cleanUrl);
					const hostname = urlObj.hostname.replace('www.', '');
					domain = hostname.split('.')[0] || hostname;
					domain = domain.charAt(0).toUpperCase() + domain.slice(1);
				} catch (e) {
					// Invalid URL string
				}

				const fallbackUsername = cleanUrl.split('/').pop() || domain;

				entries.push({
					config: {
						key: `other-${cleanUrl}`,
						name: domain,
						icon: (props) => <Globe {...props} />,
						accent: '#9ca3af',
						accentBg: 'from-muted/20 to-transparent hover:border-muted-foreground/50',
						accentBorder: 'hover:border-border group-hover:shadow-[0_0_40px_-10px_rgba(156,163,175,0.15)] bg-muted/5',
						accentText: 'text-muted-foreground',
					},
					platform: { url: cleanUrl, username: fallbackUsername, stats: {} },
					hasData: false
				});
				processedUrls.add(cleanUrl.toLowerCase());
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
				<p className="text-xl font-bold text-foreground mb-2 tracking-tight">
					{error ? 'Failed to Sync Telemetry' : 'No Profiles Configured'}
				</p>
				<p className="text-sm text-muted-foreground mb-8 max-w-sm">
					{error || "Connect your coding profiles in the admin dashboard to see your stats here."}
				</p>
			</div>
		);
	}

	return (
		<div className="h-full w-full">
			<div className="px-4 sm:px-6 md:px-8 max-w-4xl mx-auto pb-16 sm:pb-24 pt-8 md:pt-12">
				<SectionHeader
					icon={Terminal}
					label="Telemetry"
					title="Coding Profiles"
					description="Live performance metrics and activity across competitive programming, problem solving, and open source platforms."
					sectionId="coding_stats"
				/>

				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: '-20px' }}
					className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-8 md:mt-12"
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

						// Problem Solving (LeetCode, GFG) → large featured card
						if (config.key === 'leetcode' || config.key === 'gfg' || ('easy' in (platform.stats || {}))) {
							return <ProblemSolvingCard key={config.key} platform={platform} config={config} />;
						}

						// GitHub → stats grid card
						if (config.key === 'github' || ('stars' in (platform.stats || {}) && !('rating' in (platform.stats || {})))) {
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

