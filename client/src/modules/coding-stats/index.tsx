'use client';

import { useEffect, useState, useMemo } from 'react';
import { publicService } from '@/api';
import type { CodingStats, PlatformStats, Profile } from '@/api/schema';

import { Terminal, Globe, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { staggerContainer } from '@/animations/motion';

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
// MAIN MODULE (High-Density Bento Box)
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

	// Categorize platforms into Rich (hero/standard) and LinkOnly 
	// We'll map them seamlessly into the CSS Grid Bento box
	const { richCards, linkOnlyCards } = useMemo(() => {
		if (!stats && !profile) return { richCards: [], linkOnlyCards: [] };

		const rich: Array<{ config: PlatformConfig; platform: PlatformStats; type: 'hero' | 'github' | 'competitive' }> = [];
		const linkOnly: Array<{ config: PlatformConfig; platform: PlatformStats }> = [];
		const processedUrls = new Set<string>();

		// Process standard platforms
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
					if (cfg.key === 'github' || ('stars' in (p.stats || {}) && !('rating' in (p.stats || {})))) {
						rich.push({ config: cfg, platform: p, type: 'github' });
					} else if (cfg.key === 'leetcode' || cfg.key === 'gfg' || ('easy' in (p.stats || {}))) {
						rich.push({ config: cfg, platform: p, type: 'hero' });
					} else {
						rich.push({ config: cfg, platform: p, type: 'competitive' });
					}
				} else {
					linkOnly.push({ config: cfg, platform: p });
				}
			}
		}

		// Process otherProfiles from Profile to generate link-only pills
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

		return { richCards: rich, linkOnlyCards: linkOnly };
	}, [stats, profile]);

	if (loading) return <CodingStatsSkeleton />;

	const totalEntries = richCards.length + linkOnlyCards.length;

	if (error || totalEntries === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-32 text-center max-w-7xl mx-auto">
				<div className="p-5 rounded-3xl bg-orange-500/10 border border-orange-500/20 mb-5 shadow-inner backdrop-blur-3xl">
					<Terminal className="w-8 h-8 text-orange-400" />
				</div>
				<p className="text-xl font-black text-foreground mb-2 tracking-tight">
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
			<div className="px-3 sm:px-6 md:px-10 max-w-400 mx-auto pb-10 sm:pb-14 pt-6 md:pt-8 overflow-hidden">
				<SectionHeader
					icon={Terminal}
					label="Telemetry"
					title="Coding Profiles"
					description="Live performance metrics and activity across competitive programming, problem solving, and open source platforms."
					sectionId="coding_stats"
				/>

				{/* ─── Compact Bento Box Grid Layout ─── */}
				{richCards.length > 0 && (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-20px' }}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mt-6 md:auto-rows-min"
					>
						{richCards.map(({ config, platform, type }) => {
							// Determine grid spanning for smaller scale cards
							// Hero / GitHub span exactly 2 columns on most screens; Competitive single column
							const spanClass = 
								(type === 'github' || type === 'hero') ? 'col-span-1 md:col-span-2' : 
								'col-span-1';

							return (
								<div key={config.key} className={spanClass}>
									{type === 'hero' ? (
										<ProblemSolvingCard platform={platform} config={config} />
									) : type === 'github' ? (
										<GitHubCard platform={platform} config={config} />
									) : (
										<CompetitiveCard platform={platform} config={config} />
									)}
								</div>
							);
						})}
					</motion.div>
				)}

				{/* ─── Link-Only Profiles (compact pill row) ─── */}
				{linkOnlyCards.length > 0 && (
					<div className="mt-8">
						<div className="flex items-center gap-2 mb-3 px-2">
							<ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
							<span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
								Additional Profiles
							</span>
						</div>
						<motion.div
							variants={staggerContainer}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-20px' }}
							className="flex flex-wrap gap-2.5 sm:gap-3"
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
