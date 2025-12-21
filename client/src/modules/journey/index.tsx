'use client';

import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { api, JourneyEntry } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase, GraduationCap, Award, Star, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ModuleHeader } from '@/modules/shared/ModuleHeader';
import { fadeInUp, viewportSettings } from '@/lib/animations';

const categoryConfig: Record<
	string,
	{ color: string; icon: ComponentType<{ className?: string }>; bg: string; border: string }
> = {
	education: {
		color: 'text-blue-400',
		icon: GraduationCap,
		bg: 'bg-blue-500/5',
		border: 'border-blue-500/20',
	},
	work: {
		color: 'text-emerald-400',
		icon: Briefcase,
		bg: 'bg-emerald-500/5',
		border: 'border-emerald-500/20',
	},
	project: {
		color: 'text-purple-400',
		icon: Star,
		bg: 'bg-purple-500/5',
		border: 'border-purple-500/20',
	},
	achievement: {
		color: 'text-yellow-400',
		icon: Award,
		bg: 'bg-yellow-500/5',
		border: 'border-yellow-500/20',
	},
};

function JourneySkeleton() {
	return (
		<div className="p-8 space-y-8 animate-pulse max-w-4xl mx-auto">
			<div className="h-8 bg-muted rounded w-64 mb-12" />
			{[1, 2, 3].map(i => (
				<div key={i} className="flex gap-8 items-center">
					<div className="hidden md:block w-1/2" />
					<div className="w-full md:w-1/2 space-y-4 p-6 rounded-xl border border-border/40 bg-card/20">
						<div className="flex justify-between">
							<div className="h-4 bg-muted rounded w-24" />
							<div className="h-4 bg-muted rounded w-16" />
						</div>
						<div className="h-6 bg-muted rounded w-3/4" />
						<div className="h-4 bg-muted rounded w-full" />
						<div className="h-4 bg-muted rounded w-5/6" />
					</div>
				</div>
			))}
		</div>
	);
}

export function JourneyModule() {
	const [journey, setJourney] = useState<JourneyEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await api.getJourney();
			setJourney(data.sort((a, b) => a.order - b.order));
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to load journey timeline';
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (loading) return <JourneySkeleton />;

	if (error) {
		return <div className="text-center py-24 text-muted-foreground">{error}</div>;
	}

	return (
		<ScrollArea className="h-full">
			<div className="p-6 md:p-12 max-w-5xl mx-auto pb-24 relative">
				{/* Header */}
				<ModuleHeader
					icon={Briefcase}
					label="Timeline"
					title="journey"
					description="A chronological record of professional developments, academic milestones, and key achievements."
				/>

				<div className="relative">
					{/* Static Central Line - Desktop */}
					<div className="absolute left-1/2 top-4 bottom-0 w-0.5 bg-linear-to-b from-emerald-500 via-cyan-500 to-purple-500 -translate-x-1/2 rounded-full opacity-30 hidden md:block" />

					{/* Mobile Line - Perfectly aligned with nodes */}
					<div className="absolute left-[21px] top-4 bottom-0 w-0.5 bg-linear-to-b from-emerald-500/50 to-purple-500/50 rounded-full md:hidden" />

					<div className="space-y-12">
						{journey.map((entry, index) => {
							const config = categoryConfig[entry.type] || categoryConfig.work;
							const Icon = config.icon;
							const isLeft = index % 2 === 0;

							return (
								<motion.div
									key={entry.id}
									variants={fadeInUp}
									initial="hidden"
									whileInView="visible"
									viewport={viewportSettings}
									className={cn(
										'relative flex flex-col md:flex-row gap-8 md:gap-16 items-center',
										isLeft ? 'md:flex-row-reverse' : '',
									)}
								>
									{/* Content Card */}
									<div className="flex-1 w-full pl-14 md:pl-0">
										<div
											className={cn(
												'group relative p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden',
												'bg-card/40 border-white/5 hover:border-white/10',
											)}
										>
											{/* Hover Gradient Glow */}
											<div
												className={cn(
													'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
													'bg-linear-to-br from-white/5 to-transparent',
												)}
											/>
											{/* Colored sheen based on type */}
											<div
												className={cn(
													'absolute inset-0 opacity-0 group-hover:opacity-10 transition-duration-500 pointer-events-none',
													config.bg,
												)}
											/>

											{/* Header: Icon + Date */}
											<div className="flex items-center justify-between mb-4 relative z-10">
												<div
													className={cn(
														'flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm',
														config.bg,
														config.border,
														config.color,
													)}
												>
													<Icon className="w-3.5 h-3.5" />
													<span>{entry.type}</span>
												</div>
												<div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground/80 bg-black/20 border border-white/5 px-2 py-1 rounded-md">
													<Calendar className="w-3.5 h-3.5" />
													<span>{entry.date}</span>
												</div>
											</div>

											{/* Body */}
											<div className="relative z-10">
												<h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-emerald-400 transition-colors">
													{entry.title}
												</h3>
												{entry.company && (
													<div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
														<Briefcase className="w-3.5 h-3.5" />
														{entry.company}
														{entry.location && (
															<>
																<span className="opacity-30">
																	•
																</span>
																<span>{entry.location}</span>
															</>
														)}
													</div>
												)}
												<p className="text-sm text-muted-foreground/90 leading-relaxed">
													{entry.description}
												</p>

												{/* Skills/Tags if available */}
												{entry.skills && entry.skills.length > 0 && (
													<div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
														{entry.skills.map((skill: string) => (
															<span
																key={skill}
																className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10 hover:text-white transition-colors"
															>
																{skill}
															</span>
														))}
													</div>
												)}
											</div>
										</div>
									</div>

									{/* Timeline Node */}
									<div className="absolute left-[12px] md:left-1/2 md:-translate-x-1/2 flex items-center justify-center">
										<motion.div
											whileHover={{ scale: 1.2 }}
											className={cn(
												'relative w-5 h-5 rounded-full border-4 border-background shadow-sm z-10',
												config.color.replace('text-', 'bg-'),
											)}
										>
											<div
												className={cn(
													'absolute inset-0 rounded-full animate-ping opacity-20',
													config.color.replace('text-', 'bg-'),
												)}
											/>
										</motion.div>
									</div>

									{/* Spacer for alternate side layout */}
									<div className="flex-1 hidden md:block" />
								</motion.div>
							);
						})}
					</div>
				</div>

				{journey.length === 0 && (
					<div className="text-center py-24 text-muted-foreground">
						<p>No timeline entries found.</p>
					</div>
				)}
			</div>
		</ScrollArea>
	);
}
