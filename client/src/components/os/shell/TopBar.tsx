'use client';

import { motion } from 'framer-motion';
import {
	Menu,
	PanelLeftOpen,
	PanelLeftClose,
	Terminal as TerminalIcon,
	ChevronDown,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderTree } from '@/components/os/file-system/FolderTree';
import { initialFileSystem, FileSystemItem } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TopBarProps {
	isMobile: boolean;
	sidebarCollapsed: boolean;
	terminalCollapsed: boolean;
	onToggleSidebar: () => void;
	onToggleTerminal: () => void;
	onFileSelect: (item: FileSystemItem) => void;
}

export function TopBar({
	isMobile,
	sidebarCollapsed,
	terminalCollapsed,
	onToggleSidebar,
	onToggleTerminal,
	onFileSelect,
}: TopBarProps) {
	const [isExplorerOpen, setIsExplorerOpen] = useState(false);

	const handleContactClick = () => {
		const contactItem = {
			id: 'contact',
			name: 'contact',
			type: 'file',
		} as FileSystemItem;
		onFileSelect(contactItem);
	};

	return (
		<motion.div
			initial={{ y: -28, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
			className="h-10 bg-background/40 backdrop-blur-xl border-b border-border/60 flex items-center justify-between z-40 shadow-[0_2px_10px_rgba(0,0,0,0.08)] px-2 sm:px-3 text-xs select-none"
		>
			<div className="flex items-center gap-3">
				{isMobile && (
					<Sheet open={isExplorerOpen} onOpenChange={setIsExplorerOpen}>
						<SheetTrigger asChild>
							<button
								className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted/40 transition-colors"
								aria-label="Toggle explorer"
							>
								<Menu className="w-4 h-4" />
							</button>
						</SheetTrigger>
						<SheetContent
							side="left"
							className="w-[260px] p-0 bg-background/95 backdrop-blur-md border-r border-border"
						>
							<div className="p-2 text-xs font-semibold border-b border-border bg-muted/40 uppercase tracking-[0.28em] text-muted-foreground">
								Explorer
							</div>
							<div className="flex-1 overflow-hidden">
								<ScrollArea className="h-[calc(100vh-12rem)]">
									<div className="p-2">
										<FolderTree
											items={initialFileSystem}
											onSelect={item => {
												onFileSelect(item);
												setIsExplorerOpen(false);
											}}
										/>
									</div>
								</ScrollArea>
							</div>
						</SheetContent>
					</Sheet>
				)}
				<span className="font-bold tracking-[0.35em] text-sm flex items-center gap-2">
					ANURAGOS
				</span>
			</div>

			{!isMobile && (
				<div className="flex-1 flex justify-center items-center gap-6">
					<span className="text-muted-foreground tracking-[0.35em]">SYSTEM READY</span>
					<button
						onClick={handleContactClick}
						className="text-muted-foreground hover:text-primary transition-colors tracking-[0.2em] hover:tracking-[0.25em] duration-300 text-[10px] uppercase border border-transparent hover:border-primary/20 px-2 py-0.5 rounded-sm"
					>
						Contact
					</button>
				</div>
			)}

			<div className="flex items-center gap-2">
				{/* Status */}
				<div className="flex gap-2 items-center pr-2 border-r border-border">
					<span
						aria-hidden
						className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.5)]"
					/>
					<span className="text-[10px] text-muted-foreground uppercase tracking-[0.4em]">
						ONLINE
					</span>
				</div>

				{/* Theme Toggle */}
				<div className={cn('pr-2', !isMobile && 'border-r border-border')}>
					<ThemeToggle />
				</div>

				{/* Desktop Layout Controls */}
				{!isMobile && (
					<>
						{/* Sidebar controls */}
						<div className="flex items-center gap-1 pl-2 pr-1 rounded bg-muted/40 border border-border backdrop-blur-sm">
							<button
								className={cn(
									'p-1 hover:bg-muted/60 rounded transition-all duration-200',
									sidebarCollapsed && 'text-muted-foreground',
								)}
								title={sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
								aria-label={sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
								onClick={onToggleSidebar}
							>
								{sidebarCollapsed ? (
									<PanelLeftOpen className="w-4 h-4" />
								) : (
									<PanelLeftClose className="w-4 h-4" />
								)}
							</button>
						</div>

						{/* Terminal controls */}
						<div className="flex items-center gap-1 pl-2 pr-1 rounded bg-muted/40 border border-border backdrop-blur-sm">
							<button
								className={cn(
									'p-1 hover:bg-muted/60 rounded transition-all duration-200',
									terminalCollapsed && 'text-muted-foreground',
								)}
								title={terminalCollapsed ? 'Show Terminal' : 'Hide Terminal'}
								aria-label={terminalCollapsed ? 'Show Terminal' : 'Hide Terminal'}
								onClick={onToggleTerminal}
							>
								{terminalCollapsed ? (
									<TerminalIcon className="w-4 h-4" />
								) : (
									<ChevronDown className="w-4 h-4" />
								)}
							</button>
						</div>
					</>
				)}
			</div>
		</motion.div>
	);
}
