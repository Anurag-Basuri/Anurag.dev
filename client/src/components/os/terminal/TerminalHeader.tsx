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
			className="px-3 py-1.5 border-b border-border/40 bg-muted/20 backdrop-blur-sm flex items-center justify-between shrink-0 text-xs font-mono text-muted-foreground select-none"
			role="banner"
			aria-label="Terminal header"
		>
			<div className="flex items-center gap-2">
				<div className="flex items-center gap-1">
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

				<div className="h-4 w-px bg-border/40" aria-hidden="true" />
				<div className="flex items-center gap-2">
					<Terminal className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
					<div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-background/50 border border-border/30 leading-none">
						<span className="text-primary font-bold">root@anuragos</span>
						<span className="text-muted-foreground/60">:</span>
						<span className="text-blue-400">{currentPath}</span>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-1.5">
				{historyLength > 0 && (
					<span className="px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5 text-[10px] text-white/60">
						{historyLength} cmd{historyLength !== 1 ? 's' : ''}
					</span>
				)}
				<button
					type="button"
					onClick={onToggleCollapse}
					className="p-1 hover:bg-muted/30 rounded transition-colors border border-transparent hover:border-border/30"
					aria-label="Collapse terminal panel"
					title="Collapse"
				>
					<ChevronDown className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
				</button>
			</div>
		</header>
	);
}
