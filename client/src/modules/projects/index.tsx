'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	ExternalLink,
	Github,
	Folder,
	X,
	Briefcase,
	Sparkles,
	Code2,
	ArrowUpRight,
} from 'lucide-react';
import { useProjects } from '@/api';
import type { Project } from '@/api/schema';
import { SectionHeader } from '@/ui/SectionHeader';
import { Portal } from '@/ui/Portal';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, scaleIn, fadeIn } from '@/animations/motion';

function ProjectsSkeleton() {
	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
			<div className="h-6 w-32 bg-foreground/5 rounded-md" />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{[1, 2, 3, 4].map(i => (
					<div key={i} className="h-56 bg-foreground/5 rounded-2xl" />
				))}
			</div>
		</div>
	);
}

export function ProjectsModule() {
	const { projects, loading, error } = useProjects();
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [activeCategory, setActiveCategory] = useState<string>('all');

	// Extract unique categories dynamically based on techStack
	const categories = useMemo(() => {
		const cats = ['all'];
		const hasAI = projects.some(p =>
			p.techStack.some(t => ['ai', 'nlp', 'machine learning', 'llm', 'cnn', 'deep learning'].some(k => t.toLowerCase().includes(k)))
		);
		const hasFullStack = projects.some(p =>
			p.techStack.some(t => ['react', 'node', 'express', 'next', 'mongo'].some(k => t.toLowerCase().includes(k)))
		);
		const hasPython = projects.some(p =>
			p.techStack.some(t => t.toLowerCase().includes('python'))
		);

		if (hasAI) cats.push('AI & ML');
		if (hasFullStack) cats.push('Full-Stack');
		if (hasPython) cats.push('Python Systems');
		return cats;
	}, [projects]);

	// Filter projects dynamically
	const filteredProjects = useMemo(() => {
		if (activeCategory === 'all') return projects;
		if (activeCategory === 'AI & ML') {
			return projects.filter(p =>
				p.techStack.some(t => ['ai', 'nlp', 'machine learning', 'llm', 'cnn', 'deep learning', 'rag'].some(k => t.toLowerCase().includes(k)))
			);
		}
		if (activeCategory === 'Full-Stack') {
			return projects.filter(p =>
				p.techStack.some(t => ['react', 'node', 'express', 'next', 'mongo', 'tailwind'].some(k => t.toLowerCase().includes(k)))
			);
		}
		if (activeCategory === 'Python Systems') {
			return projects.filter(p =>
				p.techStack.some(t => t.toLowerCase().includes('python'))
			);
		}
		return projects;
	}, [projects, activeCategory]);

	if (loading) return <ProjectsSkeleton />;

	if (error && projects.length === 0) {
		return (
			<div className="text-center py-20 max-w-5xl mx-auto px-4">
				<p className="text-muted-foreground text-sm">Unable to load projects right now.</p>
			</div>
		);
	}

	return (
		<div className="w-full min-h-full pb-20 sm:pb-28">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6">
				{/* 02 · Section Header */}
				<SectionHeader
					icon={Briefcase}
					index="02"
					tag="PORTFOLIO"
					title="Featured Projects"
					description="Selected full-stack architectures, AI pipelines, and software systems."
					sectionId="projects"
				/>

				{/* Filter Row */}
				<div className="flex flex-wrap items-center justify-between gap-3 mt-6 mb-8 border-b border-border/25 pb-4">
					<div className="flex flex-wrap items-center gap-1.5">
						{categories.map(cat => (
							<button
								key={cat}
								onClick={() => setActiveCategory(cat)}
								className={cn(
									'px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer select-none',
									activeCategory === cat
										? 'bg-primary/20 text-primary font-semibold border border-primary/30'
										: 'text-muted-foreground/70 hover:text-foreground hover:bg-foreground/5'
								)}
							>
								{cat === 'all' ? `All (${projects.length})` : cat}
							</button>
						))}
					</div>

					<span className="text-xs font-mono text-muted-foreground/60 hidden sm:inline">
						{filteredProjects.length} {filteredProjects.length === 1 ? 'system' : 'systems'} deployed
					</span>
				</div>

				{/* Projects Grid (Clean & Spacious 2-Column Minimalist Cards) */}
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6"
				>
					{filteredProjects.map((project, idx) => (
						<motion.div
							key={project.id || idx}
							variants={staggerItem}
							className="h-full"
						>
							<div
								onClick={() => setSelectedProject(project)}
								className="group h-full flex flex-col justify-between rounded-2xl border border-border/40 bg-card/25 backdrop-blur-xl p-6 sm:p-7 hover:border-border/80 transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md"
							>
								<div>
									{/* Top Bar: Order & Links */}
									<div className="flex items-center justify-between gap-2 mb-4">
										<div className="flex items-center gap-2">
											<span className="font-mono text-xs text-primary/80 font-medium">
												// 0{idx + 1}
											</span>
											<span className="text-border/60">·</span>
											<span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/60">
												{project.status || 'Production'}
											</span>
										</div>

										{/* External Links */}
										<div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
											{project.githubUrl && (
												<a
													href={project.githubUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="p-1.5 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-surface-2 transition-colors"
													title="Source Code"
												>
													<Github className="w-4 h-4" />
												</a>
											)}
											{project.liveUrl && (
												<a
													href={project.liveUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="p-1.5 rounded-lg text-primary/80 hover:text-primary hover:bg-primary/10 transition-colors"
													title="Live Preview"
												>
													<ArrowUpRight className="w-4 h-4" />
												</a>
											)}
										</div>
									</div>

									{/* Title */}
									<h3 className="text-lg sm:text-xl font-medium tracking-tight text-foreground/95 group-hover:text-primary transition-colors font-sans mb-2.5">
										{project.title.trim()}
									</h3>

									{/* Description */}
									<p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed font-sans line-clamp-3 mb-6">
										{project.description}
									</p>
								</div>

								{/* Bottom: Tech Stack Pills */}
								<div className="pt-4 border-t border-border/20 flex flex-wrap gap-1.5">
									{(project.techStack ?? []).map(tech => (
										<span
											key={tech}
											className="px-2 py-0.5 rounded-md bg-surface-2/50 border border-border/30 text-[11px] font-mono text-muted-foreground/85"
										>
											{tech}
										</span>
									))}
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>

			{/* Detail Modal (Clean & Minimalist Inspection) */}
			<Portal>
				<AnimatePresence>
					{selectedProject && (
						<motion.div
							variants={fadeIn}
							initial="hidden"
							animate="visible"
							exit="hidden"
							className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
							onClick={() => setSelectedProject(null)}
						>
							<motion.div
								variants={scaleIn}
								initial="hidden"
								animate="visible"
								exit="hidden"
								className="relative w-full max-w-2xl rounded-2xl border border-border/60 bg-surface-1 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto"
								onClick={e => e.stopPropagation()}
							>
								{/* Modal Header */}
								<div className="flex items-start justify-between gap-4 border-b border-border/30 pb-4">
									<div>
										<span className="font-mono text-xs text-primary uppercase tracking-wider">
											Project Specifications
										</span>
										<h2 className="text-2xl font-medium text-foreground tracking-tight mt-1">
											{selectedProject.title.trim()}
										</h2>
									</div>

									<button
										onClick={() => setSelectedProject(null)}
										className="p-1.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
									>
										<X className="w-4 h-4" />
									</button>
								</div>

								{/* Description */}
								<div className="space-y-3">
									<h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
										Overview
									</h4>
									<p className="text-sm text-foreground/85 leading-relaxed font-sans whitespace-pre-line">
										{selectedProject.description}
									</p>
								</div>

								{/* Tech Stack */}
								<div className="space-y-2.5">
									<h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
										Technology Architecture
									</h4>
									<div className="flex flex-wrap gap-1.5">
										{selectedProject.techStack.map(t => (
											<span
												key={t}
												className="px-2.5 py-1 rounded-md bg-surface-2 border border-border/40 text-xs font-mono text-foreground/80"
											>
												{t}
											</span>
										))}
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex items-center gap-3 pt-4 border-t border-border/30">
									{selectedProject.liveUrl && (
										<a
											href={selectedProject.liveUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-medium hover:opacity-90 transition-opacity"
										>
											<span>Open Deployment</span>
											<ArrowUpRight className="w-3.5 h-3.5" />
										</a>
									)}
									{selectedProject.githubUrl && (
										<a
											href={selectedProject.githubUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-border/50 text-foreground font-mono text-xs font-medium hover:bg-surface-3 transition-colors"
										>
											<Github className="w-3.5 h-3.5" />
											<span>Repository</span>
										</a>
									)}
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</Portal>
		</div>
	);
}