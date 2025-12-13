'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
	Download,
	Linkedin,
	Twitter,
	ExternalLink,
	Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleHeader } from '@/components/apps/shared/ModuleHeader';
import { ModuleError } from '@/components/ui/module-error';
import { cn } from '@/lib/utils';
import { useWindowManager } from '@/hooks/use-window-manager';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '@/lib/animations';

// Enhanced skeleton loader
function AboutSkeleton() {
	return (
		<div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-pulse max-w-7xl mx-auto">
			<div className="h-40 sm:h-48 md:h-56 bg-muted/50 rounded-b-3xl" />
			<div className="flex justify-center -mt-12">
				<div className="w-32 h-32 bg-muted rounded-full border-4 border-background" />
			</div>
			<div className="space-y-4 text-center px-4">
				<div className="h-8 bg-muted rounded w-1/3 mx-auto" />
				<div className="h-4 bg-muted rounded w-1/2 mx-auto" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 px-4">
				<div className="h-28 bg-muted/50 rounded-xl" />
				<div className="h-28 bg-muted/50 rounded-xl" />
				<div className="h-28 bg-muted/50 rounded-xl" />
			</div>
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

const socialIconMap: Record<string, any> = {
	GitHub: Github,
	LinkedIn: Linkedin,
	Twitter: Twitter,
	Email: Mail,
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
			<div className="max-w-7xl mx-auto pb-12">
				{/* Enhanced Hero Section */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="relative h-48 sm:h-56 md:h-64 lg:h-72 bg-linear-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-b-[2.5rem] overflow-hidden"
				>
					{/* Animated background patterns */}
					<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 animate-pulse" />
					<div className="absolute inset-0 overflow-hidden">
						<div className="absolute top-10 left-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" />
						<div
							className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"
							style={{ animationDelay: '1s' }}
						/>
					</div>
					<div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />

					{/* Profile Picture - Centered & Overlapping */}
					<div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-10">
						<motion.div
							variants={scaleIn}
							initial="hidden"
							animate="visible"
							className="relative group"
						>
							<div className="absolute inset-0 rounded-full bg-linear-to-br from-emerald-400 to-blue-500 blur-2xl opacity-60 animate-pulse group-hover:opacity-80 transition-opacity" />
							<div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full border-[6px] border-background bg-background shadow-2xl p-1.5 transition-transform duration-300 group-hover:scale-[1.02]">
								<div className="relative w-full h-full rounded-full overflow-hidden">
									<Image
										src={about.avatarUrl || '/logo.png'}
										alt={about.name}
										fill
										className="object-cover"
										priority
									/>
								</div>
								<motion.div
									animate={{ scale: [1, 1.2, 1] }}
									transition={{ repeat: Infinity, duration: 2 }}
									className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 border-4 border-background shadow-lg"
									title="Online"
								/>
							</div>
						</motion.div>
					</div>

					{/* Header Actions - Resume Button */}
					{about.resumeUrl && (
						<div className="absolute top-6 right-6 z-20">
							<a
								href={about.resumeUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-md border border-white/10 hover:bg-background/80 transition-all text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105"
							>
								<Download className="w-4 h-4" />
								<span className="hidden sm:inline">Download CV</span>
							</a>
						</div>
					)}
				</motion.div>

				{/* Identity Section */}
				<div className="mt-20 sm:mt-24 px-4 text-center max-w-4xl mx-auto space-y-4 sm:space-y-6">
					<motion.div
						variants={fadeInUp}
						initial="hidden"
						animate="visible"
						className="space-y-3"
					>
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-linear-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight tracking-tight">
							{about.name}
						</h1>
						<p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium">
							{about.role}
						</p>
						<p className="text-sm sm:text-base text-primary/80 italic max-w-2xl mx-auto">
							{about.tagline}
						</p>

						{/* Social Links */}
						{about.socials && (
							<div className="flex items-center justify-center gap-3 pt-2">
								{about.socials.map(social => {
									const Icon = socialIconMap[social.platform] || Globe;
									return (
										<a
											key={social.platform}
											href={social.url}
											target="_blank"
											rel="noopener noreferrer"
											className="p-2.5 rounded-full bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
											title={social.platform}
										>
											<Icon className="w-5 h-5" />
										</a>
									);
								})}
							</div>
						)}

						{/* Enhanced Status Badges */}
						<div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-4 sm:pt-6">
							{about.currentStatus && (
								<div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm backdrop-blur-sm cursor-default">
									<span className="relative flex h-2 w-2">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
										<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
									</span>
									<span className="text-emerald-500 font-medium">
										{about.currentStatus.label}
									</span>
								</div>
							)}
							{about.location && (
								<div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-card border border-border text-xs sm:text-sm text-muted-foreground shadow-sm">
									<MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
									<span>{about.location}</span>
								</div>
							)}
							{about.workPreferences &&
								(about.workPreferences.remote || about.workPreferences.hybrid) && (
									<div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs sm:text-sm text-blue-400 shadow-sm">
										<Globe className="w-3 h-3 sm:w-4 sm:h-4" />
										<span>
											{about.workPreferences.remote &&
											about.workPreferences.hybrid
												? 'Remote / Hybrid'
												: about.workPreferences.remote
												? 'Remote'
												: 'Hybrid'}
										</span>
									</div>
								)}
						</div>
					</motion.div>
				</div>

				<div className="mt-12 sm:mt-16 px-4 sm:px-6 md:px-8 space-y-8 sm:space-y-12">
					{/* Highlights Section */}
					{about.highlights && about.highlights.length > 0 && (
						<motion.div
							variants={staggerContainer}
							initial="hidden"
							animate="visible"
							className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
						>
							{about.highlights.map((highlight, index) => {
								const Icon =
									highlight.icon && iconMap[highlight.icon]
										? iconMap[highlight.icon]
										: Star;
								return (
									<motion.div
										key={highlight.label}
										variants={staggerItem}
										whileHover={{ y: -5 }}
										className="relative group p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/50 hover:border-emerald-500/30 transition-all cursor-default overflow-hidden"
									>
										<div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
										<div className="relative z-10">
											<div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center mb-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300 shadow-inner">
												<Icon className="w-6 h-6" />
											</div>
											<div className="text-3xl font-bold text-foreground mb-1 tracking-tight">
												{highlight.value}
											</div>
											<div className="text-sm text-muted-foreground font-medium">
												{highlight.label}
											</div>
										</div>
									</motion.div>
								);
							})}
						</motion.div>
					)}

					{/* Bio & Stats Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
						{/* Bio */}
						<motion.div
							variants={fadeInUp}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true }}
							className="lg:col-span-2 space-y-6"
						>
							<div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
								<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

								<h2 className="text-xl font-bold mb-4 flex items-center gap-2">
									<User className="w-5 h-5 text-primary" />
									About Me
								</h2>
								<div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
									<p>{about.summary}</p>
									{/* Display full bio formatted with newlines if available */}
									{about.bio && (
										<div className="mt-4 pt-4 border-t border-border/30 whitespace-pre-line">
											{about.bio}
										</div>
									)}
								</div>

								{about.currentStatus?.description && (
									<div className="mt-6 pt-6 border-t border-border/50">
										<p className="text-sm font-medium text-foreground/80 italic flex items-start gap-2">
											<span className="text-2xl text-primary/40 leading-none -mt-1">
												❝
											</span>
											{about.currentStatus.description}
										</p>
									</div>
								)}
							</div>

							{/* Focus Areas */}
							{about.focusAreas && about.focusAreas.length > 0 && (
								<div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-6 sm:p-8">
									<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
										<Target className="w-5 h-5 text-primary" />
										Focus Areas
									</h2>
									<motion.div
										variants={staggerContainer}
										initial="hidden"
										whileInView="visible"
										viewport={{ once: true }}
										className="flex flex-wrap gap-2.5"
									>
										{about.focusAreas.map((area, index) => (
											<motion.div
												key={area}
												variants={staggerItem}
												whileHover={{ scale: 1.05 }}
												className="px-4 py-2 rounded-xl bg-linear-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 text-xs sm:text-sm font-medium text-emerald-500/90 cursor-default shadow-sm"
											>
												{area}
											</motion.div>
										))}
									</motion.div>
								</div>
							)}
						</motion.div>

						{/* Quick Stats Column */}
						<motion.div
							variants={fadeInUp}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true }}
							className="space-y-4 sm:space-y-6"
						>
							<div className="bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-3xl p-6 text-center hover:border-emerald-500/50 transition-colors shadow-lg shadow-emerald-500/5">
								<div className="w-12 h-12 mx-auto bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-500">
									<Briefcase className="w-6 h-6" />
								</div>
								<div className="text-4xl sm:text-5xl font-bold text-emerald-500 mb-2">
									{about.experienceYears}+
								</div>
								<div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
									Years Experience
								</div>
							</div>

							<div className="bg-linear-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-3xl p-6 text-center hover:border-blue-500/50 transition-colors shadow-lg shadow-blue-500/5">
								<div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
									<Code2 className="w-6 h-6" />
								</div>
								<div className="text-4xl sm:text-5xl font-bold text-blue-500 mb-2">
									{about.projectsCount}+
								</div>
								<div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
									Projects Delivered
								</div>
							</div>
						</motion.div>
					</div>

					{/* Skills Grid */}
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="space-y-6"
					>
						<h2 className="text-2xl font-bold flex items-center gap-2.5 px-2">
							<Cpu className="w-6 h-6 text-primary" />
							Technical Arsenal
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
							{/* Frontend */}
							<motion.div
								variants={staggerItem}
								whileHover={{ y: -5 }}
								className="bg-card/40 border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
							>
								<div className="flex items-center gap-3 mb-5 border-b border-indigo-500/20 pb-4">
									<Layers className="w-6 h-6 text-indigo-400" />
									<h3 className="font-bold text-lg text-indigo-400">Frontend</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{about.skills.frontend.map(skill => (
										<span
											key={skill.name}
											className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20"
										>
											{skill.name}
										</span>
									))}
								</div>
							</motion.div>

							{/* Backend */}
							<motion.div
								variants={staggerItem}
								whileHover={{ y: -5 }}
								className="bg-card/40 border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300"
							>
								<div className="flex items-center gap-3 mb-5 border-b border-emerald-500/20 pb-4">
									<Cpu className="w-6 h-6 text-emerald-400" />
									<h3 className="font-bold text-lg text-emerald-400">Backend</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{about.skills.backend.map(skill => (
										<span
											key={skill.name}
											className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/20"
										>
											{skill.name}
										</span>
									))}
								</div>
							</motion.div>

							{/* AI/ML */}
							<motion.div
								variants={staggerItem}
								whileHover={{ y: -5 }}
								className="bg-card/40 border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
							>
								<div className="flex items-center gap-3 mb-5 border-b border-purple-500/20 pb-4">
									<Box className="w-6 h-6 text-purple-400" />
									<h3 className="font-bold text-lg text-purple-400">AI & ML</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{about.skills.ml.map(skill => (
										<span
											key={skill.name}
											className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 text-xs font-medium border border-purple-500/20"
										>
											{skill.name}
										</span>
									))}
								</div>
							</motion.div>
						</div>
					</motion.div>

					{/* Personal Info Grid */}
					<motion.div
						variants={fadeInUp}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8"
					>
						{about.languages && (
							<div className="bg-card/30 border border-border/50 rounded-2xl p-6 sm:p-8 hover:bg-card/40 transition-colors">
								<h3 className="font-bold text-sm uppercase text-muted-foreground mb-4 flex items-center gap-2 tracking-wider">
									<Globe className="w-4 h-4 text-emerald-500" />
									Languages
								</h3>
								<div className="flex flex-wrap gap-2">
									{about.languages.map(lang => (
										<span
											key={lang}
											className="px-3 py-1.5 rounded-lg bg-background/50 border border-border text-sm font-medium shadow-sm"
										>
											{lang}
										</span>
									))}
								</div>
							</div>
						)}

						{about.hobbies && (
							<div className="bg-card/30 border border-border/50 rounded-2xl p-6 sm:p-8 hover:bg-card/40 transition-colors">
								<h3 className="font-bold text-sm uppercase text-muted-foreground mb-4 flex items-center gap-2 tracking-wider">
									<Sparkles className="w-4 h-4 text-purple-500" />
									Interests & Hobbies
								</h3>
								<div className="flex flex-wrap gap-2">
									{about.hobbies.map(hobby => (
										<span
											key={hobby}
											className="px-3 py-1.5 rounded-lg bg-surface-200/20 hover:bg-surface-300/30 transition-colors border border-white/5 text-sm cursor-default"
										>
											{hobby}
										</span>
									))}
								</div>
							</div>
						)}
					</motion.div>

					{/* Coding Profiles Footer */}
					{codingStats && (
						<motion.div
							variants={staggerContainer}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true }}
							className="space-y-6"
						>
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold flex items-center gap-2.5 px-2">
									<Terminal className="w-6 h-6 text-primary" />
									Coding Profiles
								</h2>
								<button
									onClick={() => openWindow('profiles')}
									className="group flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
								>
									View Details
									<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
								</button>
							</div>

							<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
								<motion.a
									variants={staggerItem}
									whileHover={{ y: -5 }}
									href={codingStats.github.url}
									target="_blank"
									rel="noopener noreferrer"
									className="p-4 rounded-xl bg-card border border-border/50 hover:border-foreground/20 hover:bg-accent/5 transition-all text-center group"
								>
									<Github className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:text-foreground transition-colors" />
									<div className="font-bold text-sm">GitHub</div>
									<div className="text-xs text-muted-foreground mt-1">
										@{codingStats.github.username}
									</div>
								</motion.a>
								<motion.a
									variants={staggerItem}
									whileHover={{ y: -5 }}
									href={codingStats.leetcode.url}
									target="_blank"
									rel="noopener noreferrer"
									className="p-4 rounded-xl bg-card border border-border/50 hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all text-center group"
								>
									<Code className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:text-yellow-500 transition-colors" />
									<div className="font-bold text-sm text-yellow-500/80 group-hover:text-yellow-500">
										LeetCode
									</div>
									<div className="text-xs text-muted-foreground mt-1">
										@{codingStats.leetcode.username}
									</div>
								</motion.a>
								<motion.a
									variants={staggerItem}
									whileHover={{ y: -5 }}
									href={codingStats.codeforces.url}
									target="_blank"
									rel="noopener noreferrer"
									className="p-4 rounded-xl bg-card border border-border/50 hover:border-red-500/30 hover:bg-red-500/5 transition-all text-center group"
								>
									<Trophy className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:text-red-500 transition-colors" />
									<div className="font-bold text-sm text-red-500/80 group-hover:text-red-500">
										Codeforces
									</div>
									<div className="text-xs text-muted-foreground mt-1">
										@{codingStats.codeforces.username}
									</div>
								</motion.a>
								{codingStats.codechef && (
									<motion.a
										variants={staggerItem}
										whileHover={{ y: -5 }}
										href={codingStats.codechef.url}
										target="_blank"
										rel="noopener noreferrer"
										className="p-4 rounded-xl bg-card border border-border/50 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all text-center group"
									>
										<Terminal className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:text-orange-500 transition-colors" />
										<div className="font-bold text-sm text-orange-500/80 group-hover:text-orange-500">
											CodeChef
										</div>
										<div className="text-xs text-muted-foreground mt-1">
											@{codingStats.codechef.username}
										</div>
									</motion.a>
								)}
							</div>
						</motion.div>
					)}
				</div>
			</div>
		</ScrollArea>
	);
}
