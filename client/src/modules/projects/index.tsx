'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Layers,
	ExternalLink,
	Github,
	Folder,
	Layout,
	X,
	ArrowUpRight,
} from 'lucide-react';
import { publicService } from '@/api';
import type { Project } from '@/api/schema';
import { SectionHeader } from '@/ui/SectionHeader';
import { UrlThumbnail } from '@/ui/UrlThumbnail';
import { ScrollArea } from '@/ui/scroll-area';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, scaleIn, fadeIn, cardHover } from '@/animations/motion';

// ─── Skeleton ───────────────────────────────────────────────────

function ProjectsSkeleton() {
	return (
		<div className="p-6 md:p-12 max-w-7xl mx-auto animate-pulse pb-32">
			<div className="flex justify-between items-end mb-12 pb-8">
				<div className="space-y-4">
					<div className="h-6 w-32 bg-white/5 rounded-lg" />
					<div className="h-12 w-80 bg-white/5 rounded-xl" />
				</div>
				<div className="h-10 w-64 bg-white/5 rounded-2xl hidden md:block" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
				{[1, 2, 3, 4, 5, 6].map(i => (
					<div key={i} className="h-96 bg-white/5 rounded-[2.5rem]" />
				))}
			</div>
		</div>
	);
}

// ─── Main Module ────────────────────────────────────────────────

export function ProjectsModule() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [selectedProject, setSelectedProject] = useState<Project | null>(null);

	useEffect(() => {
		async function fetchProjects() {
			try {
				const { data } = await publicService.getProjects();
				setProjects(data || []);
			} catch (err: unknown) {
				setError('Failed to load projects');
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchProjects();
	}, []);

	if (loading) return <ProjectsSkeleton />;

	if (error) {
		return <div className="text-center py-24 text-muted-foreground">{error}</div>;
	}

	return (
		<div className="h-full w-full">
			<div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto pb-24 sm:pb-32">
				{/* Header & Filters */}
				<SectionHeader
					icon={Layers}
					label="Innovations"
					title="Featured Projects"
					description="A collection of my work, ranging from full-stack web applications to AI experiments and open source tools."
					accent="amber"
				/>

				{projects.length === 0 ? (
					<div className="text-center py-20 mt-12 text-muted-foreground border border-dashed border-white/10 rounded-3xl bg-[#0a0a0a]/50">
						No projects found for the selected category.
					</div>
				) : (
					/* Grid */
					<motion.div
						layout
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-40px' }}
						className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
					>
						<AnimatePresence mode="popLayout">
							{projects.map(project => (
								<motion.div
									layout
									key={project.id}
									variants={staggerItem}
									initial="hidden"
									animate="visible"
									exit="hidden"
									whileHover={cardHover}
									className="group cursor-pointer h-full flex flex-col bg-linear-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-amber-500/40 relative shadow-2xl"
									onClick={() => setSelectedProject(project)}
								>
									<div className="absolute inset-0 bg-linear-to-br from-amber-500/0 to-transparent group-hover:from-amber-500/10 transition-colors duration-500 pointer-events-none" />

									{/* Thumbnail Area */}
									<div className="relative aspect-video overflow-hidden">
										<UrlThumbnail url={project.thumbnail || project.liveUrl} title={project.title} fallbackIcon={Folder} />

										{/* Top Right Action Pill Overlay */}
										<div className="absolute top-4 right-4 z-20 flex gap-2 translate-y-[-150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
											{project.liveUrl && (
												<span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-400 transition-colors">
													<ArrowUpRight className="w-3.5 h-3.5" />
													View
												</span>
											)}
										</div>

										{/* Inner gradient shadow */}
										<div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
									</div>

									{/* Content Area */}
									<div className="p-6 sm:p-8 flex flex-col grow relative z-10 -mt-6">
										{/* Tech Stack Pills (Floating over image edge) */}
										<div className="flex flex-wrap gap-2 mb-6">
											{(project.techStack ?? []).slice(0, 3).map(tech => (
												<span
													key={tech}
													className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg bg-[#0a0a0a] border border-white/10 text-white/70 shadow-xl group-hover:border-amber-500/30 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors"
												>
													{tech}
												</span>
											))}
											{(project.techStack ?? []).length > 3 && (
												<span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg bg-[#0a0a0a] border border-white/10 text-white/40 shadow-xl">
													+{(project.techStack ?? []).length - 3}
												</span>
											)}
										</div>

										<h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight mb-3 group-hover:text-amber-400 transition-colors line-clamp-2">
											{project.title}
										</h3>
										
										<p className="text-sm text-white/60 line-clamp-3 leading-relaxed font-medium mb-6">
											{project.description}
										</p>

										{/* Footer Links */}
										<div className="flex items-center gap-4 mt-auto pt-5 border-t border-white/5">
											{project.liveUrl && (
												<button
													className="flex items-center justify-center flex-1 gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-amber-400 transition-colors"
													onClick={(e) => { e.stopPropagation(); window.open(project.liveUrl, '_blank'); }}
												>
													<ExternalLink className="w-3.5 h-3.5" />
													Open
												</button>
											)}
											{project.githubUrl && (
												<button
													className="flex items-center justify-center flex-1 gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/20 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors"
													onClick={(e) => { e.stopPropagation(); window.open(project.githubUrl, '_blank'); }}
												>
													<Github className="w-3.5 h-3.5" />
													Source
												</button>
											)}
										</div>
									</div>
								</motion.div>
							))}
						</AnimatePresence>
					</motion.div>
				)}

				{/* Detail Modal */}
				<AnimatePresence>
					{selectedProject && (
						<div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-8">
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
								className="relative w-full max-w-5xl bg-[#080808] border border-white/10 rounded-[2.5rem] shadow-3xl shadow-amber-500/10 overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh] md:max-h-[700px] z-10"
							>
								{/* Close Button */}
								<button
									onClick={() => setSelectedProject(null)}
									className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all hover:rotate-90 hover:scale-110"
								>
									<X className="w-5 h-5" />
								</button>

								{/* Left Side: Thumbnail */}
								<div className="relative w-full md:w-5/12 h-64 sm:h-72 md:h-full bg-black shrink-0 overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
									<UrlThumbnail url={selectedProject.thumbnail || selectedProject.liveUrl} title={selectedProject.title} fallbackIcon={Folder} />
									<div className="absolute inset-0 bg-linear-to-t from-[#080808] via-[#080808]/40 to-transparent" />

									{/* Embedded Mobile Header */}
									<div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 bg-linear-to-t from-[#080808] to-transparent">
										<h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 leading-tight drop-shadow-lg">
											{selectedProject.title}
										</h2>
										<div className="flex flex-wrap gap-3 mt-6">
											{selectedProject.liveUrl && (
												<a
													href={selectedProject.liveUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 hover:border-amber-500/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex-1 md:flex-none"
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
													className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex-1 md:flex-none"
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
										<div className="p-6 sm:p-8 md:p-12 space-y-10 sm:space-y-12 pb-24">
											{/* Description Section */}
											<div className="space-y-4">
												<div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">
													<Layout className="w-4 h-4" />
													<span>About Project</span>
												</div>
												<p className="text-sm sm:text-base md:text-lg text-white/70 font-medium leading-relaxed whitespace-pre-wrap">
													{selectedProject.description}
												</p>
											</div>

											{/* Tech Stack Section */}
											<div className="space-y-4">
												<div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">
													<Layers className="w-4 h-4" />
													<span>Technologies</span>
												</div>
												<div className="flex flex-wrap gap-2 sm:gap-2.5">
													{(selectedProject.techStack ?? []).map(tech => (
														<span
															key={tech}
															className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#111] border border-white/5 text-xs sm:text-sm font-bold text-white/80 transition-colors shadow-inner"
														>
															{tech}
														</span>
													))}
												</div>
											</div>
										</div>
									</ScrollArea>

									{/* Fade out bottom for scroll indication */}
									<div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#080808] via-[#080808]/90 to-transparent pointer-events-none" />
								</div>
							</motion.div>
						</div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
