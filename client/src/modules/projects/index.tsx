'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { publicService } from '@/api';
import type { Project } from '@/api/schema';
import { ScrollArea } from '@/ui/scroll-area';
import { Folder, Github, ExternalLink, Layout, X, Layers, Globe, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem, scaleIn, fadeIn } from '@/animations/motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { cn } from '@/lib/utils';

function ProjectsSkeleton() {
	return (
		<div className="p-8 space-y-8 animate-pulse max-w-7xl mx-auto">
			<div className="flex justify-between items-center mb-8 border-b border-border/40 pb-4">
				<div className="h-8 bg-muted rounded w-48" />
				<div className="flex gap-2">
					<div className="h-8 bg-muted rounded w-32" />
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{[1, 2, 3, 4, 5, 6].map(i => (
					<div key={i} className="h-80 bg-card/10 rounded-3xl border border-white/5" />
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
			const { data } = await publicService.getProjects();
			setProjects(data || []);
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
		return (p.techStack ?? []).some(t => t.toLowerCase().includes(filter.toLowerCase()));
	});

	if (loading) return <ProjectsSkeleton />;

	if (error) {
		return <div className="text-center py-24 text-muted-foreground">{error}</div>;
	}

	return (
		<ScrollArea className="h-full">
			<div className="p-6 md:p-12 max-w-7xl mx-auto pb-32">
				{/* Header & Filters */}
				<SectionHeader
					icon={Layers}
					label="Innovations"
					title="Featured Projects"
					description="A collection of my work, ranging from full-stack web applications to AI experiments and open source tools."
					actions={
						<div className="flex p-1.5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-inner">
							{['All', 'Web', 'App', 'AI'].map(tab => (
								<button
									key={tab}
									onClick={() => setFilter(tab as 'All' | 'Web' | 'App' | 'AI')}
									className={cn(
										'relative px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 z-10',
										filter === tab
											? 'text-white'
											: 'text-muted-foreground hover:text-white',
									)}
								>
									{filter === tab && (
										<motion.div
											layoutId="activeTab"
											className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-xl -z-10 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
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

				{filteredProjects.length === 0 ? (
					<div className="text-center py-20 mt-12 text-muted-foreground border border-dashed border-white/10 rounded-3xl bg-[#0a0a0a]/50">
						No projects found for the selected category.
					</div>
				) : (
					/* Grid */
					<motion.div
						layout
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
						className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
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
									className="group relative h-full flex flex-col bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 rounded-4xl overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] hover:-translate-y-2"
								>
									{/* Image Container */}
									<div className="relative aspect-video overflow-hidden mt-3 mx-3 rounded-t-3xl border border-white/5">
										<div className="absolute inset-0 bg-[#050505] z-0" />
										{project.thumbnail ? (
											<Image
												src={project.thumbnail}
												alt={project.title}
												fill
												className="object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
											/>
										) : (
											<div className="w-full h-full bg-linear-to-br from-[#111] via-[#050505] to-black flex items-center justify-center relative overflow-hidden">
												<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
												<Folder className="w-12 h-12 text-white/10 group-hover:text-primary/30 transition-colors duration-500" />
											</div>
										)}

										{/* Hover Overlay */}
										<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 backdrop-blur-sm">
											<motion.button
												onClick={() => setSelectedProject(project)}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white/20 hover:border-primary/50 transition-all shadow-xl"
											>
												<Eye className="w-4 h-4" />
												<span>View Details</span>
											</motion.button>
										</div>
									</div>

									{/* Content */}
									<div className="p-6 md:p-8 flex flex-col grow">
										<div className="mb-6">
											<h3 className="text-2xl font-black text-white tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">
												{project.title}
											</h3>
											<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
												{project.description}
											</p>
										</div>

										<div className="mt-auto space-y-6">
											{/* Tech Stack */}
											<div className="flex flex-wrap gap-2">
												{(project.techStack ?? []).slice(0, 3).map(tech => (
													<span
														key={tech}
														className="text-[10px] px-3 py-1.5 rounded-lg bg-black/50 text-muted-foreground border border-white/5 group-hover:border-primary/20 group-hover:text-primary/90 transition-colors uppercase tracking-wider font-bold shadow-inner"
													>
														{tech}
													</span>
												))}
												{project.techStack.length > 3 && (
													<span className="text-[10px] px-3 py-1.5 rounded-lg bg-black/50 text-muted-foreground border border-white/5 shadow-inner font-bold">
														+{project.techStack.length - 3}
													</span>
												)}
											</div>

											{/* Links */}
											<div className="flex items-center gap-6 pt-6 border-t border-white/5">
												{project.liveUrl && (
													<a
														href={project.liveUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors group/link"
														onClick={e => e.stopPropagation()}
													>
														<Globe className="w-4 h-4 group-hover/link:animate-pulse" />
														Live Demo
													</a>
												)}
												{project.githubUrl && (
													<a
														href={project.githubUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-white transition-colors group/link"
														onClick={e => e.stopPropagation()}
													>
														<Github className="w-4 h-4" />
														Source
													</a>
												)}
											</div>
										</div>
									</div>

									{/* Ambient Glow */}
									<div className="absolute inset-0 rounded-4xl ring-1 ring-inset ring-white/5 group-hover:ring-primary/30 transition-all duration-500 pointer-events-none" />
								</motion.div>
							))}
						</AnimatePresence>
					</motion.div>
				)}

				{/* Detail Modal */}
				<AnimatePresence>
					{selectedProject && (
						<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
							<motion.div
								variants={fadeIn}
								initial="hidden"
								animate="visible"
								exit="hidden"
								onClick={() => setSelectedProject(null)}
								className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
							/>
							<motion.div
								variants={scaleIn}
								initial="hidden"
								animate="visible"
								exit="hidden"
								className="relative w-full max-w-5xl bg-[#080808] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh] md:max-h-[700px] z-10"
							>
								{/* Close Button */}
								<button
									onClick={() => setSelectedProject(null)}
									className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all hover:rotate-90"
								>
									<X className="w-5 h-5" />
								</button>

								{/* Left Side: Thumbnail */}
								<div className="relative w-full md:w-5/12 h-72 md:h-full bg-black shrink-0 overflow-hidden border-r border-white/5">
									{selectedProject.thumbnail ? (
										<Image
											src={selectedProject.thumbnail}
											alt={selectedProject.title}
											fill
											className="object-cover"
										/>
									) : (
										<div className="w-full h-full bg-linear-to-br from-[#111] to-[#050505] flex items-center justify-center">
											<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
											<Folder className="w-20 h-20 text-white/10" />
										</div>
									)}
									<div className="absolute inset-0 bg-linear-to-t from-[#080808] via-transparent to-transparent opacity-100 md:opacity-50" />

									{/* Embedded Mobile Header */}
									<div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 bg-linear-to-t from-[#080808] to-transparent">
										<h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 leading-tight drop-shadow-lg">
											{selectedProject.title}
										</h2>
										<div className="flex flex-wrap gap-3 mt-6">
											{selectedProject.liveUrl && (
												<a
													href={selectedProject.liveUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg"
												>
													<ExternalLink className="w-4 h-4" />
													Visit Site
												</a>
											)}
											{selectedProject.githubUrl && (
												<a
													href={selectedProject.githubUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg"
												>
													<Github className="w-4 h-4" />
													Source
												</a>
											)}
										</div>
									</div>
								</div>

								{/* Right Side: Content */}
								<div className="flex-1 w-full relative bg-[#080808]">
									<ScrollArea className="h-full">
										<div className="p-8 md:p-12 space-y-12">
											{/* Description Section */}
											<div className="space-y-4">
												<div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
													<Layout className="w-4 h-4" />
													<span>About Project</span>
												</div>
												<p className="text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
													{selectedProject.description}
												</p>
											</div>

											{/* Tech Stack Section */}
											<div className="space-y-4">
												<div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
													<Layers className="w-4 h-4" />
													<span>Technologies</span>
												</div>
												<div className="flex flex-wrap gap-2.5">
													{(selectedProject.techStack ?? []).map(tech => (
														<span
															key={tech}
															className="px-4 py-2 rounded-xl bg-[#111] border border-white/5 text-sm font-semibold text-white/80 hover:border-primary/30 hover:text-primary transition-colors cursor-default shadow-inner"
														>
															{tech}
														</span>
													))}
												</div>
											</div>
										</div>
									</ScrollArea>

									{/* Fade out bottom for scroll indication */}
									<div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#080808] via-[#080808]/80 to-transparent pointer-events-none" />
								</div>
							</motion.div>
						</div>
					)}
				</AnimatePresence>
			</div>
		</ScrollArea>
	);
}
