import { Terminal, ChevronDown } from 'lucide-react';

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
			className="h-7 px-2 border-b border-white/10 bg-[#0d1117] flex items-center justify-between shrink-0 text-[11px] font-mono text-white/60 select-none"
			role="banner"
			aria-label="Terminal header"
		>
			<div className="flex items-center gap-1.5">
				{/* Traffic light controls */}
				<div className="flex items-center gap-1">
					<button
						onClick={onToggleCollapse}
						className="w-2.5 h-2.5 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
						aria-label="Collapse terminal"
						title="Collapse"
					/>
					<button
						onClick={onClearHistory}
						className="w-2.5 h-2.5 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors"
						aria-label="Clear history"
						title="Clear"
					/>
					<div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
				</div>

				<div className="h-3 w-px bg-white/10" aria-hidden="true" />

				{/* Terminal info */}
				<div className="flex items-center gap-1">
					<Terminal className="w-3 h-3 text-emerald-400" aria-hidden="true" />
					<span className="text-emerald-400 font-semibold">root@anuragos</span>
					<span className="text-white/30">:</span>
					<span className="text-blue-400">{currentPath}</span>
				</div>
			</div>

			<div className="flex items-center gap-1.5">
				{historyLength > 0 && (
					<span className="px-1 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] text-white/40">
						{historyLength}
					</span>
				)}
				<button
					type="button"
					onClick={onToggleCollapse}
					className="p-0.5 hover:bg-white/10 rounded transition-colors"
					aria-label="Collapse terminal"
					title="Collapse"
				>
					<ChevronDown className="w-3 h-3 text-white/40 hover:text-white/70" />
				</button>
			</div>
		</header>
	);
}
