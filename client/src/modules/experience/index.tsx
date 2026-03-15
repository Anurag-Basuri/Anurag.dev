'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Building2, MapPin, Calendar, Star, ChevronRight } from 'lucide-react';
import { publicService } from '@/api';
import type { JourneyEntry } from '@/api/schema';
import { ScrollArea } from '@/ui/scroll-area';
import { SectionHeader } from '@/ui/SectionHeader';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/animations/motion';

export function ExperienceModule() {
	const [entries, setEntries] = useState<JourneyEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchJourney() {
			try {
				const { data } = await publicService.getJourney();
				setEntries(data || []);
			} catch (err) {
				console.error('Failed to load experience', err);
			} finally {
				setLoading(false);
			}
		}
		fetchJourney();
	}, []);

	// Filter and sort only work experience
	const workEntries = useMemo(() => {
		return entries
			.filter(entry => entry.type === 'work')
			.sort((a, b) => {
				const dateA = new Date(a.startDate || 0).getTime();
				const dateB = new Date(b.startDate || 0).getTime();
				return dateB - dateA; // Newest first
			});
	}, [entries]);

	if (loading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
			</div>
		);
	}

	return (
		<ScrollArea className="h-full w-full">
			<div className="p-6 md:p-12 max-w-5xl mx-auto pb-32">
				<SectionHeader
					icon={Briefcase}
					label="Work History"
					title="Professional Experience"
					description="My career journey, roles, and impact across companies and startups."
				/>

				{workEntries.length === 0 ? (
					<div className="text-center py-20 text-muted-foreground border border-dashed border-border/50 rounded-2xl bg-muted/5">
						No work experience data found.
					</div>
				) : (
					<div className="relative mt-16 max-w-4xl mx-auto">
						{/* Fiber Optic Center Line */}
						<div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-1 -ml-[0.5px] bg-gradient-to-b from-primary/50 via-purple-500/30 to-transparent rounded-full" />

						<motion.div
							variants={staggerContainer}
							initial="hidden"
							animate="visible"
							className="space-y-12"
						>
							{workEntries.map((job, index) => {
								const isEven = index % 2 === 0;

								return (
									<motion.div
										key={job.id}
										variants={staggerItem}
										className={cn(
											'relative flex flex-col md:flex-row items-start md:items-center gap-8 group',
											isEven ? 'md:flex-row' : 'md:flex-row-reverse',
										)}
									>
										{/* Glowing Node */}
										<div className="absolute left-8 md:left-1/2 -ml-3 md:-ml-3 mt-1.5 md:mt-0 z-10">
											<div className="w-6 h-6 rounded-full bg-background border-4 border-primary group-hover:border-purple-400 group-hover:scale-125 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
										</div>

										{/* Content Card */}
										<div
											className={cn(
												'w-full pl-20 md:pl-0 md:w-1/2',
												isEven ? 'md:pr-12' : 'md:pl-12',
											)}
										>
											<motion.div
												whileHover={{ y: -5, scale: 1.02 }}
												transition={{
													type: 'spring',
													stiffness: 300,
													damping: 20,
												}}
												className={cn(
													'relative p-6 rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 shadow-2xl transition-colors duration-500',
													job.highlighted
														? 'border-primary/30 bg-primary/5'
														: 'hover:border-white/10',
												)}
											>
												{/* Highlight Badge */}
												{job.highlighted && (
													<div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 backdrop-blur-sm">
														<Star className="w-4 h-4 text-primary fill-primary" />
													</div>
												)}

												{/* Header */}
												<h3 className="text-2xl font-black tracking-tight text-white mb-2">
													{job.title}
												</h3>

												<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-muted-foreground mb-4">
													{job.organization && (
														<span className="flex items-center gap-1.5 text-primary">
															<Building2 className="w-4 h-4" />
															{job.organization}
														</span>
													)}
													<span className="flex items-center gap-1.5 text-blue-400">
														<Calendar className="w-4 h-4" />
														{job.date}
													</span>
													{job.location && (
														<span className="flex items-center gap-1.5">
															<MapPin className="w-4 h-4" />
															{job.location}
														</span>
													)}
												</div>

												{/* Description */}
												<p className="text-muted-foreground/90 leading-relaxed text-sm mb-6 whitespace-pre-wrap">
													{job.description}
												</p>

												{/* Skills Tags */}
												{job.skills && job.skills.length > 0 && (
													<div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
														{job.skills.map(skill => (
															<span
																key={skill}
																className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10 hover:text-white transition-colors"
															>
																{skill}
															</span>
														))}
													</div>
												)}
											</motion.div>
										</div>
									</motion.div>
								);
							})}
						</motion.div>
					</div>
				)}
			</div>
		</ScrollArea>
	);
}
