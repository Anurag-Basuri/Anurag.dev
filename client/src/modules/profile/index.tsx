'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	MapPin,
	FileText,
	Mail,
	Check,
	Copy,
	ExternalLink,
	Sparkles,
	Terminal,
	Code2,
	ChevronRight,
	Briefcase,
	GraduationCap,
} from 'lucide-react';
import { useProfile, useProjects } from '@/api';
import { cn } from '@/lib/utils';
import { getSkillIcon } from '@/lib/skill-icons';
import { SiGithub, SiX, SiLeetcode, SiInstagram } from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa6';
import { fadeInUp, staggerContainer } from '@/animations/motion';
import { SectionHeader } from '@/ui/SectionHeader';

// ─── Social Platform Icons ────────────────────────────────────────────────────
const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
	GITHUB: SiGithub,
	LINKEDIN: FaLinkedinIn,
	X: SiX,
	TWITTER: SiX,
	LEETCODE: SiLeetcode,
	INSTAGRAM: SiInstagram,
};

function getSocialIcon(platform: string) {
	return SOCIAL_ICONS[platform.toUpperCase()] ?? ExternalLink;
}

export function ProfileModule() {
	const { profile, loading } = useProfile();
	const { projects } = useProjects();
	const [copied, setCopied] = useState(false);
	const [selectedSkillCategory, setSelectedSkillCategory] = useState<string | null>(null);

	const copyEmail = useCallback((email: string) => {
		navigator.clipboard.writeText(email);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, []);

	// Extract skill categories from dynamic DB profile
	const skillCategories = useMemo(() => {
		if (!profile.skills || typeof profile.skills !== 'object') return [];
		return Object.entries(profile.skills as Record<string, string[]>);
	}, [profile.skills]);

	const email = profile.email || 'anuragbasuri@gmail.com';
	const resumeHref = profile.resumeUrl || '/resume';

	if (loading && !profile) {
		return (
			<div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
				<div className="h-6 w-32 bg-foreground/5 rounded-md" />
				<div className="h-64 bg-foreground/5 rounded-2xl" />
				<div className="h-48 bg-foreground/5 rounded-2xl" />
			</div>
		);
	}

	return (
		<div className="w-full min-h-full pb-20 sm:pb-28">
			{/* Ambient Soft Glow (Minimal, 8% opacity) */}
			<div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[140px] -z-10 pointer-events-none" />

			<div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6">
				{/* 01 · Minimal Header */}
				<SectionHeader
					icon={Terminal}
					index="01"
					tag="OVERVIEW"
					title="About & Identity"
					description="Background, engineering philosophy, and technical competencies."
					sectionId="profile"
				/>

				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="space-y-6 sm:space-y-8 mt-4"
				>
					{/* ── CARD 1: Hero Identity (Clean & Spacious) ──────────────── */}
					<motion.div variants={fadeInUp}>
						<div className="relative rounded-2xl border border-border/40 bg-card/25 backdrop-blur-xl p-6 sm:p-10 md:p-12 transition-all">
							<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-border/25">
								{/* Left: Avatar & Identity */}
								<div className="flex items-center gap-5 sm:gap-6">
									{profile.avatarUrl ? (
										<div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-border/50 shrink-0 bg-surface-2 shadow-sm">
											<img
												src={profile.avatarUrl}
												alt={profile.name}
												className="w-full h-full object-cover"
											/>
										</div>
									) : (
										<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-border/50 bg-surface-2 flex items-center justify-center font-mono text-xl font-light text-primary shrink-0">
											AB
										</div>
									)}

									<div>
										<div className="flex items-center gap-2 mb-1.5">
											<span className="font-mono text-xs tracking-wider uppercase text-primary/80">
												{profile.Tagline || 'Software Developer'}
											</span>
											{profile.openToWork && (
												<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-medium">
													<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
													<span>Available for Roles</span>
												</span>
											)}
										</div>

										<h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-foreground/95 font-sans leading-tight">
											{profile.name}
										</h1>

										<div className="flex items-center gap-2 mt-2 text-xs font-mono text-muted-foreground/75">
											<MapPin className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
											<span>{profile.Currentlocation || 'Jalandhar, Punjab, India'}</span>
											{profile.Originallocation && (
												<>
													<span className="text-border/60">·</span>
													<span className="text-muted-foreground/60 hidden sm:inline">
														Origin: {profile.Originallocation}
													</span>
												</>
											)}
										</div>
									</div>
								</div>

								{/* Right: Quick Action Buttons */}
								<div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
									{/* Resume Button */}
									<a
										href={resumeHref}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-medium hover:opacity-90 transition-opacity shadow-xs"
									>
										<FileText className="w-3.5 h-3.5" />
										<span>Resume PDF</span>
									</a>

									{/* Copy Email Button */}
									<button
										onClick={() => copyEmail(email)}
										className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2/60 border border-border/40 hover:border-border text-foreground font-mono text-xs font-medium transition-all cursor-pointer"
										title="Copy Email Address"
									>
										{copied ? (
											<Check className="w-3.5 h-3.5 text-emerald-400" />
										) : (
											<Copy className="w-3.5 h-3.5 text-muted-foreground" />
										)}
										<span>{copied ? 'Copied ✓' : 'Copy Email'}</span>
									</button>
								</div>
							</div>

							{/* Dynamic Headline Bar */}
							{profile.header && (
								<div className="pt-6">
									<p className="font-mono text-xs sm:text-sm text-foreground/80 leading-relaxed">
										{profile.header}
									</p>
								</div>
							)}

							{/* Social Links Bar */}
							<div className="flex flex-wrap items-center gap-3 pt-6 border-t border-border/20 mt-6">
								<span className="font-mono text-xs text-muted-foreground/60 mr-1">Verified:</span>
								{(profile.socialLinks ?? []).map(social => {
									const Icon = getSocialIcon(social.platform);
									return (
										<a
											key={social.id}
											href={social.url}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-2/40 border border-border/30 hover:border-border/70 hover:bg-surface-2 text-muted-foreground hover:text-foreground text-xs font-mono transition-all"
										>
											<Icon className="w-3 h-3" />
											<span>{social.customLabel || social.platform}</span>
										</a>
									);
								})}
								{profile.leetcode && (
									<a
										href={profile.leetcode}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-2/40 border border-border/30 hover:border-border/70 hover:bg-surface-2 text-muted-foreground hover:text-foreground text-xs font-mono transition-all"
									>
										<SiLeetcode className="w-3 h-3" />
										<span>LeetCode</span>
									</a>
								)}
							</div>
						</div>
					</motion.div>

					{/* ── CARD 2: Bio & Philosophy (Editorial Typography) ──────── */}
					{profile.bio && (
						<motion.div variants={fadeInUp}>
							<div className="rounded-2xl border border-border/40 bg-card/25 backdrop-blur-xl p-6 sm:p-10 transition-all space-y-4">
								<div className="flex items-center gap-2 mb-2">
									<Sparkles className="w-4 h-4 text-primary" />
									<h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground font-semibold">
										Engineering Philosophy & Story
									</h2>
								</div>

								<div className="space-y-4 text-sm sm:text-base text-foreground/85 leading-relaxed font-sans whitespace-pre-line">
									{profile.bio}
								</div>
							</div>
						</motion.div>
					)}

					{/* ── CARD 3: Technical Skills & Tools (Clean Grouped Pills) ─── */}
					{skillCategories.length > 0 && (
						<motion.div variants={fadeInUp}>
							<div className="rounded-2xl border border-border/40 bg-card/25 backdrop-blur-xl p-6 sm:p-10 transition-all space-y-6">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/25 pb-4">
									<div>
										<h2 className="text-sm sm:text-base font-semibold text-foreground/95 font-sans">
											Technical Capabilities
										</h2>
										<p className="text-xs font-mono text-muted-foreground/75 mt-0.5">
											Structured according to production database taxonomy
										</p>
									</div>

									{/* Category Quick Filter */}
									<div className="flex flex-wrap items-center gap-1.5">
										<button
											onClick={() => setSelectedSkillCategory(null)}
											className={cn(
												'px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer',
												selectedSkillCategory === null
													? 'bg-primary/20 text-primary font-semibold border border-primary/30'
													: 'text-muted-foreground/70 hover:text-foreground hover:bg-foreground/5'
											)}
										>
											All ({skillCategories.reduce((acc, [, items]) => acc + items.length, 0)})
										</button>
										{skillCategories.map(([category]) => (
											<button
												key={category}
												onClick={() =>
													setSelectedSkillCategory(
														selectedSkillCategory === category ? null : category
													)
												}
												className={cn(
													'px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer',
													selectedSkillCategory === category
														? 'bg-primary/20 text-primary font-semibold border border-primary/30'
														: 'text-muted-foreground/70 hover:text-foreground hover:bg-foreground/5'
												)}
											>
												{category}
											</button>
										))}
									</div>
								</div>

								{/* Category Grid */}
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{skillCategories
										.filter(([cat]) => !selectedSkillCategory || selectedSkillCategory === cat)
										.map(([category, items]) => (
											<div
												key={category}
												className="p-4 rounded-xl bg-surface-2/30 border border-border/30 space-y-3"
											>
												<div className="flex items-center justify-between">
													<span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
														{category}
													</span>
													<span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
														{items.length}
													</span>
												</div>

												<div className="flex flex-wrap gap-1.5">
													{items.map(skill => {
														const { icon: Icon, color } = getSkillIcon(skill);
														return (
															<span
																key={skill}
																className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-1/80 border border-border/30 text-xs font-mono text-foreground/80 hover:text-foreground hover:border-border/60 transition-colors select-none"
															>
																<Icon className="w-3 h-3" style={{ color }} />
																<span>{skill}</span>
															</span>
														);
													})}
												</div>
											</div>
										))}
								</div>
							</div>
						</motion.div>
					)}

					{/* ── CARD 4: Dynamic Verified Telemetry ────────────────────── */}
					<motion.div variants={fadeInUp}>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div className="p-5 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-md">
								<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
									Practical Experience
								</p>
								<p className="text-2xl sm:text-3xl font-light text-foreground mt-1">
									{profile.experienceYears || 2}+ Years
								</p>
								<p className="text-xs text-muted-foreground/70 mt-1 font-mono">
									Full Stack & AI Systems
								</p>
							</div>

							<div className="p-5 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-md">
								<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
									Production Projects
								</p>
								<p className="text-2xl sm:text-3xl font-light text-foreground mt-1">
									{projects.length || 6} Systems
								</p>
								<p className="text-xs text-muted-foreground/70 mt-1 font-mono">
									Published & Verifiable
								</p>
							</div>

							<div className="p-5 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-md">
								<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
									Availability & Notice
								</p>
								<p className="text-2xl sm:text-3xl font-light text-foreground mt-1">
									{profile.availableFrom || 'Immediate'}
								</p>
								<p className="text-xs text-muted-foreground/70 mt-1 font-mono">
									{profile.noticePeriod === '0' ? 'Zero Days Notice' : `${profile.noticePeriod || '0'} Days Notice`}
								</p>
							</div>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}
