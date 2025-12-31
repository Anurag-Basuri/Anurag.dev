'use client';

import { Suspense, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { FileSystemItem } from '@/data/filesystem';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { Toaster } from 'react-hot-toast';
import { ContextMenuProvider } from '@/components/providers/context-menu-provider';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { BootGuard } from '@/components/layout/BootGuard';
import { useAtom } from 'jotai';
import { mainHorizontalSizesAtom, mainVerticalSizesAtom, openFilesAtom } from '@/store';
import { PANEL_CONFIG, PANEL_COLLAPSE_THRESHOLD } from '@/lib/constants';
import dynamic from 'next/dynamic';
import { getModuleIcon, getModuleTitle } from '@/lib/moduleRegistry';
import { Panel, Group, ResizeHandle } from '@/components/common/ResizeHandle';
import { EmptyState } from '@/components/editor/EmptyState';
import type { Layout, GroupImperativeHandle } from 'react-resizable-panels';
import { PanelProvider, usePanelControls } from '@/contexts/panel-context';

const CLI = dynamic(() => import('@/features/terminal/CLI').then(mod => mod.CLI), {
	ssr: false,
	loading: () => <Loader height="h-32" />,
});
const Sidebar = dynamic(() => import('@/features/sidebar/Sidebar').then(mod => mod.Sidebar), {
	ssr: false,
});
const Taskbar = dynamic(
	() => import('@/features/shell/components/Taskbar').then(mod => mod.Taskbar),
	{
		ssr: false,
		loading: () => <Loader height="h-8" />,
	},
);
const TopBar = dynamic(() => import('@/features/shell/components/TopBar').then(mod => mod.TopBar), {
	ssr: false,
	loading: () => <Loader height="h-8" />,
});

const WindowHeader = dynamic(
	() => import('@/features/shell/components/WindowHeader').then(mod => mod.WindowHeader),
	{ ssr: false },
);

// ============================================================================
// Inner Layout Component (uses PanelContext)
// ============================================================================

interface PortfolioLayoutInnerProps {
	children: ReactNode;
	horizontalGroupRef: React.RefObject<GroupImperativeHandle | null>;
	verticalGroupRef: React.RefObject<GroupImperativeHandle | null>;
}

function PortfolioLayoutInner({
	children,
	horizontalGroupRef,
	verticalGroupRef,
}: PortfolioLayoutInnerProps) {
	const isMobile = useMediaQuery('(max-width: 768px)');
	const router = useRouter();
	const pathname = usePathname();
	const COLLAPSE_EPS = PANEL_COLLAPSE_THRESHOLD;

	const [hSizes, setHSizes] = useAtom(mainHorizontalSizesAtom);
	const [vSizes, setVSizes] = useAtom(mainVerticalSizesAtom);

	// Use the centralized panel controls
	const { sidebar, terminal } = usePanelControls();

	// Module panel still uses the old hook (it's separate concern)
	const modulePanel = useCollapsiblePanel({ type: 'module' });

	useKeyboardShortcuts([
		{
			key: 'b',
			ctrl: true,
			handler: () => sidebar.toggle(),
			description: 'Toggle sidebar',
		},
		{
			key: 'j',
			ctrl: true,
			handler: () => terminal.toggle(),
			description: 'Toggle terminal',
		},
		{
			key: 'Escape',
			handler: () => {
				if (modulePanel.isMaximized) {
					modulePanel.restore();
				}
			},
			description: 'Close maximized panel',
		},
		{
			key: 'k',
			ctrl: true,
			shift: true,
			handler: () => {
				document
					.querySelector<HTMLInputElement>('input[aria-label="Command input"]')
					?.focus();
			},
			description: 'Focus terminal',
		},
	]);

	const [openFiles, setOpenFiles] = useAtom(openFilesAtom);

	const getModuleIdFromPathname = useCallback((path: string): string | null => {
		const segments = path.split('/').filter(Boolean);
		const lastSegment = segments[segments.length - 1];

		if (!lastSegment || lastSegment === 'portfolio') return null;

		const aliases: Record<string, string> = {
			bio: 'about',
			work: 'projects',
			connect: 'contact',
			certs: 'certifications',
		};

		return aliases[lastSegment] || lastSegment;
	}, []);

	const currentModuleId = getModuleIdFromPathname(pathname);

	// Synchronize open files with navigation.
	useEffect(() => {
		if (!currentModuleId) return;

		setOpenFiles(prev => {
			const existingIndex = prev.findIndex(f => f.moduleId === currentModuleId);
			if (existingIndex !== -1) {
				const updated = [...prev];
				const [existing] = updated.splice(existingIndex, 1);
				return [...updated, { ...existing, openedAt: Date.now() }];
			}
			return [...prev, { moduleId: currentModuleId, openedAt: Date.now() }];
		});
	}, [pathname, currentModuleId, setOpenFiles]);

	useEffect(() => {
		// If user navigates to a module, ensure it isn't stuck minimized
		if (currentModuleId) modulePanel.expand();
	}, [currentModuleId, modulePanel]);

	const getNextModuleAfterClose = useCallback(
		(closingModuleId: string) => {
			const remaining = openFiles.filter(f => f.moduleId !== closingModuleId);
			return remaining.length > 0 ? remaining[remaining.length - 1].moduleId : null;
		},
		[openFiles],
	);

	const dismissCurrentModule = useCallback(() => {
		if (!currentModuleId) return;

		const nextModule = getNextModuleAfterClose(currentModuleId);

		// Close behaves like taskbar close: remove from open files
		setOpenFiles(prev => prev.filter(f => f.moduleId !== currentModuleId));

		// If maximized, restore first so overlay doesn't stick
		if (modulePanel.isMaximized) modulePanel.restore();

		// Collapse state (even though we navigate away) keeps internal state consistent
		modulePanel.collapse();

		// Navigate like taskbar close
		if (nextModule) router.push(`/portfolio/${nextModule}`);
		else router.push('/portfolio');
	}, [currentModuleId, getNextModuleAfterClose, modulePanel, router, setOpenFiles]);

	const handleFileSelect = useCallback(
		(item: FileSystemItem) => {
			if (item.type === 'file' && item.moduleId) {
				router.push(`/portfolio/${item.moduleId}`);
			}
		},
		[router],
	);

	const renderModuleContent = (className?: string) => {
		if (!currentModuleId) return children;

		const Icon = getModuleIcon(currentModuleId);
		const title = getModuleTitle(currentModuleId);

		return (
			<div className={cn('h-full flex flex-col min-w-0', className)}>
				<WindowHeader
					icon={Icon}
					title={title}
					isMaximized={modulePanel.isMaximized}
					onMaximize={
						modulePanel.isMaximized ? modulePanel.restore : modulePanel.maximize
					}
					onMinimize={dismissCurrentModule}
					onClose={dismissCurrentModule}
				/>
				<div className="flex-1 min-h-0 relative">
					{modulePanel.isCollapsed ? <EmptyState /> : children}
				</div>
			</div>
		);
	};

	const renderDesktopLayout = () => {
		if (isMobile) return null;

		return (
			<Group
				id="portfolio-main-h"
				orientation="horizontal"
				className="h-full w-full gap-3"
				groupRef={horizontalGroupRef}
				defaultLayout={{ sidebar: hSizes?.[0] ?? 20, main: hSizes?.[1] ?? 80 }}
				onLayoutChange={(layout: Layout) => {
					const sidebarSize = layout.sidebar;
					const mainSize = layout.main;
					if (typeof sidebarSize !== 'number' || typeof mainSize !== 'number') return;

					const nextCollapsed = sidebarSize <= COLLAPSE_EPS;

					// Keep atom in sync with drag-collapse (use direct state update, not collapse/expand which call setLayout)
					if (nextCollapsed !== sidebar.isCollapsed) {
						sidebar.setCollapsedState(nextCollapsed);
					}

					// Don't overwrite stored sizes with the collapsed layout
					if (!nextCollapsed) {
						setHSizes([sidebarSize, mainSize]);
					}
				}}
			>
				{/* Sidebar */}
				<Panel
					id="sidebar"
					defaultSize={PANEL_CONFIG.HORIZONTAL.SIDEBAR.defaultSize}
					minSize={PANEL_CONFIG.HORIZONTAL.SIDEBAR.minSize}
					maxSize={PANEL_CONFIG.HORIZONTAL.SIDEBAR.maxSize}
					collapsible
					collapsedSize={PANEL_CONFIG.HORIZONTAL.SIDEBAR.collapsedSize}
					className="overflow-hidden bg-black/20 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-2xl transition-all duration-300"
				>
					<ErrorBoundary>
						<Suspense fallback={<Loader />}>
							<Sidebar />
						</Suspense>
					</ErrorBoundary>
				</Panel>

				{/* Horizontal ResizeHandle - hides when sidebar collapsed */}
				<ResizeHandle isCollapsed={sidebar.isCollapsed} orientation="vertical" />

				{/* Main Content + Terminal */}
				<Panel id="main" defaultSize="80%" minSize="50%" className="min-w-0">
					<Group
						id="portfolio-main-v"
						orientation="vertical"
						className="h-full gap-3"
						groupRef={verticalGroupRef}
						defaultLayout={{ content: vSizes?.[0] ?? 60, terminal: vSizes?.[1] ?? 40 }}
						onLayoutChange={(layout: Layout) => {
							const contentSize = layout.content;
							const terminalSize = layout.terminal;
							if (typeof contentSize !== 'number' || typeof terminalSize !== 'number')
								return;

							const nextCollapsed = terminalSize <= COLLAPSE_EPS;

							// Keep atom in sync with drag-collapse (use direct state update, not collapse/expand which call setLayout)
							if (nextCollapsed !== terminal.isCollapsed) {
								terminal.setCollapsedState(nextCollapsed);
							}

							if (!nextCollapsed) {
								setVSizes([contentSize, terminalSize]);
							}
						}}
					>
						{/* Content Area */}
						<Panel
							id="content"
							defaultSize={PANEL_CONFIG.VERTICAL.CONTENT.defaultSize}
							minSize={PANEL_CONFIG.VERTICAL.CONTENT.minSize}
							className="overflow-hidden min-h-0 bg-black/20 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl"
						>
							<ErrorBoundary>
								<Suspense fallback={<Loader />}>{renderModuleContent()}</Suspense>
							</ErrorBoundary>
						</Panel>

						{/* Vertical ResizeHandle */}
						<ResizeHandle isCollapsed={terminal.isCollapsed} orientation="horizontal" />

						{/* Terminal */}
						<Panel
							id="terminal"
							defaultSize={PANEL_CONFIG.VERTICAL.TERMINAL.defaultSize}
							minSize={PANEL_CONFIG.VERTICAL.TERMINAL.minSize}
							maxSize={PANEL_CONFIG.VERTICAL.TERMINAL.maxSize}
							collapsible
							collapsedSize={PANEL_CONFIG.VERTICAL.TERMINAL.collapsedSize}
							className="overflow-hidden min-h-0 bg-black/30 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl transition-all duration-300"
						>
							<ErrorBoundary>
								<Suspense fallback={<Loader height="h-32" />}>
									<CLI />
								</Suspense>
							</ErrorBoundary>
						</Panel>
					</Group>
				</Panel>
			</Group>
		);
	};

	const renderMobileLayout = () => {
		if (!isMobile) return null;

		return (
			<div className="h-full w-full flex flex-col">
				<div className="h-full w-full bg-linear-to-br from-card/80 to-card/60 backdrop-blur-xl rounded-xl shadow-xl border border-border/20">
					{renderModuleContent()}
				</div>
			</div>
		);
	};

	return (
		<>
			<AnimatePresence>
				{modulePanel.isMaximized && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="fixed inset-0 z-100 bg-black"
					>
						{renderModuleContent('maximized-content')}
					</motion.div>
				)}
			</AnimatePresence>
			<ContextMenuProvider>
				<div className="fixed inset-0 flex flex-col overflow-hidden bg-black font-sans selection:bg-emerald-500/30">
					<Suspense fallback={<Loader height="h-8" />}>
						<TopBar
							isMobile={isMobile}
							sidebarCollapsed={sidebar.isCollapsed}
							terminalCollapsed={terminal.isCollapsed}
							onToggleSidebar={sidebar.toggle}
							onToggleTerminal={terminal.toggle}
							onFileSelect={handleFileSelect}
						/>
					</Suspense>

					<div className="flex-1 min-h-0 w-full overflow-hidden relative z-10 p-3">
						{renderDesktopLayout()}
						{renderMobileLayout()}
					</div>

					<Suspense fallback={<Loader height="h-8" />}>
						<Taskbar isMobile={isMobile} />
					</Suspense>

					<Toaster
						position="top-right"
						toastOptions={{
							duration: 3000,
							style: {
								background: 'var(--background)',
								color: 'var(--foreground)',
								border: '1px solid var(--border)',
							},
						}}
					/>
				</div>
			</ContextMenuProvider>
		</>
	);
}

// ============================================================================
// Main Layout (wraps with PanelProvider)
// ============================================================================

export default function PortfolioLayout({ children }: { children: ReactNode }) {
	// Create refs locally - these will be passed to both PanelProvider and Group components
	const horizontalGroupRef = useRef<GroupImperativeHandle>(null);
	const verticalGroupRef = useRef<GroupImperativeHandle>(null);

	return (
		<ErrorBoundary>
			<BootGuard>
				<PanelProvider
					horizontalGroupRef={horizontalGroupRef}
					verticalGroupRef={verticalGroupRef}
				>
					<PortfolioLayoutInner
						horizontalGroupRef={horizontalGroupRef}
						verticalGroupRef={verticalGroupRef}
					>
						{children}
					</PortfolioLayoutInner>
				</PanelProvider>
			</BootGuard>
		</ErrorBoundary>
	);
}
