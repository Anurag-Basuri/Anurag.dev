'use client';

import { useEffect, useState } from 'react';
import { fetchCodingStats, CodingStats } from '@/lib/api/codingProfiles';
import { motion } from 'framer-motion';
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Radar,
} from 'recharts';
import { Loader2, Database, Code, Globe, Terminal, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CodingStatsModule() {
	const [stats, setStats] = useState<CodingStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchCodingStats().then(data => {
			setStats(data);
			setLoading(false);
		});
	}, []);

	if (loading) {
		return (
			<div className="h-full w-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
				<Loader2 className="w-8 h-8 animate-spin text-primary" />
				<div className="text-xs uppercase tracking-[0.2em] animate-pulse">
					Initializing Diagnostics...
				</div>
			</div>
		);
	}

	if (!stats) return null;

	// Data preparation for charts
	const leetCodeData = [
		{ name: 'Easy', value: stats.leetcode.easy, color: '#22c55e' }, // green-500
		{ name: 'Medium', value: stats.leetcode.medium, color: '#eab308' }, // yellow-500
		{ name: 'Hard', value: stats.leetcode.hard, color: '#ef4444' }, // red-500
	];

	const cfData = [
		{ subject: 'Rating', A: stats.codeforces.rating, fullMark: 3000 },
		{ subject: 'Max', A: stats.codeforces.maxRating, fullMark: 3000 },
		// Mock dimensions for radar
		{ subject: 'Activity', A: 2000, fullMark: 3000 },
		{ subject: 'Problem Solving', A: 1800, fullMark: 3000 },
		{ subject: 'Contests', A: 1500, fullMark: 3000 },
		{ subject: 'Accuracy', A: 2400, fullMark: 3000 },
	];

	return (
		<div className="h-full w-full p-6 overflow-y-auto bg-background/40">
			<div className="max-w-5xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex items-end justify-between border-b border-border/40 pb-4">
					<div>
						<h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-400">
							SYSTEM METRICS
						</h1>
						<p className="text-sm text-muted-foreground tracking-wider uppercase font-mono mt-1">
							Developer Performance Diagnostics
						</p>
					</div>
					<div className="flex items-center gap-2 text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
						<Activity className="w-3 h-3 animate-pulse" />
						<span>DATA STREAM: ACTIVE</span>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Github Card */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="col-span-1 lg:col-span-2 bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6 relative overflow-hidden group"
					>
						<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
							<Globe className="w-24 h-24" />
						</div>
						<div className="relative z-10">
							<div className="flex items-center gap-3 mb-6">
								<div className="p-2 bg-black/50 rounded-lg border border-white/10">
									<Globe className="w-5 h-5 text-white" />
								</div>
								<h3 className="text-lg font-semibold tracking-wide">
									GITHUB REPOSITORY
								</h3>
							</div>

							<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
								{[
									{ label: 'Repositories', value: stats.github.repos },
									{ label: 'Total Stars', value: stats.github.stars },
									{ label: 'Commits (YTD)', value: stats.github.contributions },
									{ label: 'Followers', value: stats.github.followers },
								].map((item, i) => (
									<div
										key={i}
										className="flex flex-col p-3 rounded bg-background/20 border border-white/5"
									>
										<span className="text-2xl font-bold font-mono text-primary">
											{item.value}
										</span>
										<span className="text-[10px] uppercase tracking-wider text-muted-foreground">
											{item.label}
										</span>
									</div>
								))}
							</div>
						</div>
					</motion.div>

					{/* LeetCode Card */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6 relative overflow-hidden flex flex-col"
					>
						<div className="flex items-center gap-3 mb-4 z-10">
							<div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
								<Database className="w-5 h-5 text-yellow-500" />
							</div>
							<h3 className="text-lg font-semibold tracking-wide">LEETCODE</h3>
						</div>

						<div className="flex-1 min-h-[180px] relative">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={leetCodeData}
										innerRadius={45}
										outerRadius={65}
										paddingAngle={5}
										dataKey="value"
										stroke="none"
									>
										{leetCodeData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											background: 'rgba(0,0,0,0.8)',
											border: 'none',
											borderRadius: '8px',
											fontSize: '12px',
										}}
										itemStyle={{ color: '#fff' }}
									/>
								</PieChart>
							</ResponsiveContainer>
							<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
								<span className="text-2xl font-bold font-mono">
									{stats.leetcode.totalSolved}
								</span>
								<span className="text-[9px] uppercase tracking-widest text-muted-foreground">
									SOLVED
								</span>
							</div>
						</div>
					</motion.div>

					{/* Codeforces Card */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6 relative overflow-hidden flex flex-col"
					>
						<div className="flex items-center gap-3 mb-4 z-10">
							<div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
								<Code className="w-5 h-5 text-blue-500" />
							</div>
							<h3 className="text-lg font-semibold tracking-wide">CODEFORCES</h3>
						</div>

						<div className="flex items-center justify-between mb-2 px-2">
							<div className="flex flex-col">
								<span className="text-xs text-muted-foreground uppercase">
									Rating
								</span>
								<span className="text-xl font-bold font-mono text-blue-400">
									{stats.codeforces.rating}
								</span>
							</div>
							<div className="flex flex-col text-right">
								<span className="text-xs text-muted-foreground uppercase">
									Max Rank
								</span>
								<span className="text-sm font-bold font-mono text-foreground">
									{stats.codeforces.maxRank}
								</span>
							</div>
						</div>

						<div className="flex-1 min-h-[150px] w-full">
							<ResponsiveContainer width="100%" height="100%">
								<RadarChart cx="50%" cy="50%" outerRadius="65%" data={cfData}>
									<PolarGrid stroke="rgba(255,255,255,0.1)" />
									<PolarAngleAxis
										dataKey="subject"
										tick={{ fill: '#888888', fontSize: 9 }}
									/>
									<PolarRadiusAxis angle={30} domain={[0, 3000]} tick={false} />
									<Radar
										name="Performance"
										dataKey="A"
										stroke="#3b82f6"
										strokeWidth={2}
										fill="#3b82f6"
										fillOpacity={0.3}
									/>
									<Tooltip />
								</RadarChart>
							</ResponsiveContainer>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
