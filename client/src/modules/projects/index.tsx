'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Layers,
	ExternalLink,
	Github,
	Folder,
	Layout,
	X,
	Briefcase,
	Sparkles,
	Terminal,
	Code2,
	ChevronRight,
	Cpu,
	CheckCircle2,
} from 'lucide-react';
import { useAtom } from 'jotai';
import { useProjects, activeSkillFilterAtom } from '@/api';
import type { Project } from '@/api/schema';
import { SectionHeader } from '@/ui/SectionHeader';
import { UrlThumbnail } from '@/ui/UrlThumbnail';
import { Portal } from '@/ui/Portal';
import { SpotlightCard } from '@/ui/SpotlightCard';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, scaleIn, fadeIn } from '@/animations/motion';

// ─── Skeleton ───────────────────────────────────────────────────
function ProjectsSkeleton() {
	return (
		<div className="px-3 sm:px-6 md:px-8 max-w-7xl mx-auto animate-pulse pb-12 pt-4">
			<div className="space-y-3 mb-6">
				<div className="h-5 w-28 bg-foreground/5 rounded-lg" />
				<div className="h-8 w-56 bg-foreground/5 rounded-xl" />
			</div>
			<div className="h-80 w-full bg-foreground/5 rounded-2xl mb-6" />
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
				{[1, 2, 3].map(i => (
					<div key={i} className="h-60 bg-foreground/5 rounded-xl" />
				))}
			</div>
		</div>
	);
}

// ─── Filter Categories ──────────────────────────────────────────
const CATEGORIES = [
	{ id: 'all', label: 'All Projects' },
	{ id: 'fullstack', label: 'Full-Stack' },
	{ id: 'ai', label: 'AI & Systems' },
	{ id: 'web', label: 'Frontend & UI' },
];

export function ProjectsModule() {
	const { projects, loading, error } = useProjects();
	const [activeSkillFilter, setActiveSkillFilter] = useAtom(activeSkillFilterAtom);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [activeCategory, setActiveCategory] = useState('all');

	// Flagship Project is the first project (or pinned)
	const heroProject = useMemo(() => {
		if (projects.length === 0) return null;
		return projects[0];
	}, [projects]);

	// Secondary projects
	const secondaryProjects = useMemo(() => {
		if (projects.length <= 1) return [];
		let list = projects.slice(1);

		if (activeCategory === 'fullstack') {
			list = list.filter(p =>
				p.techStack.some(t => ['node', 'postgres', 'express', 'next'].some(k => t.toLowerCase().includes(k)))
			);
		} else if (activeCategory === 'ai') {
			list = list.filter(p =>
				p.techStack.some(t => ['ai', 'langchain', 'python', 'openai', 'llm'].some(k => t.toLowerCase().includes(k)))
			);
		} else if (activeCategory === 'web') {
			list = list.filter(p =>
				p.techStack.some(t => ['react', 'tailwind', 'framer', 'css'].some(k => t.toLowerCase().includes(k)))
			);
		}

		return list;
	}, [projects, activeCategory]);

	if (loading) return <ProjectsSkeleton />;

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-24 text-center max-w-7xl mx-auto px-4">
				<div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-4">
					<Layers className="w-8 h-8 text-rose-400" />
				</div>
				<p className="text-lg font-bold text-foreground mb-1">Failed to load projects</p>
				<p className="text-xs text-muted-foreground mb-6 max-w-sm">{error}</p>
				<button
					onClick={() => window.location.reload()}
					className="px-5 py-2 rounded-xl bg-foreground/5 border border-border text-xs font-bold uppercase tracking-wider text-foreground hover:bg-foreground/10 transition-all"
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="h-full w-full pb-16">
			<div className="px-3 sm:px-6 md:px-8 max-w-7xl mx-auto pt-2 sm:pt-4">
				<SectionHeader
					icon={Briefcase}
					index="02"
					tag="SYSTEMS"
					title="Projects & Architectures"
					description="A curated showcase of full-stack platforms, autonomous agent systems, and technical experiments."
					sectionId="projects"
				/>

				{/* ══════════════════════════════════════════════════════════════════
				    ACTIVE SKILL FILTER BANNER (Cross-linked from Tech Radar)
				    ══════════════════════════════════════════════════════════════════ */}
				{activeSkillFilter && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-between"
					>
						<div className="flex items-center gap-2 text-xs font-mono text-foreground">
							<Terminal className="w-3.5 h-3.5 text-primary" />
							<span>
								Filtering projects using: <strong className="text-primary">{activeSkillFilter}</strong>
							</span>
						</div>
						<button
							onClick={() => setActiveSkillFilter(null)}
							className="text-[11px] font-mono text-muted-foreground hover:text-foreground underline transition-colors"
						>
							Clear filter
						</button>
					</motion.div>
				)}

				{/* ══════════════════════════════════════════════════════════════════
				    FLAGSHIP HERO PROJECT CARD (Full Width Architectural Showcase)
				    ══════════════════════════════════════════════════════════════════ */}
				{heroProject && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						className="mb-6 sm:mb-8"
					>
						<SpotlightCard
							tilt={false}
							className="rounded-2xl border border-border/40 hover:border-border/70 bg-card/30 backdrop-blur-xl overflow-hidden transition-all shadow-sm group"
						>
							<div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
								{/* Left: Device Mockup Frame / Thumbnail */}
								<div className="lg:col-span-7 relative bg-surface-2/40 border-b lg:border-b-0 lg:border-r border-border/40 flex flex-col justify-between overflow-hidden">
									{/* Architectural Blueprint Header Bar (Matches Overview Stage Card) */}
									<div className="px-4 py-2.5 border-b border-border/40 bg-background/30 flex items-center justify-between text-xs font-mono text-muted-foreground select-none">
										<div className="flex items-center gap-2">
											<span className="text-primary font-bold">// 01</span>
											<span className="text-muted-foreground/80 tracking-wider uppercase">FLAGSHIP ARCHITECTURE</span>
											<span className="text-border/60">·</span>
											<span className="text-muted-foreground/60 hidden sm:inline">{heroProject.title.toUpperCase()}</span>
										</div>
										<span className="text-[10px] font-mono uppercase text-primary/80 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
											Production System
										</span>
									</div>

									{/* Thumbnail / Preview Canvas */}
									<div className="relative aspect-video sm:aspect-16/10 lg:aspect-auto lg:h-full min-h-[220px] sm:min-h-[280px] overflow-hidden group-hover:scale-[1.01] transition-transform duration-500">
										<UrlThumbnail
											url={heroProject.thumbnail || heroProject.liveUrl}
											title={heroProject.title}
											fallbackIcon={Folder}
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none" />
									</div>

									{/* Quick Action Strip on Bottom of Preview */}
									<div className="p-3 bg-background/50 border-t border-border/40 flex items-center justify-between gap-2">
										<span className="text-[11px] font-mono text-muted-foreground">Production Verified</span>
										<div className="flex items-center gap-2">
											{heroProject.liveUrl && (
												<a
													href={heroProject.liveUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-medium hover:opacity-90 transition-opacity"
												>
													<span>Live Demo</span>
													<ExternalLink className="w-3 h-3" />
												</a>
											)}
											{heroProject.githubUrl && (
												<a
													href={heroProject.githubUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border text-foreground font-mono text-xs font-medium transition-colors"
												>
													<Github className="w-3 h-3" />
													<span>Source</span>
												</a>
											)}
										</div>
									</div>
								</div>

								{/* Right: Architectural Narrative */}
								<div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between space-y-4">
									<div>
										<div className="flex items-center gap-2 mb-2 text-xs font-mono text-primary font-medium uppercase tracking-wider">
											<Sparkles className="w-3.5 h-3.5" />
											<span>Featured Architecture</span>
										</div>

										<h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight font-sans mb-2">
											{heroProject.title}
										</h3>

										<p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-sans mb-4">
											{heroProject.description}
										</p>

										{/* Problem -> Architecture -> Impact Formula */}
										<div className="space-y-2.5 border-t border-border/40 pt-3">
											<div className="flex items-start gap-2">
												<span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 mt-0.5">
													Focus
												</span>
												<span className="text-xs text-muted-foreground leading-snug">
													High-concurrency streaming & client state orchestration with zero-flicker resilience.
												</span>
											</div>
											<div className="flex items-start gap-2">
												<span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
													Impact
												</span>
												<span className="text-xs text-muted-foreground leading-snug">
													Sub-50ms latency, persistent local session memory, and unified data caching.
												</span>
											</div>
										</div>
									</div>

									{/* Tech Stack Pills */}
									<div>
										<div className="flex flex-wrap gap-1.5 mb-4">
											{heroProject.techStack.map(tech => (
												<span
													key={tech}
													className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-surface-2 border border-border/60 text-foreground/80"
												>
													{tech}
												</span>
											))}
										</div>

										<button
											onClick={() => setSelectedProject(heroProject)}
											className="w-full py-2.5 px-4 rounded-xl bg-surface-2 hover:bg-foreground/10 border border-border/70 text-foreground font-mono text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
										>
											<Code2 className="w-3.5 h-3.5 text-primary" />
											<span>Inspect Architecture & Specifications</span>
											<ChevronRight className="w-3 h-3 text-muted-foreground" />
										</button>
									</div>
								</div>
							</div>
						</SpotlightCard>
					</motion.div>
				)}

				{/* ══════════════════════════════════════════════════════════════════
				    CATEGORY FILTER TABS & COUNT
				    ══════════════════════════════════════════════════════════════════ */}
				<div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-border/30 pb-3">
					<div className="flex items-center gap-1.5">
						{CATEGORIES.map(cat => (
							<button
								key={cat.id}
								onClick={() => setActiveCategory(cat.id)}
								className={cn(
									'px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer select-none border',
									activeCategory === cat.id
										? 'bg-primary/15 border-primary/30 text-primary font-semibold shadow-xs'
										: 'text-muted-foreground/75 border-transparent hover:text-foreground hover:bg-foreground/5',
								)}
							>
								{cat.label}
							</button>
						))}
					</div>
					<span className="text-[11px] font-mono text-muted-foreground/70">
						Showing {secondaryProjects.length + (heroProject ? 1 : 0)} systems
					</span>
				</div>

				{/* ══════════════════════════════════════════════════════════════════
				    SECONDARY CURATED PROJECT GRID (Asymmetrical & Responsive)
				    ══════════════════════════════════════════════════════════════════ */}
				<motion.div
					layout
					variants={staggerContainer}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: '-40px' }}
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4"
				>
					<AnimatePresence mode="popLayout">
						{secondaryProjects.map(project => {
							const hasActiveSkill =
								activeSkillFilter &&
								project.techStack.some(
									t => t.toLowerCase() === activeSkillFilter.toLowerCase()
								);

							return (
								<motion.div
									layout
									key={project.id}
									variants={staggerItem}
									initial="hidden"
									animate="visible"
									exit="hidden"
									className="h-full flex flex-col"
								>
									<SpotlightCard
										tilt={true}
										onClick={() => setSelectedProject(project)}
										className={cn(
											'group cursor-pointer h-full flex flex-col border rounded-2xl bg-card/30 backdrop-blur-xl transition-all duration-300 shadow-xs hover:shadow-md',
											hasActiveSkill
												? 'border-primary ring-1 ring-primary/30 shadow-[0_0_16px_rgba(52,211,153,0.15)]'
												: 'border-border/40 hover:border-border/70',
										)}
									>
										{/* Active Filter Pill */}
										{hasActiveSkill && (
											<div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary font-mono text-[10px] font-semibold shadow-xs">
												Matched: {activeSkillFilter}
											</div>
										)}

										{/* Thumbnail */}
										<div className="relative aspect-video overflow-hidden bg-surface-2/40">
											<UrlThumbnail
												url={project.thumbnail || project.liveUrl}
												title={project.title}
												fallbackIcon={Folder}
											/>
											<div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />
										</div>

										{/* Content */}
										<div className="p-4 flex flex-col grow relative z-10">
											<div className="flex flex-wrap gap-1.5 mb-2.5">
												{(project.techStack ?? []).slice(0, 3).map(tech => (
													<span
														key={tech}
														className={cn(
															'px-2 py-0.5 text-[11px] font-mono rounded-md border transition-colors',
															activeSkillFilter &&
																tech.toLowerCase() === activeSkillFilter.toLowerCase()
																? 'bg-primary/20 border-primary text-primary font-bold'
																: 'bg-surface-2 border-border/50 text-muted-foreground',
														)}
													>
														{tech}
													</span>
												))}
												{(project.techStack ?? []).length > 3 && (
													<span className="px-1.5 py-0.5 text-[10px] font-mono rounded-md bg-surface-2 text-muted-foreground">
														+{(project.techStack ?? []).length - 3}
													</span>
												)}
											</div>

											<h3 className="text-base font-semibold text-foreground tracking-tight leading-snug mb-1.5 group-hover:text-primary transition-colors font-sans">
												{project.title}
											</h3>

											<p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal mb-4 font-sans">
												{project.description}
											</p>

											{/* Footer Buttons */}
											<div className="flex items-center gap-2 mt-auto pt-3 border-t border-border/40">
												{project.liveUrl && (
													<button
														className="flex items-center justify-center flex-1 gap-1.5 py-1.5 rounded-lg bg-surface-2 hover:bg-primary/10 border border-border/50 hover:border-primary/30 text-xs font-mono font-medium text-foreground hover:text-primary transition-all cursor-pointer"
														onClick={e => {
															e.stopPropagation();
															window.open(project.liveUrl!, '_blank');
														}}
													>
														<ExternalLink className="w-3 h-3" />
														Demo
													</button>
												)}
												{project.githubUrl && (
													<button
														className="flex items-center justify-center flex-1 gap-1.5 py-1.5 rounded-lg bg-surface-2 hover:bg-foreground/10 border border-border/50 text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
														onClick={e => {
															e.stopPropagation();
															window.open(project.githubUrl!, '_blank');
														}}
													>
														<Github className="w-3 h-3" />
														Source
													</button>
												)}
											</div>
										</div>
									</SpotlightCard>
								</motion.div>
							);
						})}
					</AnimatePresence>
				</motion.div>

				{/* Detail Modal */}
				<Portal>
					<AnimatePresence>
						{selectedProject && (
							<ProjectDetailModal
								project={selectedProject}
								onClose={() => setSelectedProject(null)}
							/>
						)}
					</AnimatePresence>
				</Portal>
			</div>
		</div>
	);
}

// ─── Project Detail Modal / Drawer ──────────────────────────────
function ProjectDetailModal({
	project,
	onClose,
}: {
	project: Project;
	onClose: () => void;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
			{/* Backdrop */}
			<motion.div
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				exit="hidden"
				onClick={onClose}
				className="absolute inset-0 bg-black/80 backdrop-blur-md"
			/>

			{/* Modal Container */}
			<motion.div
				variants={scaleIn}
				initial="hidden"
				animate="visible"
				exit="hidden"
				className={cn(
					'relative z-10 flex flex-col overflow-hidden',
					'w-full max-h-[90vh] max-w-3xl',
					'bg-card/95 backdrop-blur-2xl',
					'border border-border/80 rounded-2xl shadow-2xl',
				)}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-surface-1 shrink-0">
					<div className="flex items-center gap-2 text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
						<Folder className="w-3.5 h-3.5 text-primary" />
						<span>Project Architecture & Specifications</span>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 rounded-lg bg-surface-2 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
						aria-label="Close modal"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Scrollable Body */}
				<div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7 space-y-6">
					<div>
						<h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-sans mb-2">
							{project.title}
						</h2>
						<p className="text-sm sm:text-base text-foreground/80 leading-relaxed font-sans">
							{project.description}
						</p>
					</div>

					{/* System Highlights */}
					<div className="p-4 rounded-xl bg-surface-2/60 border border-border/50 space-y-3">
						<div className="flex items-center gap-2 text-xs font-mono font-medium uppercase tracking-wider text-primary">
							<Cpu className="w-4 h-4" />
							<span>System Architecture Highlights</span>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-foreground/85">
							<div className="flex items-start gap-2">
								<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
								<span>Modular service architecture with fallback resilience</span>
							</div>
							<div className="flex items-start gap-2">
								<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
								<span>Optimized for low-latency state synchronization</span>
							</div>
							<div className="flex items-start gap-2">
								<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
								<span>Dual-font typography & accessible color contrast</span>
							</div>
							<div className="flex items-start gap-2">
								<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
								<span>Zero runtime layout shifts & static page pre-generation</span>
							</div>
						</div>
					</div>

					{/* Tech Stack */}
					{project.techStack.length > 0 && (
						<div>
							<h4 className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground mb-2.5">
								Technologies Validated
							</h4>
							<div className="flex flex-wrap gap-2">
								{project.techStack.map(tech => (
									<span
										key={tech}
										className="px-3 py-1 rounded-lg bg-surface-2 border border-border/60 text-xs font-mono font-medium text-foreground"
									>
										{tech}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex flex-wrap gap-3 pt-4 border-t border-border/50">
						{project.liveUrl && (
							<a
								href={project.liveUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-medium uppercase tracking-wider hover:opacity-90 transition-opacity"
							>
								<ExternalLink className="w-4 h-4" />
								Launch Live App
							</a>
						)}
						{project.githubUrl && (
							<a
								href={project.githubUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground hover:bg-foreground/10 text-xs font-mono font-medium uppercase tracking-wider transition-colors"
							>
								<Github className="w-4 h-4" />
								View Source Code
							</a>
						)}
					</div>
				</div>
			</motion.div>
		</div>
	);
}