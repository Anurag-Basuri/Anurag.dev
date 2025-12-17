'use client';

import { useEffect, useState } from 'react';
import { api, CodingStats } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Code2,
	Trophy,
	Terminal,
	GitCommit,
	Star,
	Box,
	Activity,
	Zap,
	TrendingUp,
	Award,
	Calendar,
	Hash,
	Github,
	Code,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ModuleHeader } from '@/components/apps/shared/ModuleHeader';
import { ModuleError } from '@/components/ui/module-error';
import { staggerContainer, staggerItem, fadeInUp, scaleIn } from '@/lib/animations';

function CodingStatsSkeleton() {
	return (
		<div className="p-8 space-y-12 animate-pulse max-w-7xl mx-auto">
			<div className="flex justify-between items-center mb-8 border-b border-border/40 pb-4">
				<div className="h-8 bg-muted rounded w-48" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="h-40 bg-card/20 rounded-3xl" />
				<div className="h-40 bg-card/20 rounded-3xl" />
				<div className="h-40 bg-card/20 rounded-3xl" />
				<div className="h-40 bg-card/20 rounded-3xl" />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="h-96 bg-card/20 rounded-[2.5rem]" />
				<div className="h-96 bg-card/20 rounded-[2.5rem]" />
			</div>
		</div>
	);
}

// Simple Circular Progress Component
const CircularProgress = ({
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
}) => {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const progress = Math.min(value / max, 1);
	const dashoffset = circumference - progress * circumference;

	return (
		<div
			className="relative flex items-center justify-center"
			style={{ width: size, height: size }}
		>
			{/* Background Circle */}
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
					transition={{ duration: 1.5, ease: 'easeOut' }}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="text-2xl font-black text-white">{value}</span>
				<span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
					Solved
				</span>
			</div>
		</div>
	);
};

export function CodingStatsModule() {
	const [stats, setStats] = useState<CodingStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
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
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (loading) return <CodingStatsSkeleton />;

	if (error) {
		return <ModuleError message={error} onRetry={fetchData} />;
	}

	if (!stats) return null;

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
					{/* Total Solved */}
					<motion.div
						variants={staggerItem}
						whileHover={{ y: -5 }}
						className="relative p-6 rounded-3xl bg-linear-to-br from-[#0a0a0a] to-[#111] border border-white/5 shadow-2xl overflow-hidden group"
					>
						<div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
						<div className="relative z-10 flex flex-col gap-4">
							<div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
								<Code2 className="w-5 h-5" />
							</div>
							<div>
								<div className="text-3xl font-black text-white tracking-tight">
									{stats.leetcode.stats?.solved || 0}
								</div>
								<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Problems Solved
								</div>
							</div>
						</div>
					</motion.div>

					{/* GitHub Stars */}
					<motion.div
						variants={staggerItem}
						whileHover={{ y: -5 }}
						className="relative p-6 rounded-3xl bg-linear-to-br from-[#0a0a0a] to-[#111] border border-white/5 shadow-2xl overflow-hidden group"
					>
						<div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
						<div className="relative z-10 flex flex-col gap-4">
							<div className="w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
								<Star className="w-5 h-5" />
							</div>
							<div>
								<div className="text-3xl font-black text-white tracking-tight">
									{stats.github.stats?.stars || 0}
								</div>
								<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Stars Earned
								</div>
							</div>
						</div>
					</motion.div>

					{/* Max Rating */}
					<motion.div
						variants={staggerItem}
						whileHover={{ y: -5 }}
						className="relative p-6 rounded-3xl bg-linear-to-br from-[#0a0a0a] to-[#111] border border-white/5 shadow-2xl overflow-hidden group"
					>
						<div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
						<div className="relative z-10 flex flex-col gap-4">
							<div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
								<Trophy className="w-5 h-5" />
							</div>
							<div>
								<div className="text-3xl font-black text-white tracking-tight">
									{stats.codeforces.stats?.maxRating || 'N/A'}
								</div>
								<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Peak Rating
								</div>
							</div>
						</div>
					</motion.div>

					{/* Contributions */}
					<motion.div
						variants={staggerItem}
						whileHover={{ y: -5 }}
						className="relative p-6 rounded-3xl bg-linear-to-br from-[#0a0a0a] to-[#111] border border-white/5 shadow-2xl overflow-hidden group"
					>
						<div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
						<div className="relative z-10 flex flex-col gap-4">
							<div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
								<GitCommit className="w-5 h-5" />
							</div>
							<div>
								<div className="text-3xl font-black text-white tracking-tight">
									{stats.github.stats?.linesOfCode || 0}
								</div>
								<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Lines of Code
								</div>
							</div>
						</div>
					</motion.div>
				</motion.div>

				{/* Detailed Stats Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* LeetCode Detailed */}
					<motion.div
						variants={fadeInUp}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="relative bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 p-8 overflow-hidden"
					>
						{/* Header */}
						<div className="flex items-center justify-between mb-8">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500">
									<Code className="w-8 h-8" />
								</div>
								<div>
									<h2 className="text-2xl font-bold text-white">LeetCode</h2>
									<p className="text-sm text-yellow-500/80 font-medium">
										@{stats.leetcode.username}
									</p>
								</div>
							</div>
							<a
								href={stats.leetcode.url}
								target="_blank"
								rel="noopener noreferrer"
								className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
							>
								View Profile
							</a>
						</div>

						<div className="flex flex-col md:flex-row items-center gap-10">
							{/* Chart */}
							<CircularProgress
								value={stats.leetcode.stats?.solved || 0}
								max={2000} // Approximate max
								color="#fbbf24" // Amber-400
								size={160}
								strokeWidth={12}
							/>

							{/* Breakdown */}
							<div className="flex-1 w-full space-y-4">
								<div className="space-y-2">
									<div className="flex justify-between items-center text-sm">
										<span className="text-emerald-400 font-bold">Easy</span>
										<span className="text-white font-bold">
											{stats.leetcode.stats?.easy || 0}
										</span>
									</div>
									<div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
										<motion.div
											initial={{ width: 0 }}
											whileInView={{
												width: `${
													((stats.leetcode.stats?.easy || 0) /
														(stats.leetcode.stats?.solved || 1)) *
													100
												}%`,
											}}
											transition={{ duration: 1 }}
											className="h-full bg-emerald-500"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex justify-between items-center text-sm">
										<span className="text-yellow-400 font-bold">Medium</span>
										<span className="text-white font-bold">
											{stats.leetcode.stats?.medium || 0}
										</span>
									</div>
									<div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
										<motion.div
											initial={{ width: 0 }}
											whileInView={{
												width: `${
													((stats.leetcode.stats?.medium || 0) /
														(stats.leetcode.stats?.solved || 1)) *
													100
												}%`,
											}}
											transition={{ duration: 1 }}
											className="h-full bg-yellow-500"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex justify-between items-center text-sm">
										<span className="text-red-400 font-bold">Hard</span>
										<span className="text-white font-bold">
											{stats.leetcode.stats?.hard || 0}
										</span>
									</div>
									<div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
										<motion.div
											initial={{ width: 0 }}
											whileInView={{
												width: `${
													((stats.leetcode.stats?.hard || 0) /
														(stats.leetcode.stats?.solved || 1)) *
													100
												}%`,
											}}
											transition={{ duration: 1 }}
											className="h-full bg-red-500"
										/>
									</div>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Codeforces & Other Detailed */}
					<motion.div
						variants={fadeInUp}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="grid grid-rows-2 gap-6"
					>
						{/* Codeforces Card */}
						<div className="bg-[#0a0a0a] rounded-4xl border border-white/10 p-6 flex flex-col justify-center relative overflow-hidden group">
							<div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-105" />

							<div className="flex items-center gap-4 mb-6 relative z-10">
								<div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
									<Activity className="w-6 h-6" />
								</div>
								<div>
									<h2 className="text-xl font-bold text-white">Codeforces</h2>
									<p className="text-sm text-red-500/80 font-medium">
										@{stats.codeforces.username}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4 relative z-10">
								<div className="p-4 rounded-xl bg-white/5 border border-white/5">
									<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
										Rating
									</div>
									<div className="text-2xl font-black text-white">
										{stats.codeforces.stats?.rating || 'N/A'}
									</div>
								</div>
								<div className="p-4 rounded-xl bg-white/5 border border-white/5">
									<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
										Max Rating
									</div>
									<div className="text-2xl font-black text-white">
										{stats.codeforces.stats?.maxRating || 'N/A'}
									</div>
								</div>
							</div>
						</div>

						{/* GitHub Card */}
						<div className="bg-[#0a0a0a] rounded-4xl border border-white/10 p-6 flex flex-col justify-center relative overflow-hidden group">
							<div className="absolute top-0 right-0 w-40 h-40 bg-zinc-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-105" />

							<div className="flex items-center gap-4 mb-6 relative z-10">
								<div className="p-3 bg-white/10 rounded-2xl text-white">
									<Github className="w-6 h-6" />
								</div>
								<div>
									<h2 className="text-xl font-bold text-white">GitHub</h2>
									<p className="text-sm text-zinc-400 font-medium">
										@{stats.github.username}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4 relative z-10">
								<div className="p-4 rounded-xl bg-white/5 border border-white/5">
									<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
										Pull Requests
									</div>
									<div className="text-2xl font-black text-white">
										{stats.github.stats?.prs || 0}
									</div>
								</div>
								<div className="p-4 rounded-xl bg-white/5 border border-white/5">
									<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
										Issues
									</div>
									<div className="text-2xl font-black text-white">
										{stats.github.stats?.issues || 0}
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</ScrollArea>
	);
}
