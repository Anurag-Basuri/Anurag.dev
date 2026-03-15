'use client';

import { useEffect, useState, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
	User,
	MapPin,
	Briefcase,
	ChevronRight,
	ExternalLink,
	Code2,
} from 'lucide-react';
import { publicService } from '@/api';
import type { Profile } from '@/api/schema';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/ui/scroll-area';
import { fadeInUp, staggerContainer, floatLoop } from '@/animations/motion';

// ─── Skeleton ───────────────────────────────────────────────────

function ProfileSkeleton() {
	return (
		<div className="max-w-6xl mx-auto p-6 md:p-12 animate-pulse min-h-full flex flex-col justify-center">
			<div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-between">
				<div className="flex-1 space-y-8 w-full">
					<div className="h-8 w-40 bg-white/5 rounded-full" />
					<div className="space-y-4">
						<div className="h-14 w-3/4 bg-white/5 rounded-xl" />
						<div className="h-8 w-1/2 bg-white/5 rounded-lg" />
					</div>
					<div className="h-20 w-full bg-white/5 rounded-lg" />
					<div className="flex gap-4">
						<div className="h-10 w-28 bg-white/5 rounded-lg" />
						<div className="h-10 w-28 bg-white/5 rounded-lg" />
						<div className="h-10 w-28 bg-white/5 rounded-lg" />
					</div>
					<div className="flex gap-4">
						<div className="h-12 w-36 bg-white/5 rounded-xl" />
						<div className="h-12 w-28 bg-white/5 rounded-xl" />
					</div>
				</div>
				<div className="shrink-0 w-64 h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] bg-white/5 rounded-[2.5rem] md:rounded-[3rem]" />
			</div>
		</div>
	);
}

// ─── Core Stack Overlay ─────────────────────────────────────────

const CoreStackOverlay = memo(function CoreStackOverlay({
	skills,
}: {
	skills: Record<string, string[]> | null | undefined;
}) {
	const topSkills = useMemo(() => {
		if (!skills) return [];
		const first = Object.values(skills)[0];
		return first?.slice(0, 3) ?? [];
	}, [skills]);

	if (topSkills.length === 0) return null;

	return (
		<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 sm:p-8 gap-4">
			<div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
				<p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">
					Core Stack
				</p>
				<div className="flex flex-wrap gap-2">
					{topSkills.map((skill: string) => (
						<span
							key={skill}
							className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded-md text-white"
						>
							{skill}
						</span>
					))}
				</div>
			</div>
		</div>
	);
});

// ─── Main Module ────────────────────────────────────────────────

export function ProfileModule() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchProfile() {
			const { data } = await publicService.getProfile();
			setProfile(data);
			setLoading(false);
		}
		fetchProfile();
	}, []);

	if (loading) return <ProfileSkeleton />;
	if (!profile) return null;

	return (
		<ScrollArea className="h-full w-full relative">
			{/* Ambient Background Glow */}
			<div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
			<div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -z-10" />

			<div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-12 pb-24 sm:pb-32 min-h-full flex flex-col justify-center">
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-20 items-center justify-between"
				>
					{/* Left Content Area (Text) */}
					<div className="flex-1 space-y-6 sm:space-y-8 z-10">
						{/* Availability Badge */}
						<motion.div
							variants={fadeInUp}
							className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md"
						>
							<div
								className={cn(
									'w-2 h-2 rounded-full animate-pulse',
									profile.openToWork ? 'bg-green-400' : 'bg-primary',
								)}
							/>
							<span className="text-xs font-semibold tracking-wide text-primary uppercase">
								{profile.openToWork ? 'Open to Work' : 'Currently Unavailable'}
							</span>
						</motion.div>

						{/* Header & Name */}
						<motion.div variants={fadeInUp} className="space-y-4">
							<h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-foreground to-foreground/60 leading-tight pb-2">
								{profile.name}
							</h1>
							{profile.header && (
								<p className="text-lg sm:text-xl md:text-2xl font-medium text-muted-foreground max-w-2xl leading-relaxed">
									{profile.header}
								</p>
							)}
						</motion.div>

						{/* Bio */}
						{profile.bio && (
							<motion.p
								variants={fadeInUp}
								className="text-sm sm:text-base text-muted-foreground/80 max-w-2xl leading-relaxed whitespace-pre-wrap"
							>
								{profile.bio}
							</motion.p>
						)}

						{/* Quick Meta Stats */}
						<motion.div
							variants={fadeInUp}
							className="flex flex-wrap items-center gap-3 sm:gap-6 pt-4 text-sm font-medium text-muted-foreground"
						>
							{profile.Currentlocation && (
								<div className="flex items-center gap-2 bg-muted/20 px-3 sm:px-4 py-2 rounded-lg border border-border/40 backdrop-blur-sm shadow-sm transition-colors hover:bg-muted/40">
									<MapPin className="w-4 h-4 text-rose-400" />
									<span>{profile.Currentlocation}</span>
								</div>
							)}
							<div className="flex items-center gap-2 bg-muted/20 px-3 sm:px-4 py-2 rounded-lg border border-border/40 backdrop-blur-sm shadow-sm transition-colors hover:bg-muted/40">
								<Briefcase className="w-4 h-4 text-blue-400" />
								<span>{profile.experienceYears}+ Yrs Exp</span>
							</div>
							<div className="flex items-center gap-2 bg-muted/20 px-3 sm:px-4 py-2 rounded-lg border border-border/40 backdrop-blur-sm shadow-sm transition-colors hover:bg-muted/40">
								<Code2 className="w-4 h-4 text-emerald-400" />
								<span>{profile.projectsCount}+ Projects</span>
							</div>
						</motion.div>

						{/* Action Buttons */}
						<motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4">
							<button
								onClick={() =>
									window.dispatchEvent(
										new CustomEvent('scroll-to-section', {
											detail: { sectionId: 'contact' },
										}),
									)
								}
								className="group flex items-center gap-2 bg-primary text-primary-foreground px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95"
								aria-label="Scroll to contact section"
							>
								Let&apos;s Connect
								<ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</button>

							{profile.resumeUrl && (
								<a
									href={profile.resumeUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 bg-secondary text-secondary-foreground px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-secondary/80 transition-all border border-border/50 active:scale-95"
									aria-label="View resume"
								>
									Resume <ExternalLink className="w-4 h-4" />
								</a>
							)}
						</motion.div>
					</div>

					{/* Right Content Area (Image / Hero visual) */}
					<motion.div
						variants={fadeInUp}
						className="relative shrink-0 w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px]"
					>
						<motion.div
							animate={floatLoop}
							className="absolute inset-0 rounded-full bg-linear-to-tr from-primary/20 via-blue-500/20 to-purple-500/20 blur-3xl -z-10"
						/>

						{/* Main Image Container */}
						<motion.div
							animate={floatLoop}
							className="relative w-full h-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center justify-center group"
						>
							{profile.avatarUrl ? (
								<img
									src={profile.avatarUrl}
									alt={profile.name}
									className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
								/>
							) : (
								<User className="w-24 sm:w-32 h-24 sm:h-32 text-muted-foreground/30" />
							)}

							<CoreStackOverlay skills={profile.skills} />
						</motion.div>
					</motion.div>
				</motion.div>
			</div>
		</ScrollArea>
	);
}
