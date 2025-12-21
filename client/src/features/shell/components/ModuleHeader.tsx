'use client';

import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModuleControls } from '@/components/common/WindowControls';

interface ModuleHeaderProps {
	icon: LucideIcon;
	title: string;
	onClose: () => void;
	onMinimize: () => void;
	onMaximize: () => void;
	isMaximized?: boolean;
	isFocused?: boolean;
}

export const ModuleHeader = memo(function ModuleHeader({
	icon: Icon,
	title,
	onClose,
	onMinimize,
	onMaximize,
	isMaximized = false,
	isFocused = true,
}: ModuleHeaderProps) {
	return (
		<header className="h-7 px-2 border-b border-white/5 bg-zinc-900/90 backdrop-blur-sm flex items-center justify-between shrink-0 select-none z-20 relative">
			{/* Left: Traffic Lights + Icon + Title */}
			<div className="flex items-center gap-2">
				<ModuleControls
					onClose={onClose}
					onMinimize={onMinimize}
					onMaximize={onMaximize}
					isMaximized={isMaximized}
				/>

				{/* Separator */}
				<div className="h-3.5 w-px bg-white/10" aria-hidden="true" />

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

			{/* Right: Module Identifier or status (optional) */}
			<div className="flex items-center gap-2">
				<div className="text-[10px] font-mono text-white/20 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
					MODULE
				</div>
			</div>
		</header>
	);
});
