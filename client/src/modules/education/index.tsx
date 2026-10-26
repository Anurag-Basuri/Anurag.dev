'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, MapPin, Calendar, BookOpen, Award } from 'lucide-react';
import type { JourneyEntry } from '@/api/schema';
import { SectionHeader } from '@/ui/SectionHeader';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/animations/motion';
import { useJourney } from '@/hooks/useJourney';

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

function cleanSkills(skills: string[] | undefined | null): string[] {
	return (skills ?? []).filter(s => s.trim().length > 0);
}

function EducationSkeleton() {
	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
			<div className="h-6 w-32 bg-foreground/5 rounded-md" />
			<div className="space-y-4">
				{[1, 2, 3].map(i => (
					<div key={i} className="h-40 bg-foreground/5 rounded-2xl" />
				))}
			</div>
		</div>
	);
}

export function EducationModule() {
	const { entries: educationEntries, loading } = useJourney('EDUCATION');

	if (loading && educationEntries.length === 0) return <EducationSkeleton />;

	return (
		<div className="w-full min-h-full pb-20 sm:pb-28">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6">
				{/* 04 · Section Header */}
				<SectionHeader
					icon={GraduationCap}
					index="04"
					tag="FOUNDATION"
					title="Academic Background"
					description="Formal education, computer science foundations, and academic honors."
					sectionId="education"
				/>

				{educationEntries.length === 0 ? (
					<div className="text-center py-20 border border-dashed border-border/40 rounded-2xl bg-card/10 mt-6">
						<p className="text-muted-foreground text-sm font-mono">No academic records found.</p>
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
						className="space-y-4 sm:space-y-6 mt-6"
					>
						{educationEntries.map((entry, idx) => {
							const dateRange = formatDateRange(entry);
							const skills = cleanSkills(entry.skills);

							return (
								<motion.div
									key={entry.id || idx}
									variants={staggerItem}
									className="group rounded-2xl border border-border/40 bg-card/25 backdrop-blur-xl p-6 sm:p-8 hover:border-border/80 transition-all duration-300 shadow-xs hover:shadow-md"
								>
									<div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-border/20">
										<div>
											<div className="flex flex-wrap items-center gap-2 mb-1.5">
												<span className="font-mono text-xs text-primary/90 font-medium">
													// 0{idx + 1}
												</span>
												{entry.board && (
													<>
														<span className="text-border/60">·</span>
														<span className="px-2 py-0.5 rounded-full bg-foreground/[0.04] text-[10px] font-mono text-muted-foreground/80 uppercase">
															{entry.board}
														</span>
													</>
												)}
												{entry.grade && (
													<span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-medium">
														{entry.grade}
													</span>
												)}
											</div>

											<h3 className="text-xl sm:text-2xl font-light tracking-tight text-foreground/95 font-sans">
												{entry.organization}
											</h3>

											{(entry.degree || entry.fieldOfStudy) && (
												<p className="text-sm sm:text-base font-normal text-muted-foreground/90 mt-1">
													{[entry.degree, entry.fieldOfStudy].filter(Boolean).join(' in ')}
												</p>
											)}
										</div>

										<div className="flex flex-col md:items-end gap-1 shrink-0 text-xs font-mono text-muted-foreground/75">
											<div className="flex items-center gap-1.5">
												<Calendar className="w-3.5 h-3.5 text-muted-foreground/50" />
												<span>{dateRange}</span>
												{entry.isCurrent && (
													<span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px]">
														Enrolled
													</span>
												)}
											</div>
											{entry.location && (
												<div className="flex items-center gap-1.5">
													<MapPin className="w-3.5 h-3.5 text-muted-foreground/50" />
													<span>{entry.location}</span>
												</div>
											)}
										</div>
									</div>

									{entry.description && (
										<div className="py-4">
											<p className="text-sm sm:text-base text-foreground/80 font-normal leading-relaxed">
												{entry.description}
											</p>
										</div>
									)}

									{skills.length > 0 && (
										<div className="flex flex-wrap items-center gap-1.5 pt-2">
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
								</motion.div>
							);
						})}
					</motion.div>
				)}
			</div>
		</div>
	);
}
