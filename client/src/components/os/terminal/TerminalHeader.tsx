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
			className="px-2 py-1 border-b border-white/10 bg-[#0d1117] flex items-center justify-between shrink-0 text-xs font-mono text-white/60 select-none"
			role="banner"
			aria-label="Terminal header"
		>
			<div className="flex items-center gap-2">
				{/* Traffic light controls */}
				<div className="flex items-center gap-1.5">
					<button
						onClick={onToggleCollapse}
						className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors shadow-[0_0_4px_rgba(239,68,68,0.5)] hover:shadow-[0_0_8px_rgba(239,68,68,0.7)]"
						aria-label="Collapse terminal"
						title="Collapse"
					/>
					<button
						onClick={onClearHistory}
						className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors shadow-[0_0_4px_rgba(234,179,8,0.5)] hover:shadow-[0_0_8px_rgba(234,179,8,0.7)]"
						aria-label="Clear history"
						title="Clear"
					/>
					<div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
				</div>

				<div className="h-4 w-px bg-white/10" aria-hidden="true" />

				{/* Terminal info */}
				<div className="flex items-center gap-2">
					<Terminal className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
					<div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
						<span className="text-emerald-400 font-bold">root@anuragos</span>
						<span className="text-white/30">:</span>
						<span className="text-blue-400">{currentPath}</span>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2">
				{historyLength > 0 && (
					<span className="px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5 text-[10px] text-white/50">
						{historyLength} cmd{historyLength !== 1 ? 's' : ''}
					</span>
				)}
				<button
					type="button"
					onClick={onToggleCollapse}
					className="p-1 hover:bg-white/10 rounded-md transition-colors border border-transparent hover:border-white/10"
					aria-label="Collapse terminal"
					title="Collapse"
				>
					<ChevronDown className="w-3.5 h-3.5 text-white/50 hover:text-white/80" />
				</button>
			</div>
		</header>
	);
}
