'use client';

import { memo } from 'react';
import { SECTIONS } from '@/lib/sections';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/ui/tooltip';

interface ScrollIndicatorProps {
	activeSectionId: string;
	onSectionClick: (sectionId: string) => void;
}

/**
 * Vertical dot indicator on the right side of the scroll container.
 * Shows progress through sections and allows click-to-scroll.
 */
export const ScrollIndicator = memo(function ScrollIndicator({
	activeSectionId,
	onSectionClick,
}: ScrollIndicatorProps) {
	return (
		<TooltipProvider delayDuration={200}>
			<nav
				className="fixed right-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 items-center"
				aria-label="Section navigation"
			>
				{SECTIONS.map(section => {
					const isActive = section.id === activeSectionId;

					return (
						<Tooltip key={section.id}>
							<TooltipTrigger asChild>
								<button
									onClick={() => onSectionClick(section.id)}
									className={cn(
										'group relative rounded-full transition-all duration-300',
										isActive
											? 'w-3 h-3 bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]'
											: 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60 hover:scale-125',
									)}
									aria-label={`Scroll to ${section.label}`}
									aria-current={isActive ? 'true' : undefined}
								/>
							</TooltipTrigger>
							<TooltipContent side="left" className="text-xs">
								{section.label}
							</TooltipContent>
						</Tooltip>
					);
				})}
			</nav>
		</TooltipProvider>
	);
});
