'use client';

import { Suspense, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import { Panel, Group, ResizeHandle } from '@/components/common/ResizeHandle';
import { PANEL_CONFIG } from '@/lib/constants';
import { PANEL_STYLES, LAYOUT_SPACING } from '../constants';
import dynamic from 'next/dynamic';
import { usePanelControls } from '@/contexts/panel-context';
import { useAtomValue } from 'jotai';
import { mainHorizontalSizesAtom, mainVerticalSizesAtom } from '@/store';
import type { PanelSize } from 'react-resizable-panels';

const CLI = dynamic(() => import('@/features/terminal/CLI').then(mod => mod.CLI), {
	ssr: false,
	loading: () => <Loader height="h-32" />,
});

const Sidebar = dynamic(() => import('@/features/sidebar/Sidebar').then(mod => mod.Sidebar), {
	ssr: false,
});

interface DesktopLayoutProps {
	children: ReactNode;
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
	const {
		sidebar,
		terminal,
		setSidebarPanelRef,
		setTerminalPanelRef,
		setSidebarCollapsedState,
		setTerminalCollapsedState,
		persistHorizontalSizes,
		persistVerticalSizes,
	} = usePanelControls();

	// Read persisted sizes for initial render (read-only)
	const hSizes = useAtomValue(mainHorizontalSizesAtom);
	const vSizes = useAtomValue(mainVerticalSizesAtom);

	// Persist sizes when layout changes (fires on resize end)
	// Library's onLayout provides the final sizes after any resize operation
	const handleHorizontalLayout = useCallback(
		(sizes: number[]) => {
			persistHorizontalSizes(sizes);
		},
		[persistHorizontalSizes],
	);

	const handleVerticalLayout = useCallback(
		(sizes: number[]) => {
			persistVerticalSizes(sizes);
		},
		[persistVerticalSizes],
	);

	const sidebarCollapsedSize = parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.collapsedSize);
	const terminalCollapsedSize = parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.collapsedSize);

	const handleSidebarResize = useCallback(
		(size: PanelSize) => {
			const isCollapsed = size.asPercentage <= sidebarCollapsedSize + 0.5;
			setSidebarCollapsedState(isCollapsed);
		},
		[setSidebarCollapsedState, sidebarCollapsedSize],
	);

	const handleTerminalResize = useCallback(
		(size: PanelSize) => {
			const isCollapsed = size.asPercentage <= terminalCollapsedSize + 0.5;
			setTerminalCollapsedState(isCollapsed);
		},
		[setTerminalCollapsedState, terminalCollapsedSize],
	);

	return (
		<Group
			id="portfolio-main-h"
			orientation="horizontal"
			className={cn('h-full w-full', LAYOUT_SPACING.gap)}
			onLayout={handleHorizontalLayout}
		>
			<Panel
				id="sidebar"
				panelRef={setSidebarPanelRef}
				defaultSize={hSizes?.[0] ?? 20}
				minSize={parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.minSize)}
				maxSize={parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.maxSize)}
				collapsible
				collapsedSize={parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.collapsedSize)}
				onResize={handleSidebarResize}
				className={cn(
					PANEL_STYLES.base,
					PANEL_STYLES.sidebar,
					'shadow-none focus-within:ring-1 focus-within:ring-primary/10',
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

			<Panel id="main" defaultSize={hSizes?.[1] ?? 80} minSize={50} className="min-w-0">
				<Group
					id="portfolio-main-v"
					orientation="vertical"
					className={cn('h-full', LAYOUT_SPACING.gap)}
					onLayout={handleVerticalLayout}
				>
					<Panel
						id="content"
						defaultSize={vSizes?.[0] ?? 60}
						minSize={parseFloat(PANEL_CONFIG.VERTICAL.CONTENT.minSize)}
						className={cn(
							PANEL_STYLES.base,
							PANEL_STYLES.content,
							'min-h-0 ring-1 ring-primary/10',
						)}
					>
						<ErrorBoundary>
							<Suspense fallback={<Loader />}>{children}</Suspense>
						</ErrorBoundary>
					</Panel>

					<ResizeHandle isCollapsed={terminal.isCollapsed} orientation="horizontal" />

					<Panel
						id="terminal"
						panelRef={setTerminalPanelRef}
						defaultSize={vSizes?.[1] ?? 40}
						minSize={parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.minSize)}
						maxSize={parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.maxSize)}
						collapsible
						collapsedSize={parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.collapsedSize)}
						onResize={handleTerminalResize}
						className={cn(
							PANEL_STYLES.base,
							PANEL_STYLES.terminal,
							'min-h-0 shadow-none focus-within:ring-1 focus-within:ring-primary/10',
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
}
