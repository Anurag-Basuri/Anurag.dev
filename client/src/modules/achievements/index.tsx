'use client';

import { useEffect, useState, memo, type ReactNode } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Target, ExternalLink, Award, Sparkles } from 'lucide-react';
import { publicService } from '@/api';
import type { Achievement } from '@/api/schema';
import { ScrollArea } from '@/ui/scroll-area';
import { SectionHeader } from '@/ui/SectionHeader';
import { cn } from '@/lib/utils';
import { staggerContainer, scaleIn } from '@/animations/motion';

// ─── Skeleton ───────────────────────────────────────────────────

function AchievementsSkeleton() {
	return (
		<div className="p-6 md:p-12 max-w-6xl mx-auto animate-pulse pb-32">
			<div className="space-y-4 mb-12 pb-8">
				<div className="h-6 w-28 bg-white/5 rounded-lg" />
				<div className="h-12 w-64 bg-white/5 rounded-xl" />
				<div className="h-5 w-96 bg-white/5 rounded-lg" />
			</div>
			<div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
				{[1, 2, 3, 4, 5, 6].map(i => (
					<div
						key={i}
						className="h-96 bg-[#0a0a0a]/60 backdrop-blur border border-white/5 rounded-[2rem]"
					/>
				))}
			</div>
		</div>
	);
}

// ─── Helpers ────────────────────────────────────────────────────

const getCategoryIcon = (category: string): ReactNode => {
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

const getCategoryPlaceholderIcon = (category: string): ReactNode => {
	switch (category.toLowerCase()) {
		case 'hackathon':
			return <Target className="w-10 h-10 text-rose-500/30 group-hover:text-rose-400/50 transition-colors duration-500" />;
		case 'competition':
			return <Medal className="w-10 h-10 text-amber-500/30 group-hover:text-amber-400/50 transition-colors duration-500" />;
		case 'opensource':
			return <Star className="w-10 h-10 text-emerald-500/30 group-hover:text-emerald-400/50 transition-colors duration-500" />;
		default:
			return <Award className="w-10 h-10 text-blue-500/30 group-hover:text-blue-400/50 transition-colors duration-500" />;
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

const getCategoryGradient = (category: string) => {
	switch (category.toLowerCase()) {
		case 'hackathon':
			return 'from-rose-950/60';
		case 'competition':
			return 'from-amber-950/60';
		case 'opensource':
			return 'from-emerald-950/60';
		default:
			return 'from-blue-950/60';
	}
};

// ─── Achievement Thumbnail ─────────────────────────────────────

const AchievementThumbnail = memo(function AchievementThumbnail({
	url,
	title,
	category,
	issuer,
}: {
	url: string | null | undefined;
	title: string;
	category: string;
	issuer: string | null | undefined;
}) {
	const [imgFailed, setImgFailed] = useState(false);

	if (url && !imgFailed) {
		return (
			<div className="relative aspect-video overflow-hidden mx-3 mt-3 rounded-t-2xl sm:rounded-t-3xl border border-white/5">
				<div className="absolute inset-0 bg-[#050505] z-0" />
				<Image
					src={url}
					alt={`${title} proof`}
					fill
					className="object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
					onError={() => setImgFailed(true)}
				/>
				<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
			</div>
		);
	}

	return (
		<div className="relative aspect-video overflow-hidden mx-3 mt-3 rounded-t-2xl sm:rounded-t-3xl border border-white/5">
			<div className={cn(
				'w-full h-full bg-gradient-to-br via-[#0a0a0a] to-[#050505] flex flex-col items-center justify-center gap-3',
				getCategoryGradient(category),
			)}>
				<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
				{getCategoryPlaceholderIcon(category)}
				{issuer && (
					<span className="text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">
						{issuer}
					</span>
				)}
			</div>
		</div>
	);
});

// ─── Achievement Card ───────────────────────────────────────────

const AchievementCard = memo(function AchievementCard({
	achievement,
}: {
	achievement: Achievement;
}) {
	const colorClass = getCategoryColor(achievement.category);
	const link = achievement.url || achievement.proofUrl;

	return (
		<motion.div
			variants={scaleIn}
			whileHover={{ y: -8, scale: 1.02 }}
			transition={{ type: 'spring', stiffness: 300, damping: 20 }}
			className={cn(
				'relative group flex flex-col h-full bg-[#0a0a0a]/80 backdrop-blur-xl border rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden transition-all duration-500',
				colorClass,
			)}
		>
			{/* Thumbnail */}
			<AchievementThumbnail
				url={achievement.proofUrl || achievement.url}
				title={achievement.title}
				category={achievement.category}
				issuer={achievement.issuer}
			/>

			<div className="p-5 sm:p-6 relative z-10 flex flex-col grow">
				<div className="flex justify-between items-start mb-4">
					<div className="p-3 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 shadow-inner">
						{getCategoryIcon(achievement.category)}
					</div>

					{achievement.featured && (
						<div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-inner">
							<Sparkles className="w-3 h-3" />
							Featured
						</div>
					)}
				</div>

				<h3 className="text-lg sm:text-xl font-black text-white tracking-tight mb-2 leading-tight">
					{achievement.title}
				</h3>

				{achievement.issuer && (
					<p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
						<span className="w-4 h-[1px] bg-muted-foreground/30" />
						{achievement.issuer}
					</p>
				)}

				{achievement.description && (
					<p className="text-xs sm:text-sm text-foreground/70 leading-relaxed mb-4 flex-grow line-clamp-3">
						{achievement.description}
					</p>
				)}

				<div className="mt-auto space-y-4">
					{(achievement.rank || achievement.event) && (
						<div className="flex flex-wrap gap-2">
							{achievement.rank && (
								<span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white shadow-inner">
									{achievement.rank}
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
						<div className="pt-4 border-t border-white/10 flex items-center justify-between">
							<a
								href={link}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors group/link"
								aria-label={`View certificate for ${achievement.title}`}
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
		<ScrollArea className="h-full w-full">
			<div className="p-4 sm:p-6 md:p-12 max-w-6xl mx-auto pb-24 sm:pb-32">
				<SectionHeader
					icon={Trophy}
					label="Triumphs"
					title="Awards & Honors"
					description="Hackathon wins, open-source milestones, and competitive programming ranks."
				/>

				{achievements.length === 0 ? (
					<div className="text-center py-20 mt-12 text-muted-foreground border border-dashed border-white/10 rounded-3xl bg-[#0a0a0a]/50">
						No achievements recorded yet.
					</div>
				) : (
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
						className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 auto-rows-fr"
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
		</ScrollArea>
	);
}
