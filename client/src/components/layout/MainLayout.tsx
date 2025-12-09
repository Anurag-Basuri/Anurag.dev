'use client';

import { useAtom } from 'jotai';
import {
	sidebarCollapsedAtom,
	terminalCollapsedAtom,
	mainVerticalSizesAtom,
	mainHorizontalSizesAtom,
} from '@/store/atoms';
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
	ImperativePanelHandle,
} from '@/components/ui/resizable';
import { CLI } from '@/components/os/terminal/CLI';
import { EditorArea } from '@/components/os/editor/EditorArea';
import { FolderTree } from '@/components/os/file-system/FolderTree';
import { SidebarProfile } from '@/components/os/shell/SidebarProfile';
import { initialFileSystem as fileSystem, FileSystemItem } from '@/lib/data';
import { Taskbar } from '@/components/os/shell/Taskbar';
import { TopBar } from '@/components/os/shell/TopBar';
import Background3D from '@/components/os/shell/Background3D';
import { WelcomeDialog } from '@/components/shared/WelcomeDialog';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useWindowManager } from '@/hooks/use-window-manager';
import { useRef, useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { CollapsedSidebar } from '@/components/os/shell/CollapsedSidebar';
import { cn } from '@/lib/utils';

export function MainLayout() {
	const isMobile = useMediaQuery('(max-width: 768px)');

	const sidebarRef = useRef<ImperativePanelHandle>(null);
	const terminalRef = useRef<React.ElementRef<typeof ResizablePanel> | null>(null);
	const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
	const [terminalCollapsed, setTerminalCollapsed] = useAtom(terminalCollapsedAtom);

	const [mainVerticalSizes, setMainVerticalSizes] = useAtom(mainVerticalSizesAtom);
	const [mainHorizontalSizes, setMainHorizontalSizes] = useAtom(mainHorizontalSizesAtom);

	const [isLayoutReady] = useState(true);

	const { openWindow } = useWindowManager();

	const handleFileSelect = (item: FileSystemItem) => {
		if (item.type === 'file') {
			const moduleId = item.id.split('/')[0];
			openWindow(moduleId);
		}
	};

	const handleToggleSidebar = useCallback(() => {
		const panel = sidebarRef.current;
		if (!panel) return;
		if (panel.isCollapsed()) {
			panel.expand();
		} else {
			panel.collapse();
		}
	}, []);

	const handleToggleTerminal = useCallback(() => {
		const panel = terminalRef.current;
		if (!panel) return;
		if (panel.isCollapsed()) {
			panel.expand();
		} else {
			panel.collapse();
		}
	}, []);

	const renderDesktopLayout = () => (
		<ResizablePanelGroup
			direction="horizontal"
			onLayout={setMainHorizontalSizes}
			className="h-full"
		>
			<ResizablePanel
				ref={sidebarRef}
				collapsible
				collapsedSize={4} // Collapse to 4rem (64px)
				minSize={15}
				maxSize={25}
				defaultSize={mainHorizontalSizes[0]}
				onCollapse={() => setSidebarCollapsed(true)}
				onExpand={() => setSidebarCollapsed(false)}
				className={cn(
					'transition-all duration-300 ease-in-out',
					sidebarCollapsed && 'min-w-[64px]!',
				)}
			>
				<div className="h-full rounded-xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,0.45)] overflow-hidden">
					{sidebarCollapsed ? (
						<CollapsedSidebar onExpand={handleToggleSidebar} />
					) : (
						<div className="h-full flex flex-col overflow-hidden">
							<SidebarProfile />

							<div className="px-3 py-2 border-y border-border/60 text-[10px] uppercase tracking-[0.22em] text-muted-foreground bg-muted/20">
								Explorer
							</div>

							<div className="flex-1 overflow-auto px-2 pb-3 custom-scrollbar">
								<FolderTree items={fileSystem} onSelect={handleFileSelect} />
							</div>
						</div>
					)}
				</div>
			</ResizablePanel>

			<ResizableHandle withHandle />

			<ResizablePanel defaultSize={mainHorizontalSizes[1]} minSize={30}>
				<ResizablePanelGroup direction="vertical" onLayout={setMainVerticalSizes}>
					<ResizablePanel
						defaultSize={mainVerticalSizes[0]}
						minSize={40}
						className="rounded-xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,0.45)] !overflow-hidden"
					>
						<EditorArea />
					</ResizablePanel>

					<ResizableHandle withHandle />

					<ResizablePanel
						ref={terminalRef}
						collapsible
						collapsedSize={3.5} // Collapse to 3.5rem (56px)
						minSize={10}
						maxSize={50}
						defaultSize={mainVerticalSizes[1]}
						onCollapse={() => setTerminalCollapsed(true)}
						onExpand={() => setTerminalCollapsed(false)}
						className={cn(
							'rounded-xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,0.45)] !overflow-hidden transition-all duration-300 ease-in-out',
							terminalCollapsed && 'min-h-[56px]!',
						)}
					>
						<CLI
							onToggleCollapse={handleToggleTerminal}
							isCollapsed={terminalCollapsed}
						/>
					</ResizablePanel>
				</ResizablePanelGroup>
			</ResizablePanel>
		</ResizablePanelGroup>
	);

	const renderMobileLayout = () => (
		<div className="h-full w-full rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl shadow-lg overflow-hidden">
			<EditorArea />
		</div>
	);

	return (
		<ErrorBoundary>
			<div className="h-full w-full bg-background text-foreground font-mono overflow-hidden flex flex-col relative">
				<Toaster
					position="bottom-right"
					toastOptions={{
						style: {
							background: 'var(--popover)',
							color: 'var(--popover-foreground)',
							border: '1px solid var(--border)',
							backdropFilter: 'blur(10px)',
						},
					}}
				/>
				<Background3D />

				<TopBar
					isMobile={isMobile}
					sidebarCollapsed={sidebarCollapsed}
					terminalCollapsed={terminalCollapsed}
					onToggleSidebar={handleToggleSidebar}
					onToggleTerminal={handleToggleTerminal}
					onFileSelect={handleFileSelect}
				/>

				<WelcomeDialog />

				<div className="flex-1 overflow-hidden p-3">
					{isLayoutReady && (isMobile ? renderMobileLayout() : renderDesktopLayout())}
				</div>

				<Taskbar />
			</div>
		</ErrorBoundary>
	);
}
