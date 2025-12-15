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
}

export function TerminalHeader({
	currentPath,
	historyLength,
	onClearHistory,
	onToggleCollapse,
	onMaximize,
	onMinimize,
	onClose,
}: TerminalHeaderProps) {
	return (
		<header className="h-8 px-1 border-b border-border/60 bg-card/60 backdrop-blur-xl flex items-center justify-between shrink-0 select-none">
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
				<div className="h-4 w-px bg-border/40" aria-hidden="true" />

				{/* Terminal Title + Path (all together) */}
				<div className="flex items-center gap-1.5 text-xs font-mono">
					<Terminal className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
					<span className="text-muted-foreground font-medium">Terminal</span>
					<span className="text-muted-foreground/40">—</span>
					<span className="text-primary font-semibold">anurag</span>
					<span className="text-muted-foreground/40">:</span>
					<span className="text-accent font-medium">{currentPath}</span>
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
