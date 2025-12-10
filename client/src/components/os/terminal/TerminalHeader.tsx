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
		<header className="h-6 px-2 border-b border-white/8 bg-[#161b22] flex items-center justify-between shrink-0 select-none">
			{/* Left: Traffic Lights + Title */}
			<div className="flex items-center gap-3">
				{/* macOS Traffic Lights */}
				<div className="flex items-center gap-1.5 group">
					<motion.button
						whileHover={{ scale: 1.15 }}
						whileTap={{ scale: 0.95 }}
						onClick={onToggleCollapse}
						className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff6961] transition-colors flex items-center justify-center group/btn"
						aria-label="Minimize terminal"
						title="Minimize"
					>
						<Minus className="w-2 h-2 text-[#990000] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.15 }}
						whileTap={{ scale: 0.95 }}
						onClick={onClearHistory}
						className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#ffc940] transition-colors flex items-center justify-center group/btn"
						aria-label="Clear history"
						title="Clear History"
					>
						<Trash2 className="w-1.5 h-1.5 text-[#985700] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
					</motion.button>
					<div
						className="w-3 h-3 rounded-full bg-[#28c840] cursor-default"
						title="Active"
					/>
				</div>

				{/* Separator */}
				<div className="h-4 w-px bg-white/6" aria-hidden="true" />

				{/* Terminal Title */}
				<div className="flex items-center gap-2">
					<Terminal className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
					<span className="text-[11px] font-medium text-white/70 tracking-wide">
						Terminal
					</span>
				</div>
			</div>

			<div className="h-4 w-px bg-white/6" aria-hidden="true" />

			{/* Center: Path Info */}
			<div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-1.5 text-[10px] font-mono">
				<span className="text-emerald-400 font-semibold">anurag</span>
				<span className="text-white/20">@</span>
				<span className="text-blue-400">{currentPath}</span>
			</div>

			{/* Right: Stats + Collapse */}
			<div className="flex items-center gap-2">
				{historyLength > 0 && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/4 border border-white/6"
					>
						<span className="text-[9px] font-mono text-white/30">{historyLength}</span>
						<span className="text-[8px] text-white/20 uppercase tracking-wider">
							cmds
						</span>
					</motion.div>
				)}

				<motion.button
					whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }}
					whileTap={{ scale: 0.95 }}
					onClick={onToggleCollapse}
					className="p-1 rounded-md transition-colors"
					aria-label="Collapse terminal"
					title="Collapse"
				>
					<ChevronDown className="w-3.5 h-3.5 text-white/30 hover:text-white/60" />
				</motion.button>
			</div>
		</header>
	);
}
