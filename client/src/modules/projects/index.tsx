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
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, scaleIn, fadeIn, cardHover } from '@/animations/motion';

// ─── Skeleton ───────────────────────────────────────────────────

function ProjectsSkeleton() {
	return (
		<div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto animate-pulse pb-16">
			<div className="space-y-3 mb-8">
				<div className="h-5 w-28 bg-foreground/5 rounded-lg" />
				<div className="h-8 w-56 bg-foreground/5 rounded-xl" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
			<div className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto pb-10 sm:pb-14 pt-6 md:pt-8">
				<SectionHeader
					icon={Briefcase}
					label="Portfolio"
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
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6"
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
									className="group cursor-pointer h-full flex flex-col bg-linear-to-br from-foreground/5 to-transparent backdrop-blur-sm border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-(--theme-primary)/40 relative shadow-lg"
									onClick={() => setSelectedProject(project)}
								>
									<div className="absolute inset-0 bg-linear-to-br from-transparent to-transparent group-hover:from-(--theme-primary)/8 transition-colors duration-300 pointer-events-none" />

									{/* Thumbnail */}
									<div className="relative aspect-video overflow-hidden">
										<UrlThumbnail url={project.thumbnail || project.liveUrl} title={project.title} fallbackIcon={Folder} />
										<div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-card to-transparent pointer-events-none" />
									</div>

									{/* Content */}
									<div className="p-3 flex flex-col grow relative z-10">
										<div className="flex flex-wrap gap-1.5 mb-2">
											{(project.techStack ?? []).slice(0, 3).map(tech => (
												<span
													key={tech}
													className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md bg-card border border-border text-muted-foreground group-hover:border-(--theme-primary)/30 group-hover:bg-(--theme-primary)/10 group-hover:text-(--theme-primary) transition-colors"
												>
													{tech}
												</span>
											))}
											{(project.techStack ?? []).length > 3 && (
												<span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md bg-card border border-border text-muted-foreground">
													+{(project.techStack ?? []).length - 3}
												</span>
											)}
										</div>

										<h3 className="text-sm font-black text-foreground tracking-tight leading-tight mb-1 group-hover:text-(--theme-primary) transition-colors line-clamp-2">
											{project.title}
										</h3>

										<p className="text-[10px] text-muted-foreground line-clamp-2 leading-snug font-medium mb-3">
											{project.description}
										</p>

										{/* Footer */}
										<div className="flex items-center gap-2 mt-auto pt-2.5 border-t border-border">
											{project.liveUrl && (
												<button
													className="flex items-center justify-center flex-1 gap-1.5 py-1.5 rounded-lg bg-foreground/5 hover:bg-(--theme-primary)/10 border border-border hover:border-(--theme-primary)/30 text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-(--theme-primary) transition-colors"
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
								</motion.div>
							))}
						</AnimatePresence>
					</motion.div>
				)}

				{/* Detail Modal */}
				<AnimatePresence>
					{selectedProject && (
						<ProjectDetailModal
							project={selectedProject}
							onClose={() => setSelectedProject(null)}
						/>
					)}
				</AnimatePresence>
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
		<div className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-4 md:p-8">
			{/* Backdrop — fixed, never scrolls */}
			<motion.div
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				exit="hidden"
				onClick={onClose}
				className="absolute inset-0 backdrop-blur-2xl"
				style={{ background: 'color-mix(in oklch, color-mix(in oklch, var(--background) 88%, var(--theme-primary)) 75%, transparent)' }}
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
					'bg-card backdrop-blur-xl',
					'border-0 sm:border sm:border-border sm:rounded-2xl',
					'shadow-2xl',
				)}
				style={{ boxShadow: '0 0 80px -20px color-mix(in oklch, var(--theme-primary) 15%, transparent)' }}
			>
				{/* Sticky Header */}
				<div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card backdrop-blur-md shrink-0">
					<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
						<Folder className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
						<span>Project Details</span>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-full bg-muted hover:bg-accent border border-border text-muted-foreground hover:text-foreground transition-all hover:rotate-90 hover:scale-110"
						aria-label="Close modal"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Scrollable Body — native scroll, backdrop stays fixed */}
				<div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
					{/* Clean Image */}
					<div className="relative w-full bg-muted overflow-hidden" style={{ maxHeight: '40vh' }}>
						<div className="relative w-full aspect-video">
							<UrlThumbnail url={project.thumbnail || project.liveUrl} title={project.title} fallbackIcon={Folder} />
						</div>
					</div>

					{/* Content */}
					<div className="p-5 sm:p-8 space-y-6 pb-10">
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
