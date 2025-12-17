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
	Server,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleHeader } from '@/components/apps/shared/ModuleHeader';
import { ModuleError } from '@/components/ui/module-error';
import { cn } from '@/lib/utils';
import { useWindowManager } from '@/hooks/use-window-manager';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '@/lib/animations';

function AboutSkeleton() {
	return (
		<div className="p-4 sm:p-6 space-y-8 animate-pulse max-w-7xl mx-auto">
			<div className="h-64 sm:h-80 bg-muted/20 rounded-[2.5rem]" />
			<div className="flex justify-center -mt-20">
				<div className="w-40 h-40 bg-muted rounded-full border-8 border-background" />
			</div>
			<div className="space-y-4 text-center px-4 max-w-2xl mx-auto">
				<div className="h-10 bg-muted/40 rounded-xl w-3/4 mx-auto" />
				<div className="h-4 bg-muted/40 rounded-xl w-1/2 mx-auto" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="h-32 bg-muted/20 rounded-3xl" />
				<div className="h-32 bg-muted/20 rounded-3xl" />
				<div className="h-32 bg-muted/20 rounded-3xl" />
			</div>
		</div>
	);
}

const socialIconMap: Record<string, React.ElementType> = {
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
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('Failed to load data');
			}
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
			<div className="max-w-7xl mx-auto pb-24">
				{/* Hero Section */}
				<div className="relative mb-20">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
						className="relative h-64 sm:h-80 md:h-96 rounded-b-[3rem] overflow-hidden mx-2 sm:mx-4"
					>
						{/* Dynamic Background */}
						<div className="absolute inset-0 bg-black">
							<div className="absolute inset-x-0 bottom-0 h-full bg-linear-to-t from-black via-transparent to-transparent z-10" />
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-emerald-900/40 via-black to-black opacity-80" />

							{/* Grid and Patterns */}
							<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
							<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" />
							<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
						</div>

						{/* Resume Button */}
						{about.resumeUrl && (
							<div className="absolute top-6 right-6 z-20">
								<a
									href={about.resumeUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
								>
									<Download className="w-4 h-4 text-emerald-400" />
									<span className="text-sm font-bold text-white/90 group-hover:text-white">
										Resume
									</span>
								</a>
							</div>
						)}
					</motion.div>

					{/* Profile Info Card */}
					<div className="relative -mt-32 z-10 px-4 sm:px-6">
						<div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2.5rem] p-8 max-w-5xl mx-auto">
							<div className="flex flex-col md:flex-row items-center md:items-start gap-8">
								{/* Avatar */}
								<motion.div
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ delay: 0.2, type: 'spring' }}
									className="relative shrink-0"
								>
									<div className="w-40 h-40 rounded-4xl p-1.5 bg-linear-to-br from-emerald-500 via-blue-500 to-purple-500 shadow-xl">
										<div className="w-full h-full rounded-[1.7rem] overflow-hidden bg-black relative">
											<Image
												src={about.avatarUrl || '/logo.png'}
												alt={about.name}
												fill
												className="object-cover"
												priority
											/>
										</div>
									</div>
									<div className="absolute -bottom-2 -right-2 bg-[#0a0a0a] rounded-xl p-1.5 border border-white/10">
										<div className="w-4 h-4 rounded-lg bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
									</div>
								</motion.div>

								{/* Info */}
								<div className="flex-1 text-center md:text-left space-y-4 pt-2">
									<div>
										<motion.h1
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight"
										>
											{about.name}
										</motion.h1>
										<motion.p
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.1 }}
											className="text-xl text-emerald-400 font-medium"
										>
											{about.role}
										</motion.p>
									</div>

									<motion.p
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.2 }}
										className="text-muted-foreground leading-relaxed max-w-2xl"
									>
										{about.tagline}
									</motion.p>

									{/* Quick Links & Status */}
									<div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
										{about.location && (
											<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-medium text-white/70">
												<MapPin className="w-3.5 h-3.5 text-emerald-500" />
												{about.location}
											</div>
										)}
										{about.currentStatus && (
											<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
												<Zap className="w-3.5 h-3.5" />
												{about.currentStatus.label}
											</div>
										)}

										<div className="w-px h-4 bg-white/10 mx-2 hidden sm:block" />

										<div className="flex items-center gap-2">
											{about.socials?.map(social => {
												const Icon =
													socialIconMap[social.platform] || Globe;
												return (
													<a
														key={social.platform}
														href={social.url}
														target="_blank"
														rel="noopener noreferrer"
														className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
													>
														<Icon className="w-4 h-4" />
													</a>
												);
											})}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Content Grid */}
				<div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-16">
					{/* Highlights */}
					{about.highlights && (
						<motion.div
							variants={staggerContainer}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-50px' }}
							className="grid grid-cols-1 md:grid-cols-3 gap-6"
						>
							<div className="group relative p-8 rounded-4xl bg-card/20 border border-white/5 hover:bg-card/40 transition-all duration-500 hover:-translate-y-1">
								<div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-4xl" />
								<div className="text-5xl font-black text-white mb-2 tracking-tighter">
									{about.experienceYears}+
								</div>
								<div className="flex items-center gap-2 text-emerald-500 text-sm font-bold uppercase tracking-widest">
									<Briefcase className="w-4 h-4" /> Years Exp.
								</div>
							</div>

							<div className="group relative p-8 rounded-4xl bg-card/20 border border-white/5 hover:bg-card/40 transition-all duration-500 hover:-translate-y-1">
								<div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-4xl" />
								<div className="text-5xl font-black text-white mb-2 tracking-tighter">
									{about.projectsCount}+
								</div>
								<div className="flex items-center gap-2 text-blue-500 text-sm font-bold uppercase tracking-widest">
									<Code2 className="w-4 h-4" /> Projects
								</div>
							</div>

							<div className="group relative p-8 rounded-4xl bg-card/20 border border-white/5 hover:bg-card/40 transition-all duration-500 hover:-translate-y-1">
								<div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-4xl" />
								<div className="text-5xl font-black text-white mb-2 tracking-tighter">
									100%
								</div>
								<div className="flex items-center gap-2 text-purple-500 text-sm font-bold uppercase tracking-widest">
									<Target className="w-4 h-4" /> Commitment
								</div>
							</div>
						</motion.div>
					)}

					{/* About Bio */}
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
						<div className="lg:col-span-8 space-y-8">
							<div className="space-y-6">
								<h2 className="text-3xl font-bold text-white flex items-center gap-3">
									<User className="w-6 h-6 text-emerald-500" />
									About Me
								</h2>
								<div className="prose prose-invert prose-lg max-w-none text-muted-foreground leading-relaxed">
									<p>{about.summary}</p>
									{about.bio && (
										<div className="whitespace-pre-line mt-4">{about.bio}</div>
									)}
								</div>
							</div>

							{about.focusAreas && about.focusAreas.length > 0 && (
								<div className="pt-6">
									<h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
										Core Focus
									</h3>
									<div className="flex flex-wrap gap-3">
										{about.focusAreas.map(area => (
											<span
												key={area}
												className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm font-medium text-white/80 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors cursor-default"
											>
												{area}
											</span>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Sidebar Stats */}
						<div className="lg:col-span-4 space-y-6">
							{codingStats && (
								<div className="p-6 rounded-4xl bg-card/20 border border-white/5 space-y-6">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-bold text-white flex items-center gap-2">
											<Terminal className="w-5 h-5 text-emerald-500" />
											Coding Stats
										</h3>
										<button
											onClick={() => openWindow('profiles')}
											className="text-xs font-bold text-muted-foreground hover:text-white transition-colors uppercase tracking-widest"
										>
											View All
										</button>
									</div>

									<div className="space-y-4">
										{/* LeetCode Mini */}
										<div className="flex items-center gap-4 p-3 rounded-xl bg-black/20 border border-white/5">
											<div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
												<Code className="w-5 h-5" />
											</div>
											<div>
												<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
													LeetCode
												</div>
												<div className="text-sm font-bold text-white">
													{codingStats.leetcode.stats?.solved || '0'}{' '}
													Solved
												</div>
											</div>
										</div>

										{/* GitHub Mini */}
										<div className="flex items-center gap-4 p-3 rounded-xl bg-black/20 border border-white/5">
											<div className="p-2 bg-white/10 rounded-lg text-white">
												<Github className="w-5 h-5" />
											</div>
											<div>
												<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
													GitHub
												</div>
												<div className="text-sm font-bold text-white">
													{codingStats.github.stats?.stars || '0'} Stars
												</div>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Tech Stack */}
					<div className="space-y-8">
						<h2 className="text-3xl font-bold text-white flex items-center gap-3">
							<Cpu className="w-6 h-6 text-emerald-500" />
							Technical Arsenal
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* Frontend */}
							<motion.div
								whileHover={{ y: -5 }}
								className="p-8 rounded-4xl bg-card/20 border border-white/5 hover:border-indigo-500/30 transition-all group"
							>
								<div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
									<Layers className="w-6 h-6" />
								</div>
								<h3 className="text-xl font-bold text-white mb-6">Frontend</h3>
								<div className="flex flex-wrap gap-2">
									{about.skills.frontend.map(skill => (
										<span
											key={skill.name}
											className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/10 text-xs font-bold text-indigo-300"
										>
											{skill.name}
										</span>
									))}
								</div>
							</motion.div>

							{/* Backend */}
							<motion.div
								whileHover={{ y: -5 }}
								className="p-8 rounded-4xl bg-card/20 border border-white/5 hover:border-emerald-500/30 transition-all group"
							>
								<div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
									<Server className="w-6 h-6" />
								</div>
								<h3 className="text-xl font-bold text-white mb-6">Backend</h3>
								<div className="flex flex-wrap gap-2">
									{about.skills.backend.map(skill => (
										<span
											key={skill.name}
											className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/10 text-xs font-bold text-emerald-300"
										>
											{skill.name}
										</span>
									))}
								</div>
							</motion.div>

							{/* AI / ML */}
							<motion.div
								whileHover={{ y: -5 }}
								className="p-8 rounded-4xl bg-card/20 border border-white/5 hover:border-purple-500/30 transition-all group"
							>
								<div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
									<Box className="w-6 h-6" />
								</div>
								<h3 className="text-xl font-bold text-white mb-6">AI & ML</h3>
								<div className="flex flex-wrap gap-2">
									{about.skills.ml.map(skill => (
										<span
											key={skill.name}
											className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/10 text-xs font-bold text-purple-300"
										>
											{skill.name}
										</span>
									))}
								</div>
							</motion.div>
						</div>
					</div>

					{/* Personal Section */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
						<div className="p-8 rounded-4xl bg-card/20 border border-white/5">
							<h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
								<Globe className="w-5 h-5 text-blue-400" />
								Languages
							</h3>
							<div className="flex flex-wrap gap-3">
								{about.languages?.map(lang => (
									<span
										key={lang}
										className="px-4 py-2 rounded-xl bg-background/50 border border-white/5 text-sm font-medium text-white/80"
									>
										{lang}
									</span>
								))}
							</div>
						</div>

						<div className="p-8 rounded-4xl bg-card/20 border border-white/5">
							<h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
								<Sparkles className="w-5 h-5 text-yellow-400" />
								Interests
							</h3>
							<div className="flex flex-wrap gap-3">
								{about.hobbies?.map(hobby => (
									<span
										key={hobby}
										className="px-4 py-2 rounded-xl bg-background/50 border border-white/5 text-sm font-medium text-white/80"
									>
										{hobby}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</ScrollArea>
	);
}
