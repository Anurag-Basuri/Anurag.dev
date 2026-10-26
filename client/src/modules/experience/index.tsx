'use client';

import { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Briefcase, Building2, MapPin, Calendar, Star, X, Clock,
	ExternalLink, Trophy, FileText, Wifi,
} from 'lucide-react';
import type { JourneyEntry } from '@/api/schema';
import { SectionHeader } from '@/ui/SectionHeader';
import { Portal } from '@/ui/Portal';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, cardHover, scaleIn, fadeIn } from '@/animations/motion';
import { useJourney } from '@/hooks/useJourney';

// ─── Helpers ────────────────────────────────────────────────────

/** Filter out empty/whitespace-only strings from skills array */
function cleanSkills(skills: string[] | undefined | null): string[] {
	return (skills ?? []).filter(s => s.trim().length > 0);
}

/** Format a date range from startDate/endDate or fall back to the pre-formatted date string */
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

/** Format API labels: INDIVIDUAL_CONTRIBUTOR → Individual Contributor */
function formatLabel(raw: string): string {
	return raw
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, c => c.toUpperCase());
}

/** Get display location — prefer workLocation, fallback to location */
function getLocation(job: JourneyEntry): string | null {
	return (job.workLocation ?? job.location) || null;
}

// ─── Skeleton ───────────────────────────────────────────────────

function ExperienceSkeleton() {
	return (
		<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto animate-pulse pb-12 pt-6">
			<div className="space-y-3 mb-8">
				<div className="h-5 w-28 bg-foreground/5 rounded-lg" />
				<div className="h-8 w-56 bg-foreground/5 rounded-xl" />
			</div>
			<div className="max-w-4xl mx-auto space-y-8 mt-12 relative">
				<div className="absolute left-[31px] md:left-1/2 top-0 bottom-0 w-px bg-foreground/10" />
				{[1, 2, 3].map(i => (
					<div key={i} className="flex items-start gap-8 relative z-10">
						<div className="absolute left-[31px] md:left-1/2 w-4 h-4 -translate-x-1/2 rounded-full bg-foreground/10 border-4 border-card" />
						<div className="w-full pl-20 md:pl-0 md:w-1/2 md:pr-12">
							<div className="h-40 bg-foreground/5 rounded-xl" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// ─── Job Card (Timeline) ────────────────────────────────────────

const JobCard = memo(function JobCard({
	job,
	isEven,
	onSelect,
}: {
	job: JourneyEntry;
	isEven: boolean;
	onSelect: (job: JourneyEntry) => void;
}) {
	const location = getLocation(job);
	const dateRange = formatDateRange(job);

	return (
		<motion.div
			variants={staggerItem}
			className={cn(
				'relative flex flex-col md:flex-row items-start md:items-center w-full group',
				!isEven && 'md:flex-row-reverse',
			)}
		>
			{/* Timeline Node — pulses for current roles */}
			<div className="absolute left-[31px] md:left-1/2 -translate-x-1/2 mt-8 md:mt-0 z-10">
				<div
					className={cn(
						'w-4 h-4 rounded-full border-4 group-hover:scale-150 transition-all duration-500',
						job.isCurrent
							? 'bg-primary animate-pulse'
							: 'bg-card',
					)}
					style={{
						borderColor: 'color-mix(in oklch, var(--theme-primary) 50%, transparent)',
						...(job.isCurrent && {
							boxShadow: '0 0 12px color-mix(in oklch, var(--theme-primary) 40%, transparent)',
						}),
					}}
				/>
			</div>

			{/* Content Card Wrapper */}
			<div
				className={cn(
					'w-full pl-20 md:pl-0 md:w-1/2 relative',
					isEven ? 'md:pr-16' : 'md:pl-16',
				)}
			>
				{/* Connector Line (Desktop) */}
				<div
					className={cn(
						'hidden md:block absolute top-1/2 -translate-y-1/2 w-8 h-px bg-border group-hover:bg-(--theme-primary)/50 transition-colors duration-500',
						isEven ? 'right-8' : 'left-8',
					)}
				/>

				<motion.div
					whileHover={cardHover}
					onClick={() => onSelect(job)}
					className={cn(
						'relative p-3 sm:p-4 rounded-xl bg-linear-to-br from-foreground/5 to-transparent border border-border backdrop-blur-sm overflow-hidden cursor-pointer',
						job.highlighted
							? 'border-(--theme-primary)/30 bg-(--theme-primary)/5'
							: 'hover:border-foreground/20',
					)}
				>
					<div className="absolute inset-0 bg-linear-to-br from-transparent to-transparent group-hover:from-(--theme-primary)/5 transition-colors duration-500" />

					{job.highlighted && (
						<div className="absolute -top-3 -right-3 w-16 h-16 rounded-full blur-xl pointer-events-none" style={{ background: 'color-mix(in oklch, var(--theme-primary) 10%, transparent)' }} />
					)}

					<div className="relative z-10 flex flex-col h-full">
						{/* Title row */}
						<div className="flex items-start justify-between gap-2 mb-2">
							<h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground leading-snug font-sans">
								{job.title}
							</h3>
							{job.isCurrent && (
								<span
									className="shrink-0 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium uppercase tracking-wider"
									style={{
										color: 'var(--theme-primary)',
										background: 'color-mix(in oklch, var(--theme-primary) 12%, transparent)',
										border: '1px solid color-mix(in oklch, var(--theme-primary) 25%, transparent)',
									}}
								>
									Current
								</span>
							)}
						</div>

						{/* Meta pills */}
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
							{job.organization && (
								<span
									className="flex items-center gap-1.5 px-2 py-0.5 rounded-md"
									style={{
										color: 'var(--theme-primary)',
										background: 'color-mix(in oklch, var(--theme-primary) 10%, transparent)',
									}}
								>
									<Building2 className="w-3 h-3" />
									{job.organization}
								</span>
							)}
							<span className="flex items-center gap-1.5">
								<Calendar className="w-3 h-3" />
								{dateRange}
							</span>
							{location && (
								<span className="flex items-center gap-1.5">
									<MapPin className="w-3 h-3" />
									{location}
								</span>
							)}
						</div>

						{/* Description — truncated */}
						<p className="text-muted-foreground leading-relaxed text-sm font-medium line-clamp-2">
							{job.description}
						</p>

						{/* Footer */}
						<div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
							<span className="text-xs font-mono font-medium uppercase tracking-wide text-muted-foreground/70 group-hover:text-[var(--theme-primary)] transition-colors">
								View Details →
							</span>
							{job.highlighted && (
								<Star className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)', fill: 'var(--theme-primary)' }} />
							)}
						</div>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
});

// ─── Experience Detail Modal ────────────────────────────────────

function ExperienceDetailModal({
	job,
	onClose,
}: {
	job: JourneyEntry;
	onClose: () => void;
}) {
	const skills = cleanSkills(job.skills);
	const location = getLocation(job);
	const dateRange = formatDateRange(job);
	const achievements = job.achievements ?? [];
	const documents = job.documents ?? [];

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
		<div className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-3 md:p-6">
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

			{/* Modal Panel */}
			<motion.div
				variants={scaleIn}
				initial="hidden"
				animate="visible"
				exit="hidden"
				className={cn(
					'relative z-10 flex flex-col overflow-hidden',
					'w-full h-full sm:h-auto sm:max-h-[90vh] max-w-2xl',
					'bg-card/80 backdrop-blur-2xl',
					'border-0 sm:border sm:border-border sm:rounded-2xl',
					'shadow-2xl',
				)}
				style={{ boxShadow: '0 0 80px -20px color-mix(in oklch, var(--theme-primary) 15%, transparent)' }}
			>
				{/* Sticky Header */}
				<div className="flex items-center justify-between px-4 sm:px-5 py-2 border-b border-border bg-card/60 backdrop-blur-xl shrink-0">
					<div className="flex items-center gap-2 text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
						<Briefcase className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
						<span>Experience Details</span>
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
					<div className="p-4 sm:p-6 space-y-5 pb-8">
						{/* Title + Badges */}
						<div>
							<div className="flex items-start gap-2 flex-wrap">
								<h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-snug flex-1 min-w-0 font-sans">
									{job.title}
								</h2>
								<div className="flex items-center gap-2 shrink-0">
									{job.isCurrent && (
										<span
											className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium uppercase tracking-wider"
											style={{
												color: 'var(--theme-primary)',
												background: 'color-mix(in oklch, var(--theme-primary) 12%, transparent)',
												border: '1px solid color-mix(in oklch, var(--theme-primary) 25%, transparent)',
											}}
										>
											● Current
										</span>
									)}
									{job.highlighted && (
										<span
											className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium uppercase tracking-wider"
											style={{
												color: 'var(--theme-primary)',
												background: 'color-mix(in oklch, var(--theme-primary) 12%, transparent)',
												border: '1px solid color-mix(in oklch, var(--theme-primary) 25%, transparent)',
											}}
										>
											<Star className="w-3 h-3 inline mr-1" style={{ fill: 'var(--theme-primary)' }} />
											Featured
										</span>
									)}
								</div>
							</div>
						</div>

						{/* Meta Info Grid */}
						<div className="flex flex-wrap gap-2">
							{job.organization && (
								<div
									className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold"
									style={{
										color: 'var(--theme-primary)',
										background: 'color-mix(in oklch, var(--theme-primary) 8%, transparent)',
										border: '1px solid color-mix(in oklch, var(--theme-primary) 15%, transparent)',
									}}
								>
									<Building2 className="w-4 h-4" />
									{job.organization}
								</div>
							)}
							<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border text-sm font-semibold text-muted-foreground">
								<Calendar className="w-4 h-4" />
								{dateRange}
							</div>
							{location && (
								<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border text-sm font-semibold text-muted-foreground">
									<MapPin className="w-4 h-4" />
									{location}
								</div>
							)}
							{job.employmentType && (
								<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border text-sm font-semibold text-muted-foreground capitalize">
									<Clock className="w-4 h-4" />
									{formatLabel(job.employmentType)}
								</div>
							)}
							{job.workType && (
								<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border text-sm font-semibold text-muted-foreground capitalize">
									<Briefcase className="w-4 h-4" />
									{formatLabel(job.workType)}
								</div>
							)}
							{job.workMode && (
								<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border text-sm font-semibold text-muted-foreground capitalize">
									<Wifi className="w-4 h-4" />
									{formatLabel(job.workMode)}
								</div>
							)}
						</div>

						{/* Description */}
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-xs font-mono font-medium uppercase tracking-wider" style={{ color: 'var(--theme-primary)' }}>
								<Briefcase className="w-3.5 h-3.5" />
								<span>About the Role</span>
							</div>
							<p className="text-sm sm:text-base text-foreground/85 font-normal leading-relaxed whitespace-pre-wrap font-sans">
								{job.description}
							</p>
						</div>

						{/* Skills */}
						{skills.length > 0 && (
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-xs font-mono font-medium uppercase tracking-wider" style={{ color: 'var(--theme-primary)' }}>
									<Star className="w-3.5 h-3.5" />
									<span>Technologies & Skills</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{skills.map(skill => (
										<span key={skill} className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-mono font-medium text-foreground/85 hover:bg-accent transition-colors">
											{skill}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Achievements */}
						{achievements.length > 0 && (
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-xs font-mono font-medium uppercase tracking-wider" style={{ color: 'var(--theme-primary)' }}>
									<Trophy className="w-3.5 h-3.5" />
									<span>Achievements</span>
								</div>
								<div className="space-y-2">
									{achievements.map(ach => (
										<div key={ach.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border">
											<Trophy className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--theme-primary)' }} />
											<div className="flex-1 min-w-0">
												<p className="text-sm font-bold text-foreground">{ach.title}</p>
												{ach.description && (
													<p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ach.description}</p>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Documents */}
						{documents.length > 0 && (
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-xs font-mono font-medium uppercase tracking-wider" style={{ color: 'var(--theme-primary)' }}>
									<FileText className="w-3.5 h-3.5" />
									<span>Documents</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{documents.map(doc => (
										<a
											key={doc.id}
											href={doc.url}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-xs font-bold text-foreground/80 hover:bg-accent hover:border-(--theme-primary)/30 transition-colors"
										>
											<ExternalLink className="w-3.5 h-3.5" />
											{doc.title}
										</a>
									))}
								</div>
							</div>
						)}

						{/* External Links */}
						{(job.url || job.experienceUrl || job.offerUrl) && (
							<div className="flex flex-wrap gap-3 pt-4 border-t border-border">
								{job.url && (
									<a
										href={job.url}
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
										View More
									</a>
								)}
								{job.experienceUrl && (
									<a
										href={job.experienceUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center justify-center gap-2 px-5 py-2.5 bg-muted hover:bg-accent text-foreground border border-border text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex-1 sm:flex-none hover:scale-[1.02] active:scale-[0.98]"
									>
										<ExternalLink className="w-4 h-4" />
										Certificate
									</a>
								)}
								{job.offerUrl && (
									<a
										href={job.offerUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center justify-center gap-2 px-5 py-2.5 bg-muted hover:bg-accent text-foreground border border-border text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex-1 sm:flex-none hover:scale-[1.02] active:scale-[0.98]"
									>
										<ExternalLink className="w-4 h-4" />
										Offer Letter
									</a>
								)}
							</div>
						)}
					</div>
				</div>
			</motion.div>
		</div>
	);
}

// ─── Main Module ────────────────────────────────────────────────

export function ExperienceModule() {
	const { entries: workEntries, loading } = useJourney('WORK');
	const [selectedJob, setSelectedJob] = useState<JourneyEntry | null>(null);

	if (loading) return <ExperienceSkeleton />;

	return (
		<div className="h-full w-full">
			<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto pb-8 sm:pb-12 pt-4 md:pt-6">
				<SectionHeader
					icon={Briefcase}
					index="03"
					tag="CAREER"
					title="Professional Journey"
					description="Engineering roles, production milestones, and architectural impact across teams."
					sectionId="experience"
				/>

				{workEntries.length === 0 ? (
					<div className="text-center py-16 mt-8 text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50">
						No work experience data found.
					</div>
				) : (
					<div className="relative mt-6 md:mt-10 max-w-4xl mx-auto">
						{/* Timeline Center Line */}
						<div className="absolute left-[31px] md:left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2" style={{ background: `linear-gradient(to bottom, transparent, color-mix(in oklch, var(--theme-primary) 20%, transparent), transparent)` }} />

						<motion.div
							variants={staggerContainer}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-20px' }}
							className="space-y-8 sm:space-y-12 md:space-y-16 flex flex-col"
						>
							{workEntries.map((job, index) => (
								<JobCard
									key={job.id}
									job={job}
									isEven={index % 2 === 0}
									onSelect={setSelectedJob}
								/>
							))}
						</motion.div>
					</div>
				)}

				{/* Detail Modal — rendered via portal to sit above everything */}
				<Portal>
					<AnimatePresence>
						{selectedJob && (
							<ExperienceDetailModal
								job={selectedJob}
								onClose={() => setSelectedJob(null)}
							/>
						)}
					</AnimatePresence>
				</Portal>
			</div>
		</div>
	);
}
