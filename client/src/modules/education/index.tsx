'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, MapPin, Calendar, Award, BookOpen, Star } from 'lucide-react';
import { publicService } from '@/api';
import type { JourneyEntry } from '@/api/schema';
import { SectionHeader } from '@/ui/SectionHeader';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, cardHover } from '@/animations/motion';
import { useJourney } from '@/hooks/useJourney';

// ─── Skeleton ───────────────────────────────────────────────────

/** Format a date range from startDate/endDate or fall back to the pre-formatted date string */
function formatDateRange(entry: JourneyEntry): string {
	if (entry.startDate) {
		const start = new Date(entry.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
		const end = entry.isCurrent
			? 'Present'
			: entry.endDate
				? new Date(entry.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
				: '';
		return end ? `${start} — ${end}` : start;
	}
	return entry.date;
}

function EducationSkeleton() {
	return (
		<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto animate-pulse pb-12 pt-6">
			<div className="space-y-3 mb-8">
				<div className="h-5 w-28 bg-foreground/5 rounded-lg" />
				<div className="h-8 w-48 bg-foreground/5 rounded-xl" />
			</div>
			<div className="max-w-4xl mx-auto space-y-6 mt-12 relative">
				<div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-foreground/10" />
				{[1, 2, 3].map(i => (
					<div key={i} className="flex items-start gap-8 relative z-10">
						<div className="absolute left-8 md:left-1/2 w-4 h-4 -ml-2 rounded-full bg-foreground/10 border-4 border-card" />
						<div className="w-full pl-20 md:pl-0 md:w-1/2 md:pr-12">
							<div className="h-44 bg-foreground/5 rounded-xl" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// ─── Education Card ─────────────────────────────────────────────

const EducationCard = memo(function EducationCard({
	entry,
	isEven,
}: {
	entry: JourneyEntry;
	isEven: boolean;
}) {
	return (
		<motion.div
			variants={staggerItem}
			className={cn(
				'relative flex flex-col md:flex-row items-start md:items-center w-full group',
				!isEven && 'md:flex-row-reverse',
			)}
		>
			{/* Timeline Node */}
			<div className="absolute left-[31px] md:left-1/2 -translate-x-1/2 mt-8 md:mt-0 z-10">
				<div
					className={cn(
						'w-4 h-4 rounded-full bg-card border-4 group-hover:scale-150 transition-all duration-500',
						entry.isCurrent && 'animate-pulse',
					)}
					style={{
						borderColor: entry.isCurrent
							? 'var(--theme-primary)'
							: 'color-mix(in oklch, var(--theme-primary) 50%, transparent)',
						boxShadow: entry.isCurrent ? '0 0 12px color-mix(in oklch, var(--theme-primary) 40%, transparent)' : '0 0 0 rgba(0,0,0,0)',
					}}
				/>
			</div>

			{/* Content Card Wrapper */}
			<div
				className={cn(
					'w-full pl-20 md:pl-0 md:w-1/2 relative',
					isEven ? 'md:pr-16 md:text-right' : 'md:pl-16',
				)}
			>
				{/* Connector Line to Node (Desktop Only) */}
				<div
					className={cn(
						'hidden md:block absolute top-1/2 -translate-y-1/2 w-8 h-px bg-border group-hover:bg-(--theme-primary)/50 transition-colors duration-500',
						isEven ? 'right-8' : 'left-8',
					)}
				/>

				<motion.div
					whileHover={cardHover}
					className={cn(
						'relative p-3 sm:p-4 rounded-xl bg-linear-to-bl from-white/5 to-transparent border border-border backdrop-blur-sm overflow-hidden text-left',
						'hover:border-foreground/20',
					)}
				>
					<div className="absolute inset-0 bg-linear-to-bl from-transparent to-transparent group-hover:from-(--theme-primary)/5 transition-colors duration-500" />

					<div className="relative z-10 flex flex-col h-full">
						{/* Header row: Title + Badge */}
						<div className="flex items-start justify-between gap-3 mb-2">
							<h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground line-clamp-2 font-sans">
								{entry.title}
							</h3>
							<div className="flex items-center gap-2 shrink-0">
								{entry.isCurrent && (
									<span
										className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium uppercase tracking-wider"
										style={{
											background: 'color-mix(in oklch, var(--theme-primary) 12%, transparent)',
											color: 'var(--theme-primary)',
											border: '1px solid color-mix(in oklch, var(--theme-primary) 25%, transparent)',
										}}
									>
										<span className="relative flex h-1.5 w-1.5">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--theme-primary)' }} />
											<span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: 'var(--theme-primary)' }} />
										</span>
										Currently Enrolled
									</span>
								)}
								{entry.grade && (
									<div className="px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-mono font-medium text-xs shadow-inner">
										{entry.grade}
									</div>
								)}
							</div>
						</div>

						{entry.degree && entry.fieldOfStudy && (
							<p className="text-sm sm:text-base font-medium mb-4" style={{ color: 'var(--theme-primary)' }}>
								{entry.degree} in {entry.fieldOfStudy}
							</p>
						)}

						<div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-mono font-medium uppercase tracking-wide text-muted-foreground mb-5">
							{entry.organization && (
								<span
									className="flex items-center gap-1.5 px-2 py-1 rounded-md"
									style={{
										color: 'var(--theme-primary)',
										background: 'color-mix(in oklch, var(--theme-primary) 10%, transparent)',
									}}
								>
									<BookOpen className="w-3.5 h-3.5" />
									{entry.organization}
								</span>
							)}
							<span className="flex items-center gap-1.5">
								<Calendar className="w-3.5 h-3.5" />
								{formatDateRange(entry)}
							</span>
							{entry.location && (
								<span className="flex items-center gap-1.5">
									<MapPin className="w-3.5 h-3.5" />
									{entry.location}
								</span>
							)}
							{entry.board && (
								<span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-foreground/5 border border-border">
									<Award className="w-3 h-3" />
									{entry.board}
								</span>
							)}
						</div>

						{/* Skills Tags */}
						{(entry.skills ?? []).filter(s => s.trim().length > 0).length > 0 && (
							<div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-border">
								{(entry.skills ?? []).filter(s => s.trim().length > 0).map(skill => (
									<span
										key={skill}
										className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg bg-foreground/5 text-muted-foreground border border-border group-hover:border-(--theme-primary)/20 transition-colors"
									>
										{skill}
									</span>
								))}
							</div>
						)}
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
});

// ─── Main Module ────────────────────────────────────────────────

export function EducationModule() {
	const { entries: educationEntries, loading } = useJourney('EDUCATION');

	if (loading) return <EducationSkeleton />;

	return (
		<div className="h-full w-full">
			<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto pb-8 sm:pb-12 pt-4 md:pt-6">
				<SectionHeader
					icon={GraduationCap}
					label="Academic Path"
					title="Education"
					description="Academic background, degrees, and institutions."
					sectionId="education"
				/>

				{educationEntries.length === 0 ? (
					<div className="text-center py-16 mt-8 text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50">
						No education data found.
					</div>
				) : (
					<div className="relative mt-8 md:mt-12 max-w-4xl mx-auto">
						{/* Timeline Center Line */}
						<div
							className="absolute left-[31px] md:left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2"
							style={{ background: `linear-gradient(to bottom, transparent, color-mix(in oklch, var(--theme-primary) 20%, transparent), transparent)` }}
						/>

						<motion.div
							variants={staggerContainer}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-20px' }}
							className="space-y-8 sm:space-y-12 md:space-y-16 flex flex-col"
						>
							{educationEntries.map((entry, index) => (
								<EducationCard
									key={entry.id}
									entry={entry}
									isEven={index % 2 === 0}
								/>
							))}
						</motion.div>
					</div>
				)}
			</div>
		</div>
	);
}
