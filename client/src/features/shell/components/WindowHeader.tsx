'use client';

import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModuleControls } from '@/components/common/WindowControls';

interface WindowHeaderProps {
	icon: LucideIcon;
	title: string;
	onClose: () => void;
	onMinimize: () => void;
	onMaximize: () => void;
	isMaximized?: boolean;
	isFocused?: boolean;
}

// Window Header Component
export const WindowHeader = memo(function WindowHeader({
	icon: Icon,
	title,
	onClose,
	onMinimize,
	onMaximize,
	isMaximized = false,
	isFocused = true,
}: WindowHeaderProps) {
	return (
		<header className="h-9 px-3 border-b border-border/30 bg-muted/30 flex items-center justify-between shrink-0 select-none z-20 relative">
			{/* Left: Traffic Lights + Icon + Title */}
			<div className="flex items-center gap-2">
				<ModuleControls
					onClose={onClose}
					onMinimize={onMinimize}
					onMaximize={onMaximize}
					isMaximized={isMaximized}
				/>

				{/* Separator */}
				<div className="h-3.5 w-px bg-border/50" aria-hidden="true" />

				{/* Module Icon + Title */}
				<div className="flex items-center gap-1.5 text-xs font-mono transition-colors">
					<Icon
						className={cn(
							'w-3.5 h-3.5',
							isFocused
								? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]'
								: 'text-primary',
						)}
						aria-hidden="true"
					/>
					<span
						className={cn(
							'font-semibold tracking-tight',
							isFocused ? 'text-emerald-300' : 'text-muted-foreground',
						)}
					>
						{title}
					</span>
				</div>
			</div>
		</header>
	);
});
