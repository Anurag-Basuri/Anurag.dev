'use client';

import { useEffect, useState } from 'react';
import { api, CodingStats } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Github, Code, Trophy, GitCommit, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
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

export default function CodingStatsModule() {
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

	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 },
	};

	return (
		<ScrollArea className="h-full">
			<div className="p-6 md:p-10 max-w-5xl mx-auto pb-20">
				<div className="flex items-center gap-3 mb-8 border-b border-border/40 pb-4">
					<Terminal className="w-6 h-6 text-primary" />
					<div>
						<h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-500">
							coding_stats.exe
						</h1>
						<p className="text-xs text-muted-foreground font-mono">
							Real-time performance metrics
						</p>
					</div>
				</div>

				<motion.div
					variants={container}
					initial="hidden"
					animate="show"
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{/* GitHub Card */}
					<motion.div
						variants={item}
						className="group relative overflow-hidden rounded-2xl bg-card/30 border border-border/50 p-6 hover:border-white/20 transition-all"
					>
						<div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="flex justify-between items-start mb-4">
							<div className="p-2 bg-white/10 rounded-lg">
								<Github className="w-6 h-6" />
							</div>
							<a
								href={stats.github.url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs font-mono text-muted-foreground hover:text-white transition-colors"
							>
								@{stats.github.username} ↗
							</a>
						</div>
						<div className="space-y-2">
							<div className="flex items-baseline gap-2">
								<h3 className="text-3xl font-bold text-white">GitHub</h3>
							</div>
							<div className="text-sm text-muted-foreground">
								Source Control Activity
							</div>
						</div>
					</motion.div>

					{/* LeetCode Card */}
					<motion.div
						variants={item}
						className="group relative overflow-hidden rounded-2xl bg-card/30 border border-border/50 p-6 hover:border-yellow-500/30 transition-all"
					>
						<div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="flex justify-between items-start mb-4">
							<div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
								<Code className="w-6 h-6" />
							</div>
							<a
								href={stats.leetcode.url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs font-mono text-muted-foreground hover:text-yellow-400 transition-colors"
							>
								@{stats.leetcode.username} ↗
							</a>
						</div>
						<div className="space-y-2">
							<h3 className="text-3xl font-bold text-white">LeetCode</h3>
							<div className="text-sm text-muted-foreground">Problem Solving</div>
						</div>
					</motion.div>

					{/* Codeforces Card */}
					<motion.div
						variants={item}
						className="group relative overflow-hidden rounded-2xl bg-card/30 border border-border/50 p-6 hover:border-red-500/30 transition-all"
					>
						<div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="flex justify-between items-start mb-4">
							<div className="p-2 bg-red-500/10 rounded-lg text-red-500">
								<Trophy className="w-6 h-6" />
							</div>
							<a
								href={stats.codeforces.url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-xs font-mono text-muted-foreground hover:text-red-400 transition-colors"
							>
								@{stats.codeforces.username} ↗
							</a>
						</div>
						<div className="space-y-2">
							<h3 className="text-3xl font-bold text-white">Codeforces</h3>
							<div className="text-sm text-muted-foreground">
								Competitive Programming
							</div>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</ScrollArea>
	);
}
