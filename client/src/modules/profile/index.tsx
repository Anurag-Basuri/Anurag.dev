'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	User,
	MapPin,
	Briefcase,
	ChevronRight,
	FileText,
	CheckCircle2,
	Globe,
	Layers,
	ExternalLink,
	Zap,
} from 'lucide-react';
import Link from 'next/link';
import { publicService } from '@/api';
import type { Profile } from '@/api/schema';
import { cn } from '@/lib/utils';
import { getSkillIcon } from '@/lib/skill-icons';
import {
	SiGithub,
	SiX,
	SiYoutube,
	SiInstagram,
	SiFacebook,
	SiDiscord,
	SiMedium,
	SiDevdotto,
	SiHashnode,
	SiStackoverflow,
	SiReddit,
	SiTwitch,
	SiDribbble,
	SiBehance,
} from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa6';
import { fadeInUp, staggerContainer, staggerFast, staggerFastItem } from '@/animations/motion';
import { SpotlightCard } from '@/ui/SpotlightCard';

// â”€â”€â”€ Social Platform Icon Map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SOCIAL_ICONS: Record<
	string,
	{ icon: React.ComponentType<{ className?: string }>; label: string; color: string }
> = {
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
	return (
		SOCIAL_ICONS[platform.toUpperCase()] ?? {
			icon: ExternalLink,
			label: platform,
			color: '#888888',
		}
	);
}

// â”€â”€â”€ Typing Animation Hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function useTypingAnimation(text: string, speed = 35, startDelay = 500) {
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

// â”€â”€â”€ Skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ProfileSkeleton() {
	return (
		<div className="w-full animate-pulse px-4 sm:px-6 md:px-10 max-w-7xl mx-auto pt-10 pb-12">
			<div className="flex flex-col md:flex-row gap-10">
				<div className="w-44 h-44 md:w-56 md:h-56 bg-foreground/5 rounded-3xl shrink-0" />
				<div className="flex-1 space-y-4 pt-2">
					<div className="h-10 w-72 bg-foreground/5 rounded-xl" />
					<div className="h-5 w-96 bg-foreground/5 rounded-lg" />
					<div className="h-5 w-64 bg-foreground/5 rounded-lg" />
					<div className="flex gap-3 mt-4">
						<div className="h-10 w-10 bg-foreground/5 rounded-full" />
						<div className="h-10 w-10 bg-foreground/5 rounded-full" />
						<div className="h-10 w-10 bg-foreground/5 rounded-full" />
					</div>
				</div>
			</div>
			<div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
				{[1, 2, 3].map(i => (
					<div key={i} className="h-24 bg-foreground/5 rounded-2xl" />
				))}
			</div>
			<div className="mt-8 h-40 bg-foreground/5 rounded-3xl" />
			<div className="mt-6 h-80 bg-foreground/5 rounded-3xl" />
		</div>
	);
}

// â”€â”€â”€ Helper: Stat Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StatCard({
	icon: Icon,
	label,
	value,
	colorClass,
	children,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: string;
	colorClass: string;
	children?: React.ReactNode;
}) {
	const [hovered, setHovered] = useState(false);

	return (
		<div
			className="relative flex-1"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<SpotlightCard
				tilt={true}
				className="flex flex-col justify-center p-4 sm:p-5 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/80 hover:border-primary/40 transition-all shadow-sm hover:shadow-lg cursor-default h-full"
			>
				<div className="flex items-center gap-4 relative z-10">
					<motion.div
						animate={hovered ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
						transition={{ type: 'spring', stiffness: 400, damping: 15 }}
						className={cn(
							'p-3 rounded-xl border bg-background shadow-inner transition-colors',
							colorClass.replace('bg-', 'text-'),
						)}
					>
						<Icon className="w-5 h-5" />
					</motion.div>
					<div>
						<p className="text-[11px] sm:text-xs font-mono font-medium text-muted-foreground uppercase tracking-wide mb-1">
							{label}
						</p>
						<p className="text-base sm:text-lg font-mono font-bold text-foreground tracking-tight leading-none tabular-nums">
							{value}
						</p>
					</div>
				</div>
			</SpotlightCard>

			{/* Hover popover */}
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

// â”€â”€â”€ Helper: Social Button with Tooltip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SocialButton({
	social,
}: {
	social: { id: string; platform: string; url: string; customLabel?: string | null };
}) {
	const { icon: SocialIcon, label } = getSocialIcon(social.platform);
	const [showTooltip, setShowTooltip] = useState(false);

	return (
		<div
			className="relative"
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
		>
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

// â”€â”€â”€ Typing Tagline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TypingTagline({ text }: { text: string }) {
	const { displayed, isDone } = useTypingAnimation(text, 35, 500);

	return (
		<p className="text-base sm:text-lg md:text-xl font-medium text-muted-foreground max-w-2xl tracking-tight leading-relaxed min-h-7">
			{displayed}
			{!isDone && (
				<span className="inline-block w-[2px] h-5 bg-primary ml-0.5 animate-pulse align-text-bottom" />
			)}
		</p>
	);
}

// â”€â”€â”€ Main Module â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function ProfileModule() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [lightboxOpen, setLightboxOpen] = useState(false);

	useEffect(() => {
		let cancelled = false;
		async function fetchProfile() {
			try {
				const { data } = await publicService.getProfile();
				if (!cancelled) setProfile(data);
			} catch (err) {
				console.error('Failed to load profile', err);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		fetchProfile();
		return () => {
			cancelled = true;
		};
	}, []);

	if (loading) return <ProfileSkeleton />;
	if (!profile) return null;

	const tagline = profile.Tagline || profile.header || 'Digital Creator & Engineer';
	const header = profile.Tagline && profile.header ? profile.header : null;
	const isAvailable = profile.openToWork;
	const socialLinks = profile.socialLinks ?? [];
	const activeWorkPrefs = profile.workPreferences
		? Object.entries(profile.workPreferences)
				.filter(([_, v]) => v === true)
				.map(([k]) => k)
		: [];

	return (
		<>
		{/* Lightbox Modal */}
		<AnimatePresence>
			{lightboxOpen && profile?.avatarUrl && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
					onClick={() => setLightboxOpen(false)}
					onKeyDown={(e) => e.key === 'Escape' && setLightboxOpen(false)}
					role="dialog"
					tabIndex={0}
				>
					<motion.img
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.8, opacity: 0 }}
						transition={{ type: 'spring', stiffness: 300, damping: 25 }}
						src={profile.avatarUrl}
						alt={profile.name}
						className="max-h-[85vh] max-w-[90vw] object-contain rounded-3xl shadow-2xl cursor-default"
						onClick={(e) => e.stopPropagation()}
					/>
				</motion.div>
			)}
		</AnimatePresence>

		<div className="w-full relative min-h-full pb-20">
			{/* Ambient Background Glows */}
			<div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px] -z-10 pointer-events-none mix-blend-screen" />
			<div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[140px] -z-10 pointer-events-none mix-blend-screen" />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-8 sm:pt-12 relative z-10">
				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="flex flex-col"
				>
					{/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
					    HERO â€” Large Photo + Identity
					    â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
					<div className="flex flex-col md:flex-row gap-8 md:gap-14 items-center md:items-center">
						{/* Profile Photo â€” very large */}
						<motion.div
							variants={fadeInUp}
							className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-4xl overflow-hidden border-2 border-border/60 bg-card shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] shrink-0 group cursor-pointer"
							onClick={() => profile.avatarUrl && setLightboxOpen(true)}
						>
							{profile.avatarUrl ? (
								<img
									src={profile.avatarUrl}
									alt={profile.name}
									className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-muted">
									<User className="w-28 h-28 text-muted-foreground/50" />
								</div>
							)}
							<div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-4xl pointer-events-none" />
						</motion.div>

						{/* Name + Tagline ONLY â€” beside the photo, vertically centered */}
						<div className="flex-1 flex flex-col justify-center min-w-0 text-center md:text-left">
							<motion.div variants={fadeInUp}>
								<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] font-sans">
									{profile.name}
								</h1>
							</motion.div>
							<motion.div variants={fadeInUp} className="mt-4">
								<TypingTagline text={tagline} />
							</motion.div>
						</div>
					</div>

					{/* â•â•â• DETAILS STRIP (below photo+name) â•â•â• */}
					<div className="mt-8 flex flex-col items-center md:items-start gap-5">
						{/* Header / Role */}
						{header && (
							<motion.p
								variants={fadeInUp}
								className="text-base sm:text-lg font-semibold text-primary tracking-tight"
							>
								{header}
							</motion.p>
						)}

						{/* Status Badges */}
						<motion.div
							variants={fadeInUp}
							className="flex flex-wrap items-center justify-center md:justify-start gap-2"
						>
							{profile.pronouns && (
								<span className="px-3 py-1.5 rounded-full bg-foreground/5 border border-border text-[11px] font-mono font-medium text-muted-foreground tracking-wide uppercase">
									{profile.pronouns}
								</span>
							)}
							{isAvailable && (
								<div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
									<span className="relative flex h-2 w-2">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
										<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
									</span>
									{profile.noticePeriod
										? `Available Â· ${profile.noticePeriod}`
										: 'Open to Work'}
								</div>
							)}
							{profile.Freelancing && (
								<div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
									<Zap className="w-3 h-3" />
									Freelance Ready
								</div>
							)}
							{activeWorkPrefs.map(pref => (
								<span
									key={pref}
									className="px-3 py-1.5 bg-foreground/5 border border-border rounded-full text-[11px] font-mono font-medium text-muted-foreground capitalize tracking-normal"
								>
									{pref}
								</span>
							))}
						</motion.div>

						{/* CTAs + Social */}
						<motion.div
							variants={fadeInUp}
							className="flex flex-wrap items-center justify-center md:justify-start gap-3"
						>
							<button
								onClick={() =>
									window.dispatchEvent(
										new CustomEvent('scroll-to-section', {
											detail: { sectionId: 'contact' },
										}),
									)
								}
								className="group flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 shadow-[0_0_30px_-8px] shadow-primary/40 hover:shadow-primary/60"
							>
								Let&apos;s Connect
								<ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
							</button>

							{profile.resumeUrl && (
								<Link
									href="/resume"
									className="group flex items-center gap-2 bg-card hover:bg-muted text-foreground px-6 py-2.5 rounded-xl font-bold text-sm transition-all border border-border hover:border-foreground/20 hover:-translate-y-0.5"
								>
									Resume
									<FileText className="w-4 h-4 text-muted-foreground group-hover:scale-110 transition-transform" />
								</Link>
							)}

							{socialLinks.length > 0 && (
								<div className="hidden sm:block w-px h-8 bg-border" />
							)}

							{socialLinks.length > 0 && (
								<div className="flex items-center gap-2">
									{socialLinks.map(social => (
										<SocialButton key={social.id} social={social} />
									))}
								</div>
							)}
						</motion.div>
					</div>

					{/* Subtle separator */}
					<motion.div
						variants={fadeInUp}
						className="mt-12 mb-2 h-px bg-linear-to-r from-transparent via-border to-transparent"
					/>

					{/* â•â•â• METRICS BAR â•â•â• */}
					<motion.div
						variants={fadeInUp}
						className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
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
							value={
								profile.languages?.length
									? `${profile.languages.length} Spoken`
									: 'Multilingual'
							}
							colorClass="bg-emerald-500"
						>
							{profile.languages && profile.languages.length > 0 && (
								<div className="space-y-2">
									<p className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
										Languages I Speak
									</p>
									<div className="flex flex-wrap gap-2">
										{profile.languages.map(lang => (
											<span
												key={lang}
												className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400"
											>
												{lang}
											</span>
										))}
									</div>
								</div>
							)}
						</StatCard>
					</motion.div>

					{/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
					    BIO SECTION
					    â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
					{profile.bio && (
						<motion.div
							variants={fadeInUp}
							className="mt-8 w-full p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm relative overflow-hidden"
						>
							<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-primary to-transparent opacity-50" />
							<h2 className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2 pl-4">
								<User className="w-4 h-4" /> About Me
							</h2>
							<p className="text-sm sm:text-base text-foreground/85 leading-relaxed whitespace-pre-wrap font-normal pl-4 font-sans">
								{profile.bio}
							</p>
						</motion.div>
					)}

					{/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
					    TECHNICAL ARSENAL
					    â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
									<h2 className="text-lg font-bold text-foreground tracking-tight font-sans">
										Technical Arsenal
									</h2>
									<p className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
										Frameworks, Tools & Protocols
									</p>
								</div>
							</div>

							<motion.div
								variants={staggerFast}
								initial="hidden"
								whileInView="visible"
								viewport={{ once: true, margin: '-50px' }}
								className="space-y-8"
							>
								{Object.entries(profile.skills).map(([category, items]) => (
									<div key={category}>
										<div className="flex items-center gap-2 mb-4 pl-1 border-l-2 border-primary/30">
											<h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
												{category}
											</h3>
											<span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-mono font-medium">
												{items.length}
											</span>
										</div>
										<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
											{items.map(skill => {
												const { icon: SkillIcon, color } =
													getSkillIcon(skill);

												return (
													<motion.div
														key={skill}
														variants={staggerFastItem}
														className="group relative flex flex-col items-center justify-center p-3 rounded-xl bg-background border border-border hover:border-transparent transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl shadow-[inset_0_1px_rgba(255,255,255,0.02)] cursor-default"
													>
														<div
															className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl pointer-events-none blur-md"
															style={{ backgroundColor: color }}
														/>
														<div 
															className="absolute inset-0 border border-transparent group-hover:border-current transition-colors duration-300 rounded-xl pointer-events-none opacity-20"
															style={{ color }}
														/>
														<SkillIcon
															className="w-5 h-5 mb-2 transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
															style={{ color }}
														/>
														<span className="text-[11px] sm:text-xs font-mono font-medium text-center text-foreground/80 group-hover:text-foreground transition-colors line-clamp-1 break-all px-1">
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
		</>
	);
}
