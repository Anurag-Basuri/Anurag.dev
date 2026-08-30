'use client';

import { memo, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { PlatformStats } from '@/api/schema';
import { staggerItem } from '@/animations/motion';
import { cn } from '@/lib/utils';
import { SpotlightCard } from '@/ui/SpotlightCard';
import type { PlatformConfig } from './constants';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SKELETON
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export function CodingStatsSkeleton() {
	return (
		<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto animate-pulse pb-12 pt-6">
			<div className="space-y-3 mb-8">
				<div className="h-5 w-28 bg-foreground/5 rounded-lg" />
				<div className="h-8 w-48 bg-foreground/5 rounded-xl" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
				{[1, 2].map(i => (
					<div key={i} className="h-52 rounded-xl border border-border bg-foreground/5" />
				))}
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
				{[1, 2, 3, 4].map(i => (
					<div key={i} className="h-36 rounded-xl border border-border bg-foreground/5" />
				))}
			</div>
		</div>
	);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SVG DONUT CHART (Real data â€” for LeetCode/GFG difficulty)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const SVGDoughnutChart = memo(function SVGDoughnutChart({
	easy,
	medium,
	hard,
	total,
	size = 72,
	strokeWidth = 7,
}: {
	easy: number;
	medium: number;
	hard: number;
	total: number;
	size?: number;
	strokeWidth?: number;
}) {
	const shouldReduceMotion = useReducedMotion();
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;

	const easyPct = total > 0 ? easy / total : 0;
	const mediumPct = total > 0 ? medium / total : 0;
	const hardPct = total > 0 ? hard / total : 0;

	const easyDash = easyPct * circumference;
	const mediumDash = mediumPct * circumference;
	const hardDash = hardPct * circumference;

	const mediumOffset = circumference - easyDash;
	const hardOffset = circumference - easyDash - mediumDash;

	return (
		<div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
			<svg width={size} height={size} className="transform -rotate-90">
				<circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-foreground/5" />
				{easy > 0 && (
					<motion.circle
						cx={size/2} cy={size/2} r={radius}
						stroke="#10b981" strokeWidth={strokeWidth} fill="transparent" strokeLinecap="round"
						initial={{ strokeDasharray: `0 ${circumference}` }}
						whileInView={{ strokeDasharray: `${easyDash} ${circumference}` }}
						transition={{ duration: shouldReduceMotion ? 0 : 0.8 }}
						viewport={{ once: true }}
					/>
				)}
				{medium > 0 && (
					<motion.circle
						cx={size/2} cy={size/2} r={radius}
						stroke="#f59e0b" strokeWidth={strokeWidth} fill="transparent" strokeDashoffset={mediumOffset} strokeLinecap="round"
						initial={{ strokeDasharray: `0 ${circumference}` }}
						whileInView={{ strokeDasharray: `${mediumDash} ${circumference}` }}
						transition={{ duration: shouldReduceMotion ? 0 : 0.8, delay: shouldReduceMotion ? 0 : 0.15 }}
						viewport={{ once: true }}
					/>
				)}
				{hard > 0 && (
					<motion.circle
						cx={size/2} cy={size/2} r={radius}
						stroke="#ef4444" strokeWidth={strokeWidth} fill="transparent" strokeDashoffset={hardOffset} strokeLinecap="round"
						initial={{ strokeDasharray: `0 ${circumference}` }}
						whileInView={{ strokeDasharray: `${hardDash} ${circumference}` }}
						transition={{ duration: shouldReduceMotion ? 0 : 0.8, delay: shouldReduceMotion ? 0 : 0.3 }}
						viewport={{ once: true }}
					/>
				)}
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
				<span className="text-sm font-black text-foreground">{total}</span>
				<span className="text-[7px] uppercase tracking-widest text-muted-foreground">Solved</span>
			</div>
		</div>
	);
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// STAT PILL (compact inline stat)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function StatPill({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
	return (
		<div className={cn(
			'flex flex-col px-3 py-2 rounded-xl bg-foreground/[0.03] border border-border/50',
			accent && 'border-primary/30 bg-primary/5',
		)}>
			<span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
				{label}
			</span>
			<span className={cn('text-base font-black tracking-tight', accent ? 'text-primary' : 'text-foreground')}>
				{value}
			</span>
		</div>
	);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// LINK-ONLY PILL (profile without stats)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const LinkOnlyPill = memo(function LinkOnlyPill({
	config,
	url,
	username,
}: {
	config: PlatformConfig;
	url: string;
	username: string;
}) {
	const Icon = config.icon;
	return (
		<motion.a
			variants={staggerItem}
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			className="group inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-foreground/[0.03] border border-border hover:border-foreground/20 transition-all duration-300 hover:-translate-y-0.5"
		>
			<div style={{ color: config.accent }}>
				<Icon className="w-4 h-4" />
			</div>
			<div className="flex flex-col min-w-0">
				<span className="text-xs font-bold text-foreground truncate">{config.name}</span>
				<span className="text-[9px] text-muted-foreground truncate">@{username}</span>
			</div>
			<ExternalLink className="w-3 h-3 text-muted-foreground/50 group-hover:text-foreground transition-colors shrink-0" />
		</motion.a>
	);
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HERO CARD â€” Problem Solving (LeetCode / GFG)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const ProblemSolvingCard = memo(function ProblemSolvingCard({
	platform,
	config,
}: {
	platform: PlatformStats;
	config: PlatformConfig;
}) {
	const Icon = config.icon;
	const s = platform.stats;
	const solved = s?.solved ?? 0;
	const easy = s?.easy ?? 0;
	const medium = s?.medium ?? 0;
	const hard = s?.hard ?? 0;

	const difficultyLegend = [
		{ label: 'Easy', count: easy, color: '#10b981' },
		{ label: 'Medium', count: medium, color: '#f59e0b' },
		{ label: 'Hard', count: hard, color: '#ef4444' },
	];

	return (
		<motion.div variants={staggerItem}>
			<SpotlightCard
				spotlightColor={config.accent}
				tilt={true}
				className="rounded-xl border border-border/80 bg-linear-to-br from-foreground/[0.03] to-transparent overflow-hidden transition-all duration-300 hover:border-foreground/30 shadow-md hover:shadow-xl"
			>
			{/* Accent top bar */}
			<div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${config.accent}, transparent)` }} />

			<div className="p-4 sm:p-5">
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg border border-border bg-card" style={{ color: config.accent }}>
							<Icon className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-base font-black text-foreground tracking-tight">{config.name}</h3>
							<span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">@{platform.username}</span>
						</div>
					</div>
					<a
						href={platform.url}
						target="_blank"
						rel="noopener noreferrer"
						className="p-2 rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
						aria-label={`View ${config.name} profile`}
					>
						<ExternalLink className="w-3.5 h-3.5" />
					</a>
				</div>

				{/* Stats body */}
				<div className="flex items-center gap-5">
					{/* Donut */}
					<div className="shrink-0">
						<SVGDoughnutChart easy={easy} medium={medium} hard={hard} total={solved} />
					</div>

					{/* Legend */}
					<div className="flex-1 space-y-2">
						{difficultyLegend.map(d => (
							<div key={d.label} className="flex items-center justify-between text-xs font-bold">
								<span className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
									{d.label}
								</span>
								<span className="text-foreground tabular-nums">{d.count}</span>
							</div>
						))}
					</div>
				</div>

				{/* Bottom stats row */}
				{(s?.rating != null || s?.globalRank != null) && (
					<div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border">
						{s?.rating != null && <StatPill label="Rating" value={s.rating} accent />}
						{s?.maxRating != null && <StatPill label="Max Rating" value={s.maxRating} />}
						{s?.globalRank != null && <StatPill label="Global Rank" value={s.globalRank} />}
					</div>
				)}

				{/* Rating History Chart */}
				{platform.ratingHistory && platform.ratingHistory.length > 1 && (
					<div className="mt-3 pt-3 border-t border-border">
						<div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Contest Rating Trend</div>
						<RatingChart entries={platform.ratingHistory} accent={config.accent} />
					</div>
				)}
			</div>
			</SpotlightCard>
		</motion.div>
	);
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HERO CARD â€” GitHub
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const GitHubCard = memo(function GitHubCard({
	platform,
	config,
}: {
	platform: PlatformStats;
	config: PlatformConfig;
}) {
	const Icon = config.icon;
	const s = platform.stats;

	// Build stats grid from available data
	const statItems: { label: string; value: number; accent?: boolean }[] = [];
	if (s?.commits != null && s.commits > 0) statItems.push({ label: 'Commits', value: s.commits, accent: true });
	if (s?.repos != null) statItems.push({ label: 'Repos', value: s.repos });
	if (s?.stars != null) statItems.push({ label: 'Stars', value: s.stars });
	if (s?.prs != null && s.prs > 0) statItems.push({ label: 'PRs', value: s.prs });
	if (s?.followers != null && s.followers > 0) statItems.push({ label: 'Followers', value: s.followers });
	if (s?.issues != null && s.issues > 0) statItems.push({ label: 'Issues', value: s.issues });

	return (
		<motion.div variants={staggerItem}>
			<SpotlightCard
				spotlightColor={config.accent}
				tilt={true}
				className="rounded-xl border border-border/80 bg-linear-to-br from-foreground/[0.03] to-transparent overflow-hidden transition-all duration-300 hover:border-foreground/30 shadow-md hover:shadow-xl"
			>
			{/* Accent top bar */}
			<div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${config.accent}80, transparent)` }} />

			<div className="p-4 sm:p-5">
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg border border-border bg-card text-foreground">
							<Icon className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-base font-black text-foreground tracking-tight">{config.name}</h3>
							<span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">@{platform.username}</span>
						</div>
					</div>
					<a
						href={platform.url}
						target="_blank"
						rel="noopener noreferrer"
						className="p-2 rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
						aria-label="View GitHub profile"
					>
						<ExternalLink className="w-3.5 h-3.5" />
					</a>
				</div>

				{/* Stats grid */}
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
					{statItems.map(item => (
						<StatPill key={item.label} label={item.label} value={item.value} accent={item.accent} />
					))}
				</div>

				{/* Contribution Heatmap */}
				{platform.contributionHeatmap && platform.contributionHeatmap.length > 0 && (
					<div className="mt-4 pt-3 border-t border-border">
						<div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Contributions (Last Year)</div>
						<ContributionHeatmap days={platform.contributionHeatmap} accent={config.accent} />
					</div>
				)}
			</div>
			</SpotlightCard>
		</motion.div>
	);
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// COMPACT CARD â€” Competitive Platforms (Codeforces, CodeChef, etc.)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const CompetitiveCard = memo(function CompetitiveCard({
	platform,
	config,
}: {
	platform: PlatformStats;
	config: PlatformConfig;
}) {
	const Icon = config.icon;
	const s = platform.stats;

	// Determine the most relevant stats to display
	const statItems: { label: string; value: string | number; accent?: boolean }[] = [];
	if (s?.rating != null) statItems.push({ label: 'Rating', value: s.rating, accent: true });
	if (s?.maxRating != null) statItems.push({ label: 'Peak', value: s.maxRating });
	if (s?.globalRank != null) statItems.push({ label: 'Rank', value: s.globalRank });
	if (s?.solved != null && s.solved > 0) statItems.push({ label: 'Solved', value: s.solved });
	if (s?.stars != null && s.stars > 0) statItems.push({ label: 'Stars', value: `${s.stars}â˜…` });

	return (
		<motion.div variants={staggerItem}>
			<SpotlightCard
				spotlightColor={config.accent}
				tilt={true}
				className="rounded-xl border border-border/80 bg-linear-to-br from-foreground/[0.03] to-transparent overflow-hidden transition-all duration-300 hover:border-foreground/30 shadow-md hover:shadow-xl"
			>
			{/* Accent top bar */}
			<div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${config.accent}, transparent)` }} />

			<div className="p-4">
				{/* Header */}
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2.5">
						<div className="p-1.5 rounded-lg border border-border bg-card" style={{ color: config.accent }}>
							<Icon className="w-4 h-4" />
						</div>
						<div>
							<h3 className="text-sm font-black text-foreground tracking-tight">{config.name}</h3>
							<span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">@{platform.username}</span>
						</div>
					</div>
					<a
						href={platform.url}
						target="_blank"
						rel="noopener noreferrer"
						className="p-1.5 rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
						aria-label={`View ${config.name} profile`}
					>
						<ExternalLink className="w-3 h-3" />
					</a>
				</div>

				{/* Stats */}
				{statItems.length > 0 && (
					<div className="grid grid-cols-2 gap-1.5">
						{statItems.slice(0, 4).map(item => (
							<StatPill key={item.label} label={item.label} value={item.value} accent={item.accent} />
						))}
					</div>
				)}

				{/* Rating History Chart */}
				{platform.ratingHistory && platform.ratingHistory.length > 1 && (
					<div className="mt-3 pt-3 border-t border-border">
						<div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Rating Trend</div>
						<RatingChart entries={platform.ratingHistory} accent={config.accent} />
					</div>
				)}
			</div>
			</SpotlightCard>
		</motion.div>
	);
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CONTRIBUTION HEATMAP (Real GitHub data)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const HEATMAP_COLORS: Record<number, string> = {
	0: 'var(--foreground-5, rgba(255,255,255,0.05))',
	1: 'color-mix(in oklch, var(--theme-primary) 25%, transparent)',
	2: 'color-mix(in oklch, var(--theme-primary) 45%, transparent)',
	3: 'color-mix(in oklch, var(--theme-primary) 70%, transparent)',
	4: 'var(--theme-primary)',
};

const ContributionHeatmap = memo(function ContributionHeatmap({
	days,
	accent,
}: {
	days: Array<{ date: string; count: number; level: number }>;
	accent: string;
}) {
	const shouldReduceMotion = useReducedMotion();

	// Organize into weeks (columns) Ã— days (rows)
	const weeks = useMemo(() => {
		const result: Array<Array<{ date: string; count: number; level: number }>> = [];
		let currentWeek: typeof result[0] = [];

		for (const day of days) {
			const d = new Date(day.date);
			if (d.getDay() === 0 && currentWeek.length > 0) {
				result.push(currentWeek);
				currentWeek = [];
			}
			currentWeek.push(day);
		}
		if (currentWeek.length > 0) result.push(currentWeek);
		return result;
	}, [days]);

	const cellSize = 10;
	const gap = 2;
	const totalWidth = weeks.length * (cellSize + gap);
	const totalHeight = 7 * (cellSize + gap);

	return (
		<div className="w-full overflow-x-auto overflow-y-hidden scrollbar-none">
			<svg
				width={totalWidth}
				height={totalHeight}
				className="block min-w-full"
				style={{ minWidth: totalWidth }}
			>
				{weeks.map((week, wi) =>
					week.map((day, di) => (
						<motion.rect
							key={day.date}
							x={wi * (cellSize + gap)}
							y={di * (cellSize + gap)}
							width={cellSize}
							height={cellSize}
							rx={2}
							fill={HEATMAP_COLORS[day.level] ?? HEATMAP_COLORS[0]}
							initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
							whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.2, delay: shouldReduceMotion ? 0 : wi * 0.01 }}
						>
							<title>{day.date}: {day.count} contribution{day.count !== 1 ? 's' : ''}</title>
						</motion.rect>
					))
				)}
			</svg>
		</div>
	);
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// RATING CHART (Real LeetCode / Codeforces data)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const RatingChart = memo(function RatingChart({
	entries,
	accent,
}: {
	entries: Array<{ date: string; rating: number; contestName?: string }>;
	accent: string;
}) {
	const shouldReduceMotion = useReducedMotion();

	const { pathStr, areaStr, points, minR, maxR, width, height } = useMemo(() => {
		const w = 300;
		const h = 60;
		const padY = 4;

		const ratings = entries.map(e => e.rating);
		const mn = Math.min(...ratings);
		const mx = Math.max(...ratings);
		const range = mx - mn || 1;

		const pts = entries.map((e, i) => ({
			x: (i / (entries.length - 1)) * w,
			y: h - padY - ((e.rating - mn) / range) * (h - padY * 2),
			rating: e.rating,
			name: e.contestName,
		}));

		const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
		const area = `${line} L ${w},${h} L 0,${h} Z`;

		return { pathStr: line, areaStr: area, points: pts, minR: mn, maxR: mx, width: w, height: h };
	}, [entries]);

	return (
		<div className="w-full">
			<svg width="100%" height={height + 16} viewBox={`0 0 ${width} ${height + 16}`} preserveAspectRatio="none" className="overflow-visible">
				<defs>
					<linearGradient id={`rg-${accent}`} x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stopColor={accent} stopOpacity="0.2" />
						<stop offset="100%" stopColor={accent} stopOpacity="0" />
					</linearGradient>
				</defs>

				{/* Area fill */}
				<motion.path
					d={areaStr}
					fill={`url(#rg-${accent})`}
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					transition={{ duration: shouldReduceMotion ? 0 : 0.8 }}
					viewport={{ once: true }}
				/>

				{/* Line */}
				<motion.path
					d={pathStr}
					fill="none"
					stroke={accent}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					initial={{ pathLength: 0 }}
					whileInView={{ pathLength: 1 }}
					transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: 'easeOut' }}
					viewport={{ once: true }}
				/>

				{/* End dot */}
				{points.length > 0 && (
					<circle
						cx={points[points.length - 1].x}
						cy={points[points.length - 1].y}
						r={3}
						fill={accent}
					/>
				)}

				{/* Min/Max labels */}
				<text x={0} y={height + 12} fill="currentColor" className="text-muted-foreground" fontSize="8" fontWeight="bold">{minR}</text>
				<text x={width} y={height + 12} fill="currentColor" className="text-muted-foreground" fontSize="8" fontWeight="bold" textAnchor="end">{maxR}</text>
			</svg>
		</div>
	);
});
