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
// MAIN MODULE (Stats Dashboard — Option B)
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

	// Categorize platforms into hero (wide), compact (grid), and link-only
	const { heroCards, compactCards, linkOnlyCards } = useMemo(() => {
		if (!stats && !profile) return { heroCards: [], compactCards: [], linkOnlyCards: [] };

		const heroes: Array<{ config: PlatformConfig; platform: PlatformStats; type: 'hero' | 'github' }> = [];
		const compact: Array<{ config: PlatformConfig; platform: PlatformStats }> = [];
		const linkOnly: Array<{ config: PlatformConfig; platform: PlatformStats }> = [];
		const processedUrls = new Set<string>();

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
					// GitHub gets hero treatment
					if (cfg.key === 'github' || ('stars' in (p.stats || {}) && !('rating' in (p.stats || {})))) {
						heroes.push({ config: cfg, platform: p, type: 'github' });
					}
					// Problem-solving platforms (LeetCode, GFG) get hero treatment
					else if (cfg.key === 'leetcode' || cfg.key === 'gfg' || ('easy' in (p.stats || {}))) {
						heroes.push({ config: cfg, platform: p, type: 'hero' });
					}
					// Competitive platforms get compact cards
					else {
						compact.push({ config: cfg, platform: p });
					}
				} else {
					linkOnly.push({ config: cfg, platform: p });
				}
			}
		}

		// Process otherProfiles from Profile for additional link-only pills
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
					// Invalid URL
				}

				const fallbackUsername = cleanUrl.split('/').pop() || domain;

				linkOnly.push({
					config: {
						key: `other-${cleanUrl}`,
						name: domain,
						icon: (props) => <Globe {...props} />,
						accent: '#9ca3af',
						accentBg: '',
						accentBorder: '',
						accentText: 'text-muted-foreground',
					},
					platform: { url: cleanUrl, username: fallbackUsername, stats: {} },
				});
				processedUrls.add(cleanUrl.toLowerCase());
			}
		}

		return { heroCards: heroes, compactCards: compact, linkOnlyCards: linkOnly };
	}, [stats, profile]);

	if (loading) return <CodingStatsSkeleton />;

	const totalEntries = heroCards.length + compactCards.length + linkOnlyCards.length;

	if (error || totalEntries === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-32 text-center max-w-7xl mx-auto">
				<div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-5">
					<Terminal className="w-8 h-8 text-orange-400" />
				</div>
				<p className="text-xl font-bold text-foreground mb-2 tracking-tight font-sans">
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
			<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto pb-8 sm:pb-12 pt-4 md:pt-6">
				<SectionHeader
					icon={Terminal}
					label="Telemetry"
					title="Coding Profiles"
					description="Live performance metrics and activity across competitive programming, problem solving, and open source platforms."
					sectionId="coding_stats"
				/>

				{/* ─── Row 1: Hero Cards (LeetCode, GitHub — 2-col) ─── */}
				{heroCards.length > 0 && (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-20px' }}
						className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6"
					>
						{heroCards.map(({ config, platform, type }) => (
							<div key={config.key}>
								{type === 'hero' ? (
									<ProblemSolvingCard platform={platform} config={config} />
								) : (
									<GitHubCard platform={platform} config={config} />
								)}
							</div>
						))}
					</motion.div>
				)}

				{/* ─── Row 2: Compact Cards (Competitive platforms — 3-4 col) ─── */}
				{compactCards.length > 0 && (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-20px' }}
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-3"
					>
						{compactCards.map(({ config, platform }) => (
							<CompetitiveCard key={config.key} platform={platform} config={config} />
						))}
					</motion.div>
				)}

				{/* ─── Row 3: Link-Only Profiles ─── */}
				{linkOnlyCards.length > 0 && (
					<div className="mt-6">
						<div className="flex items-center gap-2 mb-3">
							<ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
							<span className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
								Additional Profiles
							</span>
						</div>
						<motion.div
							variants={staggerContainer}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-20px' }}
							className="flex flex-wrap gap-2"
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
