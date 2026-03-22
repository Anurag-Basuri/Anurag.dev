'use client';

import { useEffect, useState, useMemo } from 'react';
import { publicService } from '@/api';
import type { CodingStats, PlatformStats, Profile } from '@/api/schema';

import { Terminal, Globe, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { staggerContainer, staggerItem } from '@/animations/motion';

import { PLATFORMS, type PlatformConfig } from './constants';
import { hasStats } from './utils';
import {
	CodingStatsSkeleton,
	LinkOnlyPill,
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

	// Categorize platforms
	const { heroCards, standardCards, linkOnlyCards } = useMemo(() => {
		if (!stats && !profile) return { heroCards: [], standardCards: [], linkOnlyCards: [] };

		const hero: Array<{ config: PlatformConfig; platform: PlatformStats }> = [];
		const standard: Array<{ config: PlatformConfig; platform: PlatformStats }> = [];
		const linkOnly: Array<{ config: PlatformConfig; platform: PlatformStats }> = [];
		const processedUrls = new Set<string>();

		// 1. Process standard platforms
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
				const hasData = hasStats(p);
				processedUrls.add(p.url.toLowerCase());

				if (hasData) {
					// LeetCode → hero card
					if (cfg.key === 'leetcode' || cfg.key === 'gfg' || ('easy' in (p.stats || {}))) {
						hero.push({ config: cfg, platform: p });
					}
					// GitHub → standard (wide card)
					else if (cfg.key === 'github' || ('stars' in (p.stats || {}) && !('rating' in (p.stats || {})))) {
						standard.push({ config: cfg, platform: p });
					}
					// Codeforces → standard (competitive card)
					else {
						standard.push({ config: cfg, platform: p });
					}
				} else {
					linkOnly.push({ config: cfg, platform: p });
				}
			}
		}

		// 2. Process otherProfiles from Profile
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
				} catch {
					// Invalid URL string
				}

				const fallbackUsername = cleanUrl.split('/').pop() || domain;

				linkOnly.push({
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
				});
				processedUrls.add(cleanUrl.toLowerCase());
			}
		}

		return { heroCards: hero, standardCards: standard, linkOnlyCards: linkOnly };
	}, [stats, profile]);

	if (loading) return <CodingStatsSkeleton />;

	const totalEntries = heroCards.length + standardCards.length + linkOnlyCards.length;

	if (error || totalEntries === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-32 text-center max-w-7xl mx-auto">
				<div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-6 shadow-inner">
					<Terminal className="w-8 h-8 text-orange-400" />
				</div>
				<p className="text-xl font-bold text-foreground mb-2 tracking-tight">
					{error ? 'Failed to Sync Telemetry' : 'No Profiles Configured'}
				</p>
				<p className="text-xs text-muted-foreground leading-snug mb-8 max-w-sm">
					{error || "Connect your coding profiles in the admin dashboard to see your stats here."}
				</p>
			</div>
		);
	}

	return (
		<div className="h-full w-full">
			<div className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto pb-10 sm:pb-14 pt-6 md:pt-8">
				<SectionHeader
					icon={Terminal}
					label="Telemetry"
					title="Coding Profiles"
					description="Live performance metrics and activity across competitive programming, problem solving, and open source platforms."
					sectionId="coding_stats"
				/>

				{/* ─── Hero Cards (LeetCode / Problem-Solving) ─── */}
				{heroCards.length > 0 && (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-20px' }}
						className="grid grid-cols-1 gap-4 mt-6"
					>
						{heroCards.map(({ config, platform }) => (
							<ProblemSolvingCard key={config.key} platform={platform} config={config} />
						))}
					</motion.div>
				)}

				{/* ─── Standard Cards (GitHub, Codeforces) ─── */}
				{standardCards.length > 0 && (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-20px' }}
						className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
					>
						{standardCards.map(({ config, platform }) => {
							if (config.key === 'github' || ('stars' in (platform.stats || {}) && !('rating' in (platform.stats || {})))) {
								return <GitHubCard key={config.key} platform={platform} config={config} />;
							}
							return <CompetitiveCard key={config.key} platform={platform} config={config} />;
						})}
					</motion.div>
				)}

				{/* ─── Link-Only Profiles (compact pill row) ─── */}
				{linkOnlyCards.length > 0 && (
					<div className="mt-6">
						<div className="flex items-center gap-2 mb-3">
							<ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
							<span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
								More Profiles
							</span>
						</div>
						<motion.div
							variants={staggerContainer}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-20px' }}
							className="flex flex-wrap gap-3"
						>
							{linkOnlyCards.map(({ config, platform }) => (
								<LinkOnlyPill
									key={config.key}
									config={config}
									url={platform.url}
									username={platform.username}
								/>
							))}
						</motion.div>
					</div>
				)}
			</div>
		</div>
	);
}
