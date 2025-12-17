'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api, Project } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Folder,
	Github,
	ExternalLink,
	Star,
	Box,
	Layout,
	Server,
	Database,
	X,
	Info,
	Layers,
	Globe,
	Code2,
	Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem, scaleIn, fadeIn } from '@/lib/animations';
import { ModuleHeader } from '@/components/apps/shared/ModuleHeader';
import { cn } from '@/lib/utils';
import { ModuleError } from '@/components/ui/module-error';

function ProjectsSkeleton() {
	return (
		<div className="p-8 space-y-8 animate-pulse max-w-7xl mx-auto">
			<div className="flex justify-between items-center mb-8 border-b border-border/40 pb-4">
				<div className="h-8 bg-muted rounded w-48" />
				<div className="flex gap-2">
					<div className="h-8 bg-muted rounded w-20" />
					<div className="h-8 bg-muted rounded w-20" />
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{[1, 2, 3, 4, 5, 6].map(i => (
					<div key={i} className="h-80 bg-card/20 rounded-3xl border border-border/40" />
				))}
			</div>
		</div>
	);
}

export function ProjectsModule() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filter, setFilter] = useState<'All' | 'Web' | 'App' | 'AI'>('All');
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await api.getProjects();
			setProjects(data);
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

	const filteredProjects = projects.filter(p => {
		if (filter === 'All') return true;
		return p.tags?.includes(filter) ?? false;
	});

	if (loading) return <ProjectsSkeleton />;

	if (error) {
		return <ModuleError message={error} onRetry={fetchData} />;
	}

	return (
		<ScrollArea className="h-full">
			<div className="p-6 md:p-10 max-w-7xl mx-auto pb-32">
				{/* Header & Filters */}
				<ModuleHeader
					icon={Box}
					label="Portfolio"
					title="Featured Projects"
					description="A collection of my work, ranging from full-stack web applications to AI experiments and open source tools."
					actions={
						<div className="flex p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-inner">
							{['All', 'Web', 'App', 'AI'].map(tab => (
								<button
									key={tab}
									onClick={() => setFilter(tab as 'All' | 'Web' | 'App' | 'AI')}
									className={cn(
										'relative px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 z-10',
										filter === tab
											? 'text-white'
											: 'text-muted-foreground hover:text-white',
									)}
								>
									{filter === tab && (
										<motion.div
											layoutId="activeTab"
											className="absolute inset-0 bg-emerald-500 rounded-lg -z-10 shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]"
											transition={{
												type: 'spring',
												bounce: 0.15,
												duration: 0.5,
											}}
										/>
									)}
									{tab}
								</button>
							))}
						</div>
					}
				/>

				{/* Grid */}
				<motion.div
					layout
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
				>
					<AnimatePresence mode="popLayout">
						{filteredProjects.map(project => (
							<motion.div
								layout
								key={project.id}
								variants={staggerItem}
								initial="hidden"
								animate="visible"
								exit="hidden"
								className="group relative h-full flex flex-col bg-card/20 hover:bg-card/40 backdrop-blur-sm border border-white/5 rounded-4xl overflow-hidden transition-all duration-500 hover:border-emerald-500/30 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.1)] hover:-translate-y-2"
							>
								{/* Image Container */}
								<div className="relative aspect-video overflow-hidden mt-2 mx-2 rounded-t-3xl">
									<div className="absolute inset-0 bg-gray-900 z-0" />
									{project.thumbnail ? (
										<Image
											src={project.thumbnail}
											alt={project.title}
											fill
											className="object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
										/>
									) : (
										<div className="w-full h-full bg-linear-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center relative overflow-hidden">
											<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
											<Folder className="w-12 h-12 text-white/5 group-hover:text-emerald-500/20 transition-colors duration-500" />
										</div>
									)}

									{/* Hover Overlay */}
									<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 backdrop-blur-[2px]">
										<motion.button
											onClick={() => setSelectedProject(project)}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white/20 hover:border-emerald-500/50 transition-all shadow-xl"
										>
											<Eye className="w-4 h-4" />
											<span>View Details</span>
										</motion.button>
									</div>
								</div>

								{/* Content */}
								<div className="p-6 flex flex-col grow">
									<div className="mb-4">
										<h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">
											{project.title}
										</h3>
										<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
											{project.description}
										</p>
									</div>

									<div className="mt-auto space-y-4">
										{/* Tech Stack */}
										<div className="flex flex-wrap gap-1.5">
											{project.techStack.slice(0, 3).map(tech => (
												<span
													key={tech}
													className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/5 group-hover:border-emerald-500/20 group-hover:text-emerald-500/80 transition-colors uppercase tracking-wider font-bold"
												>
													{tech}
												</span>
											))}
											{project.techStack.length > 3 && (
												<span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/5">
													+{project.techStack.length - 3}
												</span>
											)}
										</div>

										{/* Links */}
										<div className="flex items-center gap-4 pt-4 border-t border-white/5">
											{project.liveUrl && (
												<a
													href={project.liveUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-emerald-400 transition-colors group/link"
													onClick={e => e.stopPropagation()}
												>
													<Globe className="w-3.5 h-3.5 group-hover/link:animate-pulse" />
													Live Demo
												</a>
											)}
											{project.githubUrl && (
												<a
													href={project.githubUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors group/link"
													onClick={e => e.stopPropagation()}
												>
													<Github className="w-3.5 h-3.5" />
													Source
												</a>
											)}
										</div>
									</div>
								</div>

								{/* Border Gradient Animation */}
								<div className="absolute inset-0 rounded-4xl ring-1 ring-inset ring-transparent group-hover:ring-emerald-500/20 transition-all duration-500 pointer-events-none" />
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>

				{/* Detail Modal */}
				<AnimatePresence>
					{selectedProject && (
						<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
							<motion.div
								variants={fadeIn}
								initial="hidden"
								animate="visible"
								exit="hidden"
								onClick={() => setSelectedProject(null)}
								className="absolute inset-0 bg-black/80 backdrop-blur-xl"
							/>
							<motion.div
								variants={scaleIn}
								initial="hidden"
								animate="visible"
								exit="hidden"
								className="relative w-full max-w-5xl bg-[#080808] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh] md:max-h-[700px]"
							>
								{/* Close Button */}
								<button
									onClick={() => setSelectedProject(null)}
									className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all hover:rotate-90"
								>
									<X className="w-5 h-5" />
								</button>

								{/* Left Side: Thumbnail */}
								<div className="relative w-full md:w-5/12 h-64 md:h-full bg-black shrink-0">
									{selectedProject.thumbnail ? (
										<Image
											src={selectedProject.thumbnail}
											alt={selectedProject.title}
											fill
											className="object-cover"
										/>
									) : (
										<div className="w-full h-full bg-linear-to-br from-gray-900 to-black flex items-center justify-center">
											<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
											<Folder className="w-20 h-20 text-emerald-500/20" />
										</div>
									)}
									<div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-80 md:opacity-40" />

									{/* Floating Header on Mobile / Bottom text on Desktp */}
									<div className="absolute bottom-0 left-0 right-0 p-8 bg-linear-to-t from-black to-transparent">
										<h2 className="text-3xl font-black text-white mb-2 leading-none">
											{selectedProject.title}
										</h2>
										<div className="flex gap-3 mt-4">
											{selectedProject.liveUrl && (
												<a
													href={selectedProject.liveUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider rounded-full transition-colors"
												>
													<ExternalLink className="w-3 h-3" />
													Visit Site
												</a>
											)}
											{selectedProject.githubUrl && (
												<a
													href={selectedProject.githubUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/10 transition-colors"
												>
													<Github className="w-3 h-3" />
													Code
												</a>
											)}
										</div>
									</div>
								</div>

								{/* Right Side: Content */}
								<div className="flex-1 w-full bg-[#080808] relative">
									<ScrollArea className="h-full">
										<div className="p-8 md:p-10 space-y-10">
											{/* Description */}
											<div className="space-y-4">
												<div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-[0.2em]">
													<Layout className="w-4 h-4" />
													<span>About Project</span>
												</div>
												<p className="text-lg text-muted-foreground leading-relaxed">
													{selectedProject.description}
												</p>
											</div>

											{/* Tech Stack */}
											<div className="space-y-4">
												<div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-[0.2em]">
													<Layers className="w-4 h-4" />
													<span>Technologies</span>
												</div>
												<div className="flex flex-wrap gap-2">
													{selectedProject.techStack.map(tech => (
														<span
															key={tech}
															className="px-4 py-2 rounded-xl bg-card border border-white/5 text-sm font-medium text-white/80 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors cursor-default"
														>
															{tech}
														</span>
													))}
												</div>
											</div>

											{/* Features */}
											{selectedProject.features && (
												<div className="space-y-4">
													<div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-[0.2em]">
														<Star className="w-4 h-4" />
														<span>Key Highlights</span>
													</div>
													<ul className="grid grid-cols-1 gap-3">
														{selectedProject.features.map(
															(feature, idx) => (
																<li
																	key={idx}
																	className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
																>
																	<div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
																	<span className="text-sm text-white/70 leading-relaxed">
																		{feature}
																	</span>
																</li>
															),
														)}
													</ul>
												</div>
											)}
										</div>
									</ScrollArea>

									{/* Fade out bottom for scroll indication */}
									<div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-[#080808] to-transparent pointer-events-none" />
								</div>
							</motion.div>
						</div>
					)}
				</AnimatePresence>
			</div>
		</ScrollArea>
	);
}
