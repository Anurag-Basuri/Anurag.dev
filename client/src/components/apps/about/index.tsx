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
	Zap,
	Award,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { ModuleHeader } from '@/components/apps/shared/ModuleHeader';
import { ModuleError } from '@/components/ui/module-error';
import { cn } from '@/lib/utils';
import { useWindowManager } from '@/hooks/use-window-manager';

// Enhanced skeleton loader
function AboutSkeleton() {
	return (
		<div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-pulse">
			<div className="h-40 sm:h-48 md:h-56 bg-muted/50 rounded-b-3xl" />
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
				<div className="h-28 sm:h-32 bg-muted/50 rounded-xl" />
				<div className="h-28 sm:h-32 bg-muted/50 rounded-xl" />
				<div className="h-28 sm:h-32 bg-muted/50 rounded-xl" />
			</div>
			<div className="h-48 sm:h-64 bg-muted/50 rounded-xl" />
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
	Zap,
	Award,
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
			<div className="max-w-7xl mx-auto">
				{/* Enhanced Hero Section */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="relative h-40 sm:h-48 md:h-56 lg:h-64 bg-linear-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-b-3xl overflow-hidden"
				>
					{/* Animated background patterns */}
					<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 animate-pulse" />
					<div className="absolute inset-0">
						<div className="absolute top-10 left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
						<div
							className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
							style={{ animationDelay: '1s' }}
						/>
					</div>
					<div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

					{/* Profile Picture - Better mobile positioning */}
					<div className="absolute -bottom-12 sm:-bottom-16 left-1/2 -translate-x-1/2 sm:left-6 md:left-8 sm:translate-x-0 z-10">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
							className="relative"
						>
							<div className="absolute inset-0 rounded-full bg-linear-to-br from-emerald-400 to-blue-500 blur-2xl opacity-60 animate-pulse" />
							<div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 border-background bg-background shadow-2xl hover:shadow-emerald-500/50 p-1 hover:scale-105 transition-all duration-300">
								<img
									src={about.avatarUrl || '/logo.png'}
									alt={about.name}
									className="w-full h-full object-cover rounded-full"
								/>
								<motion.div
									animate={{ scale: [1, 1.2, 1] }}
									transition={{ repeat: Infinity, duration: 2 }}
									className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border-2 border-background shadow-lg"
								/>
							</div>
						</motion.div>
					</div>
				</motion.div>

				{/* Name & Role Section - Improved mobile layout */}
				<div className="mt-16 sm:mt-20 md:mt-8 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 text-center sm:text-left sm:ml-40 md:ml-48">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="space-y-3 sm:space-y-4"
					>
						<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-linear-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
							{about.name}
						</h1>
						<p className="text-base sm:text-lg md:text-xl text-muted-foreground">
							{about.role}
						</p>
						<p className="text-xs sm:text-sm text-primary/80 italic max-w-2xl">
							{about.tagline}
						</p>

						{/* Enhanced Status Badges */}
						<div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 pt-2">
							{about.currentStatus && (
								<motion.div
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.4 }}
									className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm backdrop-blur-sm hover:bg-emerald-500/20 transition-all cursor-default group"
								>
									<motion.div
										animate={{ scale: [1, 1.3, 1] }}
										transition={{ repeat: Infinity, duration: 2 }}
										className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
									/>
									<span className="text-emerald-400 font-medium">
										{about.currentStatus.label}
									</span>
								</motion.div>
							)}
							{about.location && (
								<motion.div
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.5 }}
									className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm backdrop-blur-sm hover:bg-white/10 transition-all"
								>
									<MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
									<span className="text-muted-foreground">{about.location}</span>
								</motion.div>
							)}
							{about.workPreferences &&
								(about.workPreferences.remote || about.workPreferences.hybrid) && (
									<motion.div
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.6 }}
										className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs sm:text-sm backdrop-blur-sm hover:bg-blue-500/20 transition-all"
									>
										<Globe className="w-3 h-3 sm:w-4 sm:h-4" />
										<span className="text-blue-400 font-medium">
											{about.workPreferences.remote &&
											about.workPreferences.hybrid
												? 'Remote / Hybrid'
												: about.workPreferences.remote
												? 'Remote'
												: 'Hybrid'}
										</span>
									</motion.div>
								)}
						</div>
					</motion.div>
				</div>

				<div className="px-4 sm:px-6 md:px-8 space-y-6 sm:space-y-8 pb-8">
					{/* Enhanced Highlights Section */}
					{about.highlights && about.highlights.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
						>
							<h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
								<Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
								<span>Highlights</span>
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
											whileHover={{ scale: 1.02, y: -4 }}
											transition={{ delay: 0.5 + index * 0.1 }}
											className="relative group cursor-default"
										>
											<div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
											<div className="relative bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-4 sm:p-6 hover:border-emerald-500/50 transition-all shadow-lg hover:shadow-emerald-500/10">
												<Icon className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
												<div className="text-2xl sm:text-3xl font-bold bg-linear-to-br from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-1">
													{highlight.value}
												</div>
												<div className="text-xs sm:text-sm text-muted-foreground">
													{highlight.label}
												</div>
											</div>
										</motion.div>
									);
								})}
							</div>
						</motion.div>
					)}

					{/* Enhanced About & Stats Grid */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6 }}
						className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
					>
						{/* Bio Section */}
						<div className="lg:col-span-2 bg-card/30 backdrop-blur-sm border border-border/40 rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-emerald-500/5 transition-all">
							<h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
								<User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
								<span>About Me</span>
							</h2>
							<p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4">
								{about.summary}
							</p>
							{about.currentStatus?.description && (
								<p className="text-xs sm:text-sm text-muted-foreground/80 italic border-l-2 border-emerald-500/50 pl-3 sm:pl-4 py-2">
									{about.currentStatus.description}
								</p>
							)}
						</div>

						{/* Enhanced Quick Stats */}
						<div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
							<motion.div
								whileHover={{ scale: 1.03, y: -4 }}
								className="bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 text-center shadow-lg hover:shadow-emerald-500/20 transition-all cursor-default"
							>
								<Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 mx-auto mb-2 sm:mb-3" />
								<div className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-1">
									{about.experienceYears}+
								</div>
								<div className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
									Years Experience
								</div>
							</motion.div>
							<motion.div
								whileHover={{ scale: 1.03, y: -4 }}
								className="bg-linear-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-2xl p-4 sm:p-6 text-center shadow-lg hover:shadow-blue-500/20 transition-all cursor-default"
							>
								<Code2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mx-auto mb-2 sm:mb-3" />
								<div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-1">
									{about.projectsCount}+
								</div>
								<div className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
									Projects Delivered
								</div>
							</motion.div>
						</div>
					</motion.div>

					{/* Enhanced Focus Areas */}
					{about.focusAreas && about.focusAreas.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.7 }}
							className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-2xl p-4 sm:p-6 shadow-xl"
						>
							<h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
								<Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
								<span>Focus Areas</span>
							</h2>
							<div className="flex flex-wrap gap-2 sm:gap-3">
								{about.focusAreas.map((area, index) => (
									<motion.span
										key={area}
										initial={{ opacity: 0, scale: 0 }}
										animate={{ opacity: 1, scale: 1 }}
										whileHover={{ scale: 1.05, y: -2 }}
										transition={{ delay: 0.8 + index * 0.05 }}
										className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-linear-to-r from-emerald-500/10 to-blue-500/10 text-emerald-400 text-xs sm:text-sm font-medium border border-emerald-500/30 hover:border-emerald-500/50 hover:from-emerald-500/20 hover:to-blue-500/20 transition-all cursor-default shadow-sm hover:shadow-emerald-500/20"
									>
										{area}
									</motion.span>
								))}
							</div>
						</motion.div>
					)}

					{/* Enhanced Skills Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8 }}
					>
						<h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
							<Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
							<span>Technical Skills</span>
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
							{/* Frontend */}
							<motion.div
								whileHover={{ scale: 1.02, y: -4 }}
								className="bg-linear-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-indigo-500/20 transition-all"
							>
								<div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
									<Layers className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
									<h3 className="font-bold text-indigo-400 text-sm sm:text-base">
										Frontend
									</h3>
								</div>
								<div className="flex flex-wrap gap-1.5 sm:gap-2">
									{about.skills.frontend.map(skill => (
										<span
											key={skill.name}
											className="px-2 sm:px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs border border-indigo-500/20 hover:border-indigo-500/40 transition-colors"
										>
											{skill.name}
										</span>
									))}
								</div>
							</motion.div>

							{/* Backend */}
							<motion.div
								whileHover={{ scale: 1.02, y: -4 }}
								className="bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-emerald-500/20 transition-all"
							>
								<div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
									<Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
									<h3 className="font-bold text-emerald-400 text-sm sm:text-base">
										Backend
									</h3>
								</div>
								<div className="flex flex-wrap gap-1.5 sm:gap-2">
									{about.skills.backend.map(skill => (
										<span
											key={skill.name}
											className="px-2 sm:px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
										>
											{skill.name}
										</span>
									))}
								</div>
							</motion.div>

							{/* ML/AI */}
							<motion.div
								whileHover={{ scale: 1.02, y: -4 }}
								className="bg-linear-to-br from-purple-500/10 to-pink-600/5 border border-purple-500/30 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-purple-500/20 transition-all"
							>
								<div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
									<Box className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
									<h3 className="font-bold text-purple-400 text-sm sm:text-base">
										AI & ML
									</h3>
								</div>
								<div className="flex flex-wrap gap-1.5 sm:gap-2">
									{about.skills.ml.map(skill => (
										<span
											key={skill.name}
											className="px-2 sm:px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-xs border border-purple-500/20 hover:border-purple-500/40 transition-colors"
										>
											{skill.name}
										</span>
									))}
								</div>
							</motion.div>
						</div>
					</motion.div>

					{/* Enhanced Coding Profiles */}
					{codingStats && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.9 }}
						>
							<h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
								<Code className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
								<span>Coding Profiles</span>
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
								<motion.a
									href={codingStats.github.url}
									target="_blank"
									rel="noopener noreferrer"
									whileHover={{ scale: 1.02, y: -4 }}
									className="group relative bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-4 sm:p-6 hover:border-white/30 transition-all overflow-hidden shadow-lg hover:shadow-white/10"
								>
									<div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
									<div className="relative flex items-center justify-between">
										<div>
											<div className="text-[10px] sm:text-xs text-muted-foreground uppercase mb-1">
												GitHub
											</div>
											<div className="text-base sm:text-lg font-bold">
												@{codingStats.github.username}
											</div>
										</div>
										<Github className="w-6 h-6 sm:w-8 sm:h-8 text-white/60 group-hover:text-white group-hover:scale-110 transition-all" />
									</div>
								</motion.a>

								<motion.a
									href={codingStats.leetcode.url}
									target="_blank"
									rel="noopener noreferrer"
									whileHover={{ scale: 1.02, y: -4 }}
									className="group relative bg-linear-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/30 rounded-2xl p-4 sm:p-6 hover:border-yellow-500/50 transition-all overflow-hidden shadow-lg hover:shadow-yellow-500/20"
								>
									<div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
									<div className="relative flex items-center justify-between">
										<div>
											<div className="text-[10px] sm:text-xs text-yellow-400/60 uppercase mb-1">
												LeetCode
											</div>
											<div className="text-base sm:text-lg font-bold text-yellow-400">
												@{codingStats.leetcode.username}
											</div>
										</div>
										<Code className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400/60 group-hover:text-yellow-400 group-hover:scale-110 transition-all" />
									</div>
								</motion.a>

								<motion.a
									href={codingStats.codeforces.url}
									target="_blank"
									rel="noopener noreferrer"
									whileHover={{ scale: 1.02, y: -4 }}
									className="group relative bg-linear-to-br from-red-500/10 to-orange-500/5 border border-red-500/30 rounded-2xl p-4 sm:p-6 hover:border-red-500/50 transition-all overflow-hidden shadow-lg hover:shadow-red-500/20"
								>
									<div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
									<div className="relative flex items-center justify-between">
										<div>
											<div className="text-[10px] sm:text-xs text-red-400/60 uppercase mb-1">
												Codeforces
											</div>
											<div className="text-base sm:text-lg font-bold text-red-400">
												@{codingStats.codeforces.username}
											</div>
										</div>
										<Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-red-400/60 group-hover:text-red-400 group-hover:scale-110 transition-all" />
									</div>
								</motion.a>

								{codingStats.codechef && (
									<motion.a
										href={codingStats.codechef.url}
										target="_blank"
										rel="noopener noreferrer"
										whileHover={{ scale: 1.02, y: -4 }}
										className="group relative bg-linear-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/30 rounded-2xl p-4 sm:p-6 hover:border-orange-500/50 transition-all overflow-hidden shadow-lg hover:shadow-orange-500/20"
									>
										<div className="absolute inset-0 bg-linear-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
										<div className="relative flex items-center justify-between">
											<div>
												<div className="text-[10px] sm:text-xs text-orange-400/60 uppercase mb-1">
													CodeChef
												</div>
												<div className="text-base sm:text-lg font-bold text-orange-400">
													@{codingStats.codechef.username}
												</div>
											</div>
											<Terminal className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400/60 group-hover:text-orange-400 group-hover:scale-110 transition-all" />
										</div>
									</motion.a>
								)}
							</div>

							<motion.button
								onClick={() => openWindow('profiles')}
								whileHover={{ scale: 1.01, y: -2 }}
								whileTap={{ scale: 0.99 }}
								className="w-full p-3 sm:p-4 rounded-xl bg-linear-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 hover:border-emerald-500/50 hover:from-emerald-500/20 hover:to-blue-500/20 transition-all group flex items-center justify-between shadow-lg hover:shadow-emerald-500/20"
							>
								<div className="flex items-center gap-2 sm:gap-3">
									<Code className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
									<div className="text-left">
										<div className="text-xs sm:text-sm font-bold text-foreground group-hover:text-emerald-400 transition-colors">
											View Detailed Coding Stats
										</div>
										<div className="text-[10px] sm:text-xs text-muted-foreground">
											Complete analytics from all platforms
										</div>
									</div>
								</div>
								<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
							</motion.button>
						</motion.div>
					)}

					{/* Enhanced Personal Info */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 1 }}
						className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
					>
						{about.languages && (
							<motion.div
								whileHover={{ scale: 1.02, y: -4 }}
								className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-primary/10 transition-all"
							>
								<h3 className="font-bold tracking-widest text-xs sm:text-sm uppercase mb-3 sm:mb-4 flex items-center gap-2">
									<Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
									<span>Languages</span>
								</h3>
								<div className="flex flex-wrap gap-1.5 sm:gap-2">
									{about.languages.map(lang => (
										<span
											key={lang}
											className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20 hover:border-primary/40 transition-colors"
										>
											{lang}
										</span>
									))}
								</div>
							</motion.div>
						)}

						{about.hobbies && (
							<motion.div
								whileHover={{ scale: 1.02, y: -4 }}
								className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-primary/10 transition-all"
							>
								<h3 className="font-bold tracking-widest text-xs sm:text-sm uppercase mb-3 sm:mb-4 flex items-center gap-2">
									<User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
									<span>Interests</span>
								</h3>
								<div className="flex flex-wrap gap-1.5 sm:gap-2">
									{about.hobbies.map(hobby => (
										<span
											key={hobby}
											className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-surface-200/50 text-muted-foreground text-xs border border-white/5 hover:bg-white/10 transition-colors"
										>
											{hobby}
										</span>
									))}
								</div>
							</motion.div>
						)}
					</motion.div>
				</div>
			</div>
		</ScrollArea>
	);
}
