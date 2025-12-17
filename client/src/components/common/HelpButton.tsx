'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface HelpButtonProps {
	content: React.ReactNode;
}

export function HelpButton({ content }: HelpButtonProps) {
	return (
		<TooltipProvider>
			<Tooltip delayDuration={300}>
				<TooltipTrigger asChild>
					<button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-white/5">
						<HelpCircle className="w-4 h-4" />
						<span className="sr-only">Help</span>
					</button>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="max-w-xs text-xs">
					{content}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
