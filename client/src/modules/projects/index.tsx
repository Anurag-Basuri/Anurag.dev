'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Layers,
	ExternalLink,
	Github,
	Folder,
	Layout,
	X,
	Briefcase,
} from 'lucide-react';
import { publicService } from '@/api';
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
		<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto animate-pulse pb-12 pt-6">
			<div className="space-y-3 mb-8">
				<div className="h-5 w-28 bg-foreground/5 rounded-lg" />
				<div className="h-8 w-56 bg-foreground/5 rounded-xl" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6">
				{[1, 2, 3, 4, 5, 6].map(i => (
					<div key={i} className="h-52 bg-foreground/5 rounded-xl" />
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
		let cancelled = false;
		async function fetchProjects() {
			try {
				const { data } = await publicService.getProjects();
				if (!cancelled) setProjects(data || []);
			} catch (err: unknown) {
				if (!cancelled) setError('Failed to load projects');
				console.error(err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		fetchProjects();
		return () => {
			cancelled = true;
		};
	}, []);

	if (loading) return <ProjectsSkeleton />;
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-32 text-center max-w-7xl mx-auto">
				<div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-6">
					<Layers className="w-8 h-8 text-rose-400" />
				</div>
				<p className="text-xl font-bold text-foreground mb-2 tracking-tight">Failed to load projects</p>
				<p className="text-xs text-muted-foreground leading-snug mb-8 max-w-sm">{error}</p>
				<button
					onClick={() => window.location.reload()}
					className="px-6 py-3 rounded-xl bg-foreground/5 border border-border text-xs font-bold uppercase tracking-wider text-foreground hover:bg-foreground/10 transition-all active:scale-95"
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="h-full w-full">
			<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto pb-8 sm:pb-12 pt-2 md:pt-3">
				<SectionHeader
					icon={Briefcase}
					title="Projects & Work"
					description="A collection of my recent work, open-source projects, and technical experiments."
					sectionId="projects"
				/>

				{projects.length === 0 && !loading ? (
					<div className="text-center py-16 mt-8 text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50">
						No projects found.
					</div>
				) : (
					<motion.div
						layout
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-40px' }}
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5 mt-4"
					>
						<AnimatePresence mode="popLayout">
							{projects.map((project, index) => (
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
										beam={index === 0}
										onClick={() => setSelectedProject(project)}
										className="group cursor-pointer h-full flex flex-col border border-border/80 hover:border-[var(--theme-primary)]/50 transition-all duration-300 shadow-md hover:shadow-xl"
									>
										{/* Thumbnail */}
										<div className="relative aspect-video overflow-hidden">
											<UrlThumbnail url={project.thumbnail || project.liveUrl} title={project.title} fallbackIcon={Folder} />
											<div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-card to-transparent pointer-events-none" />
										</div>

										{/* Content */}
										<div className="p-3.5 flex flex-col grow relative z-10">
											<div className="flex flex-wrap gap-1.5 mb-2">
												{(project.techStack ?? []).slice(0, 3).map(tech => (
													<span
														key={tech}
														className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md bg-foreground/5 border border-border/70 text-muted-foreground group-hover:border-[var(--theme-primary)]/30 group-hover:bg-[var(--theme-primary)]/10 group-hover:text-[var(--theme-primary)] transition-colors"
													>
														{tech}
													</span>
												))}
												{(project.techStack ?? []).length > 3 && (
													<span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md bg-foreground/5 border border-border/70 text-muted-foreground">
														+{(project.techStack ?? []).length - 3}
													</span>
												)}
											</div>

											<h3 className="text-sm sm:text-base font-black text-foreground tracking-tight leading-tight mb-1 group-hover:text-[var(--theme-primary)] transition-colors line-clamp-2">
												{project.title}
											</h3>

											<p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-medium mb-3">
												{project.description}
											</p>

											{/* Footer */}
											<div className="flex items-center gap-2 mt-auto pt-2.5 border-t border-border/60">
												{project.liveUrl && (
													<button
														className="flex items-center justify-center flex-1 gap-1.5 py-1.5 rounded-lg bg-foreground/5 hover:bg-[var(--theme-primary)]/15 border border-border hover:border-[var(--theme-primary)]/40 text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-[var(--theme-primary)] transition-all"
														onClick={(e) => { e.stopPropagation(); window.open(project.liveUrl, '_blank'); }}
													>
														<ExternalLink className="w-3 h-3" />
														Open
													</button>
												)}
												{project.githubUrl && (
													<button
														className="flex items-center justify-center flex-1 gap-1.5 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border hover:border-foreground/20 text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
														onClick={(e) => { e.stopPropagation(); window.open(project.githubUrl, '_blank'); }}
													>
														<Github className="w-3 h-3" />
														Source
													</button>
												)}
											</div>
										</div>
									</SpotlightCard>
								</motion.div>
							))}
						</AnimatePresence>
					</motion.div>
				)}

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

// ─── Project Detail Modal ───────────────────────────────────────

function ProjectDetailModal({
	project,
	onClose,
}: {
	project: Project;
	onClose: () => void;
}) {
	// Body scroll lock
	useEffect(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => { document.body.style.overflow = prev; };
	}, []);

	// Escape to close
	useEffect(() => {
		const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [onClose]);

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-3 md:p-6">
			{/* Backdrop */}
			<motion.div
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				exit="hidden"
				onClick={onClose}
				className="absolute inset-0 backdrop-blur-xl"
				style={{ background: 'color-mix(in oklch, var(--background) 95%, var(--theme-primary))' }}
			/>

			{/* Modal */}
			<motion.div
				variants={scaleIn}
				initial="hidden"
				animate="visible"
				exit="hidden"
				className={cn(
					'relative z-10 flex flex-col overflow-hidden',
					'w-full h-full sm:h-auto sm:max-h-[90vh] max-w-3xl',
					'bg-card/90 backdrop-blur-2xl',
					'border-0 sm:border sm:border-border sm:rounded-2xl',
					'shadow-2xl',
				)}
				style={{ boxShadow: '0 0 80px -20px color-mix(in oklch, var(--theme-primary) 15%, transparent)' }}
			>
				{/* Sticky Header */}
				<div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-border bg-card/60 backdrop-blur-xl shrink-0">
					<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
						<Folder className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
						<span>Project Details</span>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 rounded-full bg-muted hover:bg-accent border border-border text-muted-foreground hover:text-foreground transition-all hover:rotate-90 hover:scale-110"
						aria-label="Close modal"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Scrollable Body */}
				<div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
					{/* Clean Image */}
					<div className="relative w-full bg-muted overflow-hidden" style={{ maxHeight: '40vh' }}>
						<div className="relative w-full aspect-video">
							<UrlThumbnail url={project.thumbnail || project.liveUrl} title={project.title} fallbackIcon={Folder} />
						</div>
					</div>

					{/* Content */}
					<div className="p-4 sm:p-6 space-y-5 pb-8">
						<h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight leading-tight">
							{project.title}
						</h2>

						<div className="space-y-3">
							<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--theme-primary)' }}>
								<Layout className="w-3.5 h-3.5" />
								<span>About</span>
							</div>
							<p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">
								{project.description}
							</p>
						</div>

						{(project.techStack ?? []).length > 0 && (
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--theme-primary)' }}>
									<Layers className="w-3.5 h-3.5" />
									<span>Technologies</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{(project.techStack ?? []).map(tech => (
										<span key={tech} className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-bold text-foreground/80 hover:bg-accent transition-colors">
											{tech}
										</span>
									))}
								</div>
							</div>
						)}

						<div className="flex flex-wrap gap-3 pt-4 border-t border-border">
							{project.liveUrl && (
								<a
									href={project.liveUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex-1 sm:flex-none hover:scale-[1.02] active:scale-[0.98]"
									style={{
										background: 'color-mix(in oklch, var(--theme-primary) 12%, transparent)',
										color: 'var(--theme-primary)',
										border: '1px solid color-mix(in oklch, var(--theme-primary) 25%, transparent)',
									}}
								>
									<ExternalLink className="w-4 h-4" />
									Visit Site
								</a>
							)}
							{project.githubUrl && (
								<a
									href={project.githubUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center gap-2 px-5 py-2.5 bg-muted hover:bg-accent text-foreground border border-border text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex-1 sm:flex-none hover:scale-[1.02] active:scale-[0.98]"
								>
									<Github className="w-4 h-4" />
									Source Code
								</a>
							)}
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
}