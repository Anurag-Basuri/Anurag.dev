'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Briefcase,
	Building2,
	MapPin,
	Calendar,
	ExternalLink,
	Sparkles,
	FileText,
	ArrowUpRight,
	X,
} from 'lucide-react';
import type { JourneyEntry } from '@/api/schema';
import { SectionHeader } from '@/ui/SectionHeader';
import { Portal } from '@/ui/Portal';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, scaleIn, fadeIn } from '@/animations/motion';
import { useJourney } from '@/hooks/useJourney';

function cleanSkills(skills: string[] | undefined | null): string[] {
	return (skills ?? []).filter(s => s.trim().length > 0);
}

function formatDateRange(job: JourneyEntry): string {
	if (job.startDate) {
		const start = new Date(job.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
		const end = job.isCurrent
			? 'Present'
			: job.endDate
				? new Date(job.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
				: '';
		return end ? `${start} — ${end}` : start;
	}
	return job.date;
}

function formatLabel(raw: string): string {
	return raw
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, c => c.toUpperCase());
}

function ExperienceSkeleton() {
	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
			<div className="h-6 w-32 bg-foreground/5 rounded-md" />
			<div className="space-y-4">
				{[1, 2].map(i => (
					<div key={i} className="h-44 bg-foreground/5 rounded-2xl" />
				))}
			</div>
		</div>
	);
}

export function ExperienceModule() {
	const { entries: workEntries, loading } = useJourney('WORK');
	const [selectedJob, setSelectedJob] = useState<JourneyEntry | null>(null);

	if (loading && workEntries.length === 0) return <ExperienceSkeleton />;

	return (
		<div className="w-full min-h-full pb-20 sm:pb-28">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6">
				{/* 03 · Section Header */}
				<SectionHeader
					icon={Briefcase}
					index="03"
					tag="JOURNEY"
					title="Work Experience"
					description="Professional engagements, production software engineering, and community leadership."
					sectionId="experience"
				/>

				{workEntries.length === 0 ? (
					<div className="text-center py-20 border border-dashed border-border/40 rounded-2xl bg-card/10 mt-6">
						<p className="text-muted-foreground text-sm font-mono">No work experience entries recorded yet.</p>
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
						className="space-y-4 sm:space-y-6 mt-6"
					>
						{workEntries.map((job, idx) => {
							const dateRange = formatDateRange(job);
							const skills = cleanSkills(job.skills);
							const location = job.workLocation ?? job.location;

							return (
								<motion.div
									key={job.id || idx}
									variants={staggerItem}
									className="group rounded-2xl border border-border/40 bg-card/25 backdrop-blur-xl p-6 sm:p-8 hover:border-border/80 transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer"
									onClick={() => setSelectedJob(job)}
								>
									<div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-border/20">
										<div>
											<div className="flex flex-wrap items-center gap-2 mb-1.5">
												<span className="font-mono text-xs text-primary/90 font-medium">
													// 0{idx + 1}
												</span>
												{job.organization && (
													<>
														<span className="text-border/60">·</span>
														<span className="font-mono text-xs text-foreground/80 font-medium">
															{job.organization}
														</span>
													</>
												)}
												{job.employmentType && (
													<span className="px-2 py-0.5 rounded-full bg-foreground/[0.04] text-[10px] font-mono text-muted-foreground/70 uppercase">
														{formatLabel(job.employmentType)}
													</span>
												)}
												{job.workMode && (
													<span className="px-2 py-0.5 rounded-full bg-foreground/[0.04] text-[10px] font-mono text-muted-foreground/70 uppercase">
														{formatLabel(job.workMode)}
													</span>
												)}
											</div>

											<h3 className="text-xl sm:text-2xl font-light tracking-tight text-foreground/95 font-sans group-hover:text-primary transition-colors">
												{job.title}
											</h3>
										</div>

										<div className="flex flex-col md:items-end gap-1 shrink-0 text-xs font-mono text-muted-foreground/75">
											<div className="flex items-center gap-1.5">
												<Calendar className="w-3.5 h-3.5 text-muted-foreground/50" />
												<span>{dateRange}</span>
												{job.isCurrent && (
													<span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
														<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
														Active
													</span>
												)}
											</div>
											{location && (
												<div className="flex items-center gap-1.5">
													<MapPin className="w-3.5 h-3.5 text-muted-foreground/50" />
													<span>{location}</span>
												</div>
											)}
										</div>
									</div>

									{/* Description */}
									<div className="py-4">
										<p className="text-sm sm:text-base text-foreground/80 font-normal leading-relaxed whitespace-pre-line">
											{job.description}
										</p>
									</div>

									{/* Skills & Action */}
									<div className="flex flex-wrap items-center justify-between gap-3 pt-2">
										{skills.length > 0 && (
											<div className="flex flex-wrap items-center gap-1.5">
												{skills.map(skill => (
													<span
														key={skill}
														className="px-2.5 py-1 rounded-lg text-xs font-mono bg-foreground/[0.03] text-muted-foreground/80 border border-border/30"
													>
														{skill}
													</span>
												))}
											</div>
										)}

										{(job.url || job.experienceUrl || job.offerUrl) && (
											<div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
												{job.url && (
													<a
														href={job.url}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-1 text-xs font-mono text-primary/80 hover:text-primary transition-colors"
													>
														<span>Organization</span>
														<ArrowUpRight className="w-3.5 h-3.5" />
													</a>
												)}
												{job.experienceUrl && (
													<a
														href={job.experienceUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground/80 hover:text-foreground transition-colors"
													>
														<span>Relieving Doc</span>
														<ArrowUpRight className="w-3.5 h-3.5" />
													</a>
												)}
											</div>
										)}
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				)}
			</div>

			{/* Minimal Detail Modal */}
			<AnimatePresence>
				{selectedJob && (
					<Portal>
						<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
							<motion.div
								variants={fadeIn}
								initial="hidden"
								animate="visible"
								exit="hidden"
								onClick={() => setSelectedJob(null)}
								className="fixed inset-0 bg-black/60 backdrop-blur-md"
							/>

							<motion.div
								variants={scaleIn}
								initial="hidden"
								animate="visible"
								exit="hidden"
								className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border/60 bg-card/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl"
							>
								<div className="flex items-center justify-between pb-4 border-b border-border/30">
									<div>
										<span className="font-mono text-xs text-primary uppercase tracking-wider">
											{selectedJob.organization || 'Experience'}
										</span>
										<h2 className="text-xl sm:text-2xl font-light tracking-tight text-foreground/95 font-sans mt-0.5">
											{selectedJob.title}
										</h2>
									</div>
									<button
										onClick={() => setSelectedJob(null)}
										className="p-1.5 rounded-full hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
									>
										<X className="w-5 h-5" />
									</button>
								</div>

								<div className="py-5 space-y-4">
									<div className="flex flex-wrap gap-3 text-xs font-mono text-muted-foreground/80">
										<span>Duration: {formatDateRange(selectedJob)}</span>
										{(selectedJob.workLocation ?? selectedJob.location) && (
											<span>· Location: {selectedJob.workLocation ?? selectedJob.location}</span>
										)}
										{selectedJob.employmentType && (
											<span>· Type: {formatLabel(selectedJob.employmentType)}</span>
										)}
									</div>

									<p className="text-sm sm:text-base text-foreground/85 leading-relaxed whitespace-pre-line font-normal">
										{selectedJob.description}
									</p>

									{cleanSkills(selectedJob.skills).length > 0 && (
										<div className="pt-2">
											<span className="text-xs font-mono text-muted-foreground/60 uppercase block mb-2">Technologies Used</span>
											<div className="flex flex-wrap gap-1.5">
												{cleanSkills(selectedJob.skills).map(skill => (
													<span
														key={skill}
														className="px-2.5 py-1 rounded-lg text-xs font-mono bg-foreground/[0.04] text-foreground/85 border border-border/40"
													>
														{skill}
													</span>
												))}
											</div>
										</div>
									)}
								</div>

								<div className="pt-4 border-t border-border/30 flex justify-end">
									<button
										onClick={() => setSelectedJob(null)}
										className="px-4 py-2 rounded-xl bg-foreground/10 text-xs font-mono hover:bg-foreground/15 text-foreground transition-colors cursor-pointer"
									>
										Close
									</button>
								</div>
							</motion.div>
						</div>
					</Portal>
				)}
			</AnimatePresence>
		</div>
	);
}

export default ExperienceModule;
