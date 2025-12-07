'use client';

import { useEffect, useState } from 'react';
import { api, Project } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Github, Star, GitFork, Sparkles, FolderKanban, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ModuleError } from '@/components/ui/module-error';

// Skeleton Loading Component
function ProjectCardSkeleton() {
	return (
		<div className="bg-card/20 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden h-[340px] flex flex-col">
			<div className="h-40 bg-muted/30 animate-pulse" />
			<div className="p-5 space-y-3 flex-1">
				<div className="h-6 bg-muted/40 rounded animate-pulse w-3/4" />
				<div className="h-4 bg-muted/30 rounded animate-pulse w-full" />
				<div className="h-4 bg-muted/30 rounded animate-pulse w-5/6" />
				<div className="flex gap-2 mt-auto pt-4">
					<div className="h-5 bg-muted/20 rounded animate-pulse w-16" />
					<div className="h-5 bg-muted/20 rounded animate-pulse w-20" />
				</div>
			</div>
		</div>
	);
}

export function ProjectsModule() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		api.getProjects()
			.then(data => setProjects(data.projects))
			.catch(err => setError(err.message))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return (
			<ScrollArea className="h-full">
				<div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
					{/* Header Skeleton */}
					<div className="flex justify-between items-end border-b border-border/40 pb-4">
						<div className="space-y-2">
							<div className="h-8 w-64 bg-muted/30 rounded animate-pulse" />
						</div>
					</div>

					<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3, 4, 5, 6].map(i => (
							<ProjectCardSkeleton key={i} />
						))}
					</div>
				</div>
			</ScrollArea>
		);
	}

	if (error) {
		return (
			<ModuleError
				message={error}
				onRetry={() => {
					setLoading(true);
					setError(null);
					api.getProjects()
						.then(data => setProjects(data.projects))
						.catch(err => setError(err.message))
						.finally(() => setLoading(false));
				}}
			/>
		);
	}

	return (
		<ScrollArea className="h-full">
			<div className="p-6 space-y-8 max-w-7xl mx-auto">
				{/* 1. Standardized System Header - PROJECT REGISTRY */}
				<div className="flex items-end justify-between border-b border-border/40 pb-4">
					<div>
						<h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
							DEPLOYMENT REGISTRY
						</h1>
						<p className="text-sm text-muted-foreground tracking-wider uppercase font-mono mt-1">
							Project Archive & Live Systems
						</p>
					</div>
					<div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
						<FolderKanban className="w-3 h-3" />
						<span>COUNT: {projects.length}</span>
					</div>
				</div>

				{/* Projects Grid */}
				<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{projects.map((project, index) => (
						<motion.div
							key={project.id}
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: index * 0.1 }}
							whileHover={{ y: -6 }}
							className="group flex flex-col h-full bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
						>
							{/* Thumbnail Section */}
							<div className="relative h-48 overflow-hidden bg-muted/10">
								<img
									src={`https://placehold.co/800x600/0f172a/38bdf8?text=${encodeURIComponent(
										project.title,
									)}`}
									alt={project.title}
									className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

								{/* Top Right Actions */}
								<div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
									{project.githubUrl && (
										<a
											href={project.githubUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="p-2 bg-background/80 backdrop-blur-md rounded-full text-foreground hover:text-cyan-400 hover:bg-background transition-colors border border-border shadow-sm"
											title="View Code"
											onClick={e => e.stopPropagation()}
										>
											<Github className="w-4 h-4" />
										</a>
									)}
									{project.liveUrl && (
										<a
											href={project.liveUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="p-2 bg-background/80 backdrop-blur-md rounded-full text-foreground hover:text-cyan-400 hover:bg-background transition-colors border border-border shadow-sm"
											title="View Live"
											onClick={e => e.stopPropagation()}
										>
											<ExternalLink className="w-4 h-4" />
										</a>
									)}
								</div>

								{/* Status Badge */}
								{project.status && (
									<div className="absolute top-3 left-3">
										<span
											className={cn(
												'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm',
												project.status.toLowerCase() === 'completed'
													? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
													: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
											)}
										>
											{project.status}
										</span>
									</div>
								)}
							</div>

							{/* Content Section */}
							<div className="p-5 flex flex-col flex-1">
								<div className="mb-4">
									<h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1">
										{project.title}
									</h2>
									<p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
										{project.description}
									</p>
								</div>

								<div className="mt-auto space-y-4">
									{/* Tech Stack */}
									<div className="flex flex-wrap gap-1.5">
										{project.techStack.slice(0, 3).map(tech => (
											<span
												key={tech}
												className="px-2 py-1 text-[10px] bg-muted/30 border border-border/50 rounded font-medium text-muted-foreground"
											>
												{tech}
											</span>
										))}
										{project.techStack.length > 3 && (
											<span className="px-2 py-1 text-[10px] text-muted-foreground">
												+{project.techStack.length - 3}
											</span>
										)}
									</div>

									{/* Stats Footer */}
									{(project.stars !== undefined ||
										project.forks !== undefined) && (
										<div className="flex gap-4 pt-3 border-t border-border/30 text-xs text-muted-foreground font-mono">
											{project.stars !== undefined && (
												<div className="flex items-center gap-1.5">
													<Star className="w-3.5 h-3.5 text-yellow-500/80" />
													<span>{project.stars}</span>
												</div>
											)}
											{project.forks !== undefined && (
												<div className="flex items-center gap-1.5">
													<GitFork className="w-3.5 h-3.5" />
													<span>{project.forks}</span>
												</div>
											)}
										</div>
									)}
								</div>
							</div>
						</motion.div>
					))}
				</div>

				{/* Empty State */}
				{projects.length === 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="flex flex-col items-center justify-center py-20 text-center"
					>
						<div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-4">
							<Rocket className="w-8 h-8 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-bold text-foreground">No Projects Deployed</h3>
						<p className="text-sm text-muted-foreground max-w-xs mt-2">
							System scan returned 0 artifacts. Check back later or deploy a new
							module.
						</p>
					</motion.div>
				)}
			</div>
		</ScrollArea>
	);
}
