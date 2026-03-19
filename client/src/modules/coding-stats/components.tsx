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
		<div className="p-4 sm:p-6 md:p-12 space-y-6 animate-pulse max-w-7xl mx-auto pb-32">
			<div className="h-10 bg-foreground/5 rounded w-56 mb-8" />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
				<div className="h-[400px] border border-border bg-foreground/5 rounded-[2.5rem] md:col-span-2 lg:col-span-2 lg:row-span-2" />
				{[1, 2, 3].map(i => (
					<div key={i} className="h-64 rounded-[2.5rem] border border-border bg-foreground/5" />
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
	size = 150,
	strokeWidth = 10,
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
			<div className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] z-10 pointer-events-none" />

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
			<div className="absolute inset-0 flex flex-col items-center justify-center pt-1 z-20">
				<span className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter drop-shadow-md">{value}</span>
				<span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">
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
		<div className="space-y-2">
			<div className="flex justify-between items-end text-xs px-1">
				<span className={cn('font-black uppercase tracking-[0.15em]', config.color)}>{config.label}</span>
				<span className="text-foreground font-bold">{count}</span>
			</div>
			<div className={cn('h-2.5 w-full rounded-full overflow-hidden border border-black/50 shadow-inner', config.container)}>
				<motion.div
					initial={{ width: 0 }}
					whileInView={{ width: `${pct}%` }}
					viewport={{ once: true }}
					transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: [0.25, 1, 0.5, 1] }}
					className={cn('h-full rounded-full shadow-[0_0_10px_currentColor]', config.bg)}
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
		<div className="flex flex-col justify-center px-4 py-3 rounded-2xl bg-background/40 border border-border shadow-inner transition-colors group-hover:bg-card">
			<div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
				{label}
			</div>
			<div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{value}</div>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════════
// LINK-ONLY CARD (fallback when no stats available)
// ═══════════════════════════════════════════════════════════════════

export const LinkOnlyCard = memo(function LinkOnlyCard({
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
			whileHover={cardHover}
			className={cn(
				'group relative flex items-center gap-5 p-5 md:p-6 rounded-3xl bg-linear-to-br border border-border backdrop-blur-md overflow-hidden transition-all duration-500 shadow-xl cursor-pointer',
				config.accentBorder,
				config.accentBg,
			)}
		>
			<div className={cn('p-4 rounded-3xl bg-card border border-border shadow-xl', config.accentText)}>
				<Icon className="w-8 h-8" />
			</div>
			<div className="flex-1 min-w-0">
				<h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">{config.name}</h3>
				<p className={cn('text-[10px] font-black uppercase tracking-wider mt-1 truncate', config.accentText)}>
					@{username}
				</p>
			</div>
			<ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
		</motion.a>
	);
});

// ═══════════════════════════════════════════════════════════════════
// LEETCODE CARD (large, with circular progress + difficulty bars)
// ═══════════════════════════════════════════════════════════════════

export const LeetCodeCard = memo(function LeetCodeCard({
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
				'group relative rounded-3xl bg-linear-to-br border border-border backdrop-blur-md p-6 sm:p-8 overflow-hidden transition-all duration-500 md:col-span-2 lg:col-span-2 shadow-2xl',
				config.accentBg,
				config.accentBorder,
			)}
		>
			{/* Ambient glow */}
			<div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -z-10 pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700" />

			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10 relative z-10">
				<div className="flex items-center gap-5">
					<div className={cn('p-4 rounded-3xl bg-card border border-border shadow-xl', config.accentText)}>
						<Icon className="w-10 sm:w-12 h-10 sm:h-12" />
					</div>
					<div>
						<h2 className="text-xl sm:text-3xl font-black text-foreground tracking-tight mb-1">{config.name}</h2>
						<p className={cn('text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em]', config.accentText)}>
							@{platform.username}
						</p>
					</div>
				</div>
				<a
					href={platform.url}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background/40 border border-border text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400 hover:text-foreground hover:bg-card hover:border-amber-500/30 transition-all self-start shadow-inner"
				>
					Profile <ExternalLink className="w-3.5 h-3.5" />
				</a>
			</div>

			{/* Stats body */}
			<div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 relative z-10 bg-card/40 p-5 sm:p-6 rounded-2xl border border-border w-full">
				<CircularProgress value={solved} max={LEETCODE_MAX} color={config.accent} size={130} />
				<div className="flex-1 w-full space-y-5">
					<DifficultyBar count={easy} total={solved} config={DIFF_CONFIG.easy} />
					<DifficultyBar count={medium} total={solved} config={DIFF_CONFIG.medium} />
					<DifficultyBar count={hard} total={solved} config={DIFF_CONFIG.hard} />
				</div>
				{(s?.globalRank || s?.rating) && (
					<div className="flex flex-row md:flex-col gap-4 w-full md:w-40 justify-center">
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
				'group relative rounded-3xl bg-linear-to-br backdrop-blur-md border border-border p-5 sm:p-6 overflow-hidden transition-all duration-500 shadow-xl',
				config.accentBg,
				config.accentBorder,
			)}
		>
			{/* Ambient glow */}
			<div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/10 rounded-full blur-[50px] -z-10 pointer-events-none group-hover:bg-zinc-500/20 transition-colors duration-700" />

			{/* Header */}
			<div className="flex items-center justify-between gap-4 mb-8 relative z-10">
				<div className="flex items-center gap-4">
					<div className={cn('p-3 rounded-[1.2rem] bg-card border border-border shadow-xl', config.accentText)}>
						<Icon className="w-8 h-8" />
					</div>
					<div>
						<h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-tight">{config.name}</h3>
						<p className={cn('text-[9px] sm:text-[10px] font-black uppercase tracking-wider', config.accentText)}>
							@{platform.username}
						</p>
					</div>
				</div>
				<a
					href={platform.url}
					target="_blank"
					rel="noopener noreferrer"
					className="p-3 rounded-xl bg-background/40 border border-border text-zinc-400 hover:text-foreground hover:bg-card hover:border-zinc-500/30 transition-all self-start shadow-inner"
					aria-label="View GitHub profile"
				>
					<ExternalLink className="w-4 h-4" />
				</a>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 relative z-10">
				<StatPill label="Stars" value={s?.stars ?? 0} />
				<StatPill label="Followers" value={s?.followers ?? 0} />
				<StatPill label="PRs" value={s?.prs ?? 0} />
				<StatPill label="Issues" value={s?.issues ?? 0} />
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
				'group relative rounded-3xl bg-linear-to-br backdrop-blur-md border border-border p-5 sm:p-6 overflow-hidden transition-all duration-500 shadow-xl',
				config.accentBg,
				config.accentBorder,
			)}
		>
			<div className="absolute top-0 right-0 w-32 h-32 bg-current/5 rounded-full blur-[50px] -z-10 pointer-events-none transition-colors duration-700" style={{ color: config.accent }} />

			{/* Header */}
			<div className="flex items-center justify-between gap-4 mb-8 relative z-10">
				<div className="flex items-center gap-4">
					<div className={cn('p-3 rounded-[1.2rem] bg-card border border-border shadow-xl', config.accentText)}>
						<Icon className="w-8 h-8" />
					</div>
					<div>
						<h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-tight">{config.name}</h3>
						<p className={cn('text-[9px] sm:text-[10px] font-black uppercase tracking-wider', config.accentText)}>
							@{platform.username}
						</p>
					</div>
				</div>
				<a
					href={platform.url}
					target="_blank"
					rel="noopener noreferrer"
					className={cn('p-3 rounded-xl bg-background/40 border border-border hover:text-foreground hover:bg-card transition-all self-start shadow-inner', config.accentText, `hover:border-${config.accentBg.split('-')[1]}-500/30`)}
					aria-label={`View ${config.name} profile`}
				>
					<ExternalLink className="w-4 h-4" />
				</a>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 relative z-10">
				<StatPill label="Rating" value={s?.rating ?? 'N/A'} />
				<StatPill label="Max Rating" value={s?.maxRating ?? 'N/A'} />
				{s?.globalRank != null && <StatPill label="Global Rank" value={s.globalRank} />}
				{s?.stars != null && <StatPill label="Stars" value={`${s.stars}★`} />}
				{s?.solved != null && <StatPill label="Solved" value={s.solved} />}
			</div>
		</motion.div>
	);
});
