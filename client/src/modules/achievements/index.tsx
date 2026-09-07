'use client';

import { useEffect, useState, memo } from 'react';
import { publicService } from '@/api';
import type { Achievement } from '@/api/schema';

import { Trophy, Award, Medal, Target, ExternalLink, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/animations/motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { UrlThumbnail } from '@/ui/UrlThumbnail';
import { SpotlightCard } from '@/ui/SpotlightCard';

// ─── Skeleton ───────────────────────────────────────────────────

function AchievementsSkeleton() {
	return (
		<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto animate-pulse pb-12 pt-6">
			<div className="space-y-3 mb-8">
				<div className="h-5 w-28 bg-foreground/5 rounded-lg" />
				<div className="h-8 w-56 bg-foreground/5 rounded-xl" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6">
				{[1, 2, 3, 4].map(i => (
					<div key={i} className="h-52 bg-foreground/5 rounded-xl" />
				))}
			</div>
		</div>
	);
}

// ─── Helpers ────────────────────────────────────────────────────

const getCategoryDetails = (category: string) => {
	switch (category.toLowerCase()) {
		case 'hackathon':
			return { icon: <Target className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />, fallback: Target };
		case 'competition':
			return { icon: <Medal className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />, fallback: Medal };
		case 'opensource':
			return { icon: <Star className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />, fallback: Star };
		default:
			return { icon: <Award className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />, fallback: Award };
	}
};

// ─── Achievement Card ───────────────────────────────────────────

const AchievementCard = memo(function AchievementCard({
	achievement,
}: {
	achievement: Achievement;
}) {
	const details = getCategoryDetails(achievement.category);
	const link = achievement.url || achievement.proofUrl;

	return (
		<motion.div variants={staggerItem} className="h-full flex flex-col">
			<SpotlightCard
				tilt={true}
				beam={achievement.featured}
				className="group relative flex flex-col h-full rounded-xl border border-border/80 hover:border-[var(--theme-primary)]/40 transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden"
			>
				{/* Thumbnail — edge-to-edge */}
				<div className="relative aspect-video overflow-hidden bg-card">
					<UrlThumbnail
						url={achievement.proofUrl || achievement.url}
						title={achievement.title}
						fallbackIcon={details.fallback}
						fallbackLabel={achievement.issuer || undefined}
					/>
					<div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-card to-transparent pointer-events-none" />
				</div>

				<div className="p-3.5 relative z-10 flex flex-col grow">
					<div className="flex justify-between items-center mb-2">
						<div className="p-1.5 rounded-lg bg-card border border-border shadow-md">
							{details.icon}
						</div>
						{achievement.featured && (
							<div 
								className="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-mono font-medium uppercase tracking-wider"
								style={{
									background: 'color-mix(in oklch, var(--theme-primary) 10%, transparent)',
									color: 'var(--theme-primary)',
									borderColor: 'color-mix(in oklch, var(--theme-primary) 20%, transparent)'
								}}
							>
								<Sparkles className="w-2.5 h-2.5" />
								Featured
							</div>
						)}
					</div>

					<h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight mb-1.5 leading-snug group-hover:text-foreground/90 transition-colors line-clamp-2 font-sans">
						{achievement.title}
					</h3>

					{achievement.issuer && (
						<p className="text-xs font-mono font-medium uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: 'var(--theme-primary)' }}>
							<span className="w-3 h-[1.5px] rounded-full" style={{ background: 'var(--theme-primary)', opacity: 0.5 }} />
							{achievement.issuer}
						</p>
					)}

					{achievement.description && (
						<p className="text-xs text-muted-foreground/85 leading-relaxed mb-3 grow line-clamp-2 font-normal font-sans">
							{achievement.description}
						</p>
					)}

					<div className="mt-auto space-y-2.5">
						{(achievement.rank || achievement.event) && (
							<div className="flex flex-wrap gap-1.5">
								{achievement.rank && (
									<span className="px-2 py-0.5 rounded-md bg-foreground/5 border border-border text-[11px] font-mono font-medium text-foreground">
										{achievement.rank}
									</span>
								)}
								{achievement.event && (
									<span className="px-2 py-0.5 rounded-md bg-foreground/5 border border-border text-[11px] font-mono font-medium text-muted-foreground">
										{achievement.event}
									</span>
								)}
							</div>
						)}

						{link && (
							<div className="pt-2.5 border-t border-border/60">
								<a
									href={link}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1.5 text-xs font-mono font-medium uppercase tracking-wide text-muted-foreground hover:text-[var(--theme-primary)] transition-colors group/link"
									aria-label={'View certificate for ' + achievement.title}
								>
									View Details
									<ExternalLink className="w-3 h-3 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
								</a>
							</div>
						)}
					</div>
				</div>
			</SpotlightCard>
		</motion.div>
	);
});

// ─── Main Module ────────────────────────────────────────────────

export function AchievementsModule() {
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

	if (loading) return <AchievementsSkeleton />;

	return (
		<div className="h-full w-full">
			<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto pb-8 sm:pb-12 pt-2 md:pt-3">
				<SectionHeader
					icon={Trophy}
					title="Achievements"
					description="Hackathon wins, open-source milestones, and competitive programming ranks."
					sectionId="achievements"
				/>

				{achievements.length === 0 ? (
					<div className="text-center py-16 mt-8 text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50">
						No achievements found.
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-40px' }}
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5 mt-4"
					>
						{achievements.map(achievement => (
							<AchievementCard key={achievement.id} achievement={achievement} />
						))}
					</motion.div>
				)}
			</div>
		</div>
	);
}