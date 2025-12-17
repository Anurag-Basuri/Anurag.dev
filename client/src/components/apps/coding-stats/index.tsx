'use client';

import { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { api, CodingStats } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Code2,
	Trophy,
	Terminal,
	GitCommit,
	Star,
	Activity,
	Github,
	Code,
	ExternalLink,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { ModuleHeader } from '@/components/apps/shared/ModuleHeader';
import { ModuleError } from '@/components/ui/module-error';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';
import { cn } from '@/lib/utils';

// ============================================================================
// CONSTANTS
// ============================================================================

const LEETCODE_MAX_PROBLEMS = 3000;
const ANIMATION_DURATION = 1.5;
const PROGRESS_BAR_DURATION = 1;

const STAT_CARD_CONFIG = [
	{
		key: 'solved',
		label: 'Problems Solved',
		icon: Code2,
		bgClass: 'bg-emerald-500/5',
		iconBgClass: 'bg-emerald-500/10',
		iconTextClass: 'text-emerald-500',
		getValue: (stats: CodingStats) => stats.leetcode.stats?.solved || 0,
	},
	{
		key: 'stars',
		label: 'Stars Earned',
		icon: Star,
		bgClass: 'bg-yellow-500/5',
		iconBgClass: 'bg-yellow-500/10',
		iconTextClass: 'text-yellow-500',
		getValue: (stats: CodingStats) => stats.github.stats?.stars || 0,
	},
	{
		key: 'rating',
		label: 'Peak Rating',
		icon: Trophy,
		bgClass: 'bg-red-500/5',
		iconBgClass: 'bg-red-500/10',
		iconTextClass: 'text-red-500',
		getValue: (stats: CodingStats) => stats.codeforces.stats?.maxRating || 'N/A',
	},
	{
		key: 'loc',
		label: 'Lines of Code',
		icon: GitCommit,
		bgClass: 'bg-blue-500/5',
		iconBgClass: 'bg-blue-500/10',
		iconTextClass: 'text-blue-500',
		getValue: (stats: CodingStats) => stats.github.stats?.linesOfCode || 0,
	},
] as const;

const DIFFICULTY_CONFIG = {
	easy: {
		label: 'Easy',
		color: 'text-emerald-400',
		bgColor: 'bg-emerald-500',
	},
	medium: {
		label: 'Medium',
		color: 'text-yellow-400',
		bgColor: 'bg-yellow-500',
	},
	hard: {
		label: 'Hard',
		color: 'text-red-400',
		bgColor: 'bg-red-500',
	},
} as const;

// ============================================================================
// MEMOIZED COMPONENTS
// ============================================================================

const CodingStatsSkeleton = memo(function CodingStatsSkeleton() {
	return (
		<div className="p-8 space-y-12 animate-pulse max-w-7xl mx-auto">
			<div className="flex justify-between items-center mb-8 border-b border-border/40 pb-4">
				<div className="h-8 bg-muted rounded w-48" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{[1, 2, 3, 4].map(i => (
					<div key={i} className="h-40 bg-card/20 rounded-3xl" />
				))}
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="h-96 bg-card/20 rounded-[2.5rem]" />
				<div className="h-96 bg-card/20 rounded-[2.5rem]" />
			</div>
		</div>
	);
});

const CircularProgress = memo(function CircularProgress({
	value,
	max,
	color,
	size = 120,
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
	const percentage = Math.round(progress * 100);

	return (
		<div
			className="relative flex items-center justify-center"
			style={{ width: size, height: size }}
			role="progressbar"
			aria-valuenow={value}
			aria-valuemin={0}
			aria-valuemax={max}
			aria-label={`${value} problems solved`}
		>
			<svg width={size} height={size} className="transform -rotate-90">
				{/* Background Circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					className="text-white/5"
				/>
				{/* Progress Circle */}
				<motion.circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={color}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeLinecap="round"
					initial={{
						strokeDasharray: circumference,
						strokeDashoffset: circumference,
					}}
					animate={{ strokeDashoffset: dashoffset }}
					transition={{
						duration: shouldReduceMotion ? 0 : ANIMATION_DURATION,
						ease: 'easeOut',
					}}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="text-2xl font-black text-white">{value}</span>
				<span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
					{percentage}%
				</span>
			</div>
		</div>
	);
});

const QuickStatCard = memo(function QuickStatCard({
	label,
	value,
	icon: Icon,
	bgClass,
	iconBgClass,
	iconTextClass,
	index,
}: {
	label: string;
	value: string | number;
	icon: React.ElementType;
	bgClass: string;
	iconBgClass: string;
	iconTextClass: string;
	index: number;
}) {
	return (
		<motion.div
			variants={staggerItem}
			custom={index}
			whileHover={{ y: -5, transition: { duration: 0.2 } }}
			className="relative p-6 rounded-3xl bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5 shadow-2xl overflow-hidden group"
		>
			<div
				className={cn(
					'absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110',
					bgClass,
				)}
			/>
			<div className="relative z-10 flex flex-col gap-4">
				<div
					className={cn(
						'w-10 h-10 rounded-2xl flex items-center justify-center',
						iconBgClass,
						iconTextClass,
					)}
				>
					<Icon className="w-5 h-5" />
				</div>
				<div>
					<div className="text-3xl font-black text-white tracking-tight">{value}</div>
					<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
						{label}
					</div>
				</div>
			</div>
		</motion.div>
	);
});

const DifficultyBar = memo(function DifficultyBar({
	difficulty,
	count,
	total,
	config,
}: {
	difficulty: string;
	count: number;
	total: number;
	config: (typeof DIFFICULTY_CONFIG)[keyof typeof DIFFICULTY_CONFIG];
}) {
	const shouldReduceMotion = useReducedMotion();
	const percentage = total > 0 ? (count / total) * 100 : 0;

	return (
		<div className="space-y-2">
			<div className="flex justify-between items-center text-sm">
				<span className={cn('font-bold', config.color)}>{config.label}</span>
				<span className="text-white font-bold">{count}</span>
			</div>
			<div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
				<motion.div
					initial={{ width: 0 }}
					whileInView={{ width: `${percentage}%` }}
					viewport={{ once: true, margin: '-50px' }}
					transition={{
						duration: shouldReduceMotion ? 0 : PROGRESS_BAR_DURATION,
						ease: 'easeOut',
					}}
					className={cn('h-full', config.bgColor)}
				/>
			</div>
		</div>
	);
});

const PlatformCard = memo(function PlatformCard({
	title,
	username,
	url,
	icon: Icon,
	iconBg,
	iconColor,
	usernameBg,
	stats,
	children,
}: {
	title: string;
	username: string;
	url: string;
	icon: React.ElementType;
	iconBg: string;
	iconColor: string;
	usernameBg: string;
	stats?: React.ReactNode;
	children?: React.ReactNode;
}) {
	const handleProfileClick = useCallback(() => {
		window.open(url, '_blank', 'noopener,noreferrer');
	}, [url]);

	return (
		<div className="relative bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 p-8 overflow-hidden group">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-4">
					<div className={cn('p-3 rounded-2xl', iconBg, iconColor)}>
						<Icon className="w-8 h-8" />
					</div>
					<div>
						<h2 className="text-2xl font-bold text-white">{title}</h2>
						<p className={cn('text-sm font-medium', usernameBg)}>@{username}</p>
					</div>
				</div>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handleProfileClick}
					className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
				>
					<span>View Profile</span>
					<ExternalLink className="w-3.5 h-3.5" />
				</motion.button>
			</div>

			{/* Stats Section */}
			{stats}

			{/* Children (additional content) */}
			{children}
		</div>
	);
});

const MiniPlatformCard = memo(function MiniPlatformCard({
	title,
	username,
	icon: Icon,
	iconBg,
	iconColor,
	usernameBg,
	gradientBg,
	stats,
}: {
	title: string;
	username: string;
	icon: React.ElementType;
	iconBg: string;
	iconColor: string;
	usernameBg: string;
	gradientBg: string;
	stats: Array<{ label: string; value: string | number }>;
}) {
	return (
		<div className="bg-[#0a0a0a] rounded-4xl border border-white/10 p-6 flex flex-col justify-center relative overflow-hidden group">
			<div
				className={cn(
					'absolute top-0 right-0 w-40 h-40 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-105',
					gradientBg,
				)}
			/>

			<div className="flex items-center gap-4 mb-6 relative z-10">
				<div className={cn('p-3 rounded-2xl', iconBg, iconColor)}>
					<Icon className="w-6 h-6" />
				</div>
				<div>
					<h2 className="text-xl font-bold text-white">{title}</h2>
					<p className={cn('text-sm font-medium', usernameBg)}>@{username}</p>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4 relative z-10">
				{stats.map(stat => (
					<motion.div
						key={stat.label}
						whileHover={{ scale: 1.02 }}
						className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
					>
						<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
							{stat.label}
						</div>
						<div className="text-2xl font-black text-white">{stat.value}</div>
					</motion.div>
				))}
			</div>
		</div>
	);
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CodingStatsModule() {
	const [stats, setStats] = useState<CodingStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch data with error handling
	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await api.getCodingStats();
			setStats(data);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('An unknown error occurred');
			}
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Memoize computed values
	const leetcodeStats = useMemo(() => {
		if (!stats) return null;
		return {
			solved: stats.leetcode.stats?.solved || 0,
			easy: stats.leetcode.stats?.easy || 0,
			medium: stats.leetcode.stats?.medium || 0,
			hard: stats.leetcode.stats?.hard || 0,
		};
	}, [stats]);

	const codeforcesStats = useMemo(() => {
		if (!stats) return null;
		return [
			{ label: 'Rating', value: stats.codeforces.stats?.rating || 'N/A' },
			{ label: 'Max Rating', value: stats.codeforces.stats?.maxRating || 'N/A' },
		];
	}, [stats]);

	const githubStats = useMemo(() => {
		if (!stats) return null;
		return [
			{ label: 'Pull Requests', value: stats.github.stats?.prs || 0 },
			{ label: 'Issues', value: stats.github.stats?.issues || 0 },
		];
	}, [stats]);

	// Loading state
	if (loading) return <CodingStatsSkeleton />;

	// Error state
	if (error) {
		return <ModuleError message={error} onRetry={fetchData} />;
	}

	// No data state
	if (!stats || !leetcodeStats) return null;

	return (
		<ScrollArea className="h-full">
			<div className="p-6 md:p-10 max-w-7xl mx-auto pb-32">
				<ModuleHeader
					icon={Terminal}
					label="Analytics"
					title="Coding Performance"
					description="Real-time metrics from competitive programming platforms and open source contributions."
				/>

				{/* Quick Stats Grid */}
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
				>
					{STAT_CARD_CONFIG.map((config, index) => (
						<QuickStatCard
							key={config.key}
							label={config.label}
							value={config.getValue(stats)}
							icon={config.icon}
							bgClass={config.bgClass}
							iconBgClass={config.iconBgClass}
							iconTextClass={config.iconTextClass}
							index={index}
						/>
					))}
				</motion.div>

				{/* Detailed Stats Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* LeetCode Detailed */}
					<motion.div
						variants={fadeInUp}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-50px' }}
					>
						<PlatformCard
							title="LeetCode"
							username={stats.leetcode.username}
							url={stats.leetcode.url}
							icon={Code}
							iconBg="bg-yellow-500/10"
							iconColor="text-yellow-500"
							usernameBg="text-yellow-500/80"
							stats={
								<div className="flex flex-col md:flex-row items-center gap-10">
									{/* Chart */}
									<CircularProgress
										value={leetcodeStats.solved}
										max={LEETCODE_MAX_PROBLEMS}
										color="#fbbf24"
										size={160}
										strokeWidth={12}
									/>

									{/* Breakdown */}
									<div className="flex-1 w-full space-y-4">
										<DifficultyBar
											difficulty="easy"
											count={leetcodeStats.easy}
											total={leetcodeStats.solved}
											config={DIFFICULTY_CONFIG.easy}
										/>
										<DifficultyBar
											difficulty="medium"
											count={leetcodeStats.medium}
											total={leetcodeStats.solved}
											config={DIFFICULTY_CONFIG.medium}
										/>
										<DifficultyBar
											difficulty="hard"
											count={leetcodeStats.hard}
											total={leetcodeStats.solved}
											config={DIFFICULTY_CONFIG.hard}
										/>
									</div>
								</div>
							}
						/>
					</motion.div>

					{/* Codeforces & GitHub */}
					<motion.div
						variants={fadeInUp}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-50px' }}
						className="grid grid-rows-2 gap-6"
					>
						{/* Codeforces Card */}
						<MiniPlatformCard
							title="Codeforces"
							username={stats.codeforces.username}
							icon={Activity}
							iconBg="bg-red-500/10"
							iconColor="text-red-500"
							usernameBg="text-red-500/80"
							gradientBg="bg-red-500/5"
							stats={codeforcesStats!}
						/>

						{/* GitHub Card */}
						<MiniPlatformCard
							title="GitHub"
							username={stats.github.username}
							icon={Github}
							iconBg="bg-white/10"
							iconColor="text-white"
							usernameBg="text-zinc-400"
							gradientBg="bg-zinc-500/5"
							stats={githubStats!}
						/>
					</motion.div>
				</div>
			</div>
		</ScrollArea>
	);
}
