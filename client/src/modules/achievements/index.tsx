'use client';

import { useEffect, useState } from 'react';
import { publicService } from '@/api';
import type { Achievement } from '@/api/schema';
import { Trophy, Award, ExternalLink, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/animations/motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { cn } from '@/lib/utils';

function AchievementsSkeleton() {
	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
			<div className="h-6 w-32 bg-foreground/5 rounded-md" />
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
				{[1, 2, 3].map(i => (
					<div key={i} className="h-56 bg-foreground/5 rounded-2xl" />
				))}
			</div>
		</div>
	);
}

export function AchievementModule() {
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		async function fetchAchievements() {
			try {
				const { data } = await publicService.getAchievements();
				if (!cancelled) setAchievements(data || []);
			} catch (err) {
				console.error('Failed to load achievements', err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		fetchAchievements();
		return () => { cancelled = true; };
	}, []);

	if (loading && achievements.length === 0) return <AchievementsSkeleton />;

	return (
		<div className="w-full min-h-full pb-20 sm:pb-28">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6">
				{/* 06 · Section Header */}
				<SectionHeader
					icon={Trophy}
					index="06"
					tag="HONORS"
					title="Competitions & Honors"
					description="Competitive programming benchmarks, hackathon podium finishes, and tournament achievements."
					sectionId="achievements"
				/>

				{achievements.length === 0 ? (
					<div className="text-center py-20 border border-dashed border-border/40 rounded-2xl bg-card/10 mt-6">
						<p className="text-muted-foreground text-sm font-mono">No achievements recorded yet.</p>
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-6"
					>
						{achievements.map((item, idx) => {
							const link = item.url || item.proofUrl;

							return (
								<motion.div
									key={item.id || idx}
									variants={staggerItem}
									className="group flex flex-col justify-between rounded-2xl border border-border/40 bg-card/25 backdrop-blur-xl p-6 hover:border-border/80 transition-all duration-300 shadow-xs hover:shadow-md"
								>
									<div>
										{/* Top Header */}
										<div className="flex items-center justify-between gap-2 mb-3">
											<span className="font-mono text-xs text-primary/90 font-medium">
												// 0{idx + 1}
											</span>
											{item.rank && (
												<span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-[11px] font-medium">
													{item.rank}
												</span>
											)}
										</div>

										<h3 className="text-lg font-light tracking-tight text-foreground/95 font-sans group-hover:text-primary transition-colors mb-1">
											{item.title}
										</h3>

										{(item.event || item.issuer) && (
											<p className="text-xs font-mono text-muted-foreground/75 mb-3">
												{[item.event, item.issuer].filter(Boolean).join(' · ')}
											</p>
										)}

										{item.description && (
											<p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-normal mb-4">
												{item.description}
											</p>
										)}
									</div>

									<div>
										{/* Tags */}
										{(item.tags ?? []).length > 0 && (
											<div className="flex flex-wrap items-center gap-1.5 mb-4">
												{(item.tags ?? []).map(tag => (
													<span
														key={tag}
														className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-foreground/[0.03] text-muted-foreground/75 border border-border/30"
													>
														{tag}
													</span>
												))}
											</div>
										)}

										{/* Link / Verification */}
										{link && (
											<div className="pt-3 border-t border-border/20">
												<a
													href={link}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1 text-xs font-mono text-primary/80 hover:text-primary transition-colors"
												>
													<span>Verification Link</span>
													<ArrowUpRight className="w-3.5 h-3.5" />
												</a>
											</div>
										)}
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				)}
			</div>
		</div>
	);
}

export { AchievementModule as AchievementsModule };
export default AchievementModule;