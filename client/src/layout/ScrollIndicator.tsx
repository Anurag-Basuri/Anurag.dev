'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { SECTIONS } from '@/lib/sections';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/ui/tooltip';

interface ScrollIndicatorProps {
	activeSectionId: string;
	onSectionClick: (sectionId: string) => void;
}

/**
 * Vertical dot indicator on the right side of the scroll container.
 * Shows a connecting line, progress through sections, and click-to-scroll.
 * Hidden on mobile to avoid cluttering small screens.
 */
export const ScrollIndicator = memo(function ScrollIndicator({
	activeSectionId,
	onSectionClick,
}: ScrollIndicatorProps) {
	const activeIdx = SECTIONS.findIndex(s => s.id === activeSectionId);

	return (
		<TooltipProvider delayDuration={200}>
			<nav
				className="absolute right-1.5 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center"
				aria-label="Section navigation"
			>
				{/* Connecting line */}
				<div className="absolute top-1 bottom-1 w-px bg-foreground/5 pointer-events-none" />

				{/* Progress fill */}
				<motion.div
					className="absolute top-1 w-px bg-primary/40 origin-top pointer-events-none"
					initial={{ height: 0 }}
					animate={{
						height: activeIdx >= 0
							? `${(activeIdx / (SECTIONS.length - 1)) * 100}%`
							: '0%',
					}}
					transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
				/>

				<div className="flex flex-col gap-3 items-center relative">
					{SECTIONS.map((section, idx) => {
						const isActive = section.id === activeSectionId;
						const isPast = idx <= activeIdx;

						return (
							<Tooltip key={section.id}>
								<TooltipTrigger asChild>
									<button
										onClick={() => onSectionClick(section.id)}
										className={cn(
											'relative rounded-full transition-all duration-300 cursor-pointer',
											isActive
												? 'w-2.5 h-2.5 bg-primary'
												: isPast
													? 'w-1.5 h-1.5 bg-primary/40 hover:bg-primary/70 hover:scale-150'
													: 'w-1.5 h-1.5 bg-foreground/15 hover:bg-foreground/40 hover:scale-150',
										)}
										aria-label={`Scroll to ${section.label}`}
										aria-current={isActive ? 'true' : undefined}
									>
										{isActive && (
											<motion.span
												className="absolute inset-0 rounded-full bg-primary/30"
												animate={{
													scale: [1, 2, 1],
													opacity: [0.6, 0, 0.6],
												}}
												transition={{
													duration: 2.5,
													repeat: Infinity,
													ease: 'easeInOut',
												}}
											/>
										)}
									</button>
								</TooltipTrigger>
								<TooltipContent
									side="left"
									className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-popover/90 backdrop-blur-xl border-border"
								>
									{section.label}
								</TooltipContent>
							</Tooltip>
						);
					})}
				</div>
			</nav>
		</TooltipProvider>
	);
});
