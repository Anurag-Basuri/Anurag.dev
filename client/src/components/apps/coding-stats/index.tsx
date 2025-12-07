'use client';

import { useEffect, useState } from 'react';
import { fetchCodingStats, CodingStats } from '@/lib/api/codingProfiles';
import { motion } from 'framer-motion';
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	Radar,
} from 'recharts';
import { Loader2, Database, Code, Globe, Trophy, GitCommit, User, Sparkles } from 'lucide-react';
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
					ACCESSING DEVELOPER PROFILE...
				</div>
			</div>
		);
	}

	if (!stats) return null;

	// Persona Logic
	const getPersona = () => {
		if (stats.leetcode.hard > 50) return { title: 'Algorithm Specialist', level: 'S-Rank' };
		if (stats.identity.yearsActive > 5) return { title: 'Senior Architect', level: 'Staff' };
		if (stats.languages.length > 4) return { title: 'Polyglot Engineer', level: 'Senior' };
		return { title: 'Full Stack Developer', level: 'Advanced' };
	};

	const persona = getPersona();

	const leetCodeData = [
		{ name: 'Easy', value: stats.leetcode.easy, color: '#22c55e' },
		{ name: 'Medium', value: stats.leetcode.medium, color: '#eab308' },
		{ name: 'Hard', value: stats.leetcode.hard, color: '#ef4444' },
	];

	const cfData = [
		{ subject: '', A: 100, fullMark: 100 }, // Spacer
		{ subject: 'Rating', A: (stats.codeforces.rating / 3000) * 100, fullMark: 100 },
		{ subject: 'Rank', A: 75, fullMark: 100 },
		{ subject: 'Solves', A: 80, fullMark: 100 },
		{ subject: '', A: 100, fullMark: 100 }, // Spacer
	];

	return (
		<div className="h-full w-full p-6 overflow-y-auto bg-background/50 selection:bg-primary/20">
			<div className="max-w-6xl mx-auto space-y-6">
				{/* Identity Matrix (Header) */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-linear-to-br from-background via-muted/10 to-primary/5 border border-border/60 shadow-lg relative overflow-hidden"
				>
					<div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

					{/* ID Card Left */}
					<div className="flex items-center gap-6 z-10">
						<div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
							<User className="w-10 h-10 text-white" />
						</div>
						<div>
							<div className="flex items-center gap-2 mb-1">
								<h1 className="text-3xl font-bold tracking-tight text-foreground">
									ANURAG.DEV
								</h1>
								<span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
									{persona.level}
								</span>
							</div>
							<p className="text-lg text-muted-foreground font-medium flex items-center gap-2">
								{persona.title}
								<Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
							</p>
							<div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground/80 font-mono">
								<span className="flex items-center gap-1.5">
									<Globe className="w-3.5 h-3.5" /> Earth (Remote)
								</span>
								<span className="flex items-center gap-1.5">
									<ClockIcon className="w-3.5 h-3.5" /> EST (UTC-5)
								</span>
							</div>
						</div>
					</div>

					{/* Quick Stats Right */}
					<div className="flex-1 md:text-right flex flex-col justify-center gap-1 z-10 md:items-end">
						<div className="text-4xl font-bold font-mono tracking-tighter text-foreground">
							{stats.identity.yearsActive}+{' '}
							<span className="text-sm font-sans text-muted-foreground font-normal tracking-normal uppercase relative -top-4">
								Years Exp.
							</span>
						</div>
						<div className="flex gap-6 md:justify-end">
							<div className="text-right">
								<span className="block text-xl font-bold text-foreground">
									{stats.identity.totalCommits.toLocaleString()}
								</span>
								<span className="text-[10px] uppercase tracking-wider text-muted-foreground">
									Lifetime Commits
								</span>
							</div>
							<div className="text-right">
								<span className="block text-xl font-bold text-foreground">
									Top {100 - stats.github.percentile}%
								</span>
								<span className="text-[10px] uppercase tracking-wider text-muted-foreground">
									Global Rank
								</span>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Skill Spectrum (Language Bar) */}
				<motion.div
					initial={{ opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.1 }}
					className="w-full bg-card/40 border border-border/40 rounded-xl p-4 backdrop-blur-sm"
				>
					<div className="flex justify-between items-center mb-3">
						<h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
							<Code className="w-4 h-4" /> Core Technologies
						</h3>
						<span className="text-[10px] font-mono text-muted-foreground/60">
							{stats.identity.mostUsedLanguage} Primary
						</span>
					</div>

					<div className="h-3 w-full flex rounded-full overflow-hidden">
						{stats.languages.map(lang => (
							<div
								key={lang.name}
								style={{
									width: `${lang.percentage}%`,
									backgroundColor: lang.color,
								}}
								className="h-full first:rounded-l-full last:rounded-r-full relative group hover:brightness-110 transition-all cursor-help"
							/>
						))}
					</div>
					<div className="flex gap-4 mt-3 flex-wrap">
						{stats.languages.map(lang => (
							<div key={lang.name} className="flex items-center gap-1.5">
								<div
									className="w-2 h-2 rounded-full"
									style={{ backgroundColor: lang.color }}
								/>
								<span className="text-xs font-medium text-foreground">
									{lang.name}
								</span>
								<span className="text-[10px] text-muted-foreground">
									{lang.percentage}%
								</span>
							</div>
						))}
					</div>
				</motion.div>

				{/* Main Bento Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* LeetCode Block (Wide) */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="col-span-1 lg:col-span-2 bg-linear-to-br from-card/50 to-background border border-border/50 rounded-2xl p-6 relative overflow-hidden group hover:border-border/80 transition-colors"
					>
						<div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity scale-150 transform rotate-12">
							<Database className="w-32 h-32" />
						</div>

						<div className="flex flex-col sm:flex-row gap-8 relative z-10">
							{/* Chart */}
							<div className="w-32 h-32 sm:w-40 sm:h-40 relative shrink-0 mx-auto sm:mx-0">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={leetCodeData}
											innerRadius={55}
											outerRadius={75}
											dataKey="value"
											stroke="none"
											cornerRadius={4}
											paddingAngle={4}
										>
											{leetCodeData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
									</PieChart>
								</ResponsiveContainer>
								<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
									<span className="text-3xl font-bold">
										{stats.leetcode.totalSolved}
									</span>
									<span className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">
										Solved
									</span>
								</div>
							</div>

							{/* Stats */}
							<div className="flex-1 flex flex-col justify-center">
								<div className="flex items-center gap-2 mb-4">
									<div className="p-1.5 bg-yellow-500/10 rounded-md">
										<Database className="w-4 h-4 text-yellow-500" />
									</div>
									<h3 className="text-lg font-bold">LeetCode Mastery</h3>
									<span className="ml-auto text-xs font-mono py-1 px-2 bg-muted rounded text-muted-foreground">
										Top {stats.leetcode.globalPercentile}%
									</span>
								</div>

								<div className="grid grid-cols-3 gap-2">
									{leetCodeData.map(item => (
										<div
											key={item.name}
											className="flex flex-col p-3 rounded-lg bg-muted/40 border border-border/20"
										>
											<span className="text-xs text-muted-foreground font-medium uppercase mb-1">
												{item.name}
											</span>
											<span
												className="text-xl font-bold"
												style={{ color: item.color }}
											>
												{item.value}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</motion.div>

					{/* Codeforces Block (Square) */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="bg-card/40 border border-border/50 rounded-2xl p-6 relative overflow-hidden flex flex-col"
					>
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<div className="p-1.5 bg-blue-500/10 rounded-md">
									<Trophy className="w-4 h-4 text-blue-500" />
								</div>
								<div>
									<h3 className="font-bold leading-none">Competitive</h3>
									<span className="text-[10px] text-muted-foreground uppercase">
										{stats.codeforces.rank}
									</span>
								</div>
							</div>
							<div className="text-right">
								<div className="text-2xl font-bold text-blue-400 font-mono">
									{stats.codeforces.rating}
								</div>
							</div>
						</div>

						<div className="flex-1 min-h-[140px] w-full relative">
							<ResponsiveContainer width="100%" height="100%">
								<RadarChart cx="50%" cy="50%" outerRadius="70%" data={cfData}>
									<PolarGrid stroke="rgba(255,255,255,0.05)" />
									<PolarAngleAxis
										dataKey="subject"
										tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
										tickLine={false}
									/>
									<Radar
										name="Performance"
										dataKey="A"
										stroke="#3b82f6"
										strokeWidth={3}
										fill="#3b82f6"
										fillOpacity={0.2}
									/>
								</RadarChart>
							</ResponsiveContainer>
							<div className="absolute bottom-0 text-center w-full text-[10px] text-muted-foreground">
								Max Rating:{' '}
								<span className="text-foreground font-mono">
									{stats.codeforces.maxRating}
								</span>
							</div>
						</div>
					</motion.div>

					{/* GitHub Activity Block (Full Width Bottom) - FUTURE */}
				</div>
			</div>
		</div>
	);
}

// Simple clock icon component for the header
function ClockIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</svg>
	);
}
