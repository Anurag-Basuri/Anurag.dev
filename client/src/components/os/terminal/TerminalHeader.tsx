'use client';

import { Terminal, ChevronDown, Trash2, Minus, X, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
					<motion.button
						whileHover={{ scale: 1.15 }}
						whileTap={{ scale: 0.95 }}
						onClick={onClose}
						className="relative w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff6961] transition-colors flex items-center justify-center group/btn shadow-sm"
						aria-label="Close terminal"
						title="Close"
					>
						<div className="absolute -inset-2" />
						<X className="w-2 h-2 text-[#990000] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.15 }}
						whileTap={{ scale: 0.95 }}
						onClick={onClearHistory}
						className="relative w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#ffc940] transition-colors flex items-center justify-center group/btn shadow-sm"
						aria-label="Clear terminal history"
						title="Clear History"
					>
						<div className="absolute -inset-2" />
						<Trash2 className="w-2 h-2 text-[#985700] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.15 }}
						whileTap={{ scale: 0.95 }}
						onClick={onMaximize}
						className="relative w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#35d14b] transition-colors flex items-center justify-center group/btn shadow-sm"
						aria-label="Maximize terminal"
						title="Maximize"
					>
						<div className="absolute -inset-2" />
						<Maximize2 className="w-2 h-2 text-[#006500] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
					</motion.button>
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
