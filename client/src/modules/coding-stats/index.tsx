'use client';

import { useEffect, useState, useCallback, memo, useMemo } from 'react';
import type { ReactNode } from 'react';
import { publicService } from '@/api';
import type { CodingStats, PlatformStats } from '@/api/schema';
import { ScrollArea } from '@/ui/scroll-area';
import { Terminal, ExternalLink } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { staggerContainer, staggerItem, fadeInUp } from '@/animations/motion';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════
// OFFICIAL PLATFORM SVG ICONS
// ═══════════════════════════════════════════════════════════════════

function LeetCodeIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className={className}>
			<path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
		</svg>
	);
}

function CodeforcesIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className={className}>
			<path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-15c0-.828.672-1.5 1.5-1.5h3zm9 7.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z" />
		</svg>
	);
}

function CodeChefIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className={className}>
			<path d="M11.007.22C6.718.627 3.39 2.96 2.021 6.79c-.376 1.058-.545 2.063-.615 3.594-.054 1.32.018 1.952.345 3.132.537 1.937 1.672 3.682 3.29 5.065.27.231.557.461.637.51.08.05.145.109.145.132 0 .023-.15.261-.333.528-.552.81-.787 1.432-.804 2.126-.005.22.01.43.04.462.09.1.42.14.94.14h.508l.052-.211c.126-.515.433-1.13.844-1.69.231-.312.249-.35.16-.365a3.307 3.307 0 0 1-.652-.223c-1.953-.868-3.621-2.767-4.381-4.987-.34-1-.525-2.154-.525-3.313 0-3.053 1.47-5.633 4.151-7.28.733-.45 1.727-.862 2.625-1.087a7.44 7.44 0 0 1 2.045-.27c2.836.026 5.327 1.416 6.876 3.832.746 1.164 1.207 2.531 1.368 4.069.063.592.04 1.933-.04 2.443-.294 1.895-1.024 3.479-2.201 4.771-.607.667-1.222 1.15-2.05 1.608-.259.143-.474.278-.478.299-.004.022.163.262.37.534.42.551.734 1.128.886 1.63l.103.336.573-.005c.565-.005.574-.007.624-.098.156-.285.022-1.099-.28-1.713a5.55 5.55 0 0 0-.392-.627l-.14-.186.2-.17c1.4-1.237 2.536-2.976 3.102-4.746.402-1.261.536-2.068.536-3.217-.001-2.455-.814-4.558-2.428-6.28C15.862 1.28 13.43.04 11.007.22z" />
		</svg>
	);
}

function GitHubIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className={className}>
			<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
		</svg>
	);
}

function GFGIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className={className}>
			<path d="M21.45 14.315c-.143.28-.334.532-.565.745a3.691 3.691 0 0 1-1.104.695 4.51 4.51 0 0 1-3.116-.016 3.79 3.79 0 0 1-2.135-2.078 3.571 3.571 0 0 1-.2-.907h3.874c.081 0 .155-.03.217-.085a.29.29 0 0 0 .107-.21.29.29 0 0 0-.086-.22.318.318 0 0 0-.218-.087h-3.915a3.64 3.64 0 0 1 .203-.926 3.79 3.79 0 0 1 2.135-2.078 4.51 4.51 0 0 1 3.116-.016c.431.157.826.394 1.164.695.231.213.422.465.565.745a.29.29 0 0 0 .412.107.316.316 0 0 0 .12-.406 4.006 4.006 0 0 0-.665-.877 4.248 4.248 0 0 0-1.317-.791 5.163 5.163 0 0 0-3.563.018 4.398 4.398 0 0 0-2.47 2.406 4.152 4.152 0 0 0-.256 1.123H6.965a4.152 4.152 0 0 0-.256-1.123 4.398 4.398 0 0 0-2.47-2.406 5.163 5.163 0 0 0-3.563-.018 4.248 4.248 0 0 0-1.317.791 4.006 4.006 0 0 0-.665.877.316.316 0 0 0 .12.406.29.29 0 0 0 .412-.107c.143-.28.334-.532.565-.745a3.691 3.691 0 0 1 1.164-.695 4.51 4.51 0 0 1 3.116.016 3.79 3.79 0 0 1 2.135 2.078c.103.296.17.604.203.926H2.205a.318.318 0 0 0-.218.087.29.29 0 0 0-.086.22.29.29 0 0 0 .107.21.315.315 0 0 0 .217.085h3.874a3.571 3.571 0 0 1-.2.907 3.79 3.79 0 0 1-2.135 2.078 4.51 4.51 0 0 1-3.116.016 3.691 3.691 0 0 1-1.104-.695 3.831 3.831 0 0 1-.565-.745.29.29 0 0 0-.412-.107.316.316 0 0 0-.12.406c.166.34.39.642.665.877a4.248 4.248 0 0 0 1.317.791 5.163 5.163 0 0 0 3.563-.018 4.398 4.398 0 0 0 2.47-2.406c.103-.296.17-.604.203-.926h6.318c.033.322.1.63.203.926a4.398 4.398 0 0 0 2.47 2.406 5.163 5.163 0 0 0 3.563.018 4.248 4.248 0 0 0 1.317-.791c.275-.235.499-.536.665-.877a.316.316 0 0 0-.12-.406.29.29 0 0 0-.412.107z" />
		</svg>
	);
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

const LEETCODE_MAX = 3400;
const ANIM_DURATION = 1.5;

function hasStats(platform: PlatformStats | undefined | null): boolean {
	if (!platform?.stats) return false;
	return Object.values(platform.stats).some(v => v !== undefined && v !== null && v !== 0);
}

// ═══════════════════════════════════════════════════════════════════
// PLATFORM CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════

interface PlatformConfig {
	key: string;
	name: string;
	icon: (props: { className?: string }) => ReactNode;
	accent: string;        // primary color
	accentBg: string;      // icon/badge bg
	accentBorder: string;  // hover border
	accentGlow: string;    // hover glow
	accentText: string;    // branded text
	accentGradient: string; // ambient gradient (static class for Tailwind)
}

const PLATFORMS: PlatformConfig[] = [
	{
		key: 'leetcode',
		name: 'LeetCode',
		icon: LeetCodeIcon,
		accent: '#fbbf24',
		accentBg: 'bg-amber-500/10',
		accentBorder: 'hover:border-amber-500/40',
		accentGlow: 'hover:shadow-[0_0_40px_-5px_rgba(251,191,36,0.2)]',
		accentText: 'text-amber-400',
		accentGradient: 'from-amber-500/5',
	},
	{
		key: 'github',
		name: 'GitHub',
		icon: GitHubIcon,
		accent: '#f0f0f0',
		accentBg: 'bg-zinc-400/10',
		accentBorder: 'hover:border-zinc-400/40',
		accentGlow: 'hover:shadow-[0_0_40px_-5px_rgba(240,240,240,0.1)]',
		accentText: 'text-zinc-300',
		accentGradient: 'from-zinc-400/5',
	},
	{
		key: 'codeforces',
		name: 'Codeforces',
		icon: CodeforcesIcon,
		accent: '#ef4444',
		accentBg: 'bg-red-500/10',
		accentBorder: 'hover:border-red-500/40',
		accentGlow: 'hover:shadow-[0_0_40px_-5px_rgba(239,68,68,0.2)]',
		accentText: 'text-red-400',
		accentGradient: 'from-red-500/5',
	},
	{
		key: 'codechef',
		name: 'CodeChef',
		icon: CodeChefIcon,
		accent: '#d97706',
		accentBg: 'bg-yellow-600/10',
		accentBorder: 'hover:border-yellow-600/40',
		accentGlow: 'hover:shadow-[0_0_40px_-5px_rgba(217,119,6,0.2)]',
		accentText: 'text-yellow-500',
		accentGradient: 'from-yellow-600/5',
	},
	{
		key: 'gfg',
		name: 'GeeksforGeeks',
		icon: GFGIcon,
		accent: '#22c55e',
		accentBg: 'bg-green-500/10',
		accentBorder: 'hover:border-green-500/40',
		accentGlow: 'hover:shadow-[0_0_40px_-5px_rgba(34,197,94,0.2)]',
		accentText: 'text-green-400',
		accentGradient: 'from-green-500/5',
	},
];

// ═══════════════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════════════

function CodingStatsSkeleton() {
	return (
		<div className="p-4 sm:p-6 md:p-12 space-y-6 animate-pulse max-w-7xl mx-auto">
			<div className="h-10 bg-white/5 rounded w-56 mb-6" />
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
				{[1, 2, 3, 4, 5].map(i => (
					<div
						key={i}
						className={cn(
							'rounded-2xl sm:rounded-3xl border border-white/5 bg-[#0a0a0a]/60',
							i === 1 ? 'h-80 sm:col-span-2 lg:col-span-2 lg:row-span-2' : 'h-56',
						)}
					/>
				))}
			</div>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════════
// CIRCULAR PROGRESS (for LeetCode)
// ═══════════════════════════════════════════════════════════════════

const CircularProgress = memo(function CircularProgress({
	value,
	max,
	color,
	size = 130,
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
			className="relative flex items-center justify-center"
			style={{ width: size, height: size }}
			role="progressbar"
			aria-valuenow={value}
			aria-valuemin={0}
			aria-valuemax={max}
		>
			<svg width={size} height={size} className="transform -rotate-90">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					className="text-white/5"
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
					animate={{ strokeDashoffset: dashoffset }}
					transition={{ duration: shouldReduceMotion ? 0 : ANIM_DURATION, ease: 'easeOut' }}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="text-2xl sm:text-3xl font-black text-white tracking-tighter">{value}</span>
				<span className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-0.5">
					solved
				</span>
			</div>
		</div>
	);
});

// ═══════════════════════════════════════════════════════════════════
// DIFFICULTY BAR (for LeetCode)
// ═══════════════════════════════════════════════════════════════════

const DIFF_CONFIG = {
	easy: { label: 'Easy', color: 'text-emerald-400', bg: 'bg-emerald-500', container: 'bg-emerald-500/10' },
	medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500', container: 'bg-amber-500/10' },
	hard: { label: 'Hard', color: 'text-rose-400', bg: 'bg-rose-500', container: 'bg-rose-500/10' },
} as const;

const DifficultyBar = memo(function DifficultyBar({
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
		<div className="space-y-1.5">
			<div className="flex justify-between items-center text-[10px] sm:text-xs px-0.5">
				<span className={cn('font-black uppercase tracking-[0.15em]', config.color)}>{config.label}</span>
				<span className="text-white font-bold">{count}</span>
			</div>
			<div className={cn('h-2 w-full rounded-full overflow-hidden border border-white/5', config.container)}>
				<motion.div
					initial={{ width: 0 }}
					whileInView={{ width: `${pct}%` }}
					viewport={{ once: true }}
					transition={{ duration: shouldReduceMotion ? 0 : 1, ease: 'easeOut' }}
					className={cn('h-full rounded-full', config.bg)}
				/>
			</div>
		</div>
	);
});

// ═══════════════════════════════════════════════════════════════════
// STAT PILL (small inline stat)
// ═══════════════════════════════════════════════════════════════════

function StatPill({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-black/40 border border-white/5 group-hover:border-white/10 transition-colors">
			<div className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-1">
				{label}
			</div>
			<div className="text-lg sm:text-xl font-black text-white tracking-tight">{value}</div>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════════
// LINK-ONLY CARD (fallback when no stats available)
// ═══════════════════════════════════════════════════════════════════

const LinkOnlyCard = memo(function LinkOnlyCard({
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
				'group relative flex items-center gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 overflow-hidden transition-all duration-500',
				config.accentBorder,
				config.accentGlow,
			)}
		>
			<div className={cn('p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-white/5', config.accentBg, config.accentText)}>
				<Icon className="w-6 sm:w-7 h-6 sm:h-7" />
			</div>
			<div className="flex-1 min-w-0">
				<h3 className="text-base sm:text-lg font-black text-white tracking-tight">{config.name}</h3>
				<p className={cn('text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mt-0.5 truncate', config.accentText)}>
					@{username}
				</p>
			</div>
			<ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors shrink-0" />
		</motion.a>
	);
});

// ═══════════════════════════════════════════════════════════════════
// LEETCODE CARD (large, with circular progress + difficulty bars)
// ═══════════════════════════════════════════════════════════════════

const LeetCodeCard = memo(function LeetCodeCard({
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
			className={cn(
				'group relative rounded-2xl sm:rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 p-5 sm:p-7 overflow-hidden transition-all duration-500 sm:col-span-2 lg:col-span-2 lg:row-span-2',
				config.accentBorder,
				config.accentGlow,
			)}
		>
			{/* Ambient glow */}
			<div className="absolute inset-0 bg-linear-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 relative z-10">
				<div className="flex items-center gap-3 sm:gap-4">
					<div className={cn('p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5', config.accentBg, config.accentText)}>
						<Icon className="w-7 sm:w-8 h-7 sm:h-8" />
					</div>
					<div>
						<h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{config.name}</h2>
						<p className={cn('text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mt-0.5', config.accentText)}>
							@{platform.username}
						</p>
					</div>
				</div>
				<a
					href={platform.url}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white hover:bg-white/10 transition-all self-start sm:self-auto"
				>
					Profile <ExternalLink className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
				</a>
			</div>

			{/* Stats body */}
			<div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10">
				<CircularProgress value={solved} max={LEETCODE_MAX} color={config.accent} />
				<div className="flex-1 w-full space-y-3 sm:space-y-4">
					<DifficultyBar count={easy} total={solved} config={DIFF_CONFIG.easy} />
					<DifficultyBar count={medium} total={solved} config={DIFF_CONFIG.medium} />
					<DifficultyBar count={hard} total={solved} config={DIFF_CONFIG.hard} />
				</div>
			</div>
		</motion.div>
	);
});

// ═══════════════════════════════════════════════════════════════════
// GITHUB CARD (with stats grid)
// ═══════════════════════════════════════════════════════════════════

const GitHubCard = memo(function GitHubCard({
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
			className={cn(
				'group relative rounded-2xl sm:rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 p-5 sm:p-7 overflow-hidden transition-all duration-500',
				config.accentBorder,
				config.accentGlow,
			)}
		>
			<div className="absolute inset-0 bg-linear-to-br from-white/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

			{/* Header */}
			<div className="flex items-center justify-between gap-3 mb-5 sm:mb-6 relative z-10">
				<div className="flex items-center gap-3">
					<div className={cn('p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5', config.accentBg, config.accentText)}>
						<Icon className="w-6 sm:w-7 h-6 sm:h-7" />
					</div>
					<div>
						<h3 className="text-lg sm:text-xl font-black text-white tracking-tight">{config.name}</h3>
						<p className={cn('text-[9px] sm:text-[10px] font-bold uppercase tracking-wider', config.accentText)}>
							@{platform.username}
						</p>
					</div>
				</div>
				<a
					href={platform.url}
					target="_blank"
					rel="noopener noreferrer"
					className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-white transition-colors"
					aria-label="View GitHub profile"
				>
					<ExternalLink className="w-3.5 h-3.5" />
				</a>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-2.5 sm:gap-3 relative z-10">
				<StatPill label="Stars" value={s?.stars ?? 0} />
				<StatPill label="PRs" value={s?.prs ?? 0} />
				<StatPill label="Issues" value={s?.issues ?? 0} />
				<StatPill label="Followers" value={s?.followers ?? 0} />
			</div>
		</motion.div>
	);
});

// ═══════════════════════════════════════════════════════════════════
// COMPETITIVE CARD (Codeforces / CodeChef — rating-based)
// ═══════════════════════════════════════════════════════════════════

const CompetitiveCard = memo(function CompetitiveCard({
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
			className={cn(
				'group relative rounded-2xl sm:rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 p-5 sm:p-7 overflow-hidden transition-all duration-500',
				config.accentBorder,
				config.accentGlow,
			)}
		>
			<div className={cn(
				'absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none',
				config.accentGradient,
			)} />

			{/* Header */}
			<div className="flex items-center justify-between gap-3 mb-5 sm:mb-6 relative z-10">
				<div className="flex items-center gap-3">
					<div className={cn('p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5', config.accentBg, config.accentText)}>
						<Icon className="w-6 sm:w-7 h-6 sm:h-7" />
					</div>
					<div>
						<h3 className="text-lg sm:text-xl font-black text-white tracking-tight">{config.name}</h3>
						<p className={cn('text-[9px] sm:text-[10px] font-bold uppercase tracking-wider', config.accentText)}>
							@{platform.username}
						</p>
					</div>
				</div>
				<a
					href={platform.url}
					target="_blank"
					rel="noopener noreferrer"
					className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:text-white transition-colors"
					aria-label={`View ${config.name} profile`}
				>
					<ExternalLink className="w-3.5 h-3.5" />
				</a>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-2.5 sm:gap-3 relative z-10">
				<StatPill label="Rating" value={s?.rating ?? 'N/A'} />
				<StatPill label="Max Rating" value={s?.maxRating ?? 'N/A'} />
				{s?.globalRank != null && <StatPill label="Global Rank" value={s.globalRank} />}
				{s?.stars != null && <StatPill label="Stars" value={`${s.stars}★`} />}
				{s?.solved != null && <StatPill label="Solved" value={s.solved} />}
			</div>
		</motion.div>
	);
});

// ═══════════════════════════════════════════════════════════════════
// MAIN MODULE
// ═══════════════════════════════════════════════════════════════════

export function CodingStatsModule() {
	const [stats, setStats] = useState<CodingStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		async function fetch() {
			try {
				const { data } = await publicService.getCodingStats();
				if (!cancelled) setStats(data);
			} catch (err) {
				console.error('Failed to load coding stats', err);
				if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		fetch();
		return () => { cancelled = true; };
	}, []);

	// Determine which platforms have data
	const platformEntries = useMemo(() => {
		if (!stats) return [];

		const entries: Array<{ config: PlatformConfig; platform: PlatformStats | null; hasData: boolean }> = [];

		for (const cfg of PLATFORMS) {
			const p = (stats as unknown as Record<string, PlatformStats | undefined>)[cfg.key] ?? null;
			if (p && p.username) {
				entries.push({ config: cfg, platform: p, hasData: hasStats(p) });
			}
		}

		return entries;
	}, [stats]);

	if (loading) return <CodingStatsSkeleton />;

	if (error || platformEntries.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-8 text-center">
				<div className="p-4 rounded-full bg-white/5 mb-4">
					<Terminal className="w-8 h-8 text-muted-foreground" />
				</div>
				<p className="text-muted-foreground">
					{error ? 'Failed to load coding stats' : 'No coding profiles configured'}
				</p>
			</div>
		);
	}

	return (
		<ScrollArea className="h-full w-full">
			<div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto pb-24 sm:pb-32">
				<SectionHeader
					icon={Terminal}
					label="Telemetry"
					title="Coding Profiles"
					description="Performance metrics and activity across competitive programming and open source platforms."
				/>

				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-10 sm:mt-12"
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
		</ScrollArea>
	);
}
