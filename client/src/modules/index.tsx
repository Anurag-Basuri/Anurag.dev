'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import Image from 'next/image';
import { api, AboutData, CodingStats } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Code2,
	Terminal,
	User,
	MapPin,
	Sparkles,
	Cpu,
	Layers,
	Github,
	Code,
	ArrowRight,
	Globe,
	Briefcase,
	Target,
	Zap,
	Download,
	Linkedin,
	Twitter,
	ExternalLink,
	Mail,
	Server,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { ModuleHeader } from '@/modules/shared/ModuleHeader';
import { ModuleError } from '@/components/ui/module-error';
import { cn } from '@/lib/utils';
import { useWindowManager } from '@/hooks/use-window-manager';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '@/lib/animations';

// ============================================================================
// CONSTANTS
// ============================================================================

const SOCIAL_ICON_MAP: Record<string, React.ElementType> = {
	GitHub: Github,
	LinkedIn: Linkedin,
	Twitter: Twitter,
	Email: Mail,
};

const TECH_STACK_CONFIG = {
	frontend: {
		icon: Layers,
		label: 'Frontend',
		iconBg: 'bg-indigo-500/10',
		iconColor: 'text-indigo-400',
		borderHover: 'hover:border-indigo-500/30',
		pillBg: 'bg-indigo-500/10',
		pillBorder: 'border-indigo-500/10',
		pillText: 'text-indigo-300',
		pillHoverBg: 'hover:bg-indigo-500/20',
		pillHoverBorder: 'hover:border-indigo-500/30',
	},
	backend: {
		icon: Server,
		label: 'Backend',
		iconBg: 'bg-emerald-500/10',
		iconColor: 'text-emerald-400',
		borderHover: 'hover:border-emerald-500/30',
		pillBg: 'bg-emerald-500/10',
		pillBorder: 'border-emerald-500/10',
		pillText: 'text-emerald-300',
		pillHoverBg: 'hover:bg-emerald-500/20',
		pillHoverBorder: 'hover:border-emerald-500/30',
	},
	ml: {
		icon: Cpu,
		label: 'AI & ML',
		iconBg: 'bg-purple-500/10',
		iconColor: 'text-purple-400',
		borderHover: 'hover:border-purple-500/30',
		pillBg: 'bg-purple-500/10',
		pillBorder: 'border-purple-500/10',
		pillText: 'text-purple-300',
		pillHoverBg: 'hover:bg-purple-500/20',
		pillHoverBorder: 'hover:border-purple-500/30',
	},
} as const;

// ============================================================================
// MEMOIZED COMPONENTS
// ============================================================================

const AboutSkeleton = memo(function AboutSkeleton() {
	return (
		<div className="p-4 sm:p-6 space-y-8 animate-pulse max-w-7xl mx-auto">
			<div className="h-64 sm:h-80 bg-muted/20 rounded-[2.5rem]" />
			<div className="flex justify-center -mt-20">
				<div className="w-40 h-40 bg-muted rounded-full border-8 border-background" />
			</div>
			<div className="space-y-4 text-center px-4 max-w-2xl mx-auto">
				<div className="h-10 bg-muted/40 rounded-xl w-3/4 mx-auto" />
				<div className="h-4 bg-muted/40 rounded-xl w-1/2 mx-auto" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{[1, 2, 3].map(i => (
					<div key={i} className="h-32 bg-muted/20 rounded-3xl" />
				))}
			</div>
		</div>
	);
});

const HeroBackground = memo(function HeroBackground() {
	const shouldReduceMotion = useReducedMotion();

	return (
		<div className="absolute inset-0 bg-black overflow-hidden">
			{/* Gradient Overlay */}
			<div className="absolute inset-x-0 bottom-0 h-full bg-linear-to-t from-black via-transparent to-transparent z-10" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-emerald-900/40 via-black to-black opacity-80" />

			{/* Grid Pattern */}
			<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

			{/* Animated Blobs */}
			{!shouldReduceMotion && (
				<>
					<motion.div
						className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.3, 0.5, 0.3],
						}}
						transition={{
							duration: 8,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
					/>
					<motion.div
						className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"
						animate={{
							scale: [1, 1.3, 1],
							opacity: [0.3, 0.5, 0.3],
						}}
						transition={{
							duration: 10,
							repeat: Infinity,
							ease: 'easeInOut',
							delay: 1,
						}}
					/>
				</>
			)}
		</div>
	);
});

const ProfileAvatar = memo(function ProfileAvatar({
	avatarUrl,
	name,
}: {
	avatarUrl?: string;
	name: string;
}) {
	return (
		<motion.div
			initial={{ scale: 0, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
			className="relative shrink-0"
		>
			<div className="w-40 h-40 rounded-4xl p-1.5 bg-linear-to-br from-emerald-500 via-blue-500 to-purple-500 shadow-xl">
				<div className="w-full h-full rounded-[1.7rem] overflow-hidden bg-black relative">
					<Image
						src={avatarUrl || '/logo.png'}
						alt={name}
						fill
						className="object-cover"
						priority
						sizes="160px"
					/>
				</div>
			</div>
			{/* Online Status Indicator */}
			<motion.div
				className="absolute -bottom-2 -right-2 bg-[#0a0a0a] rounded-xl p-1.5 border border-white/10"
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				transition={{ delay: 0.5, type: 'spring' }}
			>
				<motion.div
					className="w-4 h-4 rounded-lg bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
					animate={{ opacity: [1, 0.5, 1] }}
					transition={{ duration: 2, repeat: Infinity }}
				/>
			</motion.div>
		</motion.div>
	);
});

const QuickStat = memo(function QuickStat({
	value,
	label,
	icon: Icon,
	delay = 0,
	gradientFrom,
	textColor,
}: {
	value: string | number;
	label: string;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	delay?: number;
	gradientFrom: string;
	textColor: string;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-50px' }}
			transition={{ delay, duration: 0.5 }}
			whileHover={{ y: -5, transition: { duration: 0.2 } }}
			className="group relative p-8 rounded-4xl bg-card/20 border border-white/5 hover:bg-card/40 transition-all duration-500"
		>
			<div
				className={cn(
					'absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-4xl',
					`${gradientFrom} to-transparent`,
				)}
			/>
			<div className="text-5xl font-black text-white mb-2 tracking-tighter">{value}</div>
			<div
				className={cn(
					'flex items-center gap-2 text-sm font-bold uppercase tracking-widest',
					textColor,
				)}
			>
				<Icon className="w-4 h-4" />
				{label}
			</div>
		</motion.div>
	);
});

const TechStackCard = memo(function TechStackCard({
	category,
	skills,
	config,
	delay = 0,
}: {
	category: string;
	skills: Array<{ name: string; level?: string } | string>;
	config: (typeof TECH_STACK_CONFIG)[keyof typeof TECH_STACK_CONFIG];
	delay?: number;
}) {
	const Icon = config.icon;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-50px' }}
			transition={{ delay, duration: 0.5 }}
			whileHover={{ y: -5, transition: { duration: 0.2 } }}
			className={cn(
				'p-8 rounded-4xl bg-card/20 border border-white/5 transition-all group',
				config.borderHover,
			)}
		>
			<div
				className={cn(
					'w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110',
					config.iconBg,
					config.iconColor,
				)}
			>
				<Icon className="w-6 h-6" />
			</div>
			<h3 className="text-xl font-bold text-white mb-6">{config.label}</h3>
			<div className="flex flex-wrap gap-2">
				{skills.map(skill => {
					const skillName = typeof skill === 'string' ? skill : skill.name;
					return (
						<motion.span
							key={skillName}
							whileHover={{ scale: 1.05 }}
							className={cn(
								'px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors',
								config.pillBg,
								config.pillBorder,
								config.pillText,
								config.pillHoverBg,
								config.pillHoverBorder,
							)}
						>
							{skillName}
						</motion.span>
					);
				})}
			</div>
		</motion.div>
	);
});

const CodingStatsCard = memo(function CodingStatsCard({
	codingStats,
	openWindow,
}: {
	codingStats: CodingStats | null;
	openWindow: (id: string) => void;
}) {
	if (!codingStats) return null;

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			whileInView={{ opacity: 1, x: 0 }}
			viewport={{ once: true }}
			transition={{ delay: 0.2 }}
			className="p-6 rounded-4xl bg-card/20 border border-white/5 space-y-6 hover:border-emerald-500/20 transition-all"
		>
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-bold text-white flex items-center gap-2">
					<Terminal className="w-5 h-5 text-emerald-500" />
					Coding Stats
				</h3>
				<button
					onClick={() => openWindow('coding-stats')}
					className="text-xs font-bold text-muted-foreground hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 group"
				>
					View All
					<ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
				</button>
			</div>

			<div className="space-y-4">
				{/* LeetCode */}
				<motion.div
					whileHover={{ scale: 1.02 }}
					className="flex items-center gap-4 p-3 rounded-xl bg-black/20 border border-white/5 hover:border-yellow-500/30 transition-all cursor-pointer"
				>
					<div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
						<Code className="w-5 h-5" />
					</div>
					<div className="flex-1">
						<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
							LeetCode
						</div>
						<div className="text-sm font-bold text-white">
							{codingStats.leetcode.stats?.solved || '0'} Solved
						</div>
					</div>
					<ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
				</motion.div>

				{/* GitHub */}
				<motion.div
					whileHover={{ scale: 1.02 }}
					className="flex items-center gap-4 p-3 rounded-xl bg-black/20 border border-white/5 hover:border-white/20 transition-all cursor-pointer"
				>
					<div className="p-2 bg-white/10 rounded-lg text-white">
						<Github className="w-5 h-5" />
					</div>
					<div className="flex-1">
						<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
							GitHub
						</div>
						<div className="text-sm font-bold text-white">
							{codingStats.github.stats?.stars || '0'} Stars
						</div>
					</div>
					<ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
				</motion.div>
			</div>
		</motion.div>
	);
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AboutModule() {
	const [about, setAbout] = useState<AboutData | null>(null);
	const [codingStats, setCodingStats] = useState<CodingStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { openWindow } = useWindowManager();

	// Fetch data with error handling
	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const [aboutData, statsData] = await Promise.all([
				api.getAbout(),
				api.getCodingStats(),
			]);
			setAbout(aboutData);
			setCodingStats(statsData);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('Failed to load data');
			}
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Memoize computed values
	const socialLinks = useMemo(() => about?.socials || [], [about?.socials]);
	const focusAreas = useMemo(() => about?.focusAreas || [], [about?.focusAreas]);
	const languages = useMemo(() => about?.languages || [], [about?.languages]);
	const hobbies = useMemo(() => about?.hobbies || [], [about?.hobbies]);

	// Handle social link clicks
	const handleSocialClick = useCallback((url: string) => {
		window.open(url, '_blank', 'noopener,noreferrer');
	}, []);

	// Loading state
	if (loading) return <AboutSkeleton />;

	// Error state
	if (error) {
		return <ModuleError message={error} onRetry={fetchData} />;
	}

	// No data state
	if (!about) return null;

	return (
		<ScrollArea className="h-full">
			<div className="max-w-7xl mx-auto pb-24">
				{/* ============================================================
                    HERO SECTION
                    ============================================================ */}
				<div className="relative mb-20">
					{/* Hero Background */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
						className="relative h-64 sm:h-80 md:h-96 rounded-b-[3rem] overflow-hidden mx-2 sm:mx-4"
					>
						<HeroBackground />

						{/* Resume Button */}
						{about.resumeUrl && (
							<motion.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
								className="absolute top-6 right-6 z-20"
							>
								<a
									href={about.resumeUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
								>
									<Download className="w-4 h-4 text-emerald-400" />
									<span className="text-sm font-bold text-white/90 group-hover:text-white">
										Resume
									</span>
								</a>
							</motion.div>
						)}
					</motion.div>

					{/* Profile Info Card */}
					<div className="relative -mt-32 z-10 px-4 sm:px-6">
						<div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-[2.5rem] p-8 max-w-5xl mx-auto">
							<div className="flex flex-col md:flex-row items-center md:items-start gap-8">
								{/* Avatar */}
								<ProfileAvatar avatarUrl={about.avatarUrl} name={about.name} />

								{/* Info */}
								<div className="flex-1 text-center md:text-left space-y-4 pt-2">
									<div>
										<motion.h1
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.1 }}
											className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight"
										>
											{about.name}
										</motion.h1>
										<motion.p
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.2 }}
											className="text-xl text-emerald-400 font-medium"
										>
											{about.role}
										</motion.p>
									</div>

									<motion.p
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.3 }}
										className="text-muted-foreground leading-relaxed max-w-2xl"
									>
										{about.tagline}
									</motion.p>

									{/* Quick Links & Status */}
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.4 }}
										className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2"
									>
										{about.location && (
											<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-medium text-white/70">
												<MapPin className="w-3.5 h-3.5 text-emerald-500" />
												{about.location}
											</div>
										)}
										{about.currentStatus && (
											<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
												<Zap className="w-3.5 h-3.5" />
												{about.currentStatus.label}
											</div>
										)}

										<div className="w-px h-4 bg-white/10 mx-2 hidden sm:block" />

										{/* Social Links */}
										<div className="flex items-center gap-2">
											{socialLinks.map(social => {
												const Icon =
													(SOCIAL_ICON_MAP[
														social.platform as keyof typeof SOCIAL_ICON_MAP
													] as React.ComponentType<
														React.SVGProps<SVGSVGElement>
													>) || Globe;
												return (
													<motion.button
														key={social.platform}
														whileHover={{ scale: 1.1 }}
														whileTap={{ scale: 0.95 }}
														onClick={() =>
															handleSocialClick(social.url)
														}
														className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
														aria-label={`Visit ${social.platform}`}
													>
														<Icon className="w-4 h-4" />
													</motion.button>
												);
											})}
										</div>
									</motion.div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ============================================================
                    CONTENT GRID
                    ============================================================ */}
				<div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-16">
					{/* Highlights */}
					{about.highlights && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<QuickStat
								value={`${about.experienceYears}+`}
								label="Years Exp."
								icon={Briefcase}
								gradientFrom="from-emerald-500/5"
								textColor="text-emerald-500"
								delay={0}
							/>
							<QuickStat
								value={`${about.projectsCount}+`}
								label="Projects"
								icon={Code2}
								gradientFrom="from-blue-500/5"
								textColor="text-blue-500"
								delay={0.1}
							/>
							<QuickStat
								value="100%"
								label="Commitment"
								icon={Target}
								gradientFrom="from-purple-500/5"
								textColor="text-purple-500"
								delay={0.2}
							/>
						</div>
					)}

					{/* About Bio & Sidebar */}
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
						{/* Main Content */}
						<div className="lg:col-span-8 space-y-8">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								className="space-y-6"
							>
								<h2 className="text-3xl font-bold text-white flex items-center gap-3">
									<User className="w-6 h-6 text-emerald-500" />
									About Me
								</h2>
								<div className="prose prose-invert prose-lg max-w-none text-muted-foreground leading-relaxed">
									<p>{about.summary}</p>
									{about.bio && (
										<div className="whitespace-pre-line mt-4">{about.bio}</div>
									)}
								</div>
							</motion.div>

							{/* Focus Areas */}
							{focusAreas.length > 0 && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: 0.1 }}
									className="pt-6"
								>
									<h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
										Core Focus
									</h3>
									<div className="flex flex-wrap gap-3">
										{focusAreas.map((area, index) => (
											<motion.span
												key={area}
												initial={{ opacity: 0, scale: 0.8 }}
												whileInView={{ opacity: 1, scale: 1 }}
												viewport={{ once: true }}
												transition={{ delay: index * 0.05 }}
												whileHover={{ scale: 1.05 }}
												className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm font-medium text-white/80 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors cursor-default"
											>
												{area}
											</motion.span>
										))}
									</div>
								</motion.div>
							)}
						</div>

						{/* Sidebar Stats */}
						<div className="lg:col-span-4 space-y-6">
							<CodingStatsCard codingStats={codingStats} openWindow={openWindow} />
						</div>
					</div>

					{/* Tech Stack */}
					<div className="space-y-8">
						<motion.h2
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="text-3xl font-bold text-white flex items-center gap-3"
						>
							<Cpu className="w-6 h-6 text-emerald-500" />
							Technical Arsenal
						</motion.h2>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<TechStackCard
								category="frontend"
								skills={about.skills.frontend.map(skill =>
									typeof skill === 'string'
										? skill
										: {
												...skill,
												level:
													skill.level !== undefined
														? String(skill.level)
														: undefined,
										  },
								)}
								config={TECH_STACK_CONFIG.frontend}
								delay={0}
							/>
							<TechStackCard
								category="backend"
								skills={about.skills.backend.map(skill =>
									typeof skill === 'string'
										? skill
										: {
												...skill,
												level:
													skill.level !== undefined
														? String(skill.level)
														: undefined,
										  },
								)}
								config={TECH_STACK_CONFIG.backend}
								delay={0.1}
							/>
							<TechStackCard
								category="ml"
								skills={about.skills.ml.map(skill =>
									typeof skill === 'string'
										? skill
										: {
												...skill,
												level:
													skill.level !== undefined
														? String(skill.level)
														: undefined,
										  },
								)}
								config={TECH_STACK_CONFIG.ml}
								delay={0.2}
							/>
						</div>
					</div>

					{/* Personal Section */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
						{/* Languages */}
						{languages.length > 0 && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								className="p-8 rounded-4xl bg-card/20 border border-white/5 hover:border-blue-500/20 transition-all"
							>
								<h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
									<Globe className="w-5 h-5 text-blue-400" />
									Languages
								</h3>
								<div className="flex flex-wrap gap-3">
									{languages.map((lang, index) => (
										<motion.span
											key={lang}
											initial={{ opacity: 0, scale: 0.8 }}
											whileInView={{ opacity: 1, scale: 1 }}
											viewport={{ once: true }}
											transition={{ delay: index * 0.05 }}
											whileHover={{ scale: 1.05 }}
											className="px-4 py-2 rounded-xl bg-background/50 border border-white/5 text-sm font-medium text-white/80 hover:border-blue-500/30 transition-colors"
										>
											{lang}
										</motion.span>
									))}
								</div>
							</motion.div>
						)}

						{/* Interests */}
						{hobbies.length > 0 && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.1 }}
								className="p-8 rounded-4xl bg-card/20 border border-white/5 hover:border-yellow-500/20 transition-all"
							>
								<h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
									<Sparkles className="w-5 h-5 text-yellow-400" />
									Interests
								</h3>
								<div className="flex flex-wrap gap-3">
									{hobbies.map((hobby, index) => (
										<motion.span
											key={hobby}
											initial={{ opacity: 0, scale: 0.8 }}
											whileInView={{ opacity: 1, scale: 1 }}
											viewport={{ once: true }}
											transition={{ delay: index * 0.05 }}
											whileHover={{ scale: 1.05 }}
											className="px-4 py-2 rounded-xl bg-background/50 border border-white/5 text-sm font-medium text-white/80 hover:border-yellow-500/30 transition-colors"
										>
											{hobby}
										</motion.span>
									))}
								</div>
							</motion.div>
						)}
					</div>
				</div>
			</div>
		</ScrollArea>
	);
}
