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
				<div className="h-6 w-32 bg-white/5 rounded-lg" />
				<div className="h-12 w-72 bg-white/5 rounded-xl" />
				<div className="h-5 w-96 bg-white/5 rounded-lg" />
			</div>
			<div className="max-w-4xl mx-auto space-y-12 mt-16 relative">
				<div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-white/10" />
				{[1, 2, 3].map(i => (
					<div key={i} className="flex items-start gap-8 relative z-10">
						<div className="absolute left-8 md:left-1/2 w-4 h-4 -ml-2 rounded-full bg-white/10 border-4 border-[#0a0a0a]" />
						<div className="w-full pl-20 md:pl-0 md:w-1/2 md:pr-12">
							<div className="h-48 bg-white/5 rounded-[2rem]" />
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
				<div className="w-4 h-4 rounded-full bg-[#0a0a0a] border-4 border-violet-500/50 group-hover:border-violet-400 group-hover:bg-violet-400 group-hover:scale-150 transition-all duration-500 shadow-[0_0_15px_rgba(139,92,246,0)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]" />
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
						'hidden md:block absolute top-1/2 -translate-y-1/2 w-8 h-px bg-white/10 group-hover:bg-violet-500/50 transition-colors duration-500',
						isEven ? 'right-8' : 'left-8',
					)}
				/>

				<motion.div
					whileHover={cardHover}
					className={cn(
						'relative p-6 sm:p-8 rounded-[2rem] bg-linear-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm overflow-hidden text-left',
						entry.highlighted
							? 'border-violet-500/30 bg-violet-500/5'
							: 'hover:border-white/20',
					)}
				>
					<div className="absolute inset-0 bg-linear-to-br from-violet-500/0 to-transparent group-hover:from-violet-500/5 transition-colors duration-500" />

					{/* Highlight Badge */}
					{entry.highlighted && (
						<div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-violet-500/10 blur-xl pointer-events-none" />
					)}

					<div className="relative z-10 flex flex-col h-full">
						{/* Header */}
						<div className="flex justify-between items-start gap-4 mb-2">
							<h3 className="text-xl sm:text-2xl font-black tracking-tight text-white relative inline-flex items-center gap-2">
								{entry.title}
								{entry.highlighted && (
									<Star className="w-4 h-4 text-violet-400 fill-violet-400 shrink-0" />
								)}
							</h3>
							{entry.grade && (
								<div className="shrink-0 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-xs shadow-inner">
									{entry.grade}
								</div>
							)}
						</div>

						{entry.degree && entry.fieldOfStudy && (
							<p className="text-base sm:text-lg font-medium text-violet-400 mb-4">
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
								<span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10">
									<Award className="w-3 h-3" />
									{entry.board}
								</span>
							)}
						</div>

						{/* Description */}
						{entry.description && (
							<p className="text-white/70 leading-relaxed text-sm font-medium mb-6 whitespace-pre-wrap">
								{entry.description}
							</p>
						)}

						{/* Skills Tags */}
						{(entry.skills ?? []).length > 0 && (
							<div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
								{(entry.skills ?? []).map(skill => (
									<span
										key={skill}
										className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-white/5 text-muted-foreground border border-white/10 group-hover:border-violet-500/20 transition-colors"
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
			.filter(entry => entry.type === 'education')
			.sort((a, b) => {
				const dateA = new Date(a.startDate || 0).getTime();
				const dateB = new Date(b.startDate || 0).getTime();
				return dateB - dateA;
			});
	}, [entries]);

	if (loading) return <EducationSkeleton />;

	return (
		<div className="h-full w-full">
			<div className="p-4 sm:p-6 md:p-12 max-w-6xl mx-auto pb-24 sm:pb-32">
				<SectionHeader
					icon={GraduationCap}
					label="Academics"
					title="Educational Background"
					description="Degrees, academic progression, and key coursework."
					accent="violet"
				/>

				{educationEntries.length === 0 ? (
					<div className="text-center py-20 mt-12 text-muted-foreground border border-dashed border-white/10 rounded-3xl bg-[#0a0a0a]/50">
						No educational history found.
					</div>
				) : (
					<div className="relative mt-16 max-w-5xl mx-auto">
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
