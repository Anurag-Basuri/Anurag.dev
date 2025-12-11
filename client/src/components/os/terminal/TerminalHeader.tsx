'use client';

import { Terminal, ChevronDown, Trash2, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface TerminalHeaderProps {
	currentPath: string;
	historyLength: number;
	onClearHistory: () => void;
	onToggleCollapse: () => void;
}

export function TerminalHeader({
	currentPath,
	historyLength,
	onClearHistory,
	onToggleCollapse,
}: TerminalHeaderProps) {
	return (
		<header className="h-7 px-2 border-b border-white/8 bg-[#161b22] flex items-center justify-between shrink-0 select-none">
			{/* Left: Traffic Lights + Title + Path */}
			<div className="flex items-center gap-2">
				{/* macOS Traffic Lights */}
				<div className="flex items-center gap-1.5 group">
					<motion.button
						whileHover={{ scale: 1.15 }}
						whileTap={{ scale: 0.95 }}
						onClick={onToggleCollapse}
						className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] hover:bg-[#ff6961] transition-colors flex items-center justify-center group/btn"
						aria-label="Minimize terminal"
						title="Minimize"
					>
						<Minus className="w-1.5 h-1.5 text-[#990000] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.15 }}
						whileTap={{ scale: 0.95 }}
						onClick={onClearHistory}
						className="w-2.5 h-2.5 rounded-full bg-[#febc2e] hover:bg-[#ffc940] transition-colors flex items-center justify-center group/btn"
						aria-label="Clear history"
						title="Clear"
					>
						<Trash2 className="w-1.5 h-1.5 text-[#985700] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
					</motion.button>
					<div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
				</div>

				{/* Separator */}
				<div className="h-3 w-px bg-white/8" aria-hidden="true" />

				{/* Terminal Title + Path (all together) */}
				<div className="flex items-center gap-1.5 text-[10px] font-mono">
					<Terminal className="w-3 h-3 text-emerald-500" aria-hidden="true" />
					<span className="text-white/50">Terminal</span>
					<span className="text-white/20">—</span>
					<span className="text-emerald-400">anurag</span>
					<span className="text-white/20">:</span>
					<span className="text-blue-400">{currentPath}</span>
				</div>
			</div>

			{/* Right: Stats + Collapse */}
			<div className="flex items-center gap-1.5">
				{historyLength > 0 && (
					<span className="text-[9px] font-mono text-white/25 tabular-nums">
						{historyLength}
					</span>
				)}
				<motion.button
					whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
					whileTap={{ scale: 0.95 }}
					onClick={onToggleCollapse}
					className="p-0.5 rounded transition-colors"
					aria-label="Collapse"
				>
					<ChevronDown className="w-3 h-3 text-white/25 hover:text-white/50" />
				</motion.button>
			</div>
		</header>
	);
}
