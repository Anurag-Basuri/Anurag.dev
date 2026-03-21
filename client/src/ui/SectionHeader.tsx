import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { fadeInUp } from '@/animations/motion';
import { cn } from '@/lib/utils';
import { getSectionTheme, type SectionAccent } from '@/lib/theme';

// ─── Component ──────────────────────────────────────────────────

interface SectionHeaderProps {
	icon: LucideIcon;
	label: string;
	title: string;
	description?: string;
	actions?: ReactNode;
	accent?: SectionAccent;
	/** Section ID — auto-resolves accent from the global registry if provided */
	sectionId?: string;
}

export function SectionHeader({
	icon: Icon,
	label,
	title,
	description,
	actions,
	accent,
	sectionId,
}: SectionHeaderProps) {
	// If sectionId is provided, resolve accent from registry; otherwise use explicit accent prop
	const theme = sectionId ? getSectionTheme(sectionId) : accent ? getSectionTheme(
		// Map legacy accent names to section IDs for backward compat
		accent === 'pink' ? 'profile' :
		accent === 'purple' ? 'experience' :
		accent === 'blue' ? 'education' :
		accent === 'yellow' ? 'projects' :
		accent === 'orange' ? 'achievements' :
		accent === 'emerald' ? 'certifications' :
		accent === 'sky' ? 'blog' :
		accent === 'red' ? 'coding_stats' :
		accent === 'indigo' ? 'contact' :
		'certifications'
	) : getSectionTheme('certifications');

	return (
		<motion.div
			variants={fadeInUp}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: '-20px' }}
			className="relative flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 pb-4 border-b border-border"
		>
			<div className="relative z-10">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.1 }}
					className={cn(
						'flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] mb-2',
						theme.icon,
					)}
				>
					<span className={cn('p-1.5 rounded-lg border backdrop-blur-sm', theme.badge)}>
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
					theme.line,
				)}
			/>
			<div className={cn('absolute -bottom-px left-0 w-16 h-px blur-[1px]', theme.glow)} />
		</motion.div>
	);
}
