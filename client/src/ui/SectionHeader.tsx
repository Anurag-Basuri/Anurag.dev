'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { fadeInUp } from '@/animations/motion';
import { cn } from '@/lib/utils';
import { getSectionTheme, type SectionAccent } from '@/lib/theme';

interface SectionHeaderProps {
	icon?: LucideIcon;
	index?: string;
	tag?: string;
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
	index,
	tag,
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
		? getSectionTheme(accent)
		: getSectionTheme('profile');

	return (
		<motion.div
			variants={fadeInUp}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: '-10px' }}
			className={cn(
				'sticky top-0 z-40 bg-background/80 backdrop-blur-xl py-2.5 mb-4 border-b border-border/40 flex items-center justify-between gap-3 shadow-xs select-none',
				className
			)}
		>
			<div className="flex items-center gap-3 min-w-0">
				{/* Monospace Architectural Index */}
				{index && (
					<div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs tracking-[0.2em] font-medium text-primary shrink-0">
						<span>// {index}</span>
					</div>
				)}

				{/* Subtle Icon Box */}
				{Icon && (
					<div
						className={cn(
							'p-1.5 rounded-lg border border-border/50 bg-foreground/[0.03] text-foreground/80 flex items-center justify-center shrink-0 transition-all duration-300',
							theme.icon
						)}
					>
						<Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
					</div>
				)}

				<div className="flex items-baseline gap-2.5 min-w-0">
					<h2 className="text-sm sm:text-base md:text-lg font-medium tracking-tight text-foreground/90 whitespace-nowrap font-sans">
						{title}
					</h2>

					{tag && (
						<span className="hidden sm:inline-block font-mono text-[10px] tracking-[0.15em] text-muted-foreground/60 uppercase">
							· [{tag}]
						</span>
					)}

					{description && (
						<p className="hidden md:inline-block text-xs text-muted-foreground/70 font-normal truncate max-w-md">
							— {description}
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

			{/* Soft Hairline Gradient Accent Line */}
			<div
				className="absolute bottom-0 left-0 w-24 h-[1px] bg-linear-to-r from-primary/60 via-primary/20 to-transparent pointer-events-none"
			/>
		</motion.div>
	);
}