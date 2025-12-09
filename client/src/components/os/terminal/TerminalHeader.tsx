import { Terminal, ChevronDown, Trash2 } from 'lucide-react';

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
		<header
			className="px-3 py-2 border-b border-white/5 bg-black/20 backdrop-blur-sm flex items-center justify-between shrink-0"
			role="banner"
			aria-label="Terminal header"
		>
			{/* Left: Traffic lights */}
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-1.5">
					<button
						onClick={onToggleCollapse}
						className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors shadow-[0_0_4px_rgba(239,68,68,0.5)]"
						aria-label="Close terminal"
						title="Collapse terminal"
					/>
					<button
						onClick={onClearHistory}
						className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors shadow-[0_0_4px_rgba(234,179,8,0.5)]"
						aria-label="Clear history"
						title="Clear history"
					/>
					<div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
				</div>

				{/* Divider */}
				<div className="h-4 w-px bg-white/10" aria-hidden="true" />

				{/* Title */}
				<div className="flex items-center gap-2">
					<Terminal className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
					<span className="text-xs font-medium text-white/80 tracking-wide">
						anuragos — {currentPath}
					</span>
				</div>
			</div>

			{/* Right: Controls */}
			<div className="flex items-center gap-1">
				{historyLength > 0 && (
					<span className="text-[10px] text-white/40 mr-2">
						{historyLength} cmd{historyLength !== 1 ? 's' : ''}
					</span>
				)}
				<button
					type="button"
					onClick={onToggleCollapse}
					className="p-1 hover:bg-white/10 rounded transition-colors"
					aria-label="Collapse terminal panel"
					title="Collapse"
				>
					<ChevronDown className="w-4 h-4 text-white/50 hover:text-white/80" />
				</button>
			</div>
		</header>
	);
}
