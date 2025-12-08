'use client';

import { useAtom } from 'jotai';
import { useRef, useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { FolderGit2, LineChart, Mail, Route, User } from 'lucide-react';

import { horizontalSizesAtom, verticalSizesAtom, windowsAtom } from '@/store/atoms';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useWindowManager } from '@/hooks/use-window-manager';
import { FileSystemItem } from '@/types/file-system';
import { initialFileSystem as fileSystem } from '@/lib/data';

import Background3D from '../os/shell/Background3D';
import { EditorArea } from '../os/editor/EditorArea';
import { FolderTree } from '../os/file-system/FolderTree';
import { CLI } from '../os/terminal/CLI';
import { Taskbar } from '../os/shell/Taskbar';
import { TopBar } from '../os/shell/TopBar';
import { WelcomeDialog } from '../shared/WelcomeDialog';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { HelpButton } from '../shared/HelpButton';
import { SidebarProfile } from '../os/shell/SidebarProfile';
import { OpenEditors } from '../os/file-system/OpenEditors';

export function MainLayout() {
	const isMobile = useMediaQuery('(max-width: 768px)');

	const sidebarRef = useRef<ImperativePanelHandle>(null);
	const terminalRef = useRef<ImperativePanelHandle>(null);

	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [terminalCollapsed, setTerminalCollapsed] = useState(true);

	const [verticalSizes, setVerticalSizes] = useAtom(verticalSizesAtom);
	const [horizontalSizes, setHorizontalSizes] = useAtom(horizontalSizesAtom);
	const [windows] = useAtom(windowsAtom);

	const [isLayoutReady] = useState(() => typeof window !== 'undefined');

	const { openWindow } = useWindowManager();

	const handleFileSelect = (item: FileSystemItem) => {
		let moduleId = item.id;
		if (moduleId.includes('/')) {
			moduleId = moduleId.split('/')[0];
		}
		openWindow(moduleId, item.name);
	};

	const quickLaunch: {
		label: string;
		icon: React.ComponentType<{ className?: string }>;
		item: FileSystemItem;
	}[] = [
		{ label: 'About', icon: User, item: { id: 'about', name: 'about', type: 'folder' } },
		{
			label: 'Projects',
			icon: FolderGit2,
			item: { id: 'projects', name: 'projects', type: 'folder' },
		},
		{ label: 'Journey', icon: Route, item: { id: 'journey', name: 'journey', type: 'folder' } },
		{ label: 'Contact', icon: Mail, item: { id: 'contact', name: 'contact', type: 'folder' } },
		{
			label: 'Stats',
			icon: LineChart,
			item: { id: 'tools/stats.exe', name: 'stats.exe', type: 'file' },
		},
	];

	const quickStats = [
		{ label: 'Modules', value: fileSystem.length },
		{ label: 'Open', value: windows.length },
		{ label: 'View', value: isMobile ? 'Mobile' : 'Desktop' },
	];

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
						onToggleSidebar={() => {
							const panel = sidebarRef.current;
							if (!panel) return;
							if (sidebarCollapsed) panel.expand();
							else panel.collapse();
						}}
						onToggleTerminal={() => {
							const panel = terminalRef.current;
							if (!panel) return;
							if (terminalCollapsed) panel.expand();
							else panel.collapse();
						}}
						onFileSelect={handleFileSelect}
					/>

					<WelcomeDialog />

					<div className="flex-1 z-10 relative overflow-hidden flex flex-col gap-3 px-3 pb-3 pt-2 md:px-5 md:pb-4">
						{/* Quick actions / status bar */}
						<div className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-2xl shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)] px-3 py-3 md:px-4 md:py-3 flex flex-col gap-3">
							<div className="flex items-center justify-between gap-3 flex-wrap">
								<div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
									<span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
									<span>Portfolio Workspace</span>
								</div>
								<div className="flex items-center gap-2 text-[11px] text-muted-foreground">
									<span className="px-2 py-1 rounded-full border border-border/60 bg-muted/60 backdrop-blur">
										Live Preview
									</span>
								</div>
							</div>

							<div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 text-xs text-muted-foreground">
								{quickStats.map(stat => (
									<div
										key={stat.label}
										className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.45)]"
									>
										<span className="text-[11px] uppercase tracking-[0.2em]">
											{stat.label}
										</span>
										<span className="text-sm font-medium text-foreground">
											{stat.value}
										</span>
									</div>
								))}
							</div>

							<div className="flex flex-wrap gap-2">
								{quickLaunch.map(({ label, icon: Icon, item }) => (
									<Button
										key={item.id}
										variant="outline"
										size="sm"
										className="gap-2 rounded-lg border-border/60 bg-background/60 hover:bg-primary/10 hover:border-primary/40 transition-all"
										onClick={() => handleFileSelect(item)}
									>
										<Icon className="h-4 w-4" />
										<span className="tracking-wide">{label}</span>
									</Button>
								))}
							</div>
						</div>

						{/* Main Workbench Area */}
						<div className="flex-1 relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl shadow-[0_24px_80px_-32px_rgba(0,0,0,0.4)]">
							{!isMobile && !isLayoutReady ? (
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
										<div className="h-full flex flex-col overflow-hidden bg-card/40 border-r border-border/60">
											<SidebarProfile />

											<div className="px-3 py-2 border-b border-border/60 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
												<span>Open Editors</span>
												<span className="text-[10px] text-muted-foreground/70">
													{windows.length}
												</span>
											</div>
											<div className="px-3 py-3 border-b border-border/60">
												<OpenEditors />
											</div>

											<div className="px-3 py-2 border-b border-border/60 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
												Explorer
											</div>
											<div className="flex-1 overflow-auto px-2 pb-3">
												<FolderTree
													items={fileSystem}
													onSelect={handleFileSelect}
												/>
											</div>
										</div>
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
								<div className="h-full w-full">
									<EditorArea />
								</div>
							)}
						</div>
					</div>

					<Taskbar />
				</div>

				<HelpButton />
			</>
		</ErrorBoundary>
	);
}
