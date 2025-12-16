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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem, scaleIn, fadeIn } from '@/lib/animations';
import { ModuleHeader } from '@/components/apps/shared/ModuleHeader';
import { cn } from '@/lib/utils';
import { ModuleError } from '@/components/ui/module-error';

function ProjectsSkeleton() {
	return (
		<div className="p-8 space-y-8 animate-pulse max-w-6xl mx-auto">
			<div className="flex justify-between items-center mb-8 border-b border-border/40 pb-4">
				<div className="h-8 bg-muted rounded w-48" />
				<div className="flex gap-2">
					<div className="h-8 bg-muted rounded w-20" />
					<div className="h-8 bg-muted rounded w-20" />
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[1, 2, 3, 4, 5, 6].map(i => (
					<div key={i} className="h-64 bg-card/20 rounded-2xl border border-border/40" />
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
		} catch (err: any) {
			setError(err.message);
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
			<div className="p-6 md:p-10 max-w-7xl mx-auto pb-24">
				{/* Header & Filters */}
				<ModuleHeader
					icon={Box}
					label="Portfolio"
					title="Project Directory"
					actions={
						<div className="flex p-1 bg-black/20 backdrop-blur-md rounded-xl border border-white/5">
							{['All', 'Web', 'App', 'AI'].map(tab => (
								<button
									key={tab}
									onClick={() => setFilter(tab as any)}
									className={cn(
										'relative px-4 py-1.5 text-xs font-medium rounded-lg transition-colors z-10',
										filter === tab
											? 'text-white'
											: 'text-muted-foreground hover:text-white',
									)}
								>
									{filter === tab && (
										<motion.div
											layoutId="activeTab"
											className="absolute inset-0 bg-white/10 rounded-lg -z-10 border border-white/10"
											transition={{
												type: 'spring',
												bounce: 0.2,
												duration: 0.6,
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
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" // Reverted to original grid layout
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
								className="group relative bg-card/40 border border-white/5 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
							>
								{/* Hover Gradient */}
								<div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

								{/* Thumbnail */}
								<div className="relative h-48 overflow-hidden">
									{project.thumbnail ? (
										<Image
											src={project.thumbnail}
											alt={project.title}
											fill
											className="object-cover transition-transform duration-700 group-hover:scale-110"
										/>
									) : (
										<div className="w-full h-full bg-linear-to-br from-gray-900 to-black flex items-center justify-center">
											<Folder className="w-12 h-12 text-white/10 group-hover:text-emerald-500/20 transition-colors duration-500" />
										</div>
									)}
									<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
										<button
											onClick={() => setSelectedProject(project)}
											className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white/20 hover:scale-105 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
										>
											View Details
										</button>
									</div>
								</div>

								{/* Content */}
								<div className="p-6 relative z-10">
									<div className="flex justify-between items-start mb-4">
										<div>
											<h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-emerald-400 transition-colors">
												{project.title}
											</h3>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{project.description}
											</p>
										</div>
									</div>

									<div className="flex flex-wrap gap-2 mb-4">
										{project.techStack.slice(0, 3).map(tech => (
											<span
												key={tech}
												className="text-[10px] px-2.5 py-1 rounded-md bg-white/5 text-muted-foreground border border-white/5 group-hover:bg-white/10 transition-colors uppercase tracking-wider font-medium"
											>
												{tech}
											</span>
										))}
										{project.techStack.length > 3 && (
											<span className="text-[10px] px-2.5 py-1 rounded-md bg-white/5 text-muted-foreground border border-white/5">
												+{project.techStack.length - 3}
											</span>
										)}
									</div>

									<div className="flex items-center gap-4 pt-4 border-t border-white/5">
										{project.liveUrl && ( // Changed from demoUrl to liveUrl
											<a
												href={project.liveUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-emerald-400 transition-colors"
												onClick={e => e.stopPropagation()}
											>
												<Globe className="w-4 h-4" />
												Live Demo
											</a>
										)}
										{project.githubUrl && ( // Changed from repoUrl to githubUrl
											<a
												href={project.githubUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors"
												onClick={e => e.stopPropagation()}
											>
												<Github className="w-4 h-4" />
												Code
											</a>
										)}
									</div>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>

				{/* Detail Modal */}
				<AnimatePresence>
					{selectedProject && (
						<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
							<motion.div
								variants={fadeIn}
								initial="hidden"
								animate="visible"
								exit="hidden"
								onClick={() => setSelectedProject(null)}
								className="absolute inset-0 bg-black/60 backdrop-blur-md"
							/>
							<motion.div
								variants={scaleIn}
								initial="hidden"
								animate="visible"
								exit="hidden"
								className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
							>
								{/* Modal Header Image */}
								<div className="h-48 md:h-64 relative shrink-0">
									<button
										onClick={() => setSelectedProject(null)}
										className="absolute top-4 right-4 z-20 p-3 rounded-full bg-black/50 backdrop-blur hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95"
										aria-label="Close modal"
									>
										<X className="w-5 h-5" />
									</button>
									{selectedProject.thumbnail ? (
										<Image
											src={selectedProject.thumbnail}
											alt={selectedProject.title}
											fill
											className="object-cover opacity-80"
										/>
									) : (
										<div className="w-full h-full bg-linear-to-br from-gray-900 via-black to-emerald-950/40 flex items-center justify-center relative overflow-hidden">
											<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
											<Folder className="w-20 h-20 text-white/5 relative z-10" />
										</div>
									)}
									<div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#0a0a0a] to-transparent" />

									<div className="absolute bottom-6 left-6 md:left-8">
										<h2 className="text-3xl md:text-4xl font-bold text-white mb-2 shadow-black drop-shadow-lg">
											{selectedProject.title}
										</h2>
										<div className="flex gap-3">
											{selectedProject.githubUrl && (
												<a
													href={selectedProject.githubUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur hover:bg-white/20 rounded-full text-xs font-bold text-white transition-all border border-white/10"
												>
													<Github className="w-3.5 h-3.5" />
													Code
												</a>
											)}
											{selectedProject.liveUrl && (
												<a
													href={selectedProject.liveUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 backdrop-blur hover:bg-emerald-500/30 rounded-full text-xs font-bold text-emerald-400 transition-all border border-emerald-500/20"
												>
													<ExternalLink className="w-3.5 h-3.5" />
													Demo
												</a>
											)}
										</div>
									</div>
								</div>

								{/* Modal Content Scroll */}
								<ScrollArea className="flex-1">
									<div className="p-6 md:p-8 space-y-8">
										<div className="space-y-4">
											<h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
												<Layout className="w-4 h-4" /> Description
											</h3>
											<p className="text-foreground/90 leading-relaxed text-base md:text-lg">
												{selectedProject.description}
											</p>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
											<div className="space-y-4">
												<h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
													<Layers className="w-4 h-4" /> Tech Stack
												</h3>
												<div className="flex flex-wrap gap-2">
													{selectedProject.techStack.map(tech => (
														<span
															key={tech}
															className="px-3 py-1.5 rounded-lg bg-card/40 border border-white/10 text-sm font-medium text-foreground/80 hover:text-white hover:border-emerald-500/30 transition-colors cursor-default"
														>
															{tech}
														</span>
													))}
												</div>
											</div>

											{selectedProject.features && (
												<div className="space-y-4">
													<h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
														<Star className="w-4 h-4" /> Key Features
													</h3>
													<ul className="space-y-2">
														{selectedProject.features.map(
															(feature, idx) => (
																<li
																	key={idx}
																	className="flex gap-3 text-sm text-foreground/80"
																>
																	<span className="text-emerald-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
																	{feature}
																</li>
															),
														)}
													</ul>
												</div>
											)}
										</div>
									</div>
								</ScrollArea>
							</motion.div>
						</div>
					)}
				</AnimatePresence>
			</div>
		</ScrollArea>
	);
}
