'use client';

import { useEffect, useState } from 'react';
import { api, AboutData, CodingStats } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Code2,
	Terminal,
	User,
	MapPin,
	Calendar,
	Sparkles,
	Cpu,
	Layers,
	Box,
	Github,
	Code,
	Trophy,
	ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { ModuleHeader } from '@/components/apps/shared/ModuleHeader';
import { ModuleError } from '@/components/ui/module-error';
import { cn } from '@/lib/utils';
import { useWindowManager } from '@/hooks/use-window-manager';

// Skeleton loader component
function AboutSkeleton() {
	return (
		<div className="p-6 space-y-8 animate-pulse">
			<div className="flex justify-between items-end border-b border-border/40 pb-4">
				<div className="h-8 bg-muted rounded w-48" />
				<div className="h-4 bg-muted rounded w-24" />
			</div>
			<div className="flex flex-col md:flex-row gap-6">
				<div className="md:w-1/3 space-y-4">
					<div className="aspect-square bg-muted rounded-2xl" />
					<div className="h-24 bg-muted rounded-xl" />
				</div>
				<div className="md:w-2/3 space-y-6">
					<div className="h-32 bg-muted rounded-xl" />
					<div className="grid grid-cols-2 gap-4">
						<div className="h-40 bg-muted rounded-xl" />
						<div className="h-40 bg-muted rounded-xl" />
					</div>
				</div>
			</div>
		</div>
	);
}

export function AboutModule() {
	const [about, setAbout] = useState<AboutData | null>(null);
	const [codingStats, setCodingStats] = useState<CodingStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { openWindow } = useWindowManager();

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const [aboutData, statsData] = await Promise.all([
				api.getAbout(),
				api.getCodingStats(),
			]);
			setAbout(aboutData);
			setCodingStats(statsData);
		} catch (err: any) {
			setError(err.message || 'Failed to load data');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (loading) return <AboutSkeleton />;

	if (error) {
		return <ModuleError message={error} onRetry={fetchData} />;
	}

	if (!about) return null;

	return (
		<ScrollArea className="h-full">
			<div className="p-6 space-y-8 max-w-6xl mx-auto">
				{/* 1. Standardized System Header */}
				<ModuleHeader
					label="Profile"
					icon={User}
					title="PROFILE DOSSIER"
					actions={
						<div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
							<User className="w-3 h-3" />
						</div>
					}
				/>

				<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
					{/* Left Column: Identity Card */}
					<div className="md:col-span-4 space-y-6">
						<motion.div
							initial="hidden"
							animate="visible"
							variants={fadeInUp}
							className="bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group"
						>
							<div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

							<div className="relative w-40 h-40 mb-6">
								<div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-[spin_10s_linear_infinite]" />
								<div className="absolute inset-2 rounded-full border border-primary/20" />
								<img
									src={about.avatarUrl || '/profile.png'}
									alt="Profile"
									className="w-full h-full object-cover rounded-full p-1.5"
								/>
								<div className="absolute bottom-2 right-2 p-2 bg-background/80 backdrop-blur rounded-full border border-border shadow-sm">
									<Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
								</div>
							</div>

							<h2 className="text-2xl font-bold text-foreground mb-1">
								{about.name}
							</h2>
							<p className="text-sm text-primary font-mono mb-4 px-3 py-1 bg-primary/10 rounded-full">
								{about.tagline}
							</p>
						</motion.div>

						{/* Stats Row */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.15 }}
							className="grid grid-cols-2 gap-3"
						>
							<div className="bg-card/30 border border-border/50 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
								<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
								<span className="text-3xl font-bold text-foreground">
									{about.experienceYears}+
								</span>
								<span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
									Years Exp.
								</span>
							</div>
							<div className="bg-card/30 border border-border/50 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
								<div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
								<span className="text-3xl font-bold text-foreground">
									{about.projectsCount}+
								</span>
								<span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
									Projects
								</span>
							</div>
						</motion.div>

						{/* Coding Profiles Mini-Block */}
						{codingStats && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.2 }}
								className="grid grid-cols-2 gap-3"
							>
								<a
									href={codingStats.github.url}
									target="_blank"
									rel="noopener noreferrer"
									className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-between group"
								>
									<div className="flex flex-col">
										<span className="text-[10px] text-muted-foreground uppercase">
											GitHub
										</span>
										<span className="text-sm font-bold group-hover:text-white transition-colors">
											{codingStats.github.stats?.stars !== undefined
												? `${codingStats.github.stats.stars} ★`
												: `@${codingStats.github.username}`}
										</span>
									</div>
									<div className="text-xs font-mono text-muted-foreground">
										<Github className="w-4 h-4" />
									</div>
								</a>
								<a
									href={codingStats.leetcode.url}
									target="_blank"
									rel="noopener noreferrer"
									className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10 hover:bg-yellow-500/10 hover:border-yellow-500/20 transition-all flex items-center justify-between group"
								>
									<div className="flex flex-col">
										<span className="text-[10px] text-muted-foreground uppercase">
											LeetCode
										</span>
										<span className="text-sm font-bold group-hover:text-yellow-400 transition-colors">
											{codingStats.leetcode.stats?.solved !== undefined
												? `${codingStats.leetcode.stats.solved} Solved`
												: `@${codingStats.leetcode.username}`}
										</span>
									</div>
									<div className="text-[10px] uppercase text-muted-foreground">
										<Code className="w-4 h-4" />
									</div>
								</a>
								<a
									href={codingStats.codeforces.url}
									target="_blank"
									rel="noopener noreferrer"
									className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex items-center justify-between group"
								>
									<div className="flex flex-col">
										<span className="text-[10px] text-muted-foreground uppercase">
											Codeforces
										</span>
										<span className="text-sm font-bold group-hover:text-red-400 transition-colors">
											{codingStats.codeforces.stats?.rating !== undefined
												? `${codingStats.codeforces.stats.rating} Rating`
												: `@${codingStats.codeforces.username}`}
										</span>
									</div>
									<div className="text-[10px] uppercase text-muted-foreground">
										<Trophy className="w-4 h-4" />
									</div>
								</a>
								{codingStats.codechef && (
									<a
										href={codingStats.codechef.url}
										target="_blank"
										rel="noopener noreferrer"
										className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10 hover:border-orange-500/20 transition-all flex items-center justify-between group"
									>
										<div className="flex flex-col">
											<span className="text-[10px] text-muted-foreground uppercase">
												CodeChef
											</span>
											<span className="text-sm font-bold group-hover:text-orange-400 transition-colors">
												{codingStats.codechef.stats?.rating !== undefined
													? `${codingStats.codechef.stats.rating} Rating`
													: `@${codingStats.codechef.username}`}
											</span>
										</div>
										<div className="text-[10px] uppercase text-muted-foreground">
											<Terminal className="w-4 h-4" />
										</div>
									</a>
								)}
							</motion.div>
						)}

						{/* View All Profiles Button */}
						{codingStats && (
							<motion.button
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								onClick={() => openWindow('profiles')}
								className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all group flex items-center justify-between"
							>
								<div className="flex items-center gap-3">
									<Code className="w-5 h-5 text-emerald-400" />
									<div className="text-left">
										<div className="text-sm font-bold text-foreground group-hover:text-emerald-400 transition-colors">
											View All Coding Profiles
										</div>
										<div className="text-xs text-muted-foreground">
											Detailed stats from GitHub, LeetCode, Codeforces & more
										</div>
									</div>
								</div>
								<ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
							</motion.button>
						)}

						{/* "About" Quick Summary */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="p-5 rounded-2xl bg-muted/20 border border-border/40 text-sm leading-relaxed text-muted-foreground"
						>
							<p>
								<span className="text-primary font-bold mr-2">&gt;</span>
								{about.summary}
							</p>
						</motion.div>
					</div>

					{/* Right Column: Skills & Details */}
					<div className="md:col-span-8 space-y-6">
						{/* Skills Bento Grid */}
						<motion.div
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.2 }}
							className="bg-card/20 border border-border/40 rounded-2xl p-6"
						>
							<div className="flex items-center gap-2 mb-6">
								<Code2 className="w-5 h-5 text-primary" />
								<h3 className="font-bold tracking-widest text-sm uppercase">
									Technical Capabilities
								</h3>
							</div>

							<div className="grid grid-cols-1 gap-4">
								{/* Frontend */}
								<div className="p-5 rounded-xl bg-linear-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors group">
									<div className="flex items-center gap-2 mb-4 text-indigo-400">
										<Layers className="w-4 h-4" />
										<span className="font-bold text-xs uppercase tracking-wider">
											Frontend Architecture
										</span>
									</div>
									<div className="space-y-3">
										{about.skills.frontend.map((skill: any) => (
											<div key={skill.name} className="space-y-1.5">
												<div className="flex justify-between text-xs">
													<span className="text-indigo-200 font-medium">
														{skill.name}
													</span>
													<span className="text-indigo-400/60 font-mono">
														{skill.level}%
													</span>
												</div>
												<div className="h-1.5 w-full bg-indigo-950/40 rounded-full overflow-hidden">
													<motion.div
														initial={{ width: 0 }}
														whileInView={{ width: `${skill.level}%` }}
														transition={{
															duration: 1,
															ease: 'easeOut',
														}}
														className="h-full bg-indigo-500 rounded-full"
													/>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Backend */}
								<div className="p-5 rounded-xl bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors group">
									<div className="flex items-center gap-2 mb-4 text-emerald-400">
										<Cpu className="w-4 h-4" />
										<span className="font-bold text-xs uppercase tracking-wider">
											Backend Systems
										</span>
									</div>
									<div className="space-y-3">
										{about.skills.backend.map((skill: any) => (
											<div key={skill.name} className="space-y-1.5">
												<div className="flex justify-between text-xs">
													<span className="text-emerald-200 font-medium">
														{skill.name}
													</span>
													<span className="text-emerald-400/60 font-mono">
														{skill.level}%
													</span>
												</div>
												<div className="h-1.5 w-full bg-emerald-950/40 rounded-full overflow-hidden">
													<motion.div
														initial={{ width: 0 }}
														whileInView={{ width: `${skill.level}%` }}
														transition={{
															duration: 1,
															ease: 'easeOut',
														}}
														className="h-full bg-emerald-500 rounded-full"
													/>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* ML/AI */}
								<div className="p-5 rounded-xl bg-linear-to-br from-purple-500/10 to-pink-600/5 border border-purple-500/20 hover:border-purple-500/40 transition-colors group">
									<div className="flex items-center gap-2 mb-4 text-purple-400">
										<Box className="w-4 h-4" />
										<span className="font-bold text-xs uppercase tracking-wider">
											Artificial Intelligence & ML
										</span>
									</div>
									<div className="space-y-3">
										{about.skills.ml.map((skill: any) => (
											<div key={skill.name} className="space-y-1.5">
												<div className="flex justify-between text-xs">
													<span className="text-purple-200 font-medium">
														{skill.name}
													</span>
													<span className="text-purple-400/60 font-mono">
														{skill.level}%
													</span>
												</div>
												<div className="h-1.5 w-full bg-purple-950/40 rounded-full overflow-hidden">
													<motion.div
														initial={{ width: 0 }}
														whileInView={{ width: `${skill.level}%` }}
														transition={{
															duration: 1,
															ease: 'easeOut',
														}}
														className="h-full bg-purple-500 rounded-full"
													/>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</motion.div>

						{/* Terminal Footer Quote - "Who I Am" */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-muted-foreground flex items-center gap-4"
						>
							<Terminal className="w-4 h-4 text-primary" />
							<div className="flex-1 typing-cursor">
								<span className="text-green-500 mr-2">➜</span>
								<span>echo "Checking capability matrix... STATUS: OPTIMIZED"</span>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</ScrollArea>
	);
}
