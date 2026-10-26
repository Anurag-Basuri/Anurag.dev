'use client';

import { useEffect, useState, memo, useMemo } from 'react';
import { publicService } from '@/api';
import type { Achievement } from '@/api/schema';

import { Trophy, Award, Medal, Target, ExternalLink, Sparkles, Star, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/animations/motion';
import { SectionHeader } from '@/ui/SectionHeader';
import { UrlThumbnail } from '@/ui/UrlThumbnail';
import { SpotlightCard } from '@/ui/SpotlightCard';
import { cn } from '@/lib/utils';

// ─── Skeleton ───────────────────────────────────────────────────
function AchievementsSkeleton() {
	return (
		<div className="px-3 sm:px-6 md:px-8 max-w-7xl mx-auto animate-pulse pb-12 pt-4">
			<div className="space-y-3 mb-6">
				<div className="h-5 w-28 bg-foreground/5 rounded-lg" />
				<div className="h-8 w-56 bg-foreground/5 rounded-xl" />
			</div>
			<div className="h-44 bg-foreground/5 rounded-2xl mb-4" />
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
				{[1, 2, 3].map(i => (
					<div key={i} className="h-48 bg-foreground/5 rounded-xl" />
				))}
			</div>
		</div>
	);
}

// ─── Helpers ────────────────────────────────────────────────────
const getCategoryDetails = (category: string) => {
	switch (category.toLowerCase()) {
		case 'hackathon':
			return { icon: <Target className="w-4 h-4 text-amber-400" />, fallback: Target };
		case 'competition':
			return { icon: <Medal className="w-4 h-4 text-primary" />, fallback: Medal };
		case 'opensource':
			return { icon: <Star className="w-4 h-4 text-cyan-400" />, fallback: Star };
		default:
			return { icon: <Award className="w-4 h-4 text-primary" />, fallback: Award };
	}
};

// ─── Trophy Stage Card (Featured Achievement) ───────────────────
function TrophyStageCard({ achievement }: { achievement: Achievement }) {
	const link = achievement.url || achievement.proofUrl;

	return (
		<motion.div
			initial={{ opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35 }}
			className="mb-6 sm:mb-8"
		>
			<SpotlightCard
				tilt={false}
				className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card/50 to-card/40 backdrop-blur-xl p-5 sm:p-7 md:p-8 relative overflow-hidden group shadow-md hover:border-amber-500/50 transition-all"
			>
				{/* Background Trophy Glow */}
				<div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none -z-10" />

				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
					<div className="flex items-start gap-4">
						{/* Trophy Emblem */}
						<div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
							<Trophy className="w-7 h-7 sm:w-8 sm:h-8" />
						</div>

						{/* Narrative */}
						<div>
							<div className="flex flex-wrap items-center gap-2 mb-1.5">
								<span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono uppercase tracking-wider font-bold">
									★ National Honor
								</span>
								{achievement.rank && (
									<span className="px-2 py-0.5 rounded-full bg-foreground/5 border border-border text-[11px] font-mono text-foreground font-medium">
										{achievement.rank}
									</span>
								)}
								{achievement.event && (
									<span className="text-xs font-mono text-muted-foreground">
										{achievement.event}
									</span>
								)}
							</div>

							<h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight font-sans">
								{achievement.title}
							</h3>

							{achievement.issuer && (
								<p className="text-xs font-mono text-amber-400/90 font-medium mt-1">
									Issued by: {achievement.issuer}
								</p>
							)}

							{achievement.description && (
								<p className="text-xs sm:text-sm text-foreground/80 font-sans leading-relaxed mt-2.5 max-w-2xl">
									{achievement.description}
								</p>
							)}
						</div>
					</div>

					{/* Action */}
					{link && (
						<a
							href={link}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-xs font-mono uppercase tracking-wider hover:bg-amber-500/25 transition-all shrink-0 shadow-xs self-stretch sm:self-auto justify-center"
						>
							<span>View Verification</span>
							<ExternalLink className="w-3.5 h-3.5" />
						</a>
					)}
				</div>
			</SpotlightCard>
		</motion.div>
	);
}

// ─── Standard Achievement Card ──────────────────────────────────
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
				className="group relative flex flex-col h-full rounded-xl border border-border/60 hover:border-primary/40 bg-card/40 backdrop-blur-xl transition-all duration-300 shadow-sm hover:shadow-md p-4"
			>
				<div className="flex items-center justify-between gap-2 mb-3">
					<div className="p-2 rounded-lg bg-surface-2 border border-border/50">
						{details.icon}
					</div>
					{achievement.rank && (
						<span className="px-2 py-0.5 rounded-md bg-surface-2 border border-border/40 text-[11px] font-mono text-foreground/80">
							{achievement.rank}
						</span>
					)}
				</div>

				<h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight mb-1 leading-snug group-hover:text-primary transition-colors font-sans">
					{achievement.title}
				</h3>

				{achievement.issuer && (
					<p className="text-xs font-mono text-muted-foreground mb-2">
						{achievement.issuer}
					</p>
				)}

				{achievement.description && (
					<p className="text-xs text-muted-foreground/90 leading-relaxed mb-4 grow line-clamp-3 font-sans">
						{achievement.description}
					</p>
				)}

				{link && (
					<div className="pt-2.5 border-t border-border/40 mt-auto">
						<a
							href={link}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:underline"
						>
							<span>Verify Certificate</span>
							<ExternalLink className="w-3 h-3" />
						</a>
					</div>
				)}
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

	// Separate featured SIH hackathon from the rest
	const { featuredAchievement, remainingAchievements } = useMemo(() => {
		const featured = achievements.find(a => a.featured || a.category.toLowerCase() === 'hackathon');
		const remaining = achievements.filter(a => a.id !== featured?.id);
		return { featuredAchievement: featured, remainingAchievements: remaining };
	}, [achievements]);

	if (loading) return <AchievementsSkeleton />;

	return (
		<div className="h-full w-full pb-16">
			<div className="px-3 sm:px-6 md:px-8 max-w-7xl mx-auto pt-2 sm:pt-4">
				<SectionHeader
					icon={Trophy}
					index="06"
					tag="AWARDS"
					title="Honors & Achievements"
					description="National hackathon honors, competitive programming milestones, and technical awards."
					sectionId="achievements"
				/>

				{/* Featured Trophy Card */}
				{featuredAchievement && <TrophyStageCard achievement={featuredAchievement} />}

				{/* Secondary Grid */}
				{remainingAchievements.length > 0 && (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-40px' }}
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4"
					>
						{remainingAchievements.map(achievement => (
							<AchievementCard key={achievement.id} achievement={achievement} />
						))}
					</motion.div>
				)}
			</div>
		</div>
	);
}