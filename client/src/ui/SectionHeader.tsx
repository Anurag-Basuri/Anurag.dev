import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { fadeInUp } from '@/animations/motion';
import { cn } from '@/lib/utils';

// ─── Accent color mapping ───────────────────────────────────────

type AccentColor =
	| 'emerald'
	| 'sky'
	| 'violet'
	| 'amber'
	| 'rose'
	| 'cyan'
	| 'indigo'
	| 'orange'
	| 'teal';

const ACCENT_STYLES: Record<
	AccentColor,
	{ icon: string; badge: string; text: string; line: string; glow: string }
> = {
	emerald: {
		icon: 'text-emerald-500',
		badge: 'bg-emerald-500/10 border-emerald-500/20',
		text: 'text-emerald-500',
		line: 'from-emerald-500/50',
		glow: 'bg-emerald-500',
	},
	sky: {
		icon: 'text-sky-500',
		badge: 'bg-sky-500/10 border-sky-500/20',
		text: 'text-sky-500',
		line: 'from-sky-500/50',
		glow: 'bg-sky-500',
	},
	violet: {
		icon: 'text-violet-500',
		badge: 'bg-violet-500/10 border-violet-500/20',
		text: 'text-violet-500',
		line: 'from-violet-500/50',
		glow: 'bg-violet-500',
	},
	amber: {
		icon: 'text-amber-500',
		badge: 'bg-amber-500/10 border-amber-500/20',
		text: 'text-amber-500',
		line: 'from-amber-500/50',
		glow: 'bg-amber-500',
	},
	rose: {
		icon: 'text-rose-500',
		badge: 'bg-rose-500/10 border-rose-500/20',
		text: 'text-rose-500',
		line: 'from-rose-500/50',
		glow: 'bg-rose-500',
	},
	cyan: {
		icon: 'text-cyan-500',
		badge: 'bg-cyan-500/10 border-cyan-500/20',
		text: 'text-cyan-500',
		line: 'from-cyan-500/50',
		glow: 'bg-cyan-500',
	},
	indigo: {
		icon: 'text-indigo-500',
		badge: 'bg-indigo-500/10 border-indigo-500/20',
		text: 'text-indigo-500',
		line: 'from-indigo-500/50',
		glow: 'bg-indigo-500',
	},
	orange: {
		icon: 'text-orange-500',
		badge: 'bg-orange-500/10 border-orange-500/20',
		text: 'text-orange-500',
		line: 'from-orange-500/50',
		glow: 'bg-orange-500',
	},
	teal: {
		icon: 'text-teal-500',
		badge: 'bg-teal-500/10 border-teal-500/20',
		text: 'text-teal-500',
		line: 'from-teal-500/50',
		glow: 'bg-teal-500',
	},
};

// ─── Component ──────────────────────────────────────────────────

interface SectionHeaderProps {
	icon: LucideIcon;
	label: string;
	title: string;
	description?: string;
	actions?: ReactNode;
	accent?: AccentColor;
}

export function SectionHeader({
	icon: Icon,
	label,
	title,
	description,
	actions,
	accent = 'emerald',
}: SectionHeaderProps) {
	const styles = ACCENT_STYLES[accent];

	return (
		<motion.div
			variants={fadeInUp}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: '-20px' }}
			className="relative flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 pb-4 border-b border-white/5"
		>
			<div className="relative z-10">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.1 }}
					className={cn(
						'flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] mb-2',
						styles.text,
					)}
				>
					<span className={cn('p-1.5 rounded-lg border', styles.badge)}>
						<Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
					</span>
					<span>{label}</span>
				</motion.div>

				<h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-white/90 to-white/50 leading-tight mb-2 tracking-tight">
					{title}
				</h1>

				{description && (
					<p className="text-sm text-muted-foreground/80 max-w-lg leading-relaxed font-medium">
						{description}
					</p>
				)}
			</div>

			{actions && (
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2 }}
					className="shrink-0 relative z-10"
				>
					{actions}
				</motion.div>
			)}

			{/* Accent line */}
			<div
				className={cn(
					'absolute bottom-0 left-0 right-0 h-px bg-linear-to-r via-transparent to-transparent opacity-50',
					styles.line,
				)}
			/>
			<div className={cn('absolute -bottom-px left-0 w-16 h-px blur-[1px]', styles.glow)} />
		</motion.div>
	);
}
