'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { useTerminalState } from './hooks/useTerminalState';
import { TerminalHistory } from './components/TerminalHistory';
import { TerminalPrompt } from './components/TerminalPrompt';
import { useCLI } from './hooks/useCLI';
import { SPRINGS } from '@/lib/constants';
import { Terminal } from 'lucide-react';
import { PanelHeader } from '@/components/layout/PanelHeader';
import { CollapsedPanel } from '@/components/layout/CollapsedPanel';
import { TerminalControls } from '@/components/common/WindowControls';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CLI() {
	const terminal = useCollapsiblePanel({ type: 'terminal' });
	const terminalState = useTerminalState();
	const { handleKeyDown } = useCLI(terminalState);

	return (
		<div className="h-full w-full">
			<AnimatePresence mode="wait">
				{terminal.isCollapsed ? (
					<CollapsedPanel
						key="collapsed-terminal"
						type="terminal"
						icon={Terminal}
						label="Terminal"
						orientation="horizontal"
						onExpand={terminal.expand}
					/>
				) : (
					<motion.div
						key="expanded-terminal"
						initial={{ opacity: 0, scale: 0.98, y: 4, filter: 'blur(4px)' }}
						animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
						exit={{ opacity: 0, scale: 0.96, y: 4, filter: 'blur(4px)' }}
						transition={SPRINGS.normal}
						className="h-full flex flex-col text-foreground font-mono text-sm overflow-hidden"
					>
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

							<TerminalPrompt
								terminalState={terminalState}
								onKeyDown={handleKeyDown}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
