'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Briefcase, ChevronRight, ExternalLink, Code2, FileText, CheckCircle2, Globe, Clock, Target, Layers } from 'lucide-react';
import Link from 'next/link';
import { publicService } from '@/api';
import type { Profile } from '@/api/schema';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/ui/SectionHeader';
import { getSkillIcon } from '@/lib/skill-icons';
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
			<div className="h-48 sm:h-64 md:h-[400px] w-full bg-foreground/5" />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pb-12">
				<div className="w-32 h-32 md:w-40 md:h-40 bg-foreground/10 rounded-2xl -mt-16 md:-mt-20 border-4 border-background" />
				<div className="mt-6 space-y-4">
					<div className="h-10 w-64 bg-foreground/5 rounded-xl" />
					<div className="h-6 w-96 bg-foreground/5 rounded-lg" />
				</div>
				<div className="mt-8 h-24 w-full bg-foreground/5 rounded-2xl" />
				<div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="md:col-span-1 h-64 bg-foreground/5 rounded-2xl" />
					<div className="md:col-span-2 h-96 bg-foreground/5 rounded-2xl" />
				</div>
			</div>
		</div>
	);
}

// ─── Helper Components ──────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, colorClass }: any) => (
	<div className="flex-1 flex flex-col justify-center p-4 sm:p-5 rounded-2xl bg-card/40 backdrop-blur-xl border border-border hover:border-primary/30 transition-all group overflow-hidden relative shadow-sm">
		<div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500", colorClass)} />
		<div className="flex items-center gap-4 relative z-10">
			<div className={cn("p-3 rounded-xl border bg-background shadow-inner transition-colors", colorClass.replace('bg-', 'text-').replace('from-', 'text-'))}>
				<Icon className="w-5 h-5" />
			</div>
			<div>
				<p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest mb-0.5">
					{label}
				</p>
				<p className="text-base sm:text-lg font-black text-foreground tracking-tight leading-none">
					{value}
				</p>
			</div>
		</div>
	</div>
);

// ─── Main Module ────────────────────────────────────────────────

export function ProfileModule() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		async function fetchProfile() {
			try {
				const { data } = await publicService.getProfile();
				if (!cancelled) setProfile(data);
			} catch (err) {
				console.error("Failed to load profile", err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		fetchProfile();
		return () => { cancelled = true; };
	}, []);

	if (loading) return <ProfileSkeleton />;
	if (!profile) return null;

	const tagline = profile.Tagline || profile.header || "Digital Creator & Engineer";
	const isAvailable = profile.openToWork;

	return (
		<div className="w-full relative min-h-full pb-20">
			{/* Ambient Background Glows */}
			<div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px] -z-10 pointer-events-none mix-blend-screen" />
			<div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[140px] -z-10 pointer-events-none mix-blend-screen" />

			{/* Section Header */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-4 md:pt-6 relative z-20">
				<SectionHeader
					icon={User}
					label="Overview"
					title="Creator Profile"
					description="Personal brand, expertise, and core competencies."
					sectionId="profile"
				/>
			</div>

			{/* Premium Hero Zone */}
			<motion.div
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] bg-card border-y border-border overflow-hidden mt-6"
			>
				{profile.coverUrl && (
					<img 
						src={profile.coverUrl} 
						alt="Cover" 
						className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity scale-105" 
					/>
				)}
				<div className="absolute inset-0 bg-linear-to-b from-transparent via-background/60 to-background" />
				<div className="absolute inset-0 bg-[linear-gradient(rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_80%_80%_at_50%_0%,#000_60%,transparent_100%)]" />
			</motion.div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 -mt-24 sm:-mt-28 md:-mt-32 relative z-10">
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="flex flex-col"
				>
					{/* Header Row: Avatar + Name + Core Roles */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 pt-2">
						{/* Avatar & Title */}
						<div className="flex flex-col gap-5 sm:gap-6">
							<motion.div
								variants={fadeInUp}
								className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden border-4 border-background bg-card shadow-2xl flex items-center justify-center group"
							>
								{profile.avatarUrl ? (
									<img
										src={profile.avatarUrl}
										alt={profile.name}
										className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
									/>
								) : (
									<User className="w-16 h-16 text-muted-foreground" />
								)}
								<div className="absolute inset-0 ring-1 ring-inset ring-foreground/10 rounded-3xl pointer-events-none" />
								
								{/* Availability Ping on Avatar */}
								{isAvailable && (
									<div className="absolute top-3 right-3 w-4 h-4 bg-emerald-400 rounded-full border-2 border-background shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse" />
								)}
							</motion.div>

							<div className="pt-2">
								<motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
									<h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-foreground via-foreground to-foreground/60">
										{profile.name}
									</h1>
									{profile.pronouns && (
										<span className="px-3 py-1 rounded-full bg-foreground/5 border border-border text-xs font-bold text-muted-foreground tracking-widest uppercase mt-2">
											{profile.pronouns}
										</span>
									)}
								</motion.div>

								<motion.div variants={fadeInUp} className="flex flex-col gap-3">
									<p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground/80 max-w-3xl tracking-tight leading-snug">
										{tagline}
									</p>
									{isAvailable && (
										<div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
											<CheckCircle2 className="w-4 h-4" />
											{profile.noticePeriod ? `Available (${profile.noticePeriod})` : 'Available for Work'}
											{profile.Freelancing && ' • Freelance OK'}
										</div>
									)}
								</motion.div>
							</div>
						</div>

						{/* Action Buttons */}
						<motion.div variants={fadeInUp} className="flex flex-row flex-wrap md:flex-col items-start gap-3 w-full md:w-auto mt-4 md:mt-0 pb-2">
							<button
								onClick={() =>
									window.dispatchEvent(
										new CustomEvent('scroll-to-section', {
											detail: { sectionId: 'contact' },
										}),
									)
								}
								className="w-full md:w-auto group flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-2xl font-bold transition-all hover:-translate-y-1 shadow-[0_0_40px_-10px] shadow-primary/40 hover:shadow-[0_0_50px_-10px] hover:shadow-primary/60"
							>
								Let&apos;s Connect
								<ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
							</button>

							{profile.resumeUrl && (
								<Link
									href="/resume"
									className="w-full md:w-auto group flex items-center justify-center gap-2 bg-card hover:bg-muted text-foreground px-8 py-4 rounded-2xl font-bold transition-all border border-border hover:border-foreground/20 hover:-translate-y-1 shadow-sm"
								>
									View Resume <FileText className="w-5 h-5 group-hover:scale-110 transition-transform text-muted-foreground" />
								</Link>
							)}
						</motion.div>
					</div>

					{/* Expanded Metrics / Stats Bar */}
					<motion.div
						variants={fadeInUp}
						className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
					>
						<StatCard 
							icon={MapPin} 
							label="Location" 
							value={profile.Currentlocation ?? 'Remote'} 
							colorClass="bg-blue-500" 
						/>
						<StatCard 
							icon={Briefcase} 
							label="Experience" 
							value={`${profile.experienceYears}+ Years`} 
							colorClass="bg-purple-500" 
						/>
						<StatCard 
							icon={Target} 
							label="Projects" 
							value={`${profile.projectsCount}+ Shipped`} 
							colorClass="bg-amber-500" 
						/>
						<StatCard 
							icon={Globe} 
							label="Languages" 
							value={profile.languages?.length ? `${profile.languages.length} Spoken` : 'Multilingual'} 
							colorClass="bg-emerald-500" 
						/>
					</motion.div>

					{/* Bio & Skills Layout */}
					<div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
						
						{/* Left Column: Bio & Additional Details */}
						<div className="lg:col-span-1 space-y-6">
							{profile.bio && (
								<motion.div
									variants={fadeInUp}
									className="w-full p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm flex flex-col relative overflow-hidden group"
								>
									<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-primary to-transparent opacity-50" />
									<h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
										<User className="w-4 h-4" /> About Me
									</h2>
									<p className="text-sm sm:text-base text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">
										{profile.bio}
									</p>
								</motion.div>
							)}

							{/* Work Preferences Box */}
							{profile.workPreferences && Object.keys(profile.workPreferences).length > 0 && (
								<motion.div
									variants={fadeInUp}
									className="w-full p-6 rounded-3xl bg-card border border-border shadow-sm"
								>
									<h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
										<Clock className="w-4 h-4" /> Working Styles
									</h2>
									<div className="flex flex-wrap gap-2">
										{Object.entries(profile.workPreferences)
											.filter(([_, value]) => value === true)
											.map(([key]) => (
												<span key={key} className="px-3 py-1.5 bg-foreground/5 border border-border rounded-xl text-xs font-bold text-foreground capitalize">
													{key}
												</span>
											))}
											{profile.Freelancing && (
												<span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-500">
													Freelancing
												</span>
											)}
									</div>
								</motion.div>
							)}
						</div>

						{/* Right Column: Premium Skills Grid */}
						<div className="lg:col-span-2 space-y-6">
							{profile.skills && Object.keys(profile.skills).length > 0 && (
								<motion.div
									variants={fadeInUp}
									className="w-full p-6 sm:p-8 rounded-3xl bg-card/60 backdrop-blur-2xl border border-border shadow-md relative"
								>
									<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none rounded-3xl" />
									
									<div className="flex items-center gap-3 mb-8">
										<div className="p-2 rounded-xl bg-primary/10 text-primary">
											<Layers className="w-5 h-5" />
										</div>
										<div>
											<h2 className="text-lg font-black text-foreground tracking-tight">Technical Arsenal</h2>
											<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Frameworks, Tools & Protocols</p>
										</div>
									</div>

									<motion.div
										variants={staggerFast}
										initial="hidden"
										whileInView="visible"
										viewport={{ once: true, margin: "-50px" }}
										className="space-y-8"
									>
										{Object.entries(profile.skills).map(([category, items]) => (
											<div key={category}>
												<h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-4 pl-1 border-l-2 border-primary/30">
													{category}
												</h3>
												<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
													{items.map(skill => {
														const { icon: SkillIcon, color } = getSkillIcon(skill);
														
														return (
															<motion.div
																key={skill}
																variants={staggerFastItem}
																className="group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-background border border-border hover:border-border/80 transition-all duration-300 hover:-translate-y-1 shadow-[inset_0_1px_rgba(255,255,255,0.02)]"
															>
																{/* Subtle background glow on hover derived from brand color */}
																<div 
																	className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl pointer-events-none blur-md"
																	style={{ backgroundColor: color }}
																/>
																
																<SkillIcon 
																	className="w-7 h-7 mb-3 transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" 
																	style={{ color }}
																/>
																<span className="text-[10px] sm:text-xs font-bold text-center text-foreground/80 group-hover:text-foreground transition-colors line-clamp-1 break-all px-1">
																	{skill}
																</span>
															</motion.div>
														);
													})}
												</div>
											</div>
										))}
									</motion.div>
								</motion.div>
							)}
						</div>
						
					</div>
				</motion.div>
			</div>
		</div>
	);
}
