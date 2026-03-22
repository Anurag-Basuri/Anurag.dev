'use client';

import { useEffect, useState, memo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Target, ExternalLink, Award, Sparkles } from 'lucide-react';
import { publicService } from '@/api';
import type { Achievement } from '@/api/schema';
import { SectionHeader } from '@/ui/SectionHeader';
import { UrlThumbnail } from '@/ui/UrlThumbnail';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, cardHover } from '@/animations/motion';

// ─── Skeleton ───────────────────────────────────────────────────

function AchievementsSkeleton() {
	return (
		<div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto animate-pulse pb-16">
			<div className="space-y-3 mb-8">
				<div className="h-5 w-28 bg-foreground/5 rounded-lg" />
				<div className="h-8 w-56 bg-foreground/5 rounded-xl" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
				{[1, 2, 3, 4, 5, 6].map(i => (
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
			return {
				icon: <Target className="w-5 h-5 text-rose-400" />,
				color: 'from-rose-500/20 to-rose-500/0 border-rose-500/30 group-hover:border-rose-500/50 shadow-rose-500/10',
				accent: 'rose',
				gradient: 'from-rose-950/60',
				fallback: Target,
			};
		case 'competition':
			return {
				icon: <Medal className="w-5 h-5 text-amber-400" />,
				color: 'from-amber-500/20 to-amber-500/0 border-amber-500/30 group-hover:border-amber-500/50 shadow-amber-500/10',
				accent: 'amber',
				gradient: 'from-amber-950/60',
				fallback: Medal,
			};
		case 'opensource':
			return {
				icon: <Star className="w-5 h-5 text-emerald-400" />,
				color: 'from-emerald-500/20 to-emerald-500/0 border-emerald-500/30 group-hover:border-emerald-500/50 shadow-emerald-500/10',
				accent: 'emerald',
				gradient: 'from-emerald-950/60',
				fallback: Star,
			};
		default:
			return {
				icon: <Award className="w-5 h-5 text-blue-400" />,
				color: 'from-blue-500/20 to-blue-500/0 border-blue-500/30 group-hover:border-blue-500/50 shadow-blue-500/10',
				accent: 'blue',
				gradient: 'from-blue-950/60',
				fallback: Award,
			};
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
		<motion.div
			variants={staggerItem}
			whileHover={cardHover}
			className={cn(
				'relative group flex flex-col h-full bg-linear-to-br from-white/5 to-transparent backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300 shadow-lg',
				details.color,
			)}
		>
			<div className={`absolute inset-0 bg-linear-to-br from-${details.accent}-500/0 to-transparent group-hover:from-${details.accent}-500/8 transition-colors duration-300 pointer-events-none`} />

			{/* Thumbnail — edge-to-edge */}
			<div className="relative aspect-video overflow-hidden bg-card">
				<UrlThumbnail
					url={achievement.proofUrl || achievement.url}
					title={achievement.title}
					fallbackIcon={details.fallback}
					fallbackLabel={achievement.issuer || undefined}
					fallbackGradient={details.gradient}
				/>
				<div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
			</div>

			<div className="p-3 relative z-10 flex flex-col grow">
				<div className="flex justify-between items-center mb-2">
					<div className="p-1.5 rounded-lg bg-card border border-border shadow-md">
						{details.icon}
					</div>
					{achievement.featured && (
						<div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-widest">
							<Sparkles className="w-2.5 h-2.5" />
							Featured
						</div>
					)}
				</div>

				<h3 className="text-sm font-black text-foreground tracking-tight mb-1 leading-tight group-hover:text-foreground/90 transition-colors line-clamp-2">
					{achievement.title}
				</h3>

				{achievement.issuer && (
					<p className={`text-[9px] font-bold uppercase tracking-wider text-${details.accent}-400 mb-2 flex items-center gap-1.5`}>
						<span className={`w-3 h-[1.5px] bg-${details.accent}-400/50 rounded-full`} />
						{achievement.issuer}
					</p>
				)}

				{achievement.description && (
					<p className="text-[10px] text-muted-foreground leading-snug mb-3 grow line-clamp-2 font-medium">
						{achievement.description}
					</p>
				)}

				<div className="mt-auto space-y-2.5">
					{(achievement.rank || achievement.event) && (
						<div className="flex flex-wrap gap-1.5">
							{achievement.rank && (
								<span className="px-2 py-0.5 rounded-md bg-foreground/5 border border-border text-[8px] font-black uppercase text-foreground">
									{achievement.rank}
								</span>
							)}
							{achievement.event && (
								<span className="px-2 py-0.5 rounded-md bg-foreground/5 border border-border text-[8px] font-black uppercase text-muted-foreground">
									{achievement.event}
								</span>
							)}
						</div>
					)}

					{link && (
						<div className="pt-2.5 border-t border-border">
							<a
								href={link}
								target="_blank"
								rel="noopener noreferrer"
								className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-${details.accent}-400 transition-colors group/link`}
								aria-label={`View certificate for ${achievement.title}`}
							>
								View Details
								<ExternalLink className="w-3 h-3 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
							</a>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
});

// ─── Main Module ────────────────────────────────────────────────

export function AchievementsModule() {
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchAchievements() {
			const { data } = await publicService.getAchievements();
			setAchievements(data || []);
			setLoading(false);
		}
		fetchAchievements();
	}, []);

	if (loading) return <AchievementsSkeleton />;

	return (
		<div className="h-full w-full">
			<div className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto pb-10 sm:pb-14 pt-6 md:pt-8">
				<SectionHeader
					icon={Trophy}
					label="Triumphs"
					title="Achievements"
					description="Hackathon wins, open-source milestones, and competitive programming ranks."
					sectionId="achievements"
				/>

				{achievements.length === 0 ? (
					<div className="text-center py-20 mt-12 text-muted-foreground border border-dashed border-border rounded-xl bg-card/50">
						No achievements recorded yet.
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-20px' }}
						className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
					>
						{achievements.map(achievement => (
							<AchievementCard
								key={achievement.id}
								achievement={achievement}
							/>
						))}
					</motion.div>
				)}
			</div>
		</div>
	);
}
