'use client';

import { useEffect, useState } from 'react';
import { api, AboutData, CodingStats } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Code2,
	Terminal,
	User,
	MapPin,
	Sparkles,
	Cpu,
	Layers,
	Box,
	Github,
	Code,
	Trophy,
	ArrowRight,
	Globe,
	Briefcase,
	Clock,
	CheckCircle,
	Star,
	Target,
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
			<div className="h-48 bg-muted rounded-2xl" />
			<div className="grid grid-cols-3 gap-4">
				<div className="h-32 bg-muted rounded-xl" />
				<div className="h-32 bg-muted rounded-xl" />
				<div className="h-32 bg-muted rounded-xl" />
			</div>
			<div className="h-64 bg-muted rounded-xl" />
		</div>
	);
}

const iconMap: Record<string, any> = {
	Code2,
	CheckCircle,
	Star,
	Trophy,
	Target,
	Sparkles,
};

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
			<div className="max-w-6xl mx-auto">
				{/* Hero Section */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="relative h-48 sm:h-56 md:h-64 bg-linear-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-b-3xl overflow-hidden"
				>
					<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
					<div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

					{/* Profile Picture - Overlapping */}
					<div className="absolute -bottom-16 left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0">
						<div className="relative">
							<div className="absolute inset-0 rounded-full bg-linear-to-br from-emerald-500 to-blue-500 blur-xl opacity-60 animate-pulse" />
							<div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-background bg-background p-1 hover:scale-105 transition-transform">
								<img
									src={about.avatarUrl || '/logo.png'}
									alt={about.name}
									className="w-full h-full object-cover rounded-full"
								/>
								<div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
							</div>
						</div>
					</div>
				</motion.div>

				{/* Name & Role Section */}
				<div className="mt-20 sm:mt-8 px-6 sm:px-8 pb-8 text-center sm:text-left sm:ml-44">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
					>
						<h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
							{about.name}
						</h1>
						<p className="text-lg sm:text-xl text-muted-foreground mb-3">
							{about.role}
						</p>
						<p className="text-sm text-primary/80 italic mb-4">{about.tagline}</p>

						{/* Status & Quick Info */}
						<div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
							{about.currentStatus && (
								<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm">
									<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
									<span className="text-emerald-400">
										{about.currentStatus.label}
									</span>
								</div>
							)}
							{about.location && (
								<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground">
									<MapPin className="w-3 h-3" />
									{about.location}
								</div>
							)}
							{about.workPreferences &&
								(about.workPreferences.remote || about.workPreferences.hybrid) && (
									<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400">
										<Globe className="w-3 h-3" />
										{about.workPreferences.remote &&
										about.workPreferences.hybrid
											? 'Remote / Hybrid'
											: about.workPreferences.remote
											? 'Remote'
											: 'Hybrid'}
									</div>
								)}
						</div>
					</motion.div>
				</div>

				<div className="px-6 sm:px-8 space-y-8 pb-8">
					{/* Highlights Section */}
					{about.highlights && about.highlights.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
						>
							<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
								<Sparkles className="w-5 h-5 text-yellow-400" />
								Highlights
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{about.highlights.map((highlight, index) => {
									const Icon =
										highlight.icon && iconMap[highlight.icon]
											? iconMap[highlight.icon]
											: Star;
									return (
										<motion.div
											key={highlight.label}
											initial={{ opacity: 0, scale: 0.9 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.3 + index * 0.1 }}
											className="relative group"
										>
											<div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
											<div className="relative bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-emerald-500/50 transition-all">
												<Icon className="w-8 h-8 text-emerald-400 mb-3" />
												<div className="text-3xl font-bold bg-linear-to-br from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-1">
													{highlight.value}
												</div>
												<div className="text-sm text-muted-foreground">
													{highlight.label}
												</div>
											</div>
										</motion.div>
									);
								})}
							</div>
						</motion.div>
					)}

					{/* About & Quick Info Grid */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="grid grid-cols-1 lg:grid-cols-3 gap-6"
					>
						{/* Bio */}
						<div className="lg:col-span-2 bg-card/20 border border-border/40 rounded-2xl p-6">
							<h2 className="text-xl font-bold mb-4 flex items-center gap-2">
								<User className="w-5 h-5 text-primary" />
								About Me
							</h2>
							<p className="text-muted-foreground leading-relaxed mb-4">
								{about.summary}
							</p>
							{about.currentStatus?.description && (
								<p className="text-sm text-muted-foreground/80 italic">
									{about.currentStatus.description}
								</p>
							)}
						</div>

						{/* Quick Stats */}
						<div className="space-y-4">
							<div className="bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6 text-center">
								<Briefcase className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
								<div className="text-4xl font-bold text-emerald-400 mb-1">
									{about.experienceYears}+
								</div>
								<div className="text-xs uppercase tracking-wider text-muted-foreground">
									Years Experience
								</div>
							</div>
							<div className="bg-linear-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6 text-center">
								<Code2 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
								<div className="text-4xl font-bold text-blue-400 mb-1">
									{about.projectsCount}+
								</div>
								<div className="text-xs uppercase tracking-wider text-muted-foreground">
									Projects Delivered
								</div>
							</div>
						</div>
					</motion.div>

					{/* Focus Areas */}
					{about.focusAreas && about.focusAreas.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
							className="bg-card/20 border border-border/40 rounded-2xl p-6"
						>
							<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
								<Target className="w-5 h-5 text-primary" />
								Focus Areas
							</h2>
							<div className="flex flex-wrap gap-3">
								{about.focusAreas.map((area, index) => (
									<motion.span
										key={area}
										initial={{ opacity: 0, scale: 0 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: 0.6 + index * 0.05 }}
										className="px-4 py-2 rounded-xl bg-linear-to-r from-emerald-500/10 to-blue-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20 hover:border-emerald-500/40 hover:from-emerald-500/20 hover:to-blue-500/20 transition-all cursor-default"
									>
										{area}
									</motion.span>
								))}
							</div>
						</motion.div>
					)}

					{/* Skills Section - Compact Cards */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6 }}
					>
						<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
							<Code2 className="w-5 h-5 text-primary" />
							Technical Skills
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{/* Frontend */}
							<div className="bg-linear-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-2xl p-6">
								<div className="flex items-center gap-3 mb-4">
									<Layers className="w-6 h-6 text-indigo-400" />
									<h3 className="font-bold text-indigo-400">Frontend</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{about.skills.frontend.map(skill => (
										<span
											key={skill.name}
											className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs border border-indigo-500/20"
										>
											{skill.name}
										</span>
									))}
								</div>
							</div>

							{/* Backend */}
							<div className="bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6">
								<div className="flex items-center gap-3 mb-4">
									<Cpu className="w-6 h-6 text-emerald-400" />
									<h3 className="font-bold text-emerald-400">Backend</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{about.skills.backend.map(skill => (
										<span
											key={skill.name}
											className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs border border-emerald-500/20"
										>
											{skill.name}
										</span>
									))}
								</div>
							</div>

							{/* ML/AI */}
							<div className="bg-linear-to-br from-purple-500/10 to-pink-600/5 border border-purple-500/20 rounded-2xl p-6">
								<div className="flex items-center gap-3 mb-4">
									<Box className="w-6 h-6 text-purple-400" />
									<h3 className="font-bold text-purple-400">AI & ML</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{about.skills.ml.map(skill => (
										<span
											key={skill.name}
											className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-xs border border-purple-500/20"
										>
											{skill.name}
										</span>
									))}
								</div>
							</div>
						</div>
					</motion.div>

					{/* Coding Profiles */}
					{codingStats && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.7 }}
						>
							<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
								<Code className="w-5 h-5 text-primary" />
								Coding Profiles
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
								<a
									href={codingStats.github.url}
									target="_blank"
									rel="noopener noreferrer"
									className="group relative bg-card/30 border border-border/40 rounded-2xl p-6 hover:border-white/20 transition-all overflow-hidden"
								>
									<div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
									<div className="relative flex items-center justify-between">
										<div>
											<div className="text-xs text-muted-foreground uppercase mb-1">
												GitHub
											</div>
											<div className="text-lg font-bold">
												@{codingStats.github.username}
											</div>
										</div>
										<Github className="w-8 h-8 text-white/60 group-hover:text-white transition-colors" />
									</div>
								</a>

								<a
									href={codingStats.leetcode.url}
									target="_blank"
									rel="noopener noreferrer"
									className="group relative bg-linear-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/40 transition-all overflow-hidden"
								>
									<div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
									<div className="relative flex items-center justify-between">
										<div>
											<div className="text-xs text-yellow-400/60 uppercase mb-1">
												LeetCode
											</div>
											<div className="text-lg font-bold text-yellow-400">
												@{codingStats.leetcode.username}
											</div>
										</div>
										<Code className="w-8 h-8 text-yellow-400/60 group-hover:text-yellow-400 transition-colors" />
									</div>
								</a>

								<a
									href={codingStats.codeforces.url}
									target="_blank"
									rel="noopener noreferrer"
									className="group relative bg-linear-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 transition-all overflow-hidden"
								>
									<div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
									<div className="relative flex items-center justify-between">
										<div>
											<div className="text-xs text-red-400/60 uppercase mb-1">
												Codeforces
											</div>
											<div className="text-lg font-bold text-red-400">
												@{codingStats.codeforces.username}
											</div>
										</div>
										<Trophy className="w-8 h-8 text-red-400/60 group-hover:text-red-400 transition-colors" />
									</div>
								</a>

								{codingStats.codechef && (
									<a
										href={codingStats.codechef.url}
										target="_blank"
										rel="noopener noreferrer"
										className="group relative bg-linear-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all overflow-hidden"
									>
										<div className="absolute inset-0 bg-linear-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
										<div className="relative flex items-center justify-between">
											<div>
												<div className="text-xs text-orange-400/60 uppercase mb-1">
													CodeChef
												</div>
												<div className="text-lg font-bold text-orange-400">
													@{codingStats.codechef.username}
												</div>
											</div>
											<Terminal className="w-8 h-8 text-orange-400/60 group-hover:text-orange-400 transition-colors" />
										</div>
									</a>
								)}
							</div>

							<button
								onClick={() => openWindow('profiles')}
								className="w-full p-4 rounded-xl bg-linear-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 hover:border-emerald-500/40 hover:from-emerald-500/20 hover:to-blue-500/20 transition-all group flex items-center justify-between"
							>
								<div className="flex items-center gap-3">
									<Code className="w-5 h-5 text-emerald-400" />
									<div className="text-left">
										<div className="text-sm font-bold text-foreground group-hover:text-emerald-400 transition-colors">
											View Detailed Coding Stats
										</div>
										<div className="text-xs text-muted-foreground">
											Complete analytics from all platforms
										</div>
									</div>
								</div>
								<ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
							</button>
						</motion.div>
					)}

					{/* Personal Info Grid */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8 }}
						className="grid grid-cols-1 md:grid-cols-2 gap-6"
					>
						{about.languages && (
							<div className="bg-card/20 border border-border/40 rounded-2xl p-6">
								<h3 className="font-bold tracking-widest text-sm uppercase mb-4 flex items-center gap-2">
									<Sparkles className="w-4 h-4 text-primary" />
									Languages
								</h3>
								<div className="flex flex-wrap gap-2">
									{about.languages.map(lang => (
										<span
											key={lang}
											className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20"
										>
											{lang}
										</span>
									))}
								</div>
							</div>
						)}

						{about.hobbies && (
							<div className="bg-card/20 border border-border/40 rounded-2xl p-6">
								<h3 className="font-bold tracking-widest text-sm uppercase mb-4 flex items-center gap-2">
									<User className="w-4 h-4 text-primary" />
									Interests
								</h3>
								<div className="flex flex-wrap gap-2">
									{about.hobbies.map(hobby => (
										<span
											key={hobby}
											className="px-3 py-1.5 rounded-lg bg-surface-200/50 text-muted-foreground text-xs border border-white/5 hover:bg-white/5 transition-colors"
										>
											{hobby}
										</span>
									))}
								</div>
							</div>
						)}
					</motion.div>
				</div>
			</div>
		</ScrollArea>
	);
}
