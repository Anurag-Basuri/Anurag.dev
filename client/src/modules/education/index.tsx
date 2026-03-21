'use client';

import { useEffect, useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, MapPin, Calendar, Award, BookOpen, Star } from 'lucide-react';
import { publicService } from '@/api';
import type { JourneyEntry } from '@/api/schema';
import { SectionHeader } from '@/ui/SectionHeader';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, cardHover } from '@/animations/motion';

// ─── Skeleton ───────────────────────────────────────────────────

function EducationSkeleton() {
	return (
		<div className="p-6 md:p-12 max-w-5xl mx-auto animate-pulse pb-32">
			<div className="space-y-4 mb-12 pb-8">
				<div className="h-6 w-32 bg-foreground/5 rounded-lg" />
				<div className="h-12 w-72 bg-foreground/5 rounded-xl" />
				<div className="h-5 w-96 bg-foreground/5 rounded-lg" />
			</div>
			<div className="max-w-4xl mx-auto space-y-12 mt-16 relative">
				<div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-foreground/10" />
				{[1, 2, 3].map(i => (
					<div key={i} className="flex items-start gap-8 relative z-10">
						<div className="absolute left-8 md:left-1/2 w-4 h-4 -ml-2 rounded-full bg-foreground/10 border-4 border-card" />
						<div className="w-full pl-20 md:pl-0 md:w-1/2 md:pr-12">
							<div className="h-48 bg-foreground/5 rounded-4xl" />
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
				<div className="w-4 h-4 rounded-full bg-card border-4 border-violet-500/50 group-hover:border-violet-400 group-hover:bg-violet-400 group-hover:scale-150 transition-all duration-500 shadow-[0_0_15px_rgba(139,92,246,0)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]" />
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
						'hidden md:block absolute top-1/2 -translate-y-1/2 w-8 h-px bg-foreground/10 group-hover:bg-violet-500/50 transition-colors duration-500',
						isEven ? 'right-8' : 'left-8',
					)}
				/>

				<motion.div
					whileHover={cardHover}
					className={cn(
						'relative p-5 sm:p-6 rounded-3xl bg-linear-to-bl from-white/5 to-transparent border border-border backdrop-blur-sm overflow-hidden text-left',
						'hover:border-foreground/20',
					)}
				>
					<div className="absolute inset-0 bg-linear-to-bl from-violet-500/0 to-transparent group-hover:from-violet-500/5 transition-colors duration-500" />

					<div className="relative z-10 flex flex-col h-full">
						{/* Header row: Title + Grade (if any) */}
						<div className="flex items-start justify-between gap-4 mb-2">
							<h3 className="text-lg sm:text-xl font-black tracking-tight text-foreground line-clamp-2">
								{entry.title}
							</h3>
							{entry.grade && (
								<div className="shrink-0 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-xs shadow-inner">
									{entry.grade}
								</div>
							)}
						</div>

						{entry.degree && entry.fieldOfStudy && (
							<p className="text-sm sm:text-base font-medium text-violet-400 mb-4">
								{entry.degree} in {entry.fieldOfStudy}
							</p>
						)}

						<div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
							{entry.organization && (
								<span className="flex items-center gap-1.5 text-violet-400 bg-violet-400/10 px-2 py-1 rounded-md">
									<BookOpen className="w-3.5 h-3.5" />
									{entry.organization}
								</span>
							)}
							<span className="flex items-center gap-1.5">
								<Calendar className="w-3.5 h-3.5" />
								{entry.date}
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

						{/* Description */}
						{entry.description && (
							<p className="text-foreground/70 leading-relaxed text-sm font-medium mb-4 whitespace-pre-wrap">
								{entry.description}
							</p>
						)}

						{/* Skills Tags */}
						{(entry.skills ?? []).length > 0 && (
							<div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-border">
								{(entry.skills ?? []).map(skill => (
									<span
										key={skill}
										className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-foreground/5 text-muted-foreground border border-border group-hover:border-violet-500/20 transition-colors"
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
	const [entries, setEntries] = useState<JourneyEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchJourney() {
			const { data } = await publicService.getJourney();
			setEntries(data || []);
			setLoading(false);
		}
		fetchJourney();
	}, []);

	const educationEntries = useMemo(() => {
		return entries
			.filter(entry => entry.type.toUpperCase() === 'EDUCATION')
			.sort((a, b) => {
				const dateA = new Date(a.startDate || 0).getTime();
				const dateB = new Date(b.startDate || 0).getTime();
				return dateB - dateA;
			});
	}, [entries]);

	if (loading) return <EducationSkeleton />;

	return (
		<div className="h-full w-full">
			<div className="px-4 sm:px-6 md:px-8 max-w-4xl mx-auto pb-10 sm:pb-14 pt-6 md:pt-8">
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
						<div className="absolute left-[31px] md:left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 bg-linear-to-b from-transparent via-violet-500/20 to-transparent" />

						<motion.div
							variants={staggerContainer}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-20px' }}
							className="space-y-12 sm:space-y-20 flex flex-col"
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
