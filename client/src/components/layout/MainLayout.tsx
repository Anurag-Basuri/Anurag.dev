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
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MainLayout() {
	const isMobile = useMediaQuery('(max-width: 768px)');

	const sidebarRef = useRef<React.ElementRef<typeof ResizablePanel> | null>(null);
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
			className="gap-3"
		>
			<ResizablePanel
				ref={sidebarRef}
				collapsible
				collapsedSize={0}
				minSize={14}
				maxSize={30}
				defaultSize={mainHorizontalSizes[0]}
				onCollapse={() => setSidebarCollapsed(true)}
				onExpand={() => setSidebarCollapsed(false)}
				className="relative"
			>
				<AnimatePresence mode="wait">
					{sidebarCollapsed ? (
						// Collapsed sidebar - floating icon button
						<motion.div
							key="collapsed"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.2 }}
							className="h-full flex items-center justify-center"
						>
							<button
								onClick={handleToggleSidebar}
								className="group p-3 rounded-xl border border-border/60 bg-background/80 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,0.45)] hover:bg-background/95 hover:border-primary/40 hover:shadow-[0_10px_40px_-10px_var(--primary)] transition-all duration-300"
								aria-label="Expand sidebar"
							>
								<ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
							</button>
						</motion.div>
					) : (
						// Expanded sidebar - full view
						<motion.div
							key="expanded"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="h-full rounded-xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,0.45)] overflow-hidden"
						>
							<div className="h-full flex flex-col overflow-hidden relative">
								{/* Collapse button overlay */}
								<button
									onClick={handleToggleSidebar}
									className="absolute top-3 right-3 z-10 p-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border/50 hover:border-primary/40 hover:bg-background/95 transition-all duration-200 opacity-0 hover:opacity-100 focus:opacity-100 group"
									aria-label="Collapse sidebar"
								>
									<PanelLeftOpen className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
								</button>

								<SidebarProfile />

								<div className="px-3 py-2.5 border-y border-border/60 bg-muted/20 backdrop-blur-sm text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold flex items-center justify-between">
									<span>Explorer</span>
									<span className="text-[9px] opacity-60 normal-case tracking-normal font-normal">
										{fileSystem.length} folders
									</span>
								</div>

								<div className="flex-1 overflow-auto px-2 py-3 custom-scrollbar">
									<FolderTree items={fileSystem} onSelect={handleFileSelect} />
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</ResizablePanel>

			{!sidebarCollapsed && (
				<ResizableHandle
					withHandle
					className="bg-border/40 hover:bg-primary/30 transition-all duration-200 rounded-full shadow-sm hover:shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]"
				/>
			)}

			<ResizablePanel defaultSize={mainHorizontalSizes[1]} minSize={30}>
				<ResizablePanelGroup
					direction="vertical"
					onLayout={setMainVerticalSizes}
					className="gap-3"
				>
					<ResizablePanel
						defaultSize={mainVerticalSizes[0]}
						minSize={40}
						className="rounded-xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,0.45)] !overflow-hidden"
					>
						<EditorArea />
					</ResizablePanel>

					<ResizableHandle
						withHandle
						className="bg-border/40 hover:bg-primary/30 transition-all duration-200 rounded-full shadow-sm hover:shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]"
					/>

					<ResizablePanel
						ref={terminalRef}
						collapsible
						collapsedSize={6}
						minSize={10}
						maxSize={50}
						defaultSize={mainVerticalSizes[1]}
						onCollapse={() => setTerminalCollapsed(true)}
						onExpand={() => setTerminalCollapsed(false)}
						className="rounded-xl border border-border/60 bg-background/70 backdrop-blur-xl shadow-[0_10px_40px_-20px_rgba(0,0,0,0.45)] !overflow-hidden"
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
