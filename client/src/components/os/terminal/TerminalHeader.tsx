import { Terminal, X, ChevronDown } from 'lucide-react';
import { useCallback } from 'react';

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
	const handleKeyDown = useCallback((e: React.KeyboardEvent, action: () => void) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			action();
		}
	}, []);

	return (
		<header 
			className="px-4 py-2.5 border-b border-border/60 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 backdrop-blur-sm flex items-center justify-between shrink-0 shadow-sm"
			role="banner"
			aria-label="Terminal header"
		>
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2 text-xs">
					<Terminal 
						className="w-4 h-4 text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" 
						aria-hidden="true"
					/>
					<span className="font-bold tracking-wide text-foreground">TERMINAL</span>
				</div>
				<div className="h-4 w-px bg-border/50" aria-hidden="true" />
				<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
					<span className="opacity-70">Path:</span>
					<code 
						className="px-1.5 py-0.5 bg-muted/40 rounded text-primary font-medium"
						aria-label={`Current path: ${currentPath}`}
					>
						{currentPath}
					</code>
				</div>
			</div>

			<nav className="flex items-center gap-1" role="toolbar" aria-label="Terminal controls">
				{historyLength > 0 && (
					<button
						type="button"
						onClick={onClearHistory}
						onKeyDown={(e) => handleKeyDown(e, onClearHistory)}
						className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-destructive/50"
						aria-label={`Clear terminal history (${historyLength} items)`}
						title={`Clear terminal history (${historyLength} items)`}
					>
						<X className="w-3.5 h-3.5" />
					</button>
				)}
				<button
					type="button"
					onClick={onToggleCollapse}
					onKeyDown={(e) => handleKeyDown(e, onToggleCollapse)}
					className="p-1.5 hover:bg-muted/60 rounded-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/50"
					aria-label="Collapse terminal panel"
					title="Collapse terminal panel"
				>
					<ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
				</button>
			</nav>
		</header>
	);
}

