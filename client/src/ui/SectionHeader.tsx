'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { fadeInUp } from '@/animations/motion';
import { cn } from '@/lib/utils';
import { getSectionTheme, type SectionAccent } from '@/lib/theme';

interface SectionHeaderProps {
	icon: LucideIcon;
	label?: string;
	title: string;
	description?: string;
	actions?: ReactNode;
	accent?: SectionAccent;
	sectionId?: string;
	className?: string;
}

export function SectionHeader({
	icon: Icon,
	title,
	description,
	actions,
	accent,
	sectionId,
	className,
}: SectionHeaderProps) {
	const theme = sectionId
		? getSectionTheme(sectionId)
		: accent
		? getSectionTheme(
				accent === 'pink'
					? 'profile'
					: accent === 'purple'
					? 'experience'
					: accent === 'blue'
					? 'education'
					: accent === 'yellow'
					? 'projects'
					: accent === 'orange'
					? 'achievements'
					: accent === 'emerald'
					? 'certifications'
					: accent === 'sky'
					? 'blog'
					: accent === 'red'
					? 'coding_stats'
					: accent === 'indigo'
					? 'contact'
					: 'certifications'
		  )
		: getSectionTheme('certifications');

	return (
		<motion.div
			variants={fadeInUp}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: '-10px' }}
			className={cn(
				'sticky top-0 z-40 bg-background/85 backdrop-blur-xl py-2 mb-3 border-b border-border/40 flex items-center justify-between gap-3 shadow-xs',
				className
			)}
		>
			<div className="flex items-center gap-2.5 min-w-0">
				<div
					className={cn(
						'p-1.5 rounded-lg border backdrop-blur-sm shadow-xs flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105',
						theme.badge,
						theme.icon
					)}
				>
					<Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
				</div>

				<div className="flex items-baseline gap-2.5 min-w-0">
					<h2 className="text-base sm:text-lg font-black tracking-tight text-foreground whitespace-nowrap">
						<span
							className="bg-clip-text text-transparent bg-linear-to-r from-foreground via-foreground to-[var(--theme-primary)]"
						>
							{title}
						</span>
					</h2>

					{description && (
						<p className="hidden md:inline-block text-xs text-muted-foreground/75 font-medium truncate max-w-md">
							{description}
						</p>
					)}
				</div>
			</div>

			{actions && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true }}
					className="shrink-0 flex items-center gap-2"
				>
					{actions}
				</motion.div>
			)}

			<div
				className="absolute bottom-0 left-0 w-32 h-[1.5px] bg-linear-to-r from-[var(--theme-primary)] via-transparent to-transparent opacity-80 pointer-events-none"
			/>
		</motion.div>
	);
}