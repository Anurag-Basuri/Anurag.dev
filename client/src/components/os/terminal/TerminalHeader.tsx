'use client';

import { Terminal, ChevronDown, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { TerminalControls } from '@/components/shared/WindowControls';

interface TerminalHeaderProps {
	currentPath: string;
	historyLength: number;
	onClearHistory: () => void;
	onToggleCollapse: () => void;
	onMaximize?: () => void;
	onMinimize?: () => void;
	onClose?: () => void;
	isFocused?: boolean;
}

export function TerminalHeader({
	currentPath,
	historyLength,
	onClearHistory,
	onToggleCollapse,
	onMaximize,
	onMinimize,
	onClose,
	isFocused = false,
}: TerminalHeaderProps) {
	function cn(...classes: (string | false | null | undefined)[]): string {
		return classes.filter(Boolean).join(' ');
	}
	return (
		<header className="h-10 sm:h-8 px-2 sm:px-3 border-b border-white/5 bg-zinc-900 flex items-center justify-between shrink-0 select-none z-20 relative">
			{/* Left: Traffic Lights + Title + Path */}
			<div className="flex items-center gap-2.5">
				{/* macOS Traffic Lights */}
				<div className="flex items-center gap-1.5 group">
					<TerminalControls
						onClose={onClose}
						onMaximize={onMaximize}
						onClearHistory={onClearHistory}
					/>
				</div>

				{/* Separator */}
				<div className="h-3.5 w-px bg-white/10" aria-hidden="true" />

				{/* Terminal Title + Path (all together) */}
				<div className="flex items-center gap-1.5 text-xs font-mono transition-colors">
					<Terminal
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
							'font-medium',
							isFocused ? 'text-emerald-300' : 'text-muted-foreground',
						)}
					>
						Terminal
					</span>
					<span
						className={cn(
							isFocused ? 'text-emerald-500/70' : 'text-muted-foreground/40',
						)}
					>
						—
					</span>
					<span
						className={cn(
							'font-semibold',
							isFocused ? 'text-emerald-300' : 'text-primary',
						)}
					>
						anurag
					</span>
					<span
						className={cn(
							isFocused ? 'text-emerald-500/70' : 'text-muted-foreground/40',
						)}
					>
						:
					</span>
					<span
						className={cn(
							'font-medium',
							isFocused ? 'text-emerald-200' : 'text-accent',
						)}
					>
						{currentPath}
					</span>
				</div>
			</div>

			{/* Right: Actions */}
			<div className="flex items-center gap-2">
				{/* Clear History Button */}

				{historyLength > 0 && (
					<span className="text-[10px] font-mono text-muted-foreground/60 tabular-nums px-1.5 py-0.5 rounded bg-muted/40">
						{historyLength}
					</span>
				)}
				<motion.button
					whileHover={{ backgroundColor: 'rgba(var(--primary), 0.1)' }}
					whileTap={{ scale: 0.95 }}
					onClick={onToggleCollapse}
					className="p-1 rounded transition-colors"
					aria-label="Collapse"
					title="Collapse terminal"
				>
					<ChevronDown className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
				</motion.button>
			</div>
		</header>
	);
}
