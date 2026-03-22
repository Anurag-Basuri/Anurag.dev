'use client';

import { memo } from 'react';
import { ExternalLink } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { PlatformStats } from '@/api/schema';
import { staggerItem, fadeInUp, cardHover } from '@/animations/motion';
import { cn } from '@/lib/utils';
import { ANIM_DURATION, DIFF_CONFIG, LEETCODE_MAX, type PlatformConfig } from './constants';

// ═══════════════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════════════

export function CodingStatsSkeleton() {
	return (
		<div className="p-4 sm:p-6 md:p-12 space-y-4 animate-pulse max-w-7xl mx-auto pb-16">
			<div className="h-8 bg-foreground/5 rounded w-48 mb-6" />
			<div className="h-[280px] border border-border bg-foreground/5 rounded-xl" />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{[1, 2].map(i => (
					<div key={i} className="h-48 rounded-xl border border-border bg-foreground/5" />
				))}
			</div>
			<div className="flex flex-wrap gap-3 mt-4">
				{[1, 2, 3].map(i => (
					<div key={i} className="h-10 w-36 rounded-lg border border-border bg-foreground/5" />
				))}
			</div>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════════
// CIRCULAR PROGRESS (for LeetCode)
// ═══════════════════════════════════════════════════════════════════

export const CircularProgress = memo(function CircularProgress({
	value,
	max,
	color,
	size = 120,
	strokeWidth = 8,
}: {
	value: number;
	max: number;
	color: string;
	size?: number;
	strokeWidth?: number;
}) {
	const shouldReduceMotion = useReducedMotion();
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const progress = Math.min(value / max, 1);
	const dashoffset = circumference - progress * circumference;

	return (
		<div
			className="relative flex items-center justify-center shrink-0"
			style={{ width: size, height: size }}
			role="progressbar"
			aria-valuenow={value}
			aria-valuemin={0}
			aria-valuemax={max}
		>
			<div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] z-10 pointer-events-none" />

			<svg width={size} height={size} className="transform -rotate-90">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					className="text-black/50"
				/>
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={color}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeLinecap="round"
					initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
					whileInView={{ strokeDashoffset: dashoffset }}
					viewport={{ once: true }}
					transition={{ duration: shouldReduceMotion ? 0 : ANIM_DURATION, ease: 'easeOut' }}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5 z-20">
				<span className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter drop-shadow-md">{value}</span>
				<span className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5">
					solved
				</span>
			</div>
		</div>
	);
});

// ═══════════════════════════════════════════════════════════════════
// DIFFICULTY BAR (for LeetCode)
// ═══════════════════════════════════════════════════════════════════

export const DifficultyBar = memo(function DifficultyBar({
	count,
	total,
	config,
}: {
	count: number;
	total: number;
	config: (typeof DIFF_CONFIG)[keyof typeof DIFF_CONFIG];
}) {
	const shouldReduceMotion = useReducedMotion();
	const pct = total > 0 ? (count / total) * 100 : 0;

	return (
		<div className="space-y-1">
			<div className="flex justify-between items-end text-[10px] px-0.5">
				<span className={cn('font-black uppercase tracking-[0.15em]', config.color)}>{config.label}</span>
				<span className="text-foreground font-bold">{count}</span>
			</div>
			<div className={cn('h-2 w-full rounded-full overflow-hidden border border-black/50 shadow-inner', config.container)}>
				<motion.div
					initial={{ width: 0 }}
					whileInView={{ width: `${pct}%` }}
					viewport={{ once: true }}
					transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: [0.25, 1, 0.5, 1] }}
					className={cn('h-full rounded-full shadow-[0_0_8px_currentColor]', config.bg)}
				/>
			</div>
		</div>
	);
});

// ═══════════════════════════════════════════════════════════════════
// STAT PILL (small inline stat)
// ═══════════════════════════════════════════════════════════════════

export function StatPill({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex flex-col justify-center px-3 py-2 rounded-lg bg-background/40 border border-border shadow-inner transition-colors group-hover:bg-card">
			<div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5">
				{label}
			</div>
			<div className="text-sm sm:text-base font-black text-foreground tracking-tight">{value}</div>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════════
// LINK-ONLY PILL (compact pill for platforms without stats)
// ═══════════════════════════════════════════════════════════════════

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
			className={cn(
				'group inline-flex items-center gap-2.5 px-3 py-2 rounded-lg bg-linear-to-br border border-border backdrop-blur-md overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer',
				config.accentBorder,
				config.accentBg,
			)}
		>
			<div className={cn('shrink-0', config.accentText)}>
				<Icon className="w-4 h-4" />
			</div>
			<div className="flex items-center gap-1.5 min-w-0">
				<span className="text-xs font-bold text-foreground truncate">{config.name}</span>
				<span className={cn('text-[9px] font-bold truncate hidden sm:inline', config.accentText)}>
					@{username}
				</span>
			</div>
			<ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
		</motion.a>
	);
});

// ═══════════════════════════════════════════════════════════════════
// PROBLEM SOLVING CARD (hero, with circular progress + difficulty bars)
// ═══════════════════════════════════════════════════════════════════

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

	return (
		<motion.div
			variants={fadeInUp}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
			whileHover={cardHover}
			className={cn(
				'group relative rounded-xl bg-linear-to-br border border-border backdrop-blur-md p-4 sm:p-5 overflow-hidden transition-all duration-500 shadow-2xl',
				config.accentBg,
				config.accentBorder,
			)}
		>
			{/* Ambient glow */}
			<div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] -z-10 pointer-events-none group-hover:opacity-80 transition-opacity duration-700 opacity-50" style={{ background: `${config.accent}15` }} />

			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
				<div className="flex items-center gap-3">
					<div className={cn('p-2.5 rounded-lg bg-card border border-border shadow-lg', config.accentText)}>
						<Icon className="w-6 sm:w-7 h-6 sm:h-7" />
					</div>
					<div>
						<h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">{config.name}</h2>
						<p className={cn('text-[9px] font-black uppercase tracking-[0.15em]', config.accentText)}>
							@{platform.username}
						</p>
					</div>
				</div>
				<a
					href={platform.url}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/40 border border-border text-[10px] font-black uppercase tracking-wider hover:text-foreground hover:bg-card transition-all self-start shadow-inner"
					style={{ color: config.accent }}
				>
					Profile <ExternalLink className="w-3 h-3" />
				</a>
			</div>

			{/* Stats body */}
			<div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 relative z-10 bg-card/40 p-3 sm:p-4 rounded-lg border border-border w-full">
				<CircularProgress value={solved} max={LEETCODE_MAX} color={config.accent} size={110} strokeWidth={7} />
				<div className="flex-1 w-full space-y-3">
					<DifficultyBar count={easy} total={solved} config={DIFF_CONFIG.easy} />
					<DifficultyBar count={medium} total={solved} config={DIFF_CONFIG.medium} />
					<DifficultyBar count={hard} total={solved} config={DIFF_CONFIG.hard} />
				</div>
				{(s?.globalRank || s?.rating) && (
					<div className="flex flex-row sm:flex-col gap-3 w-full sm:w-32 justify-center">
						{s?.globalRank && <StatPill label="Global Rank" value={s.globalRank} />}
						{s?.rating && <StatPill label="Rating" value={Math.round(s.rating)} />}
					</div>
				)}
			</div>
		</motion.div>
	);
});

// ═══════════════════════════════════════════════════════════════════
// GITHUB CARD (with stats grid)
// ═══════════════════════════════════════════════════════════════════

export const GitHubCard = memo(function GitHubCard({
	platform,
	config,
}: {
	platform: PlatformStats;
	config: PlatformConfig;
}) {
	const Icon = config.icon;
	const s = platform.stats;

	return (
		<motion.div
			variants={staggerItem}
			whileHover={cardHover}
			className={cn(
				'group relative rounded-xl bg-linear-to-br backdrop-blur-md border border-border p-4 sm:p-5 overflow-hidden transition-all duration-500 shadow-xl md:col-span-2',
				config.accentBg,
				config.accentBorder,
			)}
		>
			{/* Ambient glow */}
			<div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/10 rounded-full blur-2xl -z-10 pointer-events-none group-hover:bg-zinc-500/20 transition-colors duration-700" />

			{/* Header */}
			<div className="flex items-center justify-between gap-3 mb-4 relative z-10">
				<div className="flex items-center gap-3">
					<div className={cn('p-2 rounded-lg bg-card border border-border shadow-lg', config.accentText)}>
						<Icon className="w-5 h-5" />
					</div>
					<div>
						<h3 className="text-sm sm:text-base font-black text-foreground tracking-tight leading-tight">{config.name}</h3>
						<p className={cn('text-[9px] font-black uppercase tracking-wider', config.accentText)}>
							@{platform.username}
						</p>
					</div>
				</div>
				<a
					href={platform.url}
					target="_blank"
					rel="noopener noreferrer"
					className="p-2 rounded-lg bg-background/40 border border-border text-zinc-400 hover:text-foreground hover:bg-card hover:border-zinc-500/30 transition-all self-start shadow-inner"
					aria-label="View GitHub profile"
				>
					<ExternalLink className="w-3.5 h-3.5" />
				</a>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative z-10">
				<StatPill label="Repos" value={s?.repos ?? 0} />
				<StatPill label="Stars" value={s?.stars ?? 0} />
				<StatPill label="Followers" value={s?.followers ?? 0} />
				<StatPill label="Following" value={s?.following ?? 0} />
				{(s?.commits != null && s.commits > 0) && <StatPill label="Commits" value={s.commits} />}
				{(s?.prs != null && s.prs > 0) && <StatPill label="PRs" value={s.prs} />}
				{(s?.issues != null && s.issues > 0) && <StatPill label="Issues" value={s.issues} />}
				{(s?.gists != null && s.gists > 0) && <StatPill label="Gists" value={s.gists} />}
			</div>
		</motion.div>
	);
});

// ═══════════════════════════════════════════════════════════════════
// COMPETITIVE CARD (Codeforces / CodeChef — rating-based)
// ═══════════════════════════════════════════════════════════════════

export const CompetitiveCard = memo(function CompetitiveCard({
	platform,
	config,
}: {
	platform: PlatformStats;
	config: PlatformConfig;
}) {
	const Icon = config.icon;
	const s = platform.stats;

	return (
		<motion.div
			variants={staggerItem}
			whileHover={cardHover}
			className={cn(
				'group relative rounded-xl bg-linear-to-br backdrop-blur-md border border-border p-4 sm:p-5 overflow-hidden transition-all duration-500 shadow-xl',
				config.accentBg,
				config.accentBorder,
			)}
		>
			<div className="absolute top-0 right-0 w-24 h-24 bg-current/5 rounded-full blur-2xl -z-10 pointer-events-none transition-colors duration-700" style={{ color: config.accent }} />

			{/* Header */}
			<div className="flex items-center justify-between gap-3 mb-4 relative z-10">
				<div className="flex items-center gap-3">
					<div className={cn('p-2 rounded-lg bg-card border border-border shadow-lg', config.accentText)}>
						<Icon className="w-5 h-5" />
					</div>
					<div>
						<h3 className="text-sm sm:text-base font-black text-foreground tracking-tight leading-tight">{config.name}</h3>
						<p className={cn('text-[9px] font-black uppercase tracking-wider', config.accentText)}>
							@{platform.username}
						</p>
					</div>
				</div>
				<a
					href={platform.url}
					target="_blank"
					rel="noopener noreferrer"
					className={cn('p-2 rounded-lg bg-background/40 border border-border hover:text-foreground hover:bg-card transition-all self-start shadow-inner', config.accentText)}
					aria-label={`View ${config.name} profile`}
				>
					<ExternalLink className="w-3.5 h-3.5" />
				</a>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-2.5 relative z-10">
				<StatPill label="Rating" value={s?.rating ?? 'N/A'} />
				<StatPill label="Max Rating" value={s?.maxRating ?? 'N/A'} />
				{s?.globalRank != null && <StatPill label="Global Rank" value={s.globalRank} />}
				{s?.stars != null && <StatPill label="Stars" value={`${s.stars}★`} />}
				{s?.solved != null && <StatPill label="Solved" value={s.solved} />}
			</div>
		</motion.div>
	);
});
