'use client';

import { useEffect, useState, useCallback, memo, useMemo } from 'react';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { apiClient } from '@/api/client';
import type { CodingStats } from '@/api/schema';
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
import { SectionHeader } from '@/components/layout/SectionHeader';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';
import { cn } from '@/lib/utils';

// ============================================================================
// CONSTANTS
// ============================================================================

const LEETCODE_MAX_PROBLEMS = 3000;
const ANIMATION_DURATION = 1.5;
const PROGRESS_BAR_DURATION = 1;

const STAT_CARD_CONFIG: Array<{
	key: string;
	label: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	bgClass: string;
	glowClass: string;
	iconBgClass: string;
	iconTextClass: string;
	getValue: (stats: CodingStats) => string | number;
}> = [
	{
		key: 'solved',
		label: 'Problems Solved',
		icon: Code2,
		bgClass: 'from-emerald-500/10 to-transparent',
		glowClass:
			'group-hover:shadow-[0_0_30px_0px_rgba(16,185,129,0.15)] group-hover:border-emerald-500/30',
		iconBgClass: 'bg-emerald-500/10 border-emerald-500/20',
		iconTextClass: 'text-emerald-500',
		getValue: (stats: CodingStats) => stats.leetcode.stats?.solved || 0,
	},
	{
		key: 'stars',
		label: 'Stars Earned',
		icon: Star,
		bgClass: 'from-amber-500/10 to-transparent',
		glowClass:
			'group-hover:shadow-[0_0_30px_0px_rgba(245,158,11,0.15)] group-hover:border-amber-500/30',
		iconBgClass: 'bg-amber-500/10 border-amber-500/20',
		iconTextClass: 'text-amber-500',
		getValue: (stats: CodingStats) => stats.github.stats?.stars || 0,
	},
	{
		key: 'rating',
		label: 'Peak Rating',
		icon: Trophy,
		bgClass: 'from-rose-500/10 to-transparent',
		glowClass:
			'group-hover:shadow-[0_0_30px_0px_rgba(244,63,94,0.15)] group-hover:border-rose-500/30',
		iconBgClass: 'bg-rose-500/10 border-rose-500/20',
		iconTextClass: 'text-rose-500',
		getValue: (stats: CodingStats) => stats.codeforces.stats?.maxRating || 'N/A',
	},
	{
		key: 'loc',
		label: 'Lines of Code',
		icon: GitCommit,
		bgClass: 'from-blue-500/10 to-transparent',
		glowClass:
			'group-hover:shadow-[0_0_30px_0px_rgba(59,130,246,0.15)] group-hover:border-blue-500/30',
		iconBgClass: 'bg-blue-500/10 border-blue-500/20',
		iconTextClass: 'text-blue-500',
		getValue: (stats: CodingStats) => stats.github.stats?.linesOfCode || 0,
	},
];

const DIFFICULTY_CONFIG = {
	easy: {
		label: 'Easy',
		color: 'text-emerald-400',
		bgColor: 'bg-emerald-500',
		bgContainer: 'bg-emerald-500/10',
	},
	medium: {
		label: 'Medium',
		color: 'text-amber-400',
		bgColor: 'bg-amber-500',
		bgContainer: 'bg-amber-500/10',
	},
	hard: {
		label: 'Hard',
		color: 'text-rose-400',
		bgColor: 'bg-rose-500',
		bgContainer: 'bg-rose-500/10',
	},
} as const;

// ============================================================================
// MEMOIZED COMPONENTS
// ============================================================================

const CodingStatsSkeleton = memo(function CodingStatsSkeleton() {
	return (
		<div className="p-8 space-y-12 animate-pulse max-w-7xl mx-auto">
			<div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
				<div className="h-8 bg-white/5 rounded w-48" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{[1, 2, 3, 4].map(i => (
					<div
						key={i}
						className="h-40 bg-[#0a0a0a]/60 backdrop-blur border border-white/5 rounded-[2rem]"
					/>
				))}
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="h-96 bg-[#0a0a0a]/60 backdrop-blur border border-white/5 rounded-[2.5rem]" />
				<div className="h-96 bg-[#0a0a0a]/60 backdrop-blur border border-white/5 rounded-[2.5rem]" />
			</div>
		</div>
	);
});

const CircularProgress = memo(function CircularProgress({
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
	const percentage = Math.round(progress * 100);

	return (
		<div
			className="relative flex items-center justify-center drop-shadow-[0_0_15px_rgba(251,191,36,0.2)]"
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
				<span className="text-3xl font-black text-white tracking-tighter">{value}</span>
				<span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">
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
	glowClass,
	iconBgClass,
	iconTextClass,
	index,
}: {
	label: string;
	value: string | number;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	bgClass: string;
	glowClass: string;
	iconBgClass: string;
	iconTextClass: string;
	index: number;
}) {
	return (
		<motion.div
			variants={staggerItem}
			custom={index}
			whileHover={{ y: -5, transition: { duration: 0.2 } }}
			className={cn(
				'relative p-6 rounded-[2rem] bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 overflow-hidden group transition-all duration-500',
				glowClass,
			)}
		>
			<div
				className={cn(
					'absolute inset-0 bg-linear-to-br opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
					bgClass,
				)}
			/>
			<div className="relative z-10 flex flex-col gap-5">
				<div
					className={cn(
						'w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner group-hover:scale-110 transition-transform duration-500',
						iconBgClass,
						iconTextClass,
					)}
				>
					<Icon className="w-5 h-5" />
				</div>
				<div>
					<div className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
						{value}
					</div>
					<div className="text-[10px] mt-1 font-bold text-muted-foreground uppercase tracking-[0.15em]">
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
			<div className="flex justify-between items-center text-xs px-1">
				<span className={cn('font-black uppercase tracking-[0.2em]', config.color)}>
					{config.label}
				</span>
				<span className="text-white font-bold">{count}</span>
			</div>
			<div
				className={cn(
					'h-2.5 w-full rounded-full overflow-hidden shadow-inner border border-white/5',
					config.bgContainer,
				)}
			>
				<motion.div
					initial={{ width: 0 }}
					whileInView={{ width: `${percentage}%` }}
					viewport={{ once: true, margin: '-50px' }}
					transition={{
						duration: shouldReduceMotion ? 0 : PROGRESS_BAR_DURATION,
						ease: 'easeOut',
					}}
					className={cn(
						'h-full shadow-[0_0_10px_currentColor] opacity-90',
						config.bgColor,
					)}
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
	borderHover,
	stats,
	children,
}: {
	title: string;
	username: string;
	url: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	iconBg: string;
	iconColor: string;
	usernameBg: string;
	borderHover: string;
	stats?: ReactNode;
	children?: ReactNode;
}) {
	const handleProfileClick = useCallback(() => {
		window.open(url, '_blank', 'noopener,noreferrer');
	}, [url]);

	return (
		<div
			className={cn(
				'relative bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 overflow-hidden group transition-all duration-500 hover:shadow-[0_0_40px_0px_rgba(255,255,255,0.05)]',
				borderHover,
			)}
		>
			{/* Ambient Hover Space */}
			<div className="absolute inset-0 bg-linear-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 relative z-10">
				<div className="flex items-center gap-4">
					<div
						className={cn(
							'p-4 rounded-[1.25rem] border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500',
							iconBg,
							iconColor,
						)}
					>
						<Icon className="w-8 h-8" />
					</div>
					<div>
						<h2 className="text-2xl font-black text-white tracking-tight leading-tight">
							{title}
						</h2>
						<p
							className={cn(
								'text-[11px] font-bold uppercase tracking-wider mt-1 opacity-80',
								usernameBg,
							)}
						>
							@{username}
						</p>
					</div>
				</div>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handleProfileClick}
					className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white hover:bg-white/10 transition-all shadow-inner hover:border-white/20"
				>
					<span>View Profile</span>
					<ExternalLink className="w-3.5 h-3.5" />
				</motion.button>
			</div>

			{/* Stats Section */}
			<div className="relative z-10">{stats}</div>

			{/* Children (additional content) */}
			<div className="relative z-10">{children}</div>
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
	borderHover,
	glowHover,
	stats,
}: {
	title: string;
	username: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	iconBg: string;
	iconColor: string;
	usernameBg: string;
	gradientBg: string;
	borderHover: string;
	glowHover: string;
	stats: Array<{ label: string; value: string | number }>;
}) {
	return (
		<div
			className={cn(
				'bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 flex flex-col justify-center relative overflow-hidden group transition-all duration-500',
				borderHover,
				glowHover,
			)}
		>
			<div
				className={cn(
					'absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none',
					gradientBg,
				)}
			/>

			<div className="flex items-center gap-4 mb-8 relative z-10">
				<div
					className={cn(
						'p-3 rounded-[1.25rem] border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500',
						iconBg,
						iconColor,
					)}
				>
					<Icon className="w-7 h-7" />
				</div>
				<div>
					<h3 className="text-xl font-black text-white tracking-tight leading-tight">
						{title}
					</h3>
					<p
						className={cn(
							'text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80',
							usernameBg,
						)}
					>
						@{username}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4 relative z-10">
				{stats.map(stat => (
					<motion.div
						key={stat.label}
						className="p-5 rounded-3xl bg-black/40 border border-white/5 group-hover:border-white/10 transition-colors shadow-inner"
					>
						<div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2">
							{stat.label}
						</div>
						<div className="text-3xl font-black text-white">{stat.value}</div>
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
			const data = await apiClient.get<CodingStats>('/coding-stats');
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

	// No data state
	if (!stats || !leetcodeStats) return null;

	// Error state
	if (error) {
		return <div className="text-center py-24 text-muted-foreground">{error}</div>;
	}

	return (
		<ScrollArea className="h-full w-full">
			<div className="p-6 md:p-12 max-w-7xl mx-auto pb-32">
				<SectionHeader
					icon={Terminal}
					label="Telemetry"
					title="Coding Performance"
					description="Real-time metrics from competitive programming platforms and open source contributions."
				/>

				{/* Quick Stats Grid */}
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 mb-10"
				>
					{STAT_CARD_CONFIG.map((config, index) => (
						<QuickStatCard
							key={config.key}
							label={config.label}
							value={config.getValue(stats)}
							icon={config.icon}
							bgClass={config.bgClass}
							glowClass={config.glowClass}
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
							iconBg="bg-amber-500/10"
							iconColor="text-amber-500"
							usernameBg="text-amber-500"
							borderHover="hover:border-amber-500/30"
							stats={
								<div className="flex flex-col md:flex-row items-center gap-10 mt-8">
									{/* Chart */}
									<CircularProgress
										value={leetcodeStats.solved}
										max={LEETCODE_MAX_PROBLEMS}
										color="#fbbf24"
										size={160}
										strokeWidth={10}
									/>

									{/* Breakdown */}
									<div className="flex-1 w-full space-y-5">
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
						className="grid grid-rows-2 gap-8 lg:gap-6"
					>
						{/* Codeforces Card */}
						<MiniPlatformCard
							title="Codeforces"
							username={stats.codeforces.username}
							icon={Activity}
							iconBg="bg-rose-500/10"
							iconColor="text-rose-500"
							usernameBg="text-rose-500"
							gradientBg="from-rose-500/5"
							borderHover="hover:border-rose-500/30"
							glowHover="hover:shadow-[0_0_40px_0px_rgba(244,63,94,0.1)]"
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
							gradientBg="from-white/5"
							borderHover="hover:border-white/30"
							glowHover="hover:shadow-[0_0_40px_0px_rgba(255,255,255,0.05)]"
							stats={githubStats!}
						/>
					</motion.div>
				</div>
			</div>
		</ScrollArea>
	);
}
