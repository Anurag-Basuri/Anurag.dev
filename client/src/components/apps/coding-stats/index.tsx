'use client';

import { useEffect, useState } from 'react';
import { api, CodingStats } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Github, Code, Trophy, GitCommit, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { ModuleHeader } from '@/components/apps/shared/ModuleHeader';
import { ModuleError } from '@/components/ui/module-error';

function StatsSkeleton() {
	return (
		<div className="p-6 space-y-6 animate-pulse">
			<div className="h-8 bg-muted rounded w-48 mb-6" />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="h-40 bg-muted rounded-xl" />
				<div className="h-40 bg-muted rounded-xl" />
				<div className="h-40 bg-muted rounded-xl" />
			</div>
		</div>
	);
}

export function CodingStatsModule() {
	const [stats, setStats] = useState<CodingStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		api.getCodingStats()
			.then(setStats)
			.catch(err => setError(err.message))
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <StatsSkeleton />;

	if (error) {
		return (
			<ModuleError
				message={error}
				onRetry={() => {
					setLoading(true);
					setError(null);
					api.getCodingStats()
						.then(setStats)
						.catch(err => setError(err.message))
						.finally(() => setLoading(false));
				}}
			/>
		);
	}

	if (!stats) return null;

	// Using shared variants from @/lib/animations

	return (
		<ScrollArea className="h-full">
			<div className="p-6 md:p-10 max-w-5xl mx-auto pb-20">
				<ModuleHeader icon={Terminal} label="Profiles" title="Coding Profiles" />

				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 gap-6"
				>
					{/* GitHub Card */}
					<motion.div
						variants={staggerItem}
						className="group relative overflow-hidden rounded-3xl bg-card/40 border border-white/5 p-6 hover:border-white/20 transition-all hover:shaodw-2xl hover:-translate-y-1"
					>
						<div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
						<div className="flex justify-between items-start mb-6">
							<div className="p-3 bg-white/10 rounded-xl text-white">
								<Github className="w-6 h-6" />
							</div>
							<a
								href={stats.github.url}
								target="_blank"
								rel="noopener noreferrer"
								className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-mono text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
							>
								@{stats.github.username} ↗
							</a>
						</div>
						<div className="space-y-6">
							<div>
								<h3 className="text-2xl font-bold text-white mb-1">GitHub</h3>
								<div className="text-sm text-muted-foreground">
									Source Control & Open Source
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="p-4 rounded-2xl bg-black/20 border border-white/5 group-hover:border-white/10 transition-colors">
									<div className="text-3xl font-bold text-white mb-1">
										{stats.github.stats?.stars || 0}
									</div>
									<div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
										Stars Earned
									</div>
								</div>
								<div className="p-4 rounded-2xl bg-black/20 border border-white/5 group-hover:border-white/10 transition-colors">
									<div className="text-3xl font-bold text-white mb-1">
										{stats.github.stats?.followers || 0}
									</div>
									<div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
										Followers
									</div>
								</div>
							</div>
						</div>
					</motion.div>

					{/* LeetCode Card */}
					<motion.div
						variants={staggerItem}
						className="group relative overflow-hidden rounded-3xl bg-card/40 border border-white/5 p-6 hover:border-yellow-500/30 transition-all hover:shadow-2xl hover:-translate-y-1"
					>
						<div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
						<div className="flex justify-between items-start mb-6">
							<div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
								<Code className="w-6 h-6" />
							</div>
							<a
								href={stats.leetcode.url}
								target="_blank"
								rel="noopener noreferrer"
								className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-mono text-muted-foreground hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
							>
								@{stats.leetcode.username} ↗
							</a>
						</div>
						<div className="space-y-6">
							<div>
								<h3 className="text-2xl font-bold text-white mb-1">LeetCode</h3>
								<div className="text-sm text-muted-foreground">
									Problem Solving Skills
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="p-4 rounded-2xl bg-black/20 border border-white/5 group-hover:border-yellow-500/20 transition-colors">
									<div className="text-3xl font-bold text-yellow-500 mb-1">
										{stats.leetcode.stats?.solved || 0}
									</div>
									<div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
										Problems Solved
									</div>
								</div>
								<div className="p-4 rounded-2xl bg-black/20 border border-white/5 group-hover:border-yellow-500/20 transition-colors">
									<div className="text-3xl font-bold text-yellow-500 mb-1">
										{stats.leetcode.stats?.globalRank || 'N/A'}
									</div>
									<div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
										Global Ranking
									</div>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Codeforces Card */}
					<motion.div
						variants={staggerItem}
						className="group relative overflow-hidden rounded-3xl bg-card/40 border border-white/5 p-6 hover:border-red-500/30 transition-all hover:shadow-2xl hover:-translate-y-1"
					>
						<div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
						<div className="flex justify-between items-start mb-6">
							<div className="p-3 bg-red-500/10 rounded-xl text-red-500">
								<Trophy className="w-6 h-6" />
							</div>
							<a
								href={stats.codeforces.url}
								target="_blank"
								rel="noopener noreferrer"
								className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-mono text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
							>
								@{stats.codeforces.username} ↗
							</a>
						</div>
						<div className="space-y-6">
							<div>
								<h3 className="text-2xl font-bold text-white mb-1">Codeforces</h3>
								<div className="text-sm text-muted-foreground">
									Competitive Programming
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="p-4 rounded-2xl bg-black/20 border border-white/5 group-hover:border-red-500/20 transition-colors">
									<div className="text-3xl font-bold text-red-500 mb-1">
										{stats.codeforces.stats?.rating || 0}
									</div>
									<div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
										Current Rating
									</div>
								</div>
								<div className="p-4 rounded-2xl bg-black/20 border border-white/5 group-hover:border-red-500/20 transition-colors">
									<div className="text-lg font-bold text-red-500 mb-1 truncate leading-loose">
										{stats.codeforces.stats?.globalRank || 'Unrated'}
									</div>
									<div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
										Current Rank
									</div>
								</div>
							</div>
						</div>
					</motion.div>

					{/* CodeChef Card */}
					{stats.codechef && (
						<motion.div
							variants={staggerItem}
							className="group relative overflow-hidden rounded-3xl bg-card/40 border border-white/5 p-6 hover:border-orange-500/30 transition-all hover:shadow-2xl hover:-translate-y-1"
						>
							<div className="absolute inset-0 bg-linear-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
							<div className="flex justify-between items-start mb-6">
								<div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
									<Terminal className="w-6 h-6" />
								</div>
								<a
									href={stats.codechef.url}
									target="_blank"
									rel="noopener noreferrer"
									className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-mono text-muted-foreground hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
								>
									@{stats.codechef.username} ↗
								</a>
							</div>
							<div className="space-y-6">
								<div>
									<h3 className="text-2xl font-bold text-white mb-1">CodeChef</h3>
									<div className="text-sm text-muted-foreground">
										Algorithmic Competitions
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="p-4 rounded-2xl bg-black/20 border border-white/5 group-hover:border-orange-500/20 transition-colors">
										<div className="text-3xl font-bold text-orange-500 mb-1">
											{stats.codechef.stats?.rating || 0}
										</div>
										<div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
											Current Rating
										</div>
									</div>
									<div className="p-4 rounded-2xl bg-black/20 border border-white/5 group-hover:border-orange-500/20 transition-colors">
										<div className="text-lg font-bold text-orange-500 mb-1 truncate leading-loose">
											{stats.codechef.stats?.globalRank || 'Unrated'}
										</div>
										<div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
											Global Rank
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					)}
				</motion.div>
			</div>
		</ScrollArea>
	);
}
