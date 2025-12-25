'use client';

import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { useTerminalState } from './hooks/useTerminalState';
import { TerminalHistory } from './components/TerminalHistory';
import { TerminalPrompt } from './components/TerminalPrompt';
import { useCLI } from './hooks/useCLI';
import { Terminal, ChevronUp } from 'lucide-react';
import { PanelHeader } from '@/components/layout/PanelHeader';
import { TerminalControls } from '@/components/common/WindowControls';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function CLI() {
	const terminal = useCollapsiblePanel({ type: 'terminal' });
	const terminalState = useTerminalState();
	const { handleKeyDown } = useCLI(terminalState);

	// Collapsed state - minimal inline indicator
	if (terminal.isCollapsed) {
		return (
			<button
				onClick={terminal.expand}
				className={cn(
					'h-full w-full',
					'flex items-center justify-center gap-3 px-4',
					'bg-card/40 backdrop-blur-md',
					'border-0 outline-none cursor-pointer',
					'transition-colors duration-200',
					'hover:bg-card/60',
					'group',
				)}
			>
				<Terminal className="w-4 h-4 text-white/40 group-hover:text-emerald-400 transition-colors" />
				<span className="text-xs font-medium text-white/30 group-hover:text-white/60 transition-colors">
					Terminal
				</span>
				<ChevronUp className="w-3 h-3 text-white/20 group-hover:text-emerald-400 transition-colors" />
			</button>
		);
	}

	// Expanded state
	return (
		<div className="h-full flex flex-col text-foreground font-mono text-sm overflow-hidden">
			<PanelHeader
				type="terminal"
				icon={Terminal}
				title="TERMINAL"
				subtitle={terminalState.currentPath}
				isFocused={terminalState.isFocused}
				controls={
					<TerminalControls
						onClose={terminal.collapse}
						onMaximize={terminal.maximize}
						onClearHistory={terminalState.clearHistory}
					/>
				}
			/>

			<div className="flex-1 min-h-0 flex flex-col relative">
				<ScrollArea className="flex-1">
					<div className="p-3">
						<TerminalHistory history={terminalState.history} />
					</div>
				</ScrollArea>

				<TerminalPrompt terminalState={terminalState} onKeyDown={handleKeyDown} />
			</div>
		</div>
	);
}
