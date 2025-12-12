'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border/40 pb-6">
					<div>
						<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">
							<Box className="w-4 h-4" />
							<span>Portfolio</span>
						</div>
						<h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-blue-500">
							Project Directory
						</h1>
					</div>

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
										transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
									/>
								)}
								{tab}
							</button>
						))}
					</div>
				</div>

				{/* Grid */}
				<motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<AnimatePresence mode="popLayout">
						{filteredProjects.map(project => (
							<motion.div
								layout
								key={project.id}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								transition={{ duration: 0.3 }}
								onClick={() => setSelectedProject(project)}
								className="group relative bg-card/20 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden hover:border-emerald-500/40 hover:bg-card/30 transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full"
							>
								{/* Image / Preview Area */}
								<div className="aspect-video w-full bg-black/40 overflow-hidden relative">
									{project.thumbnail ? (
										<img
											src={project.thumbnail}
											alt={project.title}
											className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-800 to-black group-hover:from-gray-800/80 group-hover:to-black/80 transition-colors">
											<Folder className="w-12 h-12 text-muted-foreground/30 group-hover:text-emerald-500/50 transition-colors" />
										</div>
									)}

									{/* Status Badge */}
									<div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/80">
										{project.status === 'completed' ? 'v1.0' : 'WIP'}
									</div>
								</div>

								{/* Content */}
								<div className="p-5 flex flex-col flex-1">
									<div className="flex justify-between items-start mb-2">
										<h3 className="font-bold text-lg text-foreground group-hover:text-emerald-400 transition-colors">
											{project.title}
										</h3>
										<div className="p-1.5 rounded-full bg-white/5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
											<Info className="w-4 h-4 text-emerald-400" />
										</div>
									</div>

									<p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
										{project.description}
									</p>

									<div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
										{project.techStack.slice(0, 3).map(tech => (
											<span
												key={tech}
												className="text-[10px] px-2 py-1 rounded bg-white/5 text-muted-foreground border border-white/5"
											>
												{tech}
											</span>
										))}
										{project.techStack.length > 3 && (
											<span className="text-[10px] px-2 py-1 text-muted-foreground">
												+{project.techStack.length - 3}
											</span>
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
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={() => setSelectedProject(null)}
								className="absolute inset-0 bg-black/60 backdrop-blur-md"
							/>
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: 20 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 20 }}
								className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
							>
								{/* Modal Header Image */}
								<div className="h-48 md:h-64 relative shrink-0">
									<button
										onClick={() => setSelectedProject(null)}
										className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 backdrop-blur hover:bg-white/20 text-white transition-all"
									>
										<X className="w-5 h-5" />
									</button>
									{selectedProject.thumbnail ? (
										<img
											src={selectedProject.thumbnail}
											alt={selectedProject.title}
											className="w-full h-full object-cover opacity-80"
										/>
									) : (
										<div className="w-full h-full bg-linear-to-br from-gray-900 via-black to-emerald-950/20 flex items-center justify-center">
											<Folder className="w-16 h-16 text-white/10" />
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
