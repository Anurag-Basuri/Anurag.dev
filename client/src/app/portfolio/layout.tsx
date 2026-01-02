'use client';

import { Suspense, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { Toaster } from 'react-hot-toast';
import { ContextMenuProvider } from '@/components/providers/context-menu-provider';
import { useAtom, useSetAtom } from 'jotai';
import {
	mainHorizontalSizesAtom,
	mainVerticalSizesAtom,
	sidebarCollapsedAtom,
	terminalCollapsedAtom,
} from '@/store';
import dynamic from 'next/dynamic';
import { getModuleIcon, getModuleTitle } from '@/lib/moduleRegistry';
import { EmptyState } from '@/components/editor/EmptyState';
import { PanelProvider, usePanelControls } from '@/contexts/panel-context';

// Feature imports
import {
	TopBar,
	Taskbar,
	WindowHeader,
	PANEL_STYLES,
	MOTION_PRESETS,
	LAYOUT_SPACING,
	useModuleNavigation,
	useLayoutShortcuts,
	DesktopLayout,
	MobileLayout,
} from '@/features/shell';

// Dynamic imports for heavy components
const TopBarDynamic = dynamic(
	() => import('@/features/shell/components/TopBar').then(mod => mod.TopBar),
	{
		ssr: false,
		loading: () => <Loader height="h-8" />,
	},
);

const TaskbarDynamic = dynamic(
	() => import('@/features/shell/components/Taskbar').then(mod => mod.Taskbar),
	{
		ssr: false,
		loading: () => <Loader height="h-8" />,
	},
);

const Background3DDynamic = dynamic(
	() => import('@/features/shell/components/Background3D').then(mod => mod.Background3D),
	{
		ssr: false,
		loading: () => null,
	},
);

// Inner Layout Component
function PortfolioLayoutInner({ children }: { children: ReactNode }) {
	const isMobile = useMediaQuery('(max-width: 768px)');

	const [hSizes, setHSizes] = useAtom(mainHorizontalSizesAtom);
	const [vSizes, setVSizes] = useAtom(mainVerticalSizesAtom);
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

	// Safe access to optional properties
	const isMaximized = modulePanel.isMaximized ?? false;

	// Custom hooks
	const { currentModuleId, handleFileSelect, dismissCurrentModule } = useModuleNavigation({
		isMaximized,
		restore: modulePanel.restore,
		collapse: modulePanel.collapse,
		expand: modulePanel.expand,
	});

	useLayoutShortcuts({
		toggleSidebar: sidebar.toggle,
		toggleTerminal: terminal.toggle,
		isMaximized,
		restore: modulePanel.restore,
	});

	// Render module content with header
	const renderModuleContent = (className?: string) => {
		if (!currentModuleId) return children;

		const Icon = getModuleIcon(currentModuleId);
		const title = getModuleTitle(currentModuleId);

		return (
			<div className={cn('h-full flex flex-col min-w-0', className)}>
				<WindowHeader
					icon={Icon}
					title={title}
					isMaximized={isMaximized}
					onMaximize={isMaximized ? modulePanel.restore : modulePanel.maximize}
					onMinimize={dismissCurrentModule}
					onClose={dismissCurrentModule}
				/>
				<div className="flex-1 min-h-0 relative">
					{modulePanel.isCollapsed ? <EmptyState /> : children}
				</div>
			</div>
		);
	};

	return (
		<>
			{/* Maximized Overlay */}
			<AnimatePresence mode="wait">
				{isMaximized && (
					<motion.div
						key="maximized-overlay"
						{...MOTION_PRESETS.fadeScale}
						className={cn('fixed inset-0 z-100', PANEL_STYLES.maximized)}
					>
						{renderModuleContent('maximized-content p-4')}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Main Layout */}
			<ContextMenuProvider>
				<div className="fixed inset-0 flex flex-col overflow-hidden bg-background font-sans selection:bg-primary/30">
					{/* Background Layer */}
					<div className="absolute inset-0 z-0">
						<Suspense fallback={null}>
							<Background3DDynamic />
						</Suspense>
					</div>

					<Suspense fallback={<Loader height="h-8" />}>
						<TopBarDynamic
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
						{!isMobile && (
							<DesktopLayout
								sidebar={sidebar}
								terminal={terminal}
								hSizes={hSizes}
								vSizes={vSizes}
								setHSizes={setHSizes}
								setVSizes={setVSizes}
								setSidebarCollapsed={setSidebarCollapsed}
								setTerminalCollapsed={setTerminalCollapsed}
								setHorizontalGroupRef={setHorizontalGroupRef}
								setVerticalGroupRef={setVerticalGroupRef}
								setSidebarPanelRef={setSidebarPanelRef}
								setTerminalPanelRef={setTerminalPanelRef}
							>
								{renderModuleContent()}
							</DesktopLayout>
						)}
						{isMobile && <MobileLayout>{renderModuleContent()}</MobileLayout>}
					</div>

					<Suspense fallback={<Loader height="h-8" />}>
						<TaskbarDynamic isMobile={isMobile} />
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

// Main Layout
export default function PortfolioLayout({ children }: { children: ReactNode }) {
	return (
		<ErrorBoundary>
			<PanelProvider>
				<PortfolioLayoutInner>{children}</PortfolioLayoutInner>
			</PanelProvider>
		</ErrorBoundary>
	);
}
