'use client';
import React from 'react';

import { useEffect, useState } from 'react';
import { api, Project } from '@/lib/api';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Github, Star, GitFork, Sparkles, FolderKanban, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ModuleError } from '@/components/ui/module-error';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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

const ProjectCard = React.memo(function ProjectCard({
	project,
	index,
	onClick,
}: {
	project: Project;
	index: number;
	onClick: () => void;
}) {
	return (
		<motion.div
			layout
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.2 }}
			whileHover={{ y: -5 }}
			onClick={onClick}
			className="group flex flex-col h-full bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 cursor-pointer"
		>
			{/* Thumbnail Section */}
			<div className="relative h-40 overflow-hidden bg-muted/10">
				<div>
					<Image
						src={`https://placehold.co/800x600/0f172a/38bdf8?text=${encodeURIComponent(
							project.title,
						)}`}
						className="w-full h-full object-cover"
						alt={project.title}
						fill
						sizes="(max-width: 768px) 100vw, 33vw"
						// Only prioritize the first 3 images (above fold likely)
						priority={index < 3}
						loading={index < 3 ? 'eager' : 'lazy'}
					/>
				</div>
				<div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/10 to-transparent" />
				<div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
					<h3 className="font-bold text-foreground group-hover:text-cyan-400 transition-colors truncate pr-2">
						{project.title}
					</h3>
					{project.status && (
						<span
							className={cn(
								'text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase',
								project.status === 'Completed'
									? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
									: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
							)}
						>
							{project.status === 'Completed' ? 'Done' : 'WIP'}
						</span>
					)}
				</div>
			</div>

			{/* Content Section */}
			<div className="p-4 flex flex-col flex-1">
				<p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
					{project.description}
				</p>

				<div className="mt-auto space-y-3">
					<div className="flex flex-wrap gap-1">
						{project.techStack.slice(0, 3).map(tech => (
							<span
								key={tech}
								className="px-1.5 py-0.5 text-[10px] bg-muted/30 border border-border/50 rounded font-medium text-muted-foreground"
							>
								{tech}
							</span>
						))}
						{project.techStack.length > 3 && (
							<span className="px-1.5 py-0.5 text-[10px] text-muted-foreground">
								+{project.techStack.length - 3}
							</span>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	);
});

export function ProjectsModule() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filter, setFilter] = useState('all');
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);

	useEffect(() => {
		api.getProjects()
			.then(data => setProjects(data))
			.catch(err => setError(err.message))
			.finally(() => setLoading(false));
	}, []);

	const filteredProjects = projects.filter(p => {
		if (filter === 'all') return true;
		if (filter === 'featured') return p.featured;
		if (filter === 'web')
			return p.techStack.some(t =>
				['React', 'Next.js', 'Node.js', 'Web'].some(k => t.includes(k)),
			);
		if (filter === 'ai')
			return p.techStack.some(t => ['Python', 'AI', 'ML', 'model'].some(k => t.includes(k)));
		return true;
	});

	const featuredProject = projects.find(p => p.featured);

	if (loading) {
		// ... (Keep existing skeleton logic or use a simplified one)
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
			<div className="p-6 space-y-8 max-w-7xl mx-auto pb-20">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/40 pb-4 gap-4">
					<div>
						<h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-blue-500">
							DEPLOYMENT REGISTRY
						</h1>
						<p className="text-sm text-muted-foreground tracking-wider uppercase font-mono mt-1">
							Project Archive & Live Systems
						</p>
					</div>

					{/* Filters */}
					<div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
						{['all', 'featured', 'web', 'ai'].map(f => (
							<button
								key={f}
								onClick={() => setFilter(f)}
								className={cn(
									'px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize whitespace-nowrap',
									filter === f
										? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
										: 'bg-muted/10 border-border/50 text-muted-foreground hover:bg-muted/20 hover:text-foreground',
								)}
							>
								{f}
							</button>
						))}
					</div>
				</div>

				{/* Featured Project (Only show on 'all' tab) */}
				{filter === 'all' && featuredProject && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="relative rounded-2xl overflow-hidden border border-cyan-500/30 group cursor-pointer"
						onClick={() => setSelectedProject(featuredProject)}
					>
						<div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						<div className="grid md:grid-cols-2 gap-6 p-6 md:p-8 bg-card/20 backdrop-blur-sm">
							<div className="space-y-4">
								<div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
									<Sparkles className="w-3 h-3" />
									<span>Featured Project</span>
								</div>
								<h2 className="text-3xl font-bold text-foreground group-hover:text-cyan-400 transition-colors">
									{featuredProject.title}
								</h2>
								<p className="text-muted-foreground leading-relaxed">
									{featuredProject.description}
								</p>
								<div className="flex flex-wrap gap-2 pt-2">
									{featuredProject.techStack.map(t => (
										<span
											key={t}
											className="px-2 py-1 rounded bg-background/50 border border-border/50 text-xs text-muted-foreground"
										>
											{t}
										</span>
									))}
								</div>
							</div>
							<div>
								<Image
									src={`https://placehold.co/800x600/0f172a/38bdf8?text=${encodeURIComponent(
										featuredProject.title,
									)}`}
									className="w-full h-full object-cover"
									alt={featuredProject.title}
									fill
									sizes="(max-width: 768px) 100vw, 50vw"
									priority
								/>
							</div>
						</div>
					</motion.div>
				)}

				{/* Projects Grid */}
				<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{filteredProjects
						.filter(p => filter !== 'all' || p.id !== featuredProject?.id)
						.map((project, index) => (
							<ProjectCard
								key={project.id}
								project={project}
								index={index}
								onClick={() => setSelectedProject(project)}
							/>
						))}
				</div>

				{/* Details Modal */}
				<Dialog
					open={!!selectedProject}
					onOpenChange={open => !open && setSelectedProject(null)}
				>
					<DialogContent className="max-w-2xl bg-[#0d1117]/95 backdrop-blur-xl border-white/10 p-0 overflow-hidden">
						{selectedProject && (
							<>
								<div className="relative h-48 bg-muted/20">
									<div>
										<Image
											src={`https://placehold.co/800x600/0f172a/38bdf8?text=${encodeURIComponent(
												selectedProject.title,
											)}`}
											className="w-full h-full object-cover"
											alt={selectedProject.title}
											fill
											sizes="(max-width: 768px) 100vw, 50vw"
											priority
										/>
									</div>
									<div className="absolute inset-0 bg-linear-to-t from-[#0d1117] to-transparent" />
									<div className="absolute bottom-4 left-6">
										<DialogTitle className="text-2xl font-bold text-white">
											{selectedProject.title}
										</DialogTitle>
									</div>
								</div>

								<div className="p-6 space-y-6">
									<div className="flex items-center gap-2 text-xs">
										<span
											className={cn(
												'px-2 py-1 rounded-full border',
												selectedProject.status === 'Completed'
													? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
													: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
											)}
										>
											{selectedProject.status}
										</span>
										<span className="text-muted-foreground px-2">•</span>
										<div className="flex items-center gap-1 text-yellow-400">
											<Star className="w-3 h-3 fill-current" />
											<span>{selectedProject.stars || 0}</span>
										</div>
										<div className="flex items-center gap-1 text-muted-foreground ml-2">
											<GitFork className="w-3 h-3" />
											<span>{selectedProject.forks || 0}</span>
										</div>
									</div>

									<DialogDescription className="text-muted-foreground leading-relaxed">
										{selectedProject.description}
									</DialogDescription>

									<div className="space-y-2">
										<h3 className="text-sm font-medium text-white">
											Technologes Used
										</h3>
										<div className="flex flex-wrap gap-2">
											{selectedProject.techStack.map(tech => (
												<span
													key={tech}
													className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-blue-200"
												>
													{tech}
												</span>
											))}
										</div>
									</div>

									<div className="flex gap-3 pt-2">
										{selectedProject.githubUrl && (
											<a
												href={selectedProject.githubUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium"
											>
												<Github className="w-4 h-4" />
												View Code
											</a>
										)}
										{selectedProject.liveUrl && (
											<a
												href={selectedProject.liveUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 transition-colors text-sm font-medium"
											>
												<ExternalLink className="w-4 h-4" />
												Live Demo
											</a>
										)}
									</div>
								</div>
							</>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</ScrollArea>
	);
}
