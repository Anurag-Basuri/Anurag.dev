'use client';

import { useAtom } from 'jotai';
import { useRef, useState, useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { Toaster } from 'react-hot-toast';

import {
	windowsAtom,
	activeWindowIdAtom,
	verticalSizesAtom,
	horizontalSizesAtom,
} from '@/store/atoms';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useWindowManager } from '@/hooks/use-window-manager';
import { FileSystemItem } from '@/types/file-system';

import Background3D from '../os/shell/Background3D';
import { EditorArea } from '../os/editor/EditorArea';
import { FolderTree } from '../os/file-system/FolderTree';
import { CLI } from '../os/terminal/CLI';
import { Taskbar } from '../os/shell/Taskbar';
import { TopBar } from '../os/shell/TopBar';
import { WelcomeDialog } from '../shared/WelcomeDialog';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { HelpButton } from '../shared/HelpButton';

export function MainLayout() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const isMobile = useMediaQuery('(max-width: 768px)');

	const sidebarRef = useRef<ImperativePanelHandle>(null);
	const terminalRef = useRef<ImperativePanelHandle>(null);

	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	// Default to collapsed for simplicity
	const [terminalCollapsed, setTerminalCollapsed] = useState(true);

	const [verticalSizes, setVerticalSizes] = useAtom(verticalSizesAtom);
	const [horizontalSizes, setHorizontalSizes] = useAtom(horizontalSizesAtom);

	// Hydration check to prevent layout flicker on initial render
	const [isLayoutReady] = useState(true);

	const { openWindow } = useWindowManager();

	const handleFileSelect = (item: FileSystemItem) => {
		let moduleId = item.id;
		if (moduleId.includes('/')) {
			moduleId = moduleId.split('/')[0];
		}
		openWindow(moduleId, item.name);
	};

	return (
		<ErrorBoundary>
			<>
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

				<div className="h-full w-full bg-background text-foreground font-mono overflow-hidden flex flex-col relative">
					<Background3D />

					{/* Background Gradients */}
					<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,var(--primary)_0%,transparent_60%)] opacity-[0.12] dark:opacity-[0.08]" />
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_100%_100%,var(--accent-foreground)_0%,transparent_50%)] opacity-[0.06] dark:opacity-[0.08]" />
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_60%_at_0%_50%,var(--primary)_0%,transparent_40%)] opacity-[0.05] dark:opacity-[0.04]" />
						<div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[linear-gradient(color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_1px)] bg-size-[56px_56px]" />
					</div>

					{/* Top Layout Bar */}
					<TopBar
						isMobile={isMobile}
						sidebarCollapsed={sidebarCollapsed}
						terminalCollapsed={terminalCollapsed}
						onToggleSidebar={() => {
							const panel = sidebarRef.current;
							if (panel) {
								if (sidebarCollapsed) panel.expand();
								else panel.collapse();
							}
						}}
						onToggleTerminal={() => {
							const panel = terminalRef.current;
							if (panel) {
								if (terminalCollapsed) panel.expand();
								else panel.collapse();
							}
						}}
						onFileSelect={handleFileSelect}
					/>

					<WelcomeDialog />

					{/* Main Workbench Area */}
					<div className="flex-1 z-10 relative overflow-hidden flex resize-smooth perspective-[2000px]">
						{!isMobile && !isLayoutReady ? (
							/* Loading Skeleton */
							<div className="h-full w-full flex items-center justify-center text-muted-foreground animate-pulse">
								LOADING SYSTEM...
							</div>
						) : !isMobile && isLayoutReady ? (
							<ResizablePanelGroup
								direction="horizontal"
								className="h-full w-full transform-style-3d"
								onLayout={setHorizontalSizes}
							>
								<ResizablePanel
									ref={sidebarRef}
									collapsible
									collapsedSize={0}
									minSize={15}
									defaultSize={horizontalSizes[0]}
									onCollapse={() => setSidebarCollapsed(true)}
									onExpand={() => setSidebarCollapsed(false)}
									className="transition-all duration-300 ease-in-out"
								>
									<FolderTree items={[]} onSelect={handleFileSelect} />
								</ResizablePanel>

								<ResizableHandle
									withHandle
									className="bg-border/60 hover:bg-border transition-colors"
								/>

								<ResizablePanel defaultSize={horizontalSizes[1]}>
									<ResizablePanelGroup
										direction="vertical"
										onLayout={setVerticalSizes}
									>
										<ResizablePanel defaultSize={verticalSizes[0]}>
											<EditorArea />
										</ResizablePanel>

										<ResizableHandle
											withHandle
											className="bg-border/60 hover:bg-border transition-colors"
										/>

										<ResizablePanel
											ref={terminalRef}
											collapsible
											collapsedSize={0}
											minSize={10}
											defaultSize={verticalSizes[1]}
											onCollapse={() => setTerminalCollapsed(true)}
											onExpand={() => setTerminalCollapsed(false)}
											className="transition-all duration-300 ease-in-out"
										>
											<CLI />
										</ResizablePanel>
									</ResizablePanelGroup>
								</ResizablePanel>
							</ResizablePanelGroup>
						) : (
							/* Mobile view: EditorArea takes full space */
							<div className="h-full w-full">
								<EditorArea />
							</div>
						)}
					</div>
					<Taskbar />
				</div>

				<HelpButton />
			</>
		</ErrorBoundary>
	);
}
