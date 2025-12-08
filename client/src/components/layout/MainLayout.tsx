'use client';

import { Button } from '@/components/ui/button';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { Toaster } from 'react-hot-toast';
import {
	mainHorizontalSizesAtom,
	mainVerticalSizesAtom,
	sidebarCollapsedAtom,
	terminalCollapsedAtom,
} from '@/store/atoms';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useWindowManager } from '@/hooks/use-window-manager';
import { FileSystemItem, initialFileSystem as fileSystem } from '@/lib/data';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import Background3D from '@/components/os/shell/Background3D';
import { TopBar } from '@/components/os/shell/TopBar';
import { WelcomeDialog } from '@/components/shared/WelcomeDialog';
import { EditorArea } from '@/components/os/editor/EditorArea';
import { CLI } from '@/components/os/terminal/CLI';
import { Taskbar } from '@/components/os/shell/Taskbar';
import { HelpButton } from '@/components/shared/HelpButton';
import { FolderTree } from '../os/file-system/FolderTree';
import { SidebarProfile } from '../os/shell/SidebarProfile';

export function MainLayout() {
	const isMobile = useMediaQuery('(max-width: 768px)');

	const sidebarRef = useRef<ImperativePanelHandle>(null);
	const terminalRef = useRef<ImperativePanelHandle>(null);

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

	const handleToggleSidebar = () => {
		const panel = sidebarRef.current;
		if (!panel) return;
		if (panel.isCollapsed()) {
			panel.expand();
		} else {
			panel.collapse();
		}
	};

	const handleToggleTerminal = () => {
		const panel = terminalRef.current;
		if (!panel) return;
		if (panel.isCollapsed()) {
			panel.expand();
		} else {
			panel.collapse();
		}
	};

	const renderDesktopLayout = () => (
		<ResizablePanelGroup
			direction="horizontal"
			onLayout={setMainHorizontalSizes}
			className="gap-3"
		>
			<ResizablePanel
				ref={sidebarRef}
				collapsible
				collapsedSize={0}
				minSize={16}
				maxSize={32}
				defaultSize={mainHorizontalSizes[0]}
				onCollapse={() => setSidebarCollapsed(true)}
				onExpand={() => setSidebarCollapsed(false)}
				className="rounded-xl border border-border/60 bg-background/55 backdrop-blur-md shadow-[0_10px_40px_-20px_rgba(0,0,0,0.45)] !overflow-hidden"
			>
				<div className="h-full flex flex-col overflow-hidden">
					<SidebarProfile />

					<div className="px-3 py-2 border-y border-border/60 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
						Explorer
					</div>

					<div className="flex-1 overflow-auto px-2 pb-3 custom-scrollbar">
						<FolderTree items={fileSystem} onSelect={handleFileSelect} />
					</div>
				</div>
			</ResizablePanel>

			<ResizableHandle
				withHandle
				className="bg-border/50 hover:bg-border transition-colors rounded"
			/>

			<ResizablePanel defaultSize={mainHorizontalSizes[1]} minSize={30}>
				<ResizablePanelGroup
					direction="vertical"
					onLayout={setMainVerticalSizes}
					className="gap-3"
				>
					<ResizablePanel
						defaultSize={mainVerticalSizes[0]}
						minSize={40}
						className="rounded-xl border border-border/60 bg-background/55 backdrop-blur-md shadow-[0_10px_40px_-20px_rgba(0,0,0,0.45)] !overflow-hidden"
					>
						<EditorArea />
					</ResizablePanel>

					<ResizableHandle
						withHandle
						className="bg-border/50 hover:bg-border transition-colors rounded"
					/>

					<ResizablePanel
						ref={terminalRef}
						collapsible
						collapsedSize={6}
						minSize={8}
						maxSize={45}
						defaultSize={mainVerticalSizes[1]}
						onCollapse={() => setTerminalCollapsed(true)}
						onExpand={() => setTerminalCollapsed(false)}
						className="rounded-xl border border-border/60 bg-background/55 backdrop-blur-md shadow-[0_10px_40px_-20px_rgba(0,0,0,0.45)] !overflow-hidden"
					>
						<CLI onToggleCollapse={handleToggleTerminal} />
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

				{/* Ambient overlays */}
				<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,var(--primary)_0%,transparent_60%)] opacity-[0.12] dark:opacity-[0.08]" />
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_100%_100%,var(--accent-foreground)_0%,transparent_50%)] opacity-[0.06] dark:opacity-[0.08]" />
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_60%_at_0%_50%,var(--primary)_0%,transparent_40%)] opacity-[0.05] dark:opacity-[0.04]" />
					<div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[linear-gradient(color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_1px)] bg-size-[56px_56px]" />
				</div>

				<TopBar
					isMobile={isMobile}
					sidebarCollapsed={sidebarCollapsed}
					terminalCollapsed={terminalCollapsed}
					onToggleSidebar={handleToggleSidebar}
					onToggleTerminal={handleToggleTerminal}
					onFileSelect={handleFileSelect}
				/>

				<WelcomeDialog />

				<main className="flex-1 z-10 relative overflow-hidden p-3 pt-0">
					{!isLayoutReady ? (
						<div className="h-full w-full flex items-center justify-center text-muted-foreground animate-pulse">
							LOADING SYSTEM...
						</div>
					) : isMobile ? (
						renderMobileLayout()
					) : (
						renderDesktopLayout()
					)}
				</main>

				<Taskbar />
			</div>
		</ErrorBoundary>
	);
}
