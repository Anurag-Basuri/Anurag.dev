'use client';

import { useEffect, useState, memo, useMemo } from 'react';
import type { ReactNode } from 'react';
import { publicService } from '@/api';
import type { CodingStats, PlatformStats } from '@/api/schema';

import { Terminal, ExternalLink } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { staggerContainer, staggerItem, fadeInUp, cardHover } from '@/animations/motion';
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
	accent: string;        // primary hex color
	accentBg: string;      // custom gradient bg string (Tailwind classes)
	accentBorder: string;  // hover border specific to color
	accentText: string;    // branded text color class
}

const PLATFORMS: PlatformConfig[] = [
	{
		key: 'leetcode',
		name: 'LeetCode',
		icon: LeetCodeIcon,
		accent: '#fbbf24',
		accentBg: 'from-amber-500/20 to-amber-500/0 hover:border-amber-500/50',
		accentBorder: 'hover:border-amber-500/30 group-hover:shadow-[0_0_40px_-10px_rgba(251,191,36,0.15)] bg-amber-500/5',
		accentText: 'text-amber-400',
	},
	{
		key: 'github',
		name: 'GitHub',
		icon: GitHubIcon,
		accent: '#f0f0f0',
		accentBg: 'from-zinc-400/20 to-zinc-400/0 hover:border-zinc-400/50',
		accentBorder: 'hover:border-zinc-400/30 group-hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] bg-zinc-400/5',
		accentText: 'text-zinc-300',
	},
	{
		key: 'codeforces',
		name: 'Codeforces',
		icon: CodeforcesIcon,
		accent: '#ef4444',
		accentBg: 'from-red-500/20 to-red-500/0 hover:border-red-500/50',
		accentBorder: 'hover:border-red-500/30 group-hover:shadow-[0_0_40px_-10px_rgba(239,68,68,0.15)] bg-red-500/5',
		accentText: 'text-red-400',
	},
	{
		key: 'codechef',
		name: 'CodeChef',
		icon: CodeChefIcon,
		accent: '#d97706',
		accentBg: 'from-orange-500/20 to-orange-500/0 hover:border-orange-500/50',
		accentBorder: 'hover:border-orange-500/30 group-hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.15)] bg-orange-500/5',
		accentText: 'text-orange-400',
	},
	{
		key: 'gfg',
		name: 'GeeksforGeeks',
		icon: GFGIcon,
		accent: '#22c55e',
		accentBg: 'from-emerald-500/20 to-emerald-500/0 hover:border-emerald-500/50',
		accentBorder: 'hover:border-emerald-500/30 group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.15)] bg-emerald-500/5',
		accentText: 'text-emerald-400',
	},
];

// ═══════════════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════════════

function CodingStatsSkeleton() {
	return (
		<div className="p-4 sm:p-6 md:p-12 space-y-6 animate-pulse max-w-7xl mx-auto pb-32">
			<div className="h-10 bg-white/5 rounded w-56 mb-8" />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
				<div className="h-[400px] border border-white/5 bg-white/5 rounded-[2.5rem] md:col-span-2 lg:col-span-2 lg:row-span-2" />
				{[1, 2, 3].map(i => (
					<div key={i} className="h-64 rounded-[2.5rem] border border-white/5 bg-white/5" />
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
			{/* Ambient Drop Shadow inside circle */}
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
				<span className="text-3xl sm:text-4xl font-black text-white tracking-tighter drop-shadow-md">{value}</span>
				<span className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] mt-1">
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
		<div className="space-y-2">
			<div className="flex justify-between items-end text-xs px-1">
				<span className={cn('font-black uppercase tracking-[0.15em]', config.color)}>{config.label}</span>
				<span className="text-white font-bold">{count}</span>
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

function StatPill({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex flex-col justify-center px-4 py-3 rounded-2xl bg-black/40 border border-white/5 shadow-inner transition-colors group-hover:bg-[#0a0a0a]">
			<div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">
				{label}
			</div>
			<div className="text-xl sm:text-2xl font-black text-white tracking-tight">{value}</div>
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
			whileHover={cardHover}
			className={cn(
				'group relative flex items-center gap-5 p-6 rounded-4xl bg-linear-to-br border border-white/10 backdrop-blur-md overflow-hidden transition-all duration-500 shadow-xl cursor-pointer',
				config.accentBorder,
				config.accentBg,
			)}
		>
			<div className={cn('p-4 rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-xl', config.accentText)}>
				<Icon className="w-8 h-8" />
			</div>
			<div className="flex-1 min-w-0">
				<h3 className="text-lg sm:text-xl font-black text-white tracking-tight">{config.name}</h3>
				<p className={cn('text-[10px] font-black uppercase tracking-wider mt-1 truncate', config.accentText)}>
					@{username}
				</p>
			</div>
			<ExternalLink className="w-5 h-5 text-white/30 group-hover:text-white transition-colors shrink-0 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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
			whileHover={cardHover}
			className={cn(
				'group relative rounded-[2.5rem] bg-linear-to-br border border-white/10 backdrop-blur-md p-8 sm:p-10 overflow-hidden transition-all duration-500 md:col-span-2 lg:col-span-2 lg:row-span-2 shadow-2xl',
				config.accentBg,
				config.accentBorder,
			)}
		>
			{/* Ambient glow */}
			<div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -z-10 pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700" />

			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10 relative z-10">
				<div className="flex items-center gap-5">
					<div className={cn('p-4 rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-xl', config.accentText)}>
						<Icon className="w-10 sm:w-12 h-10 sm:h-12" />
					</div>
					<div>
						<h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-1">{config.name}</h2>
						<p className={cn('text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em]', config.accentText)}>
							@{platform.username}
						</p>
					</div>
				</div>
				<a
					href={platform.url}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400 hover:text-white hover:bg-[#0a0a0a] hover:border-amber-500/30 transition-all self-start shadow-inner"
				>
					Profile <ExternalLink className="w-3.5 h-3.5" />
				</a>
			</div>

			{/* Stats body */}
			<div className="flex flex-col md:flex-row items-center gap-10 md:gap-14 relative z-10 bg-[#0a0a0a]/40 p-6 rounded-4xl border border-white/5">
				<CircularProgress value={solved} max={LEETCODE_MAX} color={config.accent} />
				<div className="flex-1 w-full space-y-6">
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
			whileHover={cardHover}
			className={cn(
				'group relative rounded-4xl bg-linear-to-br backdrop-blur-md border border-white/10 p-6 sm:p-8 overflow-hidden transition-all duration-500 shadow-xl',
				config.accentBg,
				config.accentBorder,
			)}
		>
			{/* Ambient glow */}
			<div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/10 rounded-full blur-[50px] -z-10 pointer-events-none group-hover:bg-zinc-500/20 transition-colors duration-700" />

			{/* Header */}
			<div className="flex items-center justify-between gap-4 mb-8 relative z-10">
				<div className="flex items-center gap-4">
					<div className={cn('p-3 rounded-[1.2rem] bg-[#0a0a0a] border border-white/10 shadow-xl', config.accentText)}>
						<Icon className="w-8 h-8" />
					</div>
					<div>
						<h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">{config.name}</h3>
						<p className={cn('text-[9px] sm:text-[10px] font-black uppercase tracking-wider', config.accentText)}>
							@{platform.username}
						</p>
					</div>
				</div>
				<a
					href={platform.url}
					target="_blank"
					rel="noopener noreferrer"
					className="p-3 rounded-xl bg-black/40 border border-white/5 text-zinc-400 hover:text-white hover:bg-[#0a0a0a] hover:border-zinc-500/30 transition-all self-start shadow-inner"
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
			whileHover={cardHover}
			className={cn(
				'group relative rounded-4xl bg-linear-to-br backdrop-blur-md border border-white/10 p-6 sm:p-8 overflow-hidden transition-all duration-500 shadow-xl',
				config.accentBg,
				config.accentBorder,
			)}
		>
			<div className="absolute top-0 right-0 w-32 h-32 bg-current/5 rounded-full blur-[50px] -z-10 pointer-events-none transition-colors duration-700" style={{ color: config.accent }} />

			{/* Header */}
			<div className="flex items-center justify-between gap-4 mb-8 relative z-10">
				<div className="flex items-center gap-4">
					<div className={cn('p-3 rounded-[1.2rem] bg-[#0a0a0a] border border-white/10 shadow-xl', config.accentText)}>
						<Icon className="w-8 h-8" />
					</div>
					<div>
						<h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">{config.name}</h3>
						<p className={cn('text-[9px] sm:text-[10px] font-black uppercase tracking-wider', config.accentText)}>
							@{platform.username}
						</p>
					</div>
				</div>
				<a
					href={platform.url}
					target="_blank"
					rel="noopener noreferrer"
					className={cn('p-3 rounded-xl bg-black/40 border border-white/5 hover:text-white hover:bg-[#0a0a0a] transition-all self-start shadow-inner', config.accentText, `hover:border-${config.accentBg.split('-')[1]}-500/30`)}
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
			<div className="flex flex-col items-center justify-center py-32 text-center max-w-7xl mx-auto">
				<div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-6 shadow-inner">
					<Terminal className="w-8 h-8 text-orange-400" />
				</div>
				<p className="text-xl font-bold text-white mb-2 tracking-tight">
					{error ? 'Failed to Sync Telemetry' : 'No Profiles Configured'}
				</p>
				<p className="text-sm text-white/50 mb-8 max-w-sm">
					{error || "Connect your coding profiles in the admin dashboard to see your stats here."}
				</p>
			</div>
		);
	}

	return (
		<div className="h-full w-full">
			<div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto pb-24 sm:pb-32">
				<SectionHeader
					icon={Terminal}
					label="Telemetry"
					title="Coding Profiles"
					description="Live performance metrics and activity across competitive programming, problem solving, and open source platforms."
					accent="orange"
				/>

				<motion.div
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: '-20px' }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16"
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
		</div>
	);
}
