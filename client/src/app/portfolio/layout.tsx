'use client';

import { Suspense, useCallback, useEffect, useMemo, type ReactNode } from 'react';
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
import { useAtom, useSetAtom } from 'jotai';
import {
	mainHorizontalSizesAtom,
	mainVerticalSizesAtom,
	openFilesAtom,
	sidebarCollapsedAtom,
	terminalCollapsedAtom,
} from '@/store';
import { PANEL_CONFIG, PANEL_COLLAPSE_THRESHOLD } from '@/lib/constants';
import dynamic from 'next/dynamic';
import { getModuleIcon, getModuleTitle } from '@/lib/moduleRegistry';
import { Panel, Group, ResizeHandle } from '@/components/common/ResizeHandle';
import { EmptyState } from '@/components/editor/EmptyState';
import type { Layout } from 'react-resizable-panels';
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
// Design Tokens
// ============================================================================

const PANEL_STYLES = {
	base: 'overflow-hidden backdrop-blur-2xl border border-white/8 rounded-lg ring-1 ring-inset ring-white/5 transition-all duration-300',
	collapsed: 'border-transparent ring-transparent shadow-none bg-transparent',
	sidebar: 'bg-linear-to-br from-black/25 via-black/20 to-black/15 shadow-2xl',
	content: 'bg-linear-to-br from-black/20 via-black/15 to-black/10 shadow-xl',
	terminal: 'bg-linear-to-br from-black/30 via-black/25 to-black/20 shadow-2xl',
	mobile: 'bg-linear-to-br from-black/25 via-black/20 to-black/15 shadow-xl',
	maximized: 'bg-black shadow-2xl',
} as const;

const MOTION_PRESETS = {
	fadeScale: {
		initial: { opacity: 0, scale: 0.98 },
		animate: { opacity: 1, scale: 1 },
		exit: { opacity: 0, scale: 0.98 },
		transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] },
	},
} as const;

const LAYOUT_SPACING = {
	gap: 'gap-1',
	padding: 'p-1',
	inner: 'p-1',
} as const;

// ============================================================================
// Inner Layout Component
// ============================================================================

function PortfolioLayoutInner({ children }: { children: ReactNode }) {
	const isMobile = useMediaQuery('(max-width: 768px)');
	const router = useRouter();
	const pathname = usePathname();
	const COLLAPSE_EPS = PANEL_COLLAPSE_THRESHOLD;

	const [hSizes, setHSizes] = useAtom(mainHorizontalSizesAtom);
	const [vSizes, setVSizes] = useAtom(mainVerticalSizesAtom);

	// Direct atom setters for syncing from drag
	const setSidebarCollapsed = useSetAtom(sidebarCollapsedAtom);
	const setTerminalCollapsed = useSetAtom(terminalCollapsedAtom);

	const {
		sidebar,
		terminal,
		setHorizontalGroupRef,
		setVerticalGroupRef,
		setSidebarPanelRef,
		setTerminalPanelRef,
	} = usePanelControls();

	const modulePanel = useCollapsiblePanel({ type: 'module' });

	// Memoize shortcuts - use stable references
	const toggleSidebar = sidebar.toggle;
	const toggleTerminal = terminal.toggle;

	const shortcuts = useMemo(
		() => [
			{
				key: 'b',
				ctrl: true,
				handler: toggleSidebar,
				description: 'Toggle sidebar',
			},
			{
				key: 'j',
				ctrl: true,
				handler: toggleTerminal,
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
		],
		[toggleSidebar, toggleTerminal, modulePanel],
	);

	useKeyboardShortcuts(shortcuts);

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
		setOpenFiles(prev => prev.filter(f => f.moduleId !== currentModuleId));

		if (modulePanel.isMaximized) modulePanel.restore();
		modulePanel.collapse();

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

	// Sync collapsed state when user drags to collapse
	const handleHorizontalLayoutChange = useCallback(
		(layout: Layout) => {
			const sidebarSize = layout['sidebar'];
			const mainSize = layout['main'];
			if (typeof sidebarSize !== 'number' || typeof mainSize !== 'number') return;

			const isNowCollapsed = sidebarSize <= COLLAPSE_EPS;

			// Only update if state actually changed
			if (isNowCollapsed !== sidebar.isCollapsed) {
				setSidebarCollapsed(isNowCollapsed);
			}

			if (!isNowCollapsed) {
				setHSizes([sidebarSize, mainSize]);
			}
		},
		[COLLAPSE_EPS, sidebar.isCollapsed, setSidebarCollapsed, setHSizes],
	);

	const handleVerticalLayoutChange = useCallback(
		(layout: Layout) => {
			const contentSize = layout['content'];
			const terminalSize = layout['terminal'];
			if (typeof contentSize !== 'number' || typeof terminalSize !== 'number') return;

			const isNowCollapsed = terminalSize <= COLLAPSE_EPS;

			if (isNowCollapsed !== terminal.isCollapsed) {
				setTerminalCollapsed(isNowCollapsed);
			}

			if (!isNowCollapsed) {
				setVSizes([contentSize, terminalSize]);
			}
		},
		[COLLAPSE_EPS, terminal.isCollapsed, setTerminalCollapsed, setVSizes],
	);

	const renderDesktopLayout = () => {
		if (isMobile) return null;

		return (
			<Group
				id="portfolio-main-h"
				orientation="horizontal"
				className={cn('h-full w-full', LAYOUT_SPACING.gap)}
				groupRef={setHorizontalGroupRef}
				defaultLayout={{ sidebar: hSizes?.[0] ?? 20, main: hSizes?.[1] ?? 80 }}
				onLayoutChange={handleHorizontalLayoutChange}
			>
				<Panel
					id="sidebar"
					panelRef={setSidebarPanelRef}
					defaultSize={PANEL_CONFIG.HORIZONTAL.SIDEBAR.defaultSize}
					minSize={PANEL_CONFIG.HORIZONTAL.SIDEBAR.minSize}
					maxSize={PANEL_CONFIG.HORIZONTAL.SIDEBAR.maxSize}
					collapsible
					collapsedSize={PANEL_CONFIG.HORIZONTAL.SIDEBAR.collapsedSize}
					className={cn(
						PANEL_STYLES.base,
						PANEL_STYLES.sidebar,
						sidebar.isCollapsed && PANEL_STYLES.collapsed,
					)}
				>
					<ErrorBoundary>
						<Suspense fallback={<Loader />}>
							<Sidebar />
						</Suspense>
					</ErrorBoundary>
				</Panel>

				<ResizeHandle isCollapsed={sidebar.isCollapsed} orientation="vertical" />

				<Panel id="main" defaultSize="80%" minSize="50%" className="min-w-0">
					<Group
						id="portfolio-main-v"
						orientation="vertical"
						className={cn('h-full', LAYOUT_SPACING.gap)}
						groupRef={setVerticalGroupRef}
						defaultLayout={{ content: vSizes?.[0] ?? 60, terminal: vSizes?.[1] ?? 40 }}
						onLayoutChange={handleVerticalLayoutChange}
					>
						<Panel
							id="content"
							defaultSize={PANEL_CONFIG.VERTICAL.CONTENT.defaultSize}
							minSize={PANEL_CONFIG.VERTICAL.CONTENT.minSize}
							className={cn(PANEL_STYLES.base, PANEL_STYLES.content, 'min-h-0')}
						>
							<ErrorBoundary>
								<Suspense fallback={<Loader />}>{renderModuleContent()}</Suspense>
							</ErrorBoundary>
						</Panel>

						<ResizeHandle isCollapsed={terminal.isCollapsed} orientation="horizontal" />

						<Panel
							id="terminal"
							panelRef={setTerminalPanelRef}
							defaultSize={PANEL_CONFIG.VERTICAL.TERMINAL.defaultSize}
							minSize={PANEL_CONFIG.VERTICAL.TERMINAL.minSize}
							maxSize={PANEL_CONFIG.VERTICAL.TERMINAL.maxSize}
							collapsible
							collapsedSize={PANEL_CONFIG.VERTICAL.TERMINAL.collapsedSize}
							className={cn(
								PANEL_STYLES.base,
								PANEL_STYLES.terminal,
								'min-h-0',
								terminal.isCollapsed && PANEL_STYLES.collapsed,
							)}
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
			<div className="h-full w-full flex flex-col p-1">
				<div className={cn(PANEL_STYLES.base, PANEL_STYLES.mobile, 'h-full w-full')}>
					{renderModuleContent()}
				</div>
			</div>
		);
	};

	return (
		<>
			<AnimatePresence mode="wait">
				{modulePanel.isMaximized && (
					<motion.div
						key="maximized-overlay"
						{...MOTION_PRESETS.fadeScale}
						className={cn('fixed inset-0 z-100', PANEL_STYLES.maximized)}
					>
						{renderModuleContent('maximized-content p-4')}
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

					<div
						className={cn(
							'flex-1 min-h-0 w-full overflow-hidden relative z-10',
							LAYOUT_SPACING.padding,
						)}
					>
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
// Main Layout
// ============================================================================

export default function PortfolioLayout({ children }: { children: ReactNode }) {
	return (
		<ErrorBoundary>
			<BootGuard>
				<PanelProvider>
					<PortfolioLayoutInner>{children}</PortfolioLayoutInner>
				</PanelProvider>
			</BootGuard>
		</ErrorBoundary>
	);
}
