'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Briefcase, ChevronRight, FileText, CheckCircle2, Globe, Layers, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { publicService } from '@/api';
import type { Profile } from '@/api/schema';
import { cn } from '@/lib/utils';
import { getSkillIcon } from '@/lib/skill-icons';
import { SiGithub, SiX, SiYoutube, SiInstagram, SiFacebook, SiDiscord, SiMedium, SiDevdotto, SiHashnode, SiStackoverflow, SiReddit, SiTwitch, SiDribbble, SiBehance } from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa6';
import {
	fadeInUp,
	fadeIn,
	staggerContainer,
	staggerFast,
	staggerFastItem,
} from '@/animations/motion';

// ─── Social Platform Icon Map ───────────────────────────────────

const SOCIAL_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
	GITHUB: { icon: SiGithub, label: 'GitHub', color: '#181717' },
	LINKEDIN: { icon: FaLinkedinIn, label: 'LinkedIn', color: '#0A66C2' },
	X: { icon: SiX, label: 'X (Twitter)', color: '#000000' },
	TWITTER: { icon: SiX, label: 'X (Twitter)', color: '#000000' },
	YOUTUBE: { icon: SiYoutube, label: 'YouTube', color: '#FF0000' },
	INSTAGRAM: { icon: SiInstagram, label: 'Instagram', color: '#E4405F' },
	FACEBOOK: { icon: SiFacebook, label: 'Facebook', color: '#1877F2' },
	DISCORD: { icon: SiDiscord, label: 'Discord', color: '#5865F2' },
	MEDIUM: { icon: SiMedium, label: 'Medium', color: '#000000' },
	DEVTO: { icon: SiDevdotto, label: 'Dev.to', color: '#0A0A0A' },
	HASHNODE: { icon: SiHashnode, label: 'Hashnode', color: '#2962FF' },
	STACKOVERFLOW: { icon: SiStackoverflow, label: 'Stack Overflow', color: '#F58025' },
	REDDIT: { icon: SiReddit, label: 'Reddit', color: '#FF4500' },
	TWITCH: { icon: SiTwitch, label: 'Twitch', color: '#9146FF' },
	DRIBBBLE: { icon: SiDribbble, label: 'Dribbble', color: '#EA4C89' },
	BEHANCE: { icon: SiBehance, label: 'Behance', color: '#1769FF' },
};

function getSocialIcon(platform: string) {
	return SOCIAL_ICONS[platform.toUpperCase()] ?? { icon: ExternalLink, label: platform, color: '#888888' };
}

// ─── Typing Animation Hook ──────────────────────────────────────

function useTypingAnimation(text: string, speed = 40, startDelay = 600) {
	const [displayed, setDisplayed] = useState('');
	const [isDone, setIsDone] = useState(false);

	useEffect(() => {
		if (!text) return;
		setDisplayed('');
		setIsDone(false);

		const startTimeout = setTimeout(() => {
			let i = 0;
			const interval = setInterval(() => {
				i++;
				setDisplayed(text.slice(0, i));
				if (i >= text.length) {
					clearInterval(interval);
					setIsDone(true);
				}
			}, speed);
			return () => clearInterval(interval);
		}, startDelay);

		return () => clearTimeout(startTimeout);
	}, [text, speed, startDelay]);

	return { displayed, isDone };
}

// ─── Skeleton ───────────────────────────────────────────────────

function ProfileSkeleton() {
	return (
		<div className="w-full animate-pulse">
			<div className="h-[220px] sm:h-[300px] md:h-[380px] w-full bg-foreground/5" />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pb-12">
				<div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 bg-foreground/10 rounded-3xl -mt-16 md:-mt-20 border-4 border-background" />
				<div className="mt-6 space-y-4">
					<div className="h-10 w-64 bg-foreground/5 rounded-xl" />
					<div className="h-6 w-96 bg-foreground/5 rounded-lg" />
					<div className="h-5 w-72 bg-foreground/5 rounded-lg" />
				</div>
				<div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
					{[1, 2, 3].map(i => <div key={i} className="h-24 bg-foreground/5 rounded-2xl" />)}
				</div>
				<div className="mt-8 h-48 bg-foreground/5 rounded-3xl" />
				<div className="mt-6 h-96 bg-foreground/5 rounded-3xl" />
			</div>
		</div>
	);
}

// ─── Helper: Stat Card with hover effects ───────────────────────

function StatCard({ icon: Icon, label, value, colorClass, children }: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: string;
	colorClass: string;
	children?: React.ReactNode;
}) {
	const [hovered, setHovered] = useState(false);

	return (
		<div
			className="relative flex-1 flex flex-col justify-center p-4 sm:p-5 rounded-2xl bg-card/40 backdrop-blur-xl border border-border hover:border-primary/30 transition-all group overflow-visible shadow-sm cursor-default"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<div className={cn("absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500", colorClass)} />
			<div className="flex items-center gap-4 relative z-10">
				<motion.div
					animate={hovered ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
					transition={{ type: 'spring', stiffness: 400, damping: 15 }}
					className={cn("p-3 rounded-xl border bg-background shadow-inner transition-colors", colorClass.replace('bg-', 'text-'))}
				>
					<Icon className="w-5 h-5" />
				</motion.div>
				<div>
					<p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest mb-0.5">
						{label}
					</p>
					<p className="text-base sm:text-lg font-black text-foreground tracking-tight leading-none">
						{value}
					</p>
				</div>
			</div>

			{/* Hover popover (for languages etc.) */}
			<AnimatePresence>
				{hovered && children && (
					<motion.div
						initial={{ opacity: 0, y: 8, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 8, scale: 0.95 }}
						transition={{ duration: 0.15 }}
						className="absolute left-0 right-0 top-full mt-2 z-50 p-4 rounded-2xl bg-card border border-border shadow-xl backdrop-blur-xl"
					>
						{children}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// ─── Helper: Social Button with Tooltip ─────────────────────────

function SocialButton({ social }: { social: { id: string; platform: string; url: string; customLabel?: string | null } }) {
	const { icon: SocialIcon, label, color } = getSocialIcon(social.platform);
	const [showTooltip, setShowTooltip] = useState(false);

	return (
		<div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
			<a
				href={social.url}
				target="_blank"
				rel="noopener noreferrer"
				className="w-10 h-10 rounded-full bg-foreground/5 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/10 hover:scale-110 transition-all duration-200"
			>
				<SocialIcon className="w-4 h-4" />
			</a>
			<AnimatePresence>
				{showTooltip && (
					<motion.div
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 4 }}
						transition={{ duration: 0.12 }}
						className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-foreground text-background text-[10px] font-bold whitespace-nowrap z-50 shadow-lg"
					>
						{social.customLabel || label}
						<div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

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
	const header = profile.Tagline && profile.header ? profile.header : null; // Show header separately only if tagline exists
	const isAvailable = profile.openToWork;
	const socialLinks = profile.socialLinks ?? [];
	const activeWorkPrefs = profile.workPreferences
		? Object.entries(profile.workPreferences).filter(([_, v]) => v === true).map(([k]) => k)
		: [];

	return (
		<div className="w-full relative min-h-full pb-20">
			{/* Ambient Background Glows */}
			<div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px] -z-10 pointer-events-none mix-blend-screen" />
			<div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[140px] -z-10 pointer-events-none mix-blend-screen" />

			{/* Hero Cover Banner */}
			<motion.div
				variants={fadeIn}
				initial="hidden"
				animate="visible"
				className="relative w-full h-[220px] sm:h-[300px] md:h-[380px] bg-card border-b border-border overflow-hidden"
			>
				{profile.coverUrl && (
					<img
						src={profile.coverUrl}
						alt="Cover"
						className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105"
					/>
				)}
				<div className="absolute inset-0 bg-linear-to-b from-transparent via-background/70 to-background" />
				<div className="absolute inset-0 bg-[linear-gradient(rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_80%_80%_at_50%_0%,#000_60%,transparent_100%)]" />
			</motion.div>

			{/* Main Content — bleeds into cover */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 -mt-24 sm:-mt-28 md:-mt-32 relative z-10">
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="flex flex-col"
				>
					{/* ═══ HERO ZONE ═══ */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 pt-2">
						{/* Left: Avatar + Identity */}
						<div className="flex flex-col gap-5 sm:gap-6">
							{/* Animated Gradient Border Avatar */}
							<motion.div variants={fadeInUp} className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44">
								{/* Rotating gradient ring */}
								<div className="absolute -inset-[3px] rounded-3xl bg-[conic-gradient(from_var(--angle),var(--theme-primary),var(--theme-secondary),var(--theme-primary))] animate-[spin_6s_linear_infinite] opacity-60 blur-[1px]"
									style={{ '--angle': '0deg' } as React.CSSProperties}
								/>
								<div className="absolute inset-0 rounded-3xl overflow-hidden border-4 border-background bg-card shadow-2xl flex items-center justify-center group">
									{profile.avatarUrl ? (
										<img
											src={profile.avatarUrl}
											alt={profile.name}
											className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
										/>
									) : (
										<User className="w-14 h-14 text-muted-foreground" />
									)}
									<div className="absolute inset-0 ring-1 ring-inset ring-foreground/10 rounded-3xl pointer-events-none" />
									{isAvailable && (
										<div className="absolute top-3 right-3 w-4 h-4 bg-emerald-400 rounded-full border-2 border-background shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse" />
									)}
								</div>
							</motion.div>

							{/* Name + Header + Tagline */}
							<div className="pt-1">
								<motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
									<h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-foreground via-foreground to-foreground/60">
										{profile.name}
									</h1>
									{profile.pronouns && (
										<span className="px-3 py-1 rounded-full bg-foreground/5 border border-border text-xs font-bold text-muted-foreground tracking-widest uppercase">
											{profile.pronouns}
										</span>
									)}
								</motion.div>

								{/* Header (role/title) */}
								{header && (
									<motion.p variants={fadeInUp} className="text-sm sm:text-base font-semibold text-primary/80 mb-2 tracking-tight">
										{header}
									</motion.p>
								)}

								<motion.div variants={fadeInUp} className="flex flex-col gap-3">
									{/* Typing Tagline */}
									<TypingTagline text={tagline} />

									{/* Availability + Work Preferences Inline */}
									{isAvailable && (
										<div className="flex flex-wrap items-center gap-2">
											<div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
												<CheckCircle2 className="w-4 h-4" />
												{profile.noticePeriod ? `Available (${profile.noticePeriod})` : 'Available for Work'}
											</div>
											{/* Work preferences as inline chips */}
											{activeWorkPrefs.map(pref => (
												<span key={pref} className="px-2.5 py-1 bg-foreground/5 border border-border rounded-lg text-xs font-bold text-foreground/70 capitalize">
													{pref}
												</span>
											))}
											{profile.Freelancing && (
												<span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-bold text-emerald-500">
													Freelance
												</span>
											)}
										</div>
									)}

									{/* Social Links Row with Tooltips */}
									{socialLinks.length > 0 && (
										<div className="flex items-center gap-2 mt-1">
											{socialLinks.map((social) => (
												<SocialButton key={social.id} social={social} />
											))}
										</div>
									)}
								</motion.div>
							</div>
						</div>

						{/* Right: Action Buttons */}
						<motion.div variants={fadeInUp} className="flex flex-row flex-wrap md:flex-col items-start gap-3 w-full md:w-auto mt-2 md:mt-0 pb-2">
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

					{/* ═══ METRICS BAR ═══ */}
					<motion.div
						variants={fadeInUp}
						className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
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
							icon={Globe}
							label="Languages"
							value={profile.languages?.length ? `${profile.languages.length} Spoken` : 'Multilingual'}
							colorClass="bg-emerald-500"
						>
							{/* Languages Hover Popup */}
							{profile.languages && profile.languages.length > 0 && (
								<div className="space-y-2">
									<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
										Languages I Speak
									</p>
									<div className="flex flex-wrap gap-2">
										{profile.languages.map(lang => (
											<span key={lang} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400">
												{lang}
											</span>
										))}
									</div>
								</div>
							)}
						</StatCard>
					</motion.div>

					{/* ═══ BIO SECTION (Full Width, Standalone) ═══ */}
					{profile.bio && (
						<motion.div
							variants={fadeInUp}
							className="mt-8 w-full p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm relative overflow-hidden"
						>
							<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-primary to-transparent opacity-50" />
							<h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2 pl-4">
								<User className="w-4 h-4" /> About Me
							</h2>
							<p className="text-sm sm:text-base text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium pl-4">
								{profile.bio}
							</p>
						</motion.div>
					)}

					{/* ═══ SKILLS SECTION (Full Width, Standalone) ═══ */}
					{profile.skills && Object.keys(profile.skills).length > 0 && (
						<motion.div
							variants={fadeInUp}
							className="mt-6 w-full p-6 sm:p-8 rounded-3xl bg-card/60 backdrop-blur-2xl border border-border shadow-md relative"
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
										<div className="flex items-center gap-2 mb-4 pl-1 border-l-2 border-primary/30">
											<h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
												{category}
											</h3>
											{/* Category count badge */}
											<span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-black">
												{items.length}
											</span>
										</div>
										<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
											{items.map(skill => {
												const { icon: SkillIcon, color } = getSkillIcon(skill);

												return (
													<motion.div
														key={skill}
														variants={staggerFastItem}
														className="group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-background border border-border hover:border-border/80 transition-all duration-300 hover:-translate-y-1 shadow-[inset_0_1px_rgba(255,255,255,0.02)]"
													>
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
				</motion.div>
			</div>
		</div>
	);
}

// ─── Typing Tagline Component ───────────────────────────────────

function TypingTagline({ text }: { text: string }) {
	const { displayed, isDone } = useTypingAnimation(text, 35, 500);

	return (
		<p className="text-base sm:text-lg md:text-xl font-bold text-foreground/75 max-w-3xl tracking-tight leading-snug min-h-[1.75rem]">
			{displayed}
			{!isDone && (
				<span className="inline-block w-[2px] h-5 bg-primary ml-0.5 animate-pulse align-text-bottom" />
			)}
		</p>
	);
}
