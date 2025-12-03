'use client';

import { useEffect, useState } from 'react';
import { api, Project } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Github, Star, GitFork, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ModuleError } from '@/components/ui/module-error';

// Skeleton Loading Component
function ProjectCardSkeleton() {
	return (
		<div className="bg-linear-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
			<div className="relative h-48 bg-linear-to-br from-cyan-500/10 to-blue-500/10 animate-pulse" />
			<div className="p-5 space-y-3">
				<div className="h-6 bg-white/10 rounded animate-pulse w-3/4" />
				<div className="h-4 bg-white/5 rounded animate-pulse w-full" />
				<div className="h-4 bg-white/5 rounded animate-pulse w-5/6" />
				<div className="flex gap-2 mt-4">
					<div className="h-6 bg-blue-500/20 rounded animate-pulse w-16" />
					<div className="h-6 bg-blue-500/20 rounded animate-pulse w-20" />
					<div className="h-6 bg-blue-500/20 rounded animate-pulse w-14" />
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
				<div className="p-6 md:p-8 space-y-6">
					<div className="space-y-2">
						<h1 className="text-3xl font-bold bg-linear-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
							<span className="text-cyan-400">$</span> ls projects/
							<Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
						</h1>
						<p className="text-white/60 text-sm">Loading projects...</p>
					</div>

					<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map(i => (
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
			<div className="p-6 md:p-8 space-y-8">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="space-y-3"
				>
					<h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
						<span className="text-cyan-400">$</span> ls projects/
					</h1>
					<p className="text-white/70 text-sm md:text-base">
						{projects.length} project{projects.length !== 1 ? 's' : ''} found
					</p>
				</motion.div>

				{/* Projects Grid */}
				<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{projects.map((project, index) => (
						<motion.div
							key={project.id}
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: index * 0.1 }}
							whileHover={{ y: -8, scale: 1.02 }}
							className="group relative"
						>
							<div className="glass-panel rounded-xl overflow-hidden border border-white/10 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]">
								{/* Gradient Overlay on Hover */}
								<div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none z-10" />

								{/* Project Thumbnail */}
								<div className="relative h-48 bg-gradient-to-br from-cyan-500/10 via-blue-500/15 to-purple-500/10 overflow-hidden">
									<img
										src={`https://placehold.co/800x600/0f172a/38bdf8?text=${encodeURIComponent(
											project.title,
										)}`}
										alt={project.title}
										className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

									{/* Action Buttons */}
									<div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
										{project.githubUrl && (
											<motion.a
												href={project.githubUrl}
												target="_blank"
												rel="noopener noreferrer"
												whileHover={{ scale: 1.1, rotate: 5 }}
												whileTap={{ scale: 0.95 }}
												className="p-2.5 bg-black/70 backdrop-blur-md rounded-full text-white hover:bg-emerald-500/80 transition-colors shadow-lg"
												title="View on GitHub"
												onClick={e => e.stopPropagation()}
											>
												<Github className="w-4 h-4" />
											</motion.a>
										)}
										{project.liveUrl && (
											<motion.a
												href={project.liveUrl}
												target="_blank"
												rel="noopener noreferrer"
												whileHover={{ scale: 1.1, rotate: -5 }}
												whileTap={{ scale: 0.95 }}
												className="p-2.5 bg-black/70 backdrop-blur-md rounded-full text-white hover:bg-cyan-500/80 transition-colors shadow-lg"
												title="View Live"
												onClick={e => e.stopPropagation()}
											>
												<ExternalLink className="w-4 h-4" />
											</motion.a>
										)}
									</div>

									{/* Status Badge */}
									{project.status && (
										<div className="absolute bottom-3 left-3">
											<span
												className={cn(
													'px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border',
													project.status.toLowerCase() === 'completed'
														? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
														: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
												)}
											>
												{project.status}
											</span>
										</div>
									)}
								</div>

								{/* Project Info */}
								<div className="p-5 space-y-4 relative z-20">
									<div className="space-y-2">
										<h2 className="text-xl font-bold bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-300">
											{project.title}
										</h2>
										<p className="text-sm text-white/70 line-clamp-2 leading-relaxed">
											{project.description}
										</p>
									</div>

									{/* Tech Stack */}
									<div className="flex flex-wrap gap-2">
										{project.techStack.slice(0, 4).map((tech, i) => (
											<motion.span
												key={tech}
												initial={{ opacity: 0, scale: 0.8 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ delay: index * 0.1 + i * 0.05 }}
												className="px-2.5 py-1 bg-linear-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-md text-xs text-cyan-300 font-medium hover:border-cyan-400/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all duration-200"
											>
												{tech}
											</motion.span>
										))}
										{project.techStack.length > 4 && (
											<span className="px-2.5 py-1 text-xs text-white/50 flex items-center">
												+{project.techStack.length - 4} more
											</span>
										)}
									</div>

									{/* Stats */}
									{(project.stars !== undefined ||
										project.forks !== undefined) && (
										<div className="flex gap-4 text-xs text-white/60 pt-3 border-t border-white/10">
											{project.stars !== undefined && (
												<div className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors">
													<Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
													<span className="font-medium">
														{project.stars}
													</span>
												</div>
											)}
											{project.forks !== undefined && (
												<div className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
													<GitFork className="w-3.5 h-3.5" />
													<span className="font-medium">
														{project.forks}
													</span>
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
						className="text-center py-20 space-y-4"
					>
						<div className="text-6xl opacity-30">📁</div>
						<div className="space-y-2">
							<p className="text-white/70 font-medium">No projects found</p>
							<p className="text-sm text-white/40">Check back soon for updates!</p>
						</div>
					</motion.div>
				)}
			</div>
		</ScrollArea>
	);
}
