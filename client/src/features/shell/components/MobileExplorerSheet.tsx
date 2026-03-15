'use client';

import { memo } from 'react';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderTree, SidebarProfile } from '@/features/sidebar';
import { INITIAL_FILE_SYSTEM } from '@/data/filesystem';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MobileExplorerSheetProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onNavigate: (moduleId: string) => void;
}

export const MobileExplorerSheet = memo(function MobileExplorerSheet({
	isOpen,
	onOpenChange,
	onNavigate,
}: MobileExplorerSheetProps) {
	return (
		<Sheet open={isOpen} onOpenChange={onOpenChange}>
			<SheetTrigger asChild>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/40 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
							aria-label="Open file explorer"
						>
							<Menu className="w-5 h-5" aria-hidden="true" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						<p>Open Explorer</p>
					</TooltipContent>
				</Tooltip>
			</SheetTrigger>

			<SheetContent
				side="left"
				className="w-[min(320px,85vw)] p-0 bg-background/95 backdrop-blur-xl border-r border-border/20 flex flex-col"
			>
				<SheetTitle className="sr-only">File Explorer</SheetTitle>

				<div className="shrink-0">
					<SidebarProfile />
				</div>

				<div className="flex-1 overflow-hidden">
					<ScrollArea className="h-full">
						<div className="p-4">
							<FolderTree
								items={INITIAL_FILE_SYSTEM}
								onSelect={item => {
									if (item.moduleId) {
										onNavigate(item.moduleId);
									}
									onOpenChange(false);
								}}
							/>
						</div>
					</ScrollArea>
				</div>

				<div className="p-4 border-t border-border/50 flex items-center justify-between bg-muted/30">
					<span className="text-xs text-muted-foreground font-medium">Theme</span>
					<ThemeToggle />
				</div>
			</SheetContent>
		</Sheet>
	);
});
