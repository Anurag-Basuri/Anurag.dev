'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Target, ExternalLink, Award, Sparkles } from 'lucide-react';
import { apiClient } from '@/api/client';
import type { Achievement } from '@/api/schema';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { cn } from '@/lib/utils';
import { staggerContainer, scaleIn } from '@/design-system/motion';

const getCategoryIcon = (category: string) => {
	switch (category.toLowerCase()) {
		case 'hackathon':
			return <Target className="w-6 h-6 text-rose-400" />;
		case 'competition':
			return <Medal className="w-6 h-6 text-amber-400" />;
		case 'opensource':
			return <Star className="w-6 h-6 text-emerald-400" />;
		default:
			return <Award className="w-6 h-6 text-blue-400" />;
	}
};

const getCategoryColor = (category: string) => {
	switch (category.toLowerCase()) {
		case 'hackathon':
			return 'from-rose-500/20 to-rose-500/0 border-rose-500/30 group-hover:border-rose-500/60 shadow-[0_0_30px_-5px_rgba(244,63,94,0.15)] group-hover:shadow-[0_0_40px_0px_rgba(244,63,94,0.3)]';
		case 'competition':
			return 'from-amber-500/20 to-amber-500/0 border-amber-500/30 group-hover:border-amber-500/60 shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)] group-hover:shadow-[0_0_40px_0px_rgba(245,158,11,0.3)]';
		case 'opensource':
			return 'from-emerald-500/20 to-emerald-500/0 border-emerald-500/30 group-hover:border-emerald-500/60 shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_40px_0px_rgba(16,185,129,0.3)]';
		default:
			return 'from-blue-500/20 to-blue-500/0 border-blue-500/30 group-hover:border-blue-500/60 shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_40px_0px_rgba(59,130,246,0.3)]';
	}
};

export function AchievementsModule() {
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchAchievements() {
			try {
				const data = await apiClient.get<Achievement[]>('/achievements');
				setAchievements(data || []);
			} catch (err) {
				console.error('Failed to load achievements', err);
			} finally {
				setLoading(false);
			}
		}
		fetchAchievements();
	}, []);

	if (loading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
			</div>
		);
	}

	return (
		<ScrollArea className="h-full w-full">
			<div className="p-6 md:p-12 max-w-6xl mx-auto pb-32">
				<SectionHeader
					icon={Trophy}
					label="Triumphs"
					title="Awards & Honors"
					description="Hackathon wins, open-source milestones, and competitive programming ranks."
				/>

				{achievements.length === 0 ? (
					<div className="text-center py-20 text-muted-foreground border border-dashed border-white/10 rounded-3xl bg-[#0a0a0a]/50 mt-12">
						No achievements recorded yet.
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
						className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 auto-rows-fr"
					>
						{achievements.map(achievement => {
							const colorClass = getCategoryColor(achievement.category);
							const link = achievement.url || achievement.proofUrl;

							return (
								<motion.div
									key={achievement.id}
									variants={scaleIn}
									whileHover={{ y: -8, scale: 1.02 }}
									transition={{ type: 'spring', stiffness: 300, damping: 20 }}
									className={cn(
										'relative group flex flex-col h-full bg-[#0a0a0a]/80 backdrop-blur-xl border rounded-[2rem] overflow-hidden transition-all duration-500',
										colorClass,
									)}
								>
									{/* Top glowing gradient */}
									<div
										className={cn(
											'absolute inset-x-0 top-0 h-32 bg-gradient-to-b opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
											colorClass.split(' ')[0],
											colorClass.split(' ')[1],
										)}
									/>

									<div className="p-8 relative z-10 flex flex-col grow">
										<div className="flex justify-between items-start mb-6">
											<div className="p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 shadow-inner">
												{getCategoryIcon(achievement.category)}
											</div>

											{achievement.featured && (
												<div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest shadow-inner">
													<Sparkles className="w-3 h-3" />
													Featured
												</div>
											)}
										</div>

										<h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-3 leading-tight">
											{achievement.title}
										</h3>

										{achievement.issuer && (
											<p className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
												<span className="w-4 h-[1px] bg-muted-foreground/30" />
												{achievement.issuer}
											</p>
										)}

										<p className="text-sm text-foreground/70 leading-relaxed mb-8 flex-grow">
											{achievement.description}
										</p>

										<div className="mt-auto space-y-5">
											{(achievement.rank || achievement.event) && (
												<div className="flex flex-wrap gap-2">
													{achievement.rank && (
														<span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white shadow-inner">
															🏆 {achievement.rank}
														</span>
													)}
													{achievement.event && (
														<span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/70 shadow-inner">
															{achievement.event}
														</span>
													)}
												</div>
											)}

											{link && (
												<div className="pt-5 border-t border-white/10 flex items-center justify-between">
													<a
														href={link}
														target="_blank"
														rel="noreferrer"
														className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors group/link"
													>
														View Certificate
														<ExternalLink className="w-3.5 h-3.5 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
													</a>
												</div>
											)}
										</div>
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				)}
			</div>
		</ScrollArea>
	);
}

