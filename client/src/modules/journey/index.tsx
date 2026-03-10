'use client';

import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { api, JourneyEntry, Achievement } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Briefcase,
	GraduationCap,
	Award,
	Heart,
	FlaskConical,
	Calendar,
	MapPin,
	Trophy,
	Medal,
	BookOpen,
	GitBranch,
	Sparkles,
	Users,
	ExternalLink,
	Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/layout/SectionHeader';
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
	volunteering: {
		color: 'text-pink-400',
		icon: Heart,
		bg: 'bg-pink-500/5',
		border: 'border-pink-500/20',
	},
	research: {
		color: 'text-purple-400',
		icon: FlaskConical,
		bg: 'bg-purple-500/5',
		border: 'border-purple-500/20',
	},
};

const achievementCategoryConfig: Record<
	string,
	{ color: string; icon: ComponentType<{ className?: string }> }
> = {
	hackathon: { color: 'text-orange-400', icon: Trophy },
	competition: { color: 'text-cyan-400', icon: Medal },
	award: { color: 'text-yellow-400', icon: Award },
	opensource: { color: 'text-green-400', icon: GitBranch },
	publication: { color: 'text-indigo-400', icon: BookOpen },
	scholarship: { color: 'text-amber-400', icon: Sparkles },
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
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const [journeyData, achievementData] = await Promise.all([
				api.getJourney(),
				api.getAchievements(),
			]);
			setJourney(journeyData.sort((a, b) => a.order - b.order));
			setAchievements(achievementData.sort((a, b) => a.order - b.order));
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

	// Standalone achievements (not linked to a journey entry)
	const standaloneAchievements = achievements.filter(a => !a.journeyEntryId);

	if (loading) return <JourneySkeleton />;

	if (error) {
		return <div className="text-center py-24 text-muted-foreground">{error}</div>;
	}

	return (
		<ScrollArea className="h-full">
			<div className="p-6 md:p-12 max-w-5xl mx-auto pb-24 relative">
				{/* Header */}
				<SectionHeader
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
													{entry.isCurrent && (
														<span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 align-middle">
															Current
														</span>
													)}
												</h3>
												{entry.organization && (
													<div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
														<Briefcase className="w-3.5 h-3.5" />
														{entry.organization}
														{entry.location && (
															<>
																<span className="opacity-30">
																	•
																</span>
																<MapPin className="w-3 h-3" />
																<span>{entry.location}</span>
															</>
														)}
													</div>
												)}

												{/* Education details */}
												{entry.type === 'education' &&
													(entry.degree ||
														entry.grade ||
														entry.board) && (
														<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/80 mb-3">
															{entry.degree && entry.fieldOfStudy && (
																<span className="flex items-center gap-1">
																	<GraduationCap className="w-3 h-3" />
																	{entry.degree} —{' '}
																	{entry.fieldOfStudy}
																</span>
															)}
															{entry.grade && (
																<span className="flex items-center gap-1">
																	<Star className="w-3 h-3 text-yellow-400" />
																	{entry.grade}
																</span>
															)}
															{entry.board && (
																<span className="flex items-center gap-1">
																	<BookOpen className="w-3 h-3" />
																	{entry.board}
																</span>
															)}
														</div>
													)}

												{/* Work details */}
												{entry.type === 'work' && entry.employmentType && (
													<div className="text-xs text-muted-foreground/70 mb-3 capitalize">
														{entry.employmentType}
													</div>
												)}

												<p className="text-sm text-muted-foreground/90 leading-relaxed">
													{entry.description}
												</p>

												{/* Linked achievements */}
												{entry.achievements &&
													entry.achievements.length > 0 && (
														<div className="mt-4 pt-3 border-t border-white/5 space-y-2">
															{entry.achievements.map(achievement => {
																const achConfig =
																	achievementCategoryConfig[
																		achievement.category
																	] ||
																	achievementCategoryConfig.award;
																const AchIcon = achConfig.icon;
																return (
																	<div
																		key={achievement.id}
																		className="flex items-start gap-2 text-xs text-muted-foreground/80 bg-white/[0.02] rounded-lg px-3 py-2 border border-white/5"
																	>
																		<AchIcon
																			className={cn(
																				'w-3.5 h-3.5 mt-0.5 shrink-0',
																				achConfig.color,
																			)}
																		/>
																		<div className="min-w-0">
																			<span className="font-medium text-foreground/90">
																				{achievement.title}
																			</span>
																			{achievement.rank && (
																				<span
																					className={cn(
																						'ml-2 text-[10px] font-bold',
																						achConfig.color,
																					)}
																				>
																					{
																						achievement.rank
																					}
																				</span>
																			)}
																			{achievement.team &&
																				achievement.team
																					.length > 1 && (
																					<span className="ml-2 inline-flex items-center gap-1 text-muted-foreground/60">
																						<Users className="w-3 h-3" />
																						{
																							achievement
																								.team
																								.length
																						}
																					</span>
																				)}
																		</div>
																	</div>
																);
															})}
														</div>
													)}

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

				{/* Standalone Achievements Section */}
				{standaloneAchievements.length > 0 && (
					<motion.div
						variants={fadeInUp}
						initial="hidden"
						whileInView="visible"
						viewport={viewportSettings}
						className="mt-16"
					>
						<h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
							<Award className="w-5 h-5 text-yellow-400" />
							Achievements
						</h2>
						<div className="grid gap-4 sm:grid-cols-2">
							{standaloneAchievements.map(achievement => {
								const achConfig =
									achievementCategoryConfig[achievement.category] ||
									achievementCategoryConfig.award;
								const AchIcon = achConfig.icon;
								return (
									<div
										key={achievement.id}
										className="group relative p-5 rounded-xl border bg-card/40 border-white/5 hover:border-white/10 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
									>
										<div className="flex items-start gap-3">
											<div
												className={cn(
													'p-2 rounded-lg bg-white/5 border border-white/5',
													achConfig.color,
												)}
											>
												<AchIcon className="w-4 h-4" />
											</div>
											<div className="min-w-0 flex-1">
												<div className="flex items-center justify-between gap-2 mb-1">
													<h3 className="text-sm font-bold text-foreground group-hover:text-yellow-400 transition-colors truncate">
														{achievement.title}
													</h3>
													{achievement.rank && (
														<span
															className={cn(
																'text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/5 shrink-0',
																achConfig.color,
															)}
														>
															{achievement.rank}
														</span>
													)}
												</div>
												{(achievement.issuer || achievement.event) && (
													<p className="text-xs text-muted-foreground/70 mb-2">
														{achievement.issuer}
														{achievement.issuer &&
															achievement.event &&
															' — '}
														{achievement.event}
													</p>
												)}
												{achievement.description && (
													<p className="text-xs text-muted-foreground/80 leading-relaxed mb-3">
														{achievement.description}
													</p>
												)}
												<div className="flex items-center justify-between">
													<div className="flex flex-wrap gap-1.5">
														{achievement.tags?.slice(0, 3).map(tag => (
															<span
																key={tag}
																className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground border border-white/5"
															>
																{tag}
															</span>
														))}
													</div>
													<div className="flex items-center gap-2">
														{achievement.team &&
															achievement.team.length > 1 && (
																<span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
																	<Users className="w-3 h-3" />
																	{achievement.team.length}
																</span>
															)}
														{achievement.proofUrl && (
															<a
																href={achievement.proofUrl}
																target="_blank"
																rel="noopener noreferrer"
																className="text-muted-foreground/50 hover:text-foreground transition-colors"
															>
																<ExternalLink className="w-3.5 h-3.5" />
															</a>
														)}
													</div>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</motion.div>
				)}

				{journey.length === 0 && standaloneAchievements.length === 0 && (
					<div className="text-center py-24 text-muted-foreground">
						<p>No timeline entries found.</p>
					</div>
				)}
			</div>
		</ScrollArea>
	);
}
