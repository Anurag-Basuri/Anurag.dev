'use client';

import { memo } from 'react';
import { Terminal as TerminalIcon, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ControlPanelProps {
	sidebarCollapsed: boolean;
	terminalCollapsed: boolean;
	onToggleSidebar: () => void;
	onToggleTerminal: () => void;
	onContactClick: () => void;
}

export const ControlPanel = memo(function ControlPanel({
	sidebarCollapsed,
	terminalCollapsed,
	onToggleSidebar,
	onToggleTerminal,
	onContactClick,
}: ControlPanelProps) {
	return (
		<nav
			className="flex items-center gap-0.5 sm:gap-1 bg-muted/30 p-0.5 sm:p-1 rounded-lg border border-border/50 shadow-sm"
			role="navigation"
			aria-label="View controls"
		>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						onClick={onContactClick}
						className="h-6 px-2 sm:px-2.5 rounded-md bg-primary/10 hover:bg-primary/20 hover:shadow-md text-[9px] font-bold uppercase tracking-wider text-primary hover:text-primary transition-all duration-200 border border-primary/20 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-ring/60 active:scale-95 hover:scale-105"
						aria-label="Open contact form"
					>
						Contact
					</button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p>Get in touch</p>
				</TooltipContent>
			</Tooltip>

			<div className="w-px h-3.5 bg-border/50 mx-0.5 sm:mx-1" aria-hidden="true" />

			<Tooltip>
				<TooltipTrigger asChild>
					<button
						onClick={onToggleSidebar}
						className={cn(
							'h-6 w-7 flex items-center justify-center rounded-md transition-all duration-200 border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring/60 active:scale-95 hover:scale-105',
							sidebarCollapsed
								? 'text-muted-foreground hover:text-foreground hover:bg-muted'
								: 'text-primary bg-primary/10 shadow-sm hover:bg-primary/20',
						)}
						aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
						aria-pressed={!sidebarCollapsed}
					>
						{sidebarCollapsed ? (
							<Folder className="w-3.5 h-3.5" aria-hidden="true" />
						) : (
							<FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
						)}
					</button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p>
						{sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar
						<span className="ml-2 text-xs text-muted-foreground">Ctrl+B</span>
					</p>
				</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<button
						onClick={onToggleTerminal}
						className={cn(
							'h-6 w-7 flex items-center justify-center rounded-md transition-all duration-200 border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring/60 active:scale-95 hover:scale-105',
							terminalCollapsed
								? 'text-muted-foreground hover:text-foreground hover:bg-muted'
								: 'text-primary bg-primary/10 shadow-sm hover:bg-primary/20',
						)}
						aria-label={terminalCollapsed ? 'Expand terminal' : 'Collapse terminal'}
						aria-pressed={!terminalCollapsed}
					>
						{terminalCollapsed ? (
							<TerminalIcon className="w-3.5 h-3.5" aria-hidden="true" />
						) : (
							<ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
						)}
					</button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p>{terminalCollapsed ? 'Expand' : 'Collapse'} Terminal</p>
				</TooltipContent>
			</Tooltip>
		</nav>
	);
});
