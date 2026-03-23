'use client';

import { memo, type ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import type { PlatformStats } from '@/api/schema';
import { staggerItem, fadeInUp } from '@/animations/motion';
import { cn } from '@/lib/utils';
import { ANIM_DURATION, DIFF_CONFIG, LEETCODE_MAX, type PlatformConfig } from './constants';

// ═══════════════════════════════════════════════════════════════════
// TILT CARD HANDLER (3D Mouse Interaction)
// ═══════════════════════════════════════════════════════════════════

export function TiltCard({
	children,
	className,
	accentColor = 'rgba(255,255,255,0.1)',
}: {
	children: ReactNode;
	className?: string;
	accentColor?: string;
}) {
	const shouldReduceMotion = useReducedMotion();
	
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
	const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

	const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['4deg', '-4deg']);
	const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-4deg', '4deg']);

	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	const background = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, ${accentColor}, transparent 80%)`;

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (shouldReduceMotion) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;

		const mX = e.clientX - rect.left;
		const mY = e.clientY - rect.top;

		const xPct = mX / width - 0.5;
		const yPct = mY / height - 0.5;

		x.set(xPct);
		y.set(yPct);
		mouseX.set(mX);
		mouseY.set(mY);
	};

	const handleMouseLeave = () => {
		if (shouldReduceMotion) return;
		x.set(0);
		y.set(0);
		mouseX.set(0);
		mouseY.set(0);
	};

	return (
		<motion.div
			variants={staggerItem}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={{
				rotateX: shouldReduceMotion ? 0 : rotateX,
				rotateY: shouldReduceMotion ? 0 : rotateY,
				transformStyle: 'preserve-3d',
			}}
			className={cn('relative w-full h-full group perspective-[1000px]', className)}
		>
			<motion.div
				className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
				style={{ background: shouldReduceMotion ? undefined : background }}
			/>
			<div
				className="relative z-10 w-full h-full flex flex-col"
				style={{ transform: shouldReduceMotion ? 'none' : 'translateZ(15px)' }}
			>
				{children}
			</div>
		</motion.div>
	);
}

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
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════════
// SVG DONUT CHART (For LeetCode Difficulty)
// ═══════════════════════════════════════════════════════════════════

const SVGDoughnutChart = memo(function SVGDoughnutChart({
	easy,
	medium,
	hard,
	total,
	size = 80,
	strokeWidth = 6,
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

	// Calculate percentages
	const easyPct = total > 0 ? easy / total : 0;
	const mediumPct = total > 0 ? medium / total : 0;
	const hardPct = total > 0 ? hard / total : 0;

	// Calculate offsets for stacked SVG circles
	const easyDash = easyPct * circumference;
	const mediumDash = mediumPct * circumference;
	const hardDash = hardPct * circumference;

	const mediumOffset = circumference - easyDash;
	const hardOffset = circumference - easyDash - mediumDash;

	return (
		<div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
			<svg width={size} height={size} className="transform -rotate-90 drop-shadow-md">
				{/* Background track */}
				<circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-black/30" />
				
				{/* Easy */}
				{easy > 0 && (
					<motion.circle
						cx={size/2} cy={size/2} r={radius}
						stroke="var(--theme-green, #10b981)" strokeWidth={strokeWidth} fill="transparent" strokeLinecap="round"
						initial={{ strokeDasharray: `0 ${circumference}` }}
						whileInView={{ strokeDasharray: `${easyDash} ${circumference}` }}
						transition={{ duration: shouldReduceMotion ? 0 : 1 }}
						viewport={{ once: true }}
					/>
				)}
				{/* Medium */}
				{medium > 0 && (
					<motion.circle
						cx={size/2} cy={size/2} r={radius}
						stroke="var(--theme-yellow, #f59e0b)" strokeWidth={strokeWidth} fill="transparent" strokeDashoffset={mediumOffset} strokeLinecap="round"
						initial={{ strokeDasharray: `0 ${circumference}` }}
						whileInView={{ strokeDasharray: `${mediumDash} ${circumference}` }}
						transition={{ duration: shouldReduceMotion ? 0 : 1, delay: shouldReduceMotion ? 0 : 0.2 }}
						viewport={{ once: true }}
					/>
				)}
				{/* Hard */}
				{hard > 0 && (
					<motion.circle
						cx={size/2} cy={size/2} r={radius}
						stroke="var(--theme-red, #ef4444)" strokeWidth={strokeWidth} fill="transparent" strokeDashoffset={hardOffset} strokeLinecap="round"
						initial={{ strokeDasharray: `0 ${circumference}` }}
						whileInView={{ strokeDasharray: `${hardDash} ${circumference}` }}
						transition={{ duration: shouldReduceMotion ? 0 : 1, delay: shouldReduceMotion ? 0 : 0.4 }}
						viewport={{ once: true }}
					/>
				)}
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
				<span className="text-sm font-black text-foreground">{total}</span>
				<span className="text-[7px] uppercase tracking-widest text-muted-foreground mt-0.5">Total</span>
			</div>
		</div>
	);
});

// ═══════════════════════════════════════════════════════════════════
// SVG SPARKLINE (Trend visualization for rating)
// ═══════════════════════════════════════════════════════════════════

const SVGSparkline = memo(function SVGSparkline({
	color,
	width = 100,
	height = 30,
}: { color: string; width?: number; height?: number }) {
	// Generates a simulated positive upward trend path mathematically
	const pathStr = `M 0,${height} Q ${width*0.2},${height*0.8} ${width*0.4},${height*0.7} T ${width*0.8},${height*0.3} T ${width},0`;
	
	return (
		<svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible drop-shadow-[0_4px_10px_currentColor]" style={{ color }}>
			<defs>
				<linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
					<stop offset="100%" stopColor="currentColor" stopOpacity="0" />
				</linearGradient>
			</defs>
			<motion.path
				d={`${pathStr} L ${width},${height} L 0,${height} Z`}
				fill={`url(#grad-${color})`}
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				transition={{ duration: 1 }}
				viewport={{ once: true }}
			/>
			<motion.path
				d={pathStr}
				fill="none"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				initial={{ pathLength: 0 }}
				whileInView={{ pathLength: 1 }}
				transition={{ duration: 1.5, ease: "easeOut" }}
				viewport={{ once: true }}
			/>
		</svg>
	);
});

// ═══════════════════════════════════════════════════════════════════
// SVG HEATMAP (GitHub Contribution Map Replica)
// ═══════════════════════════════════════════════════════════════════

const SVGHeatmap = memo(function SVGHeatmap() {
	// 5 rows x 12 columns for a compact view
	const rows = 5;
	const cols = 12;
	const size = 12;
	const gap = 3;
	
	const rects = [];
	for (let c = 0; c < cols; c++) {
		for (let r = 0; r < rows; r++) {
			// Probability of getting a higher density block increases towards the right (newer)
			const intensity = Math.random() + (c/cols)*0.5;
			const fill = intensity > 1.2 ? '#10b981' : // emerald-500
			             intensity > 0.8 ? '#059669' : // emerald-600
						 intensity > 0.4 ? '#064e3b' : // emerald-900
						 '#27272a'; // zinc-800

			rects.push(
				<motion.rect
					key={`${c}-${r}`}
					x={c * (size + gap)}
					y={r * (size + gap)}
					width={size}
					height={size}
					rx={3} // slight rounded corners
					fill={fill}
					initial={{ opacity: 0, scale: 0.5 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.3, delay: (c * 0.03) + (r * 0.02) }}
				/>
			);
		}
	}

	return (
		<svg width={(size + gap) * cols - gap} height={(size + gap) * rows - gap} className="drop-shadow-lg">
			{rects}
		</svg>
	);
});


// ═══════════════════════════════════════════════════════════════════
// STAT PILL (small compact inline stat)
// ═══════════════════════════════════════════════════════════════════

export function StatPill({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
	return (
		<div className={cn(
			"flex flex-col justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-zinc-950/20 shadow-inner border border-border/50 h-full w-full",
			highlight && "border-primary/40 bg-primary/10 shadow-[inset_0_0_20px_rgba(var(--theme-primary-rgb),0.1)]"
		)}>
			<div className="text-[8px] font-black text-muted-foreground uppercase tracking-Widest mb-1">
				{label}
			</div>
			<div className={cn("text-base sm:text-lg font-black tracking-tight", highlight ? "text-primary drop-shadow-[0_0_8px_rgba(var(--theme-primary-rgb),0.6)]" : "text-foreground")}>
				{value}
			</div>
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════════
// LINK-ONLY PILL
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
				'group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-linear-to-br border border-border backdrop-blur-3xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 shadow-md',
				config.accentBorder,
				config.accentBg,
			)}
		>
			<div className={cn('shrink-0', config.accentText)}>
				<Icon className="w-4 h-4" />
			</div>
			<div className="flex items-center gap-1.5 min-w-0">
				<span className="text-xs sm:text-sm font-bold text-foreground truncate">{config.name}</span>
			</div>
			<ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
		</motion.a>
	);
});

// ═══════════════════════════════════════════════════════════════════
// PROBLEM SOLVING CARD (LeetCode/GFG - now heavily compacted)
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
		<TiltCard accentColor={`${config.accent}30`}>
			<div
				className={cn(
					'w-full h-full rounded-3xl bg-linear-to-br bg-zinc-950/40 border border-border backdrop-blur-3xl p-5 sm:p-6 overflow-hidden transition-all duration-500 shadow-2xl flex flex-col justify-between',
					config.accentBg,
					config.accentBorder,
				)}
			>
				{/* Background Glow */}
				<div className="absolute top-0 right-[-10%] w-32 h-32 rounded-full blur-[80px] -z-10 pointer-events-none opacity-40" style={{ background: config.accent }} />

				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 relative z-10 w-full">
					<div className="flex items-center gap-3">
						<div className={cn('p-2.5 sm:p-3 rounded-xl bg-card border border-border shadow-xl', config.accentText)}>
							<Icon className="w-6 h-6 sm:w-7 sm:h-7" />
						</div>
						<div>
							<h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-tight">{config.name}</h2>
							<p className={cn('text-[9px] font-black uppercase tracking-[0.2em] mt-0.5', config.accentText)}>
								@{platform.username}
							</p>
						</div>
					</div>
					<a
						href={platform.url}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/50 border border-border/50 text-[9px] font-black uppercase tracking-widest hover:text-foreground hover:bg-card transition-all self-start shadow-sm"
						style={{ color: config.accent }}
					>
						Profile <ExternalLink className="w-3 h-3" />
					</a>
				</div>

				{/* Stats body */}
				<div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-5 relative z-10 w-full mt-auto bg-black/10 p-4 sm:p-5 rounded-3xl border border-white/5 shadow-inner">
					
					{/* Donut Chart Visualization */}
					<div className="shrink-0 drop-shadow-xl">
						<SVGDoughnutChart easy={easy} medium={medium} hard={hard} total={solved} size={84} strokeWidth={8} />
					</div>
					
					{/* Legend / Stats */}
					<div className="flex flex-col gap-2 w-full">
						<div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold">
							<span className="text-emerald-400 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Easy</span>
							<span className="text-foreground">{easy}</span>
						</div>
						<div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold">
							<span className="text-amber-500 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> Medium</span>
							<span className="text-foreground">{medium}</span>
						</div>
						<div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold">
							<span className="text-red-500 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Hard</span>
							<span className="text-foreground">{hard}</span>
						</div>
					</div>
				</div>
			</div>
		</TiltCard>
	);
});

// ═══════════════════════════════════════════════════════════════════
// GITHUB CARD (Compact visual map)
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
		<TiltCard accentColor={`${config.accent}20`}>
			<div
				className={cn(
					'w-full h-full rounded-3xl bg-linear-to-br bg-zinc-950/40 backdrop-blur-3xl border border-border p-5 sm:p-6 transition-all duration-500 shadow-2xl flex flex-col',
					config.accentBg,
					config.accentBorder,
				)}
			>
				<div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/10 rounded-full blur-[80px] -z-10 pointer-events-none opacity-50" />

				{/* Header */}
				<div className="flex items-center justify-between gap-3 mb-4 relative z-10 w-full">
					<div className="flex items-center gap-3">
						<div className={cn('p-2.5 sm:p-3 rounded-xl bg-card border border-border shadow-xl', config.accentText)}>
							<Icon className="w-6 h-6 sm:w-7 sm:h-7" />
						</div>
						<div>
							<h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-tight">{config.name}</h3>
							<p className={cn('text-[9px] font-black uppercase tracking-[0.2em] mt-0.5', config.accentText)}>
								@{platform.username}
							</p>
						</div>
					</div>
					<a
						href={platform.url}
						target="_blank"
						rel="noopener noreferrer"
						className="p-2 sm:p-2.5 rounded-lg bg-background/50 border border-border/50 text-zinc-400 hover:text-foreground hover:bg-card transition-all self-start shadow-sm"
						aria-label="View GitHub profile"
					>
						<ExternalLink className="w-3.5 h-3.5" />
					</a>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 relative z-10 h-full">
					{/* Left stats grid */}
					<div className="grid grid-cols-2 gap-2 flex-1 h-full content-start">
						{s?.commits != null && s.commits > 0 && <StatPill label="Commits" value={s.commits} highlight={true} />}
						<StatPill label="Repos" value={s?.repos ?? 0} />
						<StatPill label="Stars" value={s?.stars ?? 0} />
						{(s?.prs != null && s.prs > 0) && <StatPill label="PRs" value={s.prs} />}
					</div>

					{/* Right visual map (SVG Contribution Graph) */}
					<div className="w-full sm:w-[150px] shrink-0 p-4 bg-black/20 border border-white/5 rounded-2xl flex flex-col justify-center items-center sm:items-end">
						<div className="w-full text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-3 sm:text-left text-center">Activity Map</div>
						<SVGHeatmap />
					</div>
				</div>
			</div>
		</TiltCard>
	);
});

// ═══════════════════════════════════════════════════════════════════
// COMPETITIVE CARD (Codeforces / CodeChef — Compact + Sparkline)
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
		<TiltCard accentColor={`${config.accent}20`}>
			<div
				className={cn(
					'w-full h-full rounded-3xl bg-linear-to-br bg-zinc-950/40 backdrop-blur-3xl border border-border p-5 sm:p-6 transition-all duration-500 shadow-2xl flex flex-col',
					config.accentBg,
					config.accentBorder,
				)}
			>
				<div className="absolute top-0 right-0 w-32 h-32 bg-current/10 rounded-full blur-[80px] -z-10 pointer-events-none opacity-50" style={{ color: config.accent }} />

				{/* Header */}
				<div className="flex items-center justify-between gap-3 mb-4 relative z-10 w-full">
					<div className="flex items-center gap-3">
						<div className={cn('p-2.5 sm:p-3 rounded-xl bg-card border border-border shadow-xl', config.accentText)}>
							<Icon className="w-6 h-6 sm:w-7 sm:h-7" />
						</div>
						<div>
							<h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-tight">{config.name}</h3>
							<p className={cn('text-[9px] font-black uppercase tracking-[0.2em] mt-0.5', config.accentText)}>
								@{platform.username}
							</p>
						</div>
					</div>
					<a
						href={platform.url}
						target="_blank"
						rel="noopener noreferrer"
						className={cn('p-2 sm:p-2.5 rounded-lg bg-background/50 border border-border/50 hover:text-foreground hover:bg-card transition-all self-start shadow-sm', config.accentText)}
						aria-label={`View ${config.name} profile`}
					>
						<ExternalLink className="w-3.5 h-3.5" />
					</a>
				</div>

				{/* Vis + Stats */}
				<div className="flex flex-col gap-4 relative z-10 mt-auto">
					<div className="w-full px-2 pt-1 pb-2">
						<SVGSparkline color={config.accent} height={40} />
					</div>
					
					<div className="grid grid-cols-2 gap-2">
						<StatPill label="Rating" value={s?.rating ?? 'N/A'} highlight={true} />
						<StatPill label="Max Rating" value={s?.maxRating ?? 'N/A'} />
						{s?.globalRank != null && <StatPill label="Global Rank" value={s.globalRank} />}
						{s?.solved != null && <StatPill label="Solved" value={s.solved} />}
					</div>
				</div>
			</div>
		</TiltCard>
	);
});
