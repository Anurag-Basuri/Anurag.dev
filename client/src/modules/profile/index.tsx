'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants, Easing } from 'framer-motion';
import {
	User,
	MapPin,
	Briefcase,
	ChevronRight,
	Github,
	ExternalLink,
	Mail,
	Code2,
} from 'lucide-react';
import { publicService } from '@/api';
import type { Profile } from '@/api/schema';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/ui/scroll-area';

// --- Animations ---
const fadeInUp: Variants = {
	hidden: { opacity: 0, y: 30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
	},
};

const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.15,
		},
	},
};

const floatingAnimation = {
	y: ['-3%', '3%'],
	transition: {
		y: {
			duration: 4,
			repeat: Infinity,
			repeatType: 'reverse' as const,
			ease: [0.42, 0, 0.58, 1] as Easing,
		},
	},
};

export function ProfileModule() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchProfile() {
			try {
				const { data } = await publicService.getProfile();
				setProfile(data);
			} catch (err) {
				console.error('Failed to load profile', err);
			} finally {
				setLoading(false);
			}
		}
		fetchProfile();
	}, []);

	if (loading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
			</div>
		);
	}

	if (!profile) return null;

	return (
		<ScrollArea className="h-full w-full relative">
			{/* Ambient Background Glow */}
			<div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
			<div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -z-10" />

			<div className="max-w-6xl mx-auto p-6 md:p-12 pb-32 min-h-full flex flex-col justify-center">
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-between"
				>
					{/* Left Content Area (Text) */}
					<div className="flex-1 space-y-8 z-10">
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
							<h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-foreground to-foreground/60 leading-tight pb-2">
								{profile.name}
							</h1>
							<p className="text-xl md:text-2xl font-medium text-muted-foreground max-w-2xl leading-relaxed">
								{profile.header}
							</p>
						</motion.div>

						{/* Bio */}
						<motion.p
							variants={fadeInUp}
							className="text-base text-muted-foreground/80 max-w-2xl leading-relaxed whitespace-pre-wrap"
						>
							{profile.bio}
						</motion.p>

						{/* Quick Meta Stats */}
						<motion.div
							variants={fadeInUp}
							className="flex flex-wrap items-center gap-6 pt-4 text-sm font-medium text-muted-foreground"
						>
							{profile.Currentlocation && (
								<div className="flex items-center gap-2 bg-muted/20 px-4 py-2 rounded-lg border border-border/40 backdrop-blur-sm shadow-sm transition-colors hover:bg-muted/40">
									<MapPin className="w-4 h-4 text-rose-400" />
									<span>{profile.Currentlocation}</span>
								</div>
							)}
							<div className="flex items-center gap-2 bg-muted/20 px-4 py-2 rounded-lg border border-border/40 backdrop-blur-sm shadow-sm transition-colors hover:bg-muted/40">
								<Briefcase className="w-4 h-4 text-blue-400" />
								<span>{profile.experienceYears}+ Yrs Exp</span>
							</div>
							<div className="flex items-center gap-2 bg-muted/20 px-4 py-2 rounded-lg border border-border/40 backdrop-blur-sm shadow-sm transition-colors hover:bg-muted/40">
								<Code2 className="w-4 h-4 text-emerald-400" />
								<span>{profile.projectsCount}+ Projects</span>
							</div>
						</motion.div>

						{/* Action Buttons */}
						<motion.div variants={fadeInUp} className="flex items-center gap-4 pt-4">
							<button
								onClick={() =>
									window.dispatchEvent(
										new CustomEvent('scroll-to-section', {
											detail: { sectionId: 'contact' },
										}),
									)
								}
								className="group flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95"
							>
								Let's Connect
								<ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</button>

							{profile.resumeUrl && (
								<a
									href={profile.resumeUrl}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-secondary/80 transition-all border border-border/50 active:scale-95"
								>
									Resume <ExternalLink className="w-4 h-4" />
								</a>
							)}
						</motion.div>
					</div>

					{/* Right Content Area (Image / Hero visual) */}
					<motion.div
						variants={fadeInUp}
						className="relative shrink-0 w-64 h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px]"
					>
						<motion.div
							animate={floatingAnimation}
							className="absolute inset-0 rounded-full bg-linear-to-tr from-primary/20 via-blue-500/20 to-purple-500/20 blur-3xl -z-10"
						/>

						{/* Main Image Container */}
						<motion.div
							animate={floatingAnimation}
							className="relative w-full h-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center justify-center group"
						>
							{profile.avatarUrl ? (
								<img
									src={profile.avatarUrl}
									alt={profile.name}
									className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
								/>
							) : (
								<User className="w-32 h-32 text-muted-foreground/30" />
							)}

							{/* Hover Overlay Stats overlaying the image */}
							<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 gap-4">
								<div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
									<p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">
										Core Stack
									</p>
									<div className="flex flex-wrap gap-2">
										{(profile.skills as any)?.Frontend?.slice(0, 3).map(
											(skill: string) => (
												<span
													key={skill}
													className="text-[10px] font-bold px-2 py-1 bg-white/10 rounded-md text-white"
												>
													{skill}
												</span>
											),
										)}
									</div>
								</div>
							</div>
						</motion.div>

						{/* Decorative floating elements */}
						<motion.div
							animate={{ y: ['-10%', '10%'], rotate: [0, 5, 0] }}
							transition={{
								duration: 5,
								repeat: Infinity,
								repeatType: 'reverse',
								ease: 'easeInOut',
								delay: 1,
							}}
							className="absolute -top-6 -right-6 bg-background/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-xl flex items-center gap-3"
						>
							<div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
								<Github className="w-4 h-4 text-indigo-400" />
							</div>
							<div className="pr-2">
								<p className="text-xs font-bold font-mono">Top 1%</p>
								<p className="text-[10px] text-muted-foreground">
									GitHub Open Source
								</p>
							</div>
						</motion.div>
					</motion.div>
				</motion.div>
			</div>
		</ScrollArea>
	);
}
