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
	Zap,
	Sparkles,
	Code2,
	ChevronRight,
	Terminal,
	Layers,
	GitBranch,
	Award,
	GraduationCap,
	Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { useAtom } from 'jotai';
import { useProfile, useProjects, activeSkillFilterAtom } from '@/api';
import { cn } from '@/lib/utils';
import { getSkillIcon } from '@/lib/skill-icons';
import {
	SiGithub,
	SiX,
	SiLeetcode,
	SiYoutube,
	SiInstagram,
	SiDiscord,
} from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa6';
import { fadeInUp, staggerContainer } from '@/animations/motion';
import { SpotlightCard } from '@/ui/SpotlightCard';
import { SectionHeader } from '@/ui/SectionHeader';
import { useCountUp } from '@/hooks/useCountUp';

// ─── Social Platform Helpers ──────────────────────────────────────────────────
const SOCIAL_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
	GITHUB: { icon: SiGithub, color: '#f1f5f9' },
	LINKEDIN: { icon: FaLinkedinIn, color: '#0A66C2' },
	X: { icon: SiX, color: '#f1f5f9' },
	TWITTER: { icon: SiX, color: '#1DA1F2' },
	LEETCODE: { icon: SiLeetcode, color: '#FFA116' },
	DISCORD: { icon: SiDiscord, color: '#5865F2' },
	YOUTUBE: { icon: SiYoutube, color: '#FF0000' },
	INSTAGRAM: { icon: SiInstagram, color: '#E4405F' },
};

function getSocialInfo(platform: string) {
	return SOCIAL_ICONS[platform.toUpperCase()] ?? { icon: ExternalLink, color: '#888888' };
}

// ─── Animated Telemetry Counter Component ─────────────────────────────────────
function TelemetryNumber({
	value,
	decimals = 0,
	suffix = '',
	prefix = '',
}: {
	value: number;
	decimals?: number;
	suffix?: string;
	prefix?: string;
}) {
	const { formatted } = useCountUp({ end: value, decimals, suffix, prefix, duration: 1200 });
	return <span className="tabular-nums font-mono font-bold text-foreground">{formatted}</span>;
}

// ─── Bento Grid Skeleton ──────────────────────────────────────────────────────
function ProfileBentoSkeleton() {
	return (
		<div className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-6 animate-pulse space-y-4">
			<div className="h-10 w-64 rounded-xl bg-foreground/5 mb-4" />
			<div className="h-96 rounded-2xl bg-foreground/5" />
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="h-48 rounded-2xl bg-foreground/5" />
				<div className="h-48 rounded-2xl bg-foreground/5" />
				<div className="h-48 rounded-2xl bg-foreground/5" />
			</div>
		</div>
	);
}

// ─── Main Profile Module ──────────────────────────────────────────────────────
export function ProfileModule() {
	const { profile, loading } = useProfile();
	const { projects } = useProjects();
	const [activeSkillFilter, setActiveSkillFilter] = useAtom(activeSkillFilterAtom);

	const [copied, setCopied] = useState(false);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [expandedArsenal, setExpandedArsenal] = useState(false);

	const copyEmail = useCallback((email: string) => {
		navigator.clipboard.writeText(email);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, []);

	// Group core skills for the interactive radar
	const coreSkills = useMemo(() => {
		if (!profile.skills) return [];
		const list: Array<{ name: string; category: string }> = [];
		Object.entries(profile.skills).forEach(([category, items]) => {
			items.forEach(skill => {
				list.push({ name: skill, category });
			});
		});
		return list;
	}, [profile.skills]);

	// Calculate which skills are utilized in actual projects
	const skillProjectCount = useMemo(() => {
		const map: Record<string, number> = {};
		projects.forEach(project => {
			project.techStack.forEach(t => {
				const norm = t.toLowerCase();
				map[norm] = (map[norm] || 0) + 1;
			});
		});
		return map;
	}, [projects]);

	if (loading && !profile) return <ProfileBentoSkeleton />;

	const email = profile.email || 'basurianurag@gmail.com';
	const isAvailable = profile.openToWork ?? true;

	return (
		<>
			{/* Lightbox for Profile Photo */}
			<AnimatePresence>
				{lightboxOpen && profile.avatarUrl && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-pointer"
						onClick={() => setLightboxOpen(false)}
					>
						<motion.img
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							transition={{ type: 'spring', stiffness: 300, damping: 25 }}
							src={profile.avatarUrl}
							alt={profile.name}
							className="max-h-[85vh] max-w-[90vw] object-contain rounded-3xl border border-white/10 shadow-2xl"
							onClick={e => e.stopPropagation()}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="w-full min-h-full pb-16 sm:pb-20">
				{/* Soft Ambient Obsidian Glow (Quiet, less contrasty) */}
				<div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px] -z-10 pointer-events-none" />
				<div className="absolute top-1/3 left-0 w-[450px] h-[450px] bg-secondary/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

				<div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-2 sm:pt-4">
					{/* ══════════════════════════════════════════════════════════════════
					    01 · SECTION HEADER (Matching BootScreen DNA)
					    ══════════════════════════════════════════════════════════════════ */}
					<SectionHeader
						icon={Terminal}
						index="01"
						tag="SYSTEM DOSSIER"
						title="Overview & Architecture"
						description="Full Stack Engineer & AI Systems Architect specialized in high-performance web applications."
						sectionId="profile"
					/>

					<motion.div
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
						className="space-y-4 sm:space-y-6"
					>
						{/* ══════════════════════════════════════════════════════════════════
						    STAGE FEATURE CARD: Primary Engineering Dossier (Span 12)
						    Mirrors the Stage Feature Card of Section 02 Projects!
						    ══════════════════════════════════════════════════════════════════ */}
						<motion.div variants={fadeInUp}>
							<SpotlightCard
								tilt={false}
								className="rounded-2xl border border-border/40 hover:border-border/70 bg-card/30 backdrop-blur-xl overflow-hidden transition-all shadow-sm group"
							>
								{/* Blueprint Header Bar */}
								<div className="px-4 sm:px-6 py-2.5 border-b border-border/40 bg-background/30 flex items-center justify-between text-xs font-mono text-muted-foreground select-none">
									<div className="flex items-center gap-2">
										<span className="text-primary font-bold">// 01</span>
										<span className="text-muted-foreground/80 tracking-wider uppercase">SYSTEM DOSSIER</span>
										<span className="text-border/60">·</span>
										<span className="text-muted-foreground/60 hidden sm:inline">ANURAG BASURI</span>
									</div>

									{/* Availability Status */}
									{isAvailable ? (
										<div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-medium">
											<span className="relative flex h-2 w-2">
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
												<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
											</span>
											<span>Open for Roles · {profile.noticePeriod || 'Immediate'}</span>
										</div>
									) : (
										<span className="text-[11px] font-mono text-muted-foreground/60">System Operational</span>
									)}
								</div>

								{/* Dossier Body: 2 Columns */}
								<div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
									{/* Left Column: Identity, Bio, & Quick Actions (7 cols) */}
									<div className="lg:col-span-7 p-5 sm:p-7 md:p-8 border-b lg:border-b-0 lg:border-r border-border/40 flex flex-col justify-between space-y-6">
										<div>
											{/* Avatar + Main Title Row */}
											<div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 mb-5">
												<div
													onClick={() => profile.avatarUrl && setLightboxOpen(true)}
													className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-border/50 bg-surface-2 shrink-0 group cursor-pointer shadow-sm"
												>
													{profile.avatarUrl ? (
														<img
															src={profile.avatarUrl}
															alt={profile.name}
															className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center font-mono font-bold text-lg text-primary">
															AB
														</div>
													)}
													<div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
												</div>

												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 text-xs font-mono text-primary/80 uppercase tracking-widest mb-1">
														<span>&lt;AB /&gt;</span>
														<span>·</span>
														<span>Full-Stack & AI Systems</span>
													</div>

													<h1 className="text-2xl sm:text-3xl font-light tracking-[0.06em] text-foreground/95 uppercase font-sans leading-tight">
														{profile.name}
													</h1>

													<p className="text-xs sm:text-sm font-medium text-primary/90 mt-1 font-mono">
														{profile.header || 'Full Stack Engineer & AI Systems Developer'}
													</p>

													<div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground/75 font-mono">
														<MapPin className="w-3.5 h-3.5 text-muted-foreground/60" />
														<span>{profile.Currentlocation || 'Jamshedpur, India'}</span>
														<span className="text-border">•</span>
														<span className="text-emerald-400/80">Remote / Hybrid</span>
													</div>
												</div>
											</div>

											{/* Concise Engineering Philosophy */}
											<p className="text-xs sm:text-sm text-muted-foreground/85 leading-relaxed font-sans border-t border-border/30 pt-4">
												Architecting high-performance, fault-tolerant web applications and autonomous AI agent workflows. Focused on clean system design, React/Next.js internals, scalable Node/Postgres backends, and tangible user delight.
											</p>
										</div>

										{/* Quick Channels & Action Deck */}
										<div className="pt-4 border-t border-border/30 space-y-3">
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
												<Link
													href="/resume"
													className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/25 hover:border-primary/50 text-foreground text-xs font-mono font-medium transition-all hover:bg-primary/15 group"
												>
													<span className="flex items-center gap-2">
														<FileText className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
														<span>Interactive Resume</span>
													</span>
													<ChevronRight className="w-3 h-3 text-primary group-hover:translate-x-0.5 transition-transform" />
												</Link>

												<button
													onClick={() => copyEmail(email)}
													className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-surface-2/60 border border-border/40 hover:border-border text-foreground text-xs font-mono font-medium transition-all hover:bg-surface-2 group cursor-pointer"
												>
													<span className="flex items-center gap-2 truncate">
														{copied ? (
															<Check className="w-3.5 h-3.5 text-emerald-400" />
														) : (
															<Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
														)}
														<span className="truncate">{email}</span>
													</span>
													<span className="text-[10px] text-muted-foreground shrink-0 ml-1">
														{copied ? 'Copied ✓' : 'Copy'}
													</span>
												</button>
											</div>

											{/* Social Network Strip */}
											<div className="flex items-center gap-2">
												{[
													{ id: 'gh', platform: 'GITHUB', url: profile.github || 'https://github.com/Anurag-Basuri' },
													{
														id: 'li',
														platform: 'LINKEDIN',
														url:
															profile.socialLinks?.find(s => s.platform.toUpperCase() === 'LINKEDIN')?.url ||
															'https://linkedin.com/in/anuragbasuri',
													},
													{
														id: 'tw',
														platform: 'X',
														url:
															profile.socialLinks?.find(s => ['X', 'TWITTER'].includes(s.platform.toUpperCase()))?.url ||
															'https://twitter.com/AnuragBasuri',
													},
													{ id: 'lc', platform: 'LEETCODE', url: profile.leetcode || 'https://leetcode.com/u/Anurag_Basuri' },
												].map(social => {
													const { icon: SocialIcon } = getSocialInfo(social.platform);
													return (
														<a
															key={social.id}
															href={social.url}
															target="_blank"
															rel="noopener noreferrer"
															className="flex-1 flex items-center justify-center h-8 rounded-lg bg-surface-2/40 border border-border/40 hover:border-border/70 hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-all"
															title={social.platform}
														>
															<SocialIcon className="w-3.5 h-3.5" />
														</a>
													);
												})}
											</div>
										</div>
									</div>

									{/* Right Column: Interactive Tech Radar (5 cols) */}
									<div className="lg:col-span-5 p-5 sm:p-7 md:p-8 flex flex-col justify-between space-y-4 bg-surface-1/40">
										<div>
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-2">
													<Terminal className="w-3.5 h-3.5 text-primary" />
													<h3 className="text-xs sm:text-sm font-semibold text-foreground/90 font-sans">
														Technical Radar
													</h3>
												</div>
												{activeSkillFilter && (
													<button
														onClick={() => setActiveSkillFilter(null)}
														className="text-[11px] font-mono text-muted-foreground hover:text-foreground underline transition-colors"
													>
														Clear filter
													</button>
												)}
											</div>
											<p className="text-[11px] text-muted-foreground/75 font-mono mb-4 leading-relaxed">
												Select or hover any skill to spotlight associated production systems:
											</p>

											{/* Interactive Skill Chips */}
											<div className="flex flex-wrap gap-1.5 sm:gap-2">
												{coreSkills.slice(0, 18).map(({ name, category }) => {
													const { icon: SkillIcon, color } = getSkillIcon(name);
													const isSelected = activeSkillFilter?.toLowerCase() === name.toLowerCase();
													const projectCount = skillProjectCount[name.toLowerCase()] || 0;

													return (
														<button
															key={name}
															onClick={() =>
																setActiveSkillFilter(isSelected ? null : name)
															}
															onMouseEnter={() => setActiveSkillFilter(name)}
															onMouseLeave={() => setActiveSkillFilter(null)}
															className={cn(
																'group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all border cursor-pointer select-none',
																isSelected
																	? 'bg-primary/20 border-primary text-foreground shadow-[0_0_10px_rgba(52,211,153,0.2)] scale-105'
																	: 'bg-surface-2/60 border-border/40 text-foreground/75 hover:text-foreground hover:border-border hover:bg-surface-2',
															)}
															title={`${name} (${category}) — Click to spotlight`}
														>
															<SkillIcon
																className="w-3 h-3 transition-transform group-hover:scale-110"
																style={{ color: isSelected ? 'var(--primary)' : color }}
															/>
															<span>{name}</span>
															{projectCount > 0 && (
																<span
																	className={cn(
																		'text-[10px] px-1 py-0.2 rounded font-mono',
																		isSelected
																			? 'bg-primary/30 text-primary-foreground font-semibold'
																			: 'bg-foreground/5 text-muted-foreground group-hover:text-foreground',
																	)}
																>
																	{projectCount}
																</span>
															)}
														</button>
													);
												})}
											</div>
										</div>

										{/* Status hint & Drawer toggle */}
										<div className="pt-3 border-t border-border/30 flex items-center justify-between text-[11px] font-mono text-muted-foreground/70">
											<span>Stack: Next.js · React · TS · Node</span>
											<button
												onClick={() => setExpandedArsenal(!expandedArsenal)}
												className="text-primary hover:underline flex items-center gap-1 font-sans text-xs cursor-pointer"
											>
												{expandedArsenal ? 'Collapse arsenal' : 'View full stack'}
												<ChevronRight
													className={cn(
														'w-3 h-3 transition-transform',
														expandedArsenal ? 'rotate-90' : '',
													)}
												/>
											</button>
										</div>
									</div>
								</div>
							</SpotlightCard>
						</motion.div>

						{/* ══════════════════════════════════════════════════════════════════
						    SECONDARY 3-CARD ROW: Telemetry, Current Focus, Core Domains
						    Matches the 3-column / 2-column grid layout of other sections!
						    ══════════════════════════════════════════════════════════════════ */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
							{/* Card A: Engineering Telemetry */}
							<motion.div variants={fadeInUp} className="flex flex-col">
								<SpotlightCard
									tilt={false}
									className="p-5 sm:p-6 flex flex-col justify-between h-full rounded-2xl bg-card/30 border border-border/40 hover:border-border/70 transition-all"
								>
									<div>
										<div className="flex items-center gap-2 mb-4">
											<GraduationCap className="w-4 h-4 text-emerald-400" />
											<h3 className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
												Engineering Telemetry
											</h3>
										</div>

										<div className="space-y-3">
											<div className="flex items-baseline justify-between border-b border-border/20 pb-2">
												<div>
													<p className="text-xs font-mono text-muted-foreground/80">Academic CGPA</p>
													<p className="text-[10px] text-muted-foreground/60 font-mono">B.Tech CSE · LPU</p>
												</div>
												<div className="text-lg sm:text-xl">
													<TelemetryNumber value={9.0} decimals={1} suffix="/10" />
												</div>
											</div>

											<div className="flex items-baseline justify-between border-b border-border/20 pb-2">
												<div>
													<p className="text-xs font-mono text-muted-foreground/80">Systems Shipped</p>
													<p className="text-[10px] text-muted-foreground/60 font-mono">Web & AI Architectures</p>
												</div>
												<div className="text-lg sm:text-xl">
													<TelemetryNumber value={profile.projectsCount || 15} suffix="+" />
												</div>
											</div>

											<div className="flex items-baseline justify-between">
												<div>
													<p className="text-xs font-mono text-muted-foreground/80">Practical Experience</p>
													<p className="text-[10px] text-muted-foreground/60 font-mono">Production & Open Source</p>
												</div>
												<div className="text-lg sm:text-xl">
													<TelemetryNumber value={profile.experienceYears || 2} suffix=" Yrs" />
												</div>
											</div>
										</div>
									</div>

									<div className="mt-4 pt-3 border-t border-border/30 flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
										<Award className="w-3.5 h-3.5 shrink-0" />
										<span className="truncate">SIH '24 National Finalist</span>
									</div>
								</SpotlightCard>
							</motion.div>

							{/* Card B: Currently Architecting */}
							<motion.div variants={fadeInUp} className="flex flex-col">
								<SpotlightCard
									tilt={false}
									className="p-5 sm:p-6 flex flex-col justify-between h-full rounded-2xl bg-card/30 border border-border/40 hover:border-border/70 transition-all"
								>
									<div>
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center gap-2 text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
												<Zap className="w-4 h-4 text-amber-400" />
												<span>Currently Building</span>
											</div>
											<span className="flex h-2 w-2 relative">
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
												<span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
											</span>
										</div>

										<div className="p-3 rounded-xl bg-surface-2/40 border border-border/30 mb-2.5">
											<div className="flex items-center gap-2 mb-1">
												<Code2 className="w-3.5 h-3.5 text-cyan-400" />
												<h4 className="text-xs font-semibold text-foreground/90 font-sans">
													JobFlow AI Platform
												</h4>
											</div>
											<p className="text-[11px] text-muted-foreground/80 leading-relaxed font-sans">
												Automated application tracker with resume tailored embeddings, Gemini pipeline, and sub-100ms sync.
											</p>
										</div>

										<div className="p-3 rounded-xl bg-surface-2/40 border border-border/30">
											<div className="flex items-center gap-2 mb-1">
												<Sparkles className="w-3.5 h-3.5 text-purple-400" />
												<h4 className="text-xs font-semibold text-foreground/90 font-sans">
													Autonomous Agent OS
												</h4>
											</div>
											<p className="text-[11px] text-muted-foreground/80 leading-relaxed font-sans">
												SSE-streamed multi-tool execution workspace with live terminal introspection.
											</p>
										</div>
									</div>

									<div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[11px] font-mono text-muted-foreground/70">
										<span className="flex items-center gap-1.5">
											<GitBranch className="w-3.5 h-3.5" />
											Active Commits
										</span>
										<a
											href="https://github.com/Anurag-Basuri"
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline flex items-center gap-1"
										>
											GitHub
											<ExternalLink className="w-3 h-3" />
										</a>
									</div>
								</SpotlightCard>
							</motion.div>

							{/* Card C: Core Architectural Domains */}
							<motion.div variants={fadeInUp} className="flex flex-col">
								<SpotlightCard
									tilt={false}
									className="p-5 sm:p-6 flex flex-col justify-between h-full rounded-2xl bg-card/30 border border-border/40 hover:border-border/70 transition-all"
								>
									<div>
										<div className="flex items-center gap-2 mb-3">
											<Layers className="w-4 h-4 text-primary" />
											<h3 className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
												Core Architectures
											</h3>
										</div>

										<div className="space-y-2.5">
											<div className="p-2.5 rounded-lg bg-surface-2/30 border border-border/25">
												<p className="text-xs font-semibold text-foreground/90 font-mono">01. Autonomous AI Agents</p>
												<p className="text-[11px] text-muted-foreground/75 mt-0.5">SSE streaming, function calling, tool execution pipelines.</p>
											</div>

											<div className="p-2.5 rounded-lg bg-surface-2/30 border border-border/25">
												<p className="text-xs font-semibold text-foreground/90 font-mono">02. Modern Next.js Internals</p>
												<p className="text-[11px] text-muted-foreground/75 mt-0.5">App router, server components, optimistic zero-flicker UI.</p>
											</div>

											<div className="p-2.5 rounded-lg bg-surface-2/30 border border-border/25">
												<p className="text-xs font-semibold text-foreground/90 font-mono">03. Resilient Distributed Backends</p>
												<p className="text-[11px] text-muted-foreground/75 mt-0.5">Node.js, PostgreSQL/Neon, Prisma ORM, Redis caching.</p>
											</div>
										</div>
									</div>

									<button
										onClick={() =>
											window.dispatchEvent(
												new CustomEvent('scroll-to-section', { detail: { sectionId: 'projects' } }),
											)
										}
										className="mt-4 w-full py-2 px-3 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border/40 text-foreground font-mono text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
									>
										<span>Explore Featured Systems</span>
										<ChevronRight className="w-3.5 h-3.5 text-primary" />
									</button>
								</SpotlightCard>
							</motion.div>
						</div>

						{/* ══════════════════════════════════════════════════════════════════
						    EXPANDABLE ARSENAL DRAWER (Detailed category-by-category stack)
						    ══════════════════════════════════════════════════════════════════ */}
						<AnimatePresence>
							{expandedArsenal && profile.skills && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.3 }}
									className="overflow-hidden"
								>
									<div className="p-6 sm:p-8 rounded-2xl bg-card/30 border border-border/40 backdrop-blur-xl space-y-6">
										<div className="flex items-center gap-3">
											<div className="p-2 rounded-xl bg-primary/10 text-primary">
												<Layers className="w-5 h-5" />
											</div>
											<div>
												<h3 className="text-base font-semibold text-foreground/90 font-sans">
													Full Technical Arsenal
												</h3>
												<p className="text-xs font-mono text-muted-foreground/75">
													All verified languages, frameworks, databases & infrastructure tools
												</p>
											</div>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
											{Object.entries(profile.skills).map(([category, items]) => (
												<div
													key={category}
													className="p-4 rounded-xl bg-surface-2/40 border border-border/30"
												>
													<div className="flex items-center justify-between mb-3">
														<span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
															{category}
														</span>
														<span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
															{items.length}
														</span>
													</div>
													<div className="flex flex-wrap gap-1.5">
														{items.map(skill => {
															const { icon: SkillIcon, color } = getSkillIcon(skill);
															return (
																<span
																	key={skill}
																	className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-1 border border-border/30 text-[11px] font-mono text-foreground/80"
																>
																	<SkillIcon className="w-3 h-3" style={{ color }} />
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
						</AnimatePresence>
					</motion.div>
				</div>
			</div>
		</>
	);
}
