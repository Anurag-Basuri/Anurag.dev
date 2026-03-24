'use client';

import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Building2, MapPin, Calendar, Star } from 'lucide-react';
import { publicService } from '@/api';
import type { JourneyEntry } from '@/api/schema';
import { SectionHeader } from '@/ui/SectionHeader';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, cardHover } from '@/animations/motion';
import { useJourney } from '@/hooks/useJourney';

// ─── Skeleton ───────────────────────────────────────────────────

function ExperienceSkeleton() {
	return (
		<div className="p-6 md:p-12 max-w-5xl mx-auto animate-pulse pb-32">
			<div className="space-y-4 mb-12 pb-8">
				<div className="h-6 w-32 bg-foreground/5 rounded-lg" />
				<div className="h-12 w-72 bg-foreground/5 rounded-xl" />
				<div className="h-5 w-96 bg-foreground/5 rounded-lg" />
			</div>
			<div className="max-w-4xl mx-auto space-y-6 mt-16 relative">
				<div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-foreground/10" />
				{[1, 2, 3].map(i => (
					<div key={i} className="flex items-start gap-8 relative z-10">
						<div className="absolute left-8 md:left-1/2 w-4 h-4 -ml-2 rounded-full bg-foreground/10 border-4 border-card" />
						<div className="w-full pl-20 md:pl-0 md:w-1/2 md:pr-12">
							<div className="h-48 bg-foreground/5 rounded-2xl" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// ─── Job Card ───────────────────────────────────────────────────

const JobCard = memo(function JobCard({
	job,
	isEven,
}: {
	job: JourneyEntry;
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
					className="w-4 h-4 rounded-full bg-card border-4 group-hover:scale-150 transition-all duration-500"
					style={{
						borderColor: 'color-mix(in oklch, var(--theme-primary) 50%, transparent)',
						boxShadow: '0 0 0 rgba(0,0,0,0)',
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
						'relative p-3 sm:p-4 rounded-xl bg-linear-to-br from-foreground/5 to-transparent border border-border backdrop-blur-sm overflow-hidden text-left',
						job.highlighted
							? 'border-(--theme-primary)/30 bg-(--theme-primary)/5'
							: 'hover:border-foreground/20',
					)}
				>
					<div className="absolute inset-0 bg-linear-to-br from-transparent to-transparent group-hover:from-(--theme-primary)/5 transition-colors duration-500" />

					{/* Highlight Badge */}
					{job.highlighted && (
						<div className="absolute -top-3 -right-3 w-16 h-16 rounded-full blur-xl pointer-events-none" style={{ background: 'color-mix(in oklch, var(--theme-primary) 10%, transparent)' }} />
					)}

					<div className="relative z-10 flex flex-col h-full">
						{/* Header */}
						<h3 className="text-base sm:text-lg font-black tracking-tight text-foreground mb-2 relative inline-flex items-center gap-2">
							{job.title}
							{job.highlighted && (
								<Star className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)', fill: 'var(--theme-primary)' }} />
							)}
						</h3>

						<div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
							{job.organization && (
								<span
									className="flex items-center gap-1.5 px-2 py-1 rounded-md"
									style={{
										color: 'var(--theme-primary)',
										background: 'color-mix(in oklch, var(--theme-primary) 10%, transparent)',
									}}
								>
									<Building2 className="w-3.5 h-3.5" />
									{job.organization}
								</span>
							)}
							<span className="flex items-center gap-1.5">
								<Calendar className="w-3.5 h-3.5" />
								{job.date}
							</span>
							{job.location && (
								<span className="flex items-center gap-1.5">
									<MapPin className="w-3.5 h-3.5" />
									{job.location}
								</span>
							)}
						</div>

						{/* Description */}
						<p className="text-muted-foreground leading-relaxed text-sm font-medium mb-6 whitespace-pre-wrap">
							{job.description}
						</p>

						{/* Skills Tags */}
						{(job.skills ?? []).length > 0 && (
							<div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border">
								{(job.skills ?? []).map(skill => (
									<span
										key={skill}
										className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-foreground/5 text-muted-foreground border border-border group-hover:border-(--theme-primary)/20 transition-colors"
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

export function ExperienceModule() {
	const { entries: workEntries, loading } = useJourney('WORK');

	if (loading) return <ExperienceSkeleton />;

	return (
		<div className="h-full w-full">
			<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto pb-8 sm:pb-12 pt-4 md:pt-6">
				<SectionHeader
					icon={Briefcase}
					label="Work History"
					title="Professional Experience"
					description="My career journey, roles, and impact across companies and startups."
					sectionId="experience"
				/>

				{workEntries.length === 0 ? (
					<div className="text-center py-16 mt-8 text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50">
						No work experience data found.
					</div>
				) : (
					<div className="relative mt-8 md:mt-12 max-w-4xl mx-auto">
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
								/>
							))}
						</motion.div>
					</div>
				)}
			</div>
		</div>
	);
}
