'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Briefcase, ChevronRight, ExternalLink, Code2 } from 'lucide-react';
import { publicService } from '@/api';
import type { Profile } from '@/api/schema';
import { cn } from '@/lib/utils';
import {
	fadeInUp,
	fadeIn,
	staggerContainer,
	staggerFast,
	staggerFastItem,
	cardHover,
} from '@/animations/motion';

// ─── Skeleton ───────────────────────────────────────────────────

function ProfileSkeleton() {
	return (
		<div className="w-full animate-pulse">
			{/* Cover */}
			<div className="h-48 sm:h-64 md:h-80 w-full bg-white/5" />
			<div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pb-24">
				{/* Avatar */}
				<div className="w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-3xl -mt-16 md:-mt-20 border-4 border-[#020409]" />
				{/* Info */}
				<div className="mt-6 space-y-4">
					<div className="h-10 w-64 bg-white/5 rounded-xl" />
					<div className="h-6 w-96 bg-white/5 rounded-lg" />
				</div>
				{/* Stats */}
				<div className="mt-8 h-20 w-full bg-white/5 rounded-2xl" />
				{/* Bento */}
				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="md:col-span-2 h-64 bg-white/5 rounded-3xl" />
					<div className="h-64 bg-white/5 rounded-3xl" />
				</div>
			</div>
		</div>
	);
}

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
		<div className="w-full relative min-h-full">
			{/* Ambient Background Glows */}
			<div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
			<div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

			{/* Hero Cover Image Area (gradient fallback if none) */}
			<motion.div
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				className="relative w-full h-48 sm:h-64 md:h-[28rem] bg-[#0a0a0a] border-b border-white/5 overflow-hidden"
			>
				<div className="absolute inset-0 bg-linear-to-br from-primary/20 via-[#0a0a0a] to-[#0a0a0a]" />
				<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]" />
				<div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#020409] to-transparent" />
			</motion.div>

			<div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pb-24 sm:pb-32 -mt-16 sm:-mt-20 md:-mt-24 relative z-10">
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="flex flex-col"
				>
					{/* Header Row: Avatar + Name + Actions */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
						{/* Avatar & Title */}
						<div className="flex flex-col gap-4">
							<motion.div
								variants={fadeInUp}
								className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-[2rem] overflow-hidden border-4 border-[#020409] bg-[#0a0a0a] shadow-2xl flex items-center justify-center group"
							>
								{profile.avatarUrl ? (
									<img
										src={profile.avatarUrl}
										alt={profile.name}
										className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
									/>
								) : (
									<User className="w-16 h-16 text-white/20" />
								)}
								<div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2rem] pointer-events-none" />
							</motion.div>

							<div className="pt-2">
								<motion.div variants={fadeInUp} className="flex items-center gap-4 mb-2">
									<h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white to-white/60">
										{profile.name}
									</h1>
									<div
										className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-md"
										title={profile.openToWork ? 'Open to Work' : 'Currently Unavailable'}
									>
										<div
											className={cn(
												'w-2 h-2 rounded-full shadow-[0_0_10px]',
												profile.openToWork
													? 'bg-green-400 shadow-green-400/50 animate-pulse'
													: 'bg-primary shadow-primary/50',
											)}
										/>
										<span className="text-[10px] font-bold tracking-widest text-primary uppercase hidden sm:inline-block">
											{profile.openToWork ? 'Available' : 'Busy'}
										</span>
									</div>
								</motion.div>
								{profile.header && (
									<motion.p
										variants={fadeInUp}
										className="text-lg md:text-2xl font-medium text-muted-foreground/90 max-w-2xl"
									>
										{profile.header}
									</motion.p>
								)}
							</div>
						</div>

						{/* Action Buttons */}
						<motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3">
							<button
								onClick={() =>
									window.dispatchEvent(
										new CustomEvent('scroll-to-section', {
											detail: { sectionId: 'contact' },
										}),
									)
								}
								className="group flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-semibold transition-all active:scale-95 shadow-[0_0_40px_-10px] shadow-primary/40 hover:shadow-primary/60"
							>
								Let&apos;s Connect
								<ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</button>

							{profile.resumeUrl && (
								<a
									href={profile.resumeUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl font-semibold transition-all border border-white/10 active:scale-95"
								>
									Resume <ExternalLink className="w-4 h-4" />
								</a>
							)}
						</motion.div>
					</div>

					{/* Stats Bar */}
					<motion.div
						variants={fadeInUp}
						className="mt-12 flex flex-wrap md:flex-nowrap items-stretch gap-4"
					>
						{[
							{
								icon: MapPin,
								label: 'Location',
								value: profile.Currentlocation ?? 'Remote',
								color: 'text-rose-400',
								bg: 'bg-rose-400/10 border-rose-400/20',
							},
							{
								icon: Briefcase,
								label: 'Experience',
								value: `${profile.experienceYears}+ Years`,
								color: 'text-sky-400',
								bg: 'bg-sky-400/10 border-sky-400/20',
							},
							{
								icon: Code2,
								label: 'Projects',
								value: `${profile.projectsCount}+ Shipped`,
								color: 'text-emerald-400',
								bg: 'bg-emerald-400/10 border-emerald-400/20',
							},
						].map((stat, i) => (
							<div
								key={i}
								className="flex-1 min-w-[200px] flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors"
							>
								<div className={cn('p-3 rounded-2xl border', stat.bg)}>
									<stat.icon className={cn('w-5 h-5', stat.color)} />
								</div>
								<div>
									<p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
										{stat.label}
									</p>
									<p className="text-lg font-bold text-white tracking-tight">
										{stat.value}
									</p>
								</div>
							</div>
						))}
					</motion.div>

					{/* Bio & Skills Bento Grid */}
					<div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-6">
						{/* Bio Card */}
						{profile.bio && (
							<motion.div
								variants={fadeInUp}
								whileHover={cardHover}
								className="md:col-span-3 p-6 sm:p-8 rounded-[2rem] bg-linear-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm relative overflow-hidden group"
							>
								<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
								<div className="relative z-10 flex flex-col h-full">
									<h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
										About Me
									</h2>
									<p className="text-sm sm:text-base md:text-lg text-white/80 leading-relaxed whitespace-pre-wrap font-medium">
										{profile.bio}
									</p>
								</div>
							</motion.div>
						)}

						{/* Skills Card */}
						{profile.skills && Object.keys(profile.skills).length > 0 && (
							<motion.div
								variants={fadeInUp}
								whileHover={cardHover}
								className="md:col-span-2 p-6 sm:p-8 rounded-[2rem] bg-[#0a0a0a] border border-white/10 relative overflow-hidden group"
							>
								<div className="absolute inset-0 bg-linear-to-bl from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
								<div className="relative z-10 flex flex-col h-full">
									<h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
										Core Stack
									</h2>

									<motion.div
										variants={staggerFast}
										initial="hidden"
										whileInView="visible"
										viewport={{ once: true }}
										className="flex flex-col gap-5"
									>
										{Object.entries(profile.skills)
											.slice(0, 3)
											.map(([category, items]) => (
												<div key={category}>
													<p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
														{category}
													</p>
													<div className="flex flex-wrap gap-2">
														{items.slice(0, 5).map(skill => (
															<motion.span
																key={skill}
																variants={staggerFastItem}
																className="text-xs font-semibold px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-white/90 transition-colors"
															>
																{skill}
															</motion.span>
														))}
														{items.length > 5 && (
															<span className="text-xs font-semibold px-2.5 py-1.5 bg-transparent border border-dashed border-white/10 rounded-lg text-white/40">
																+{items.length - 5}
															</span>
														)}
													</div>
												</div>
											))}
									</motion.div>
								</div>
							</motion.div>
						)}
					</div>
				</motion.div>
			</div>
		</div>
	);
}
