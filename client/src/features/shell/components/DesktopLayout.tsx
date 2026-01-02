'use client';

import { Suspense, useCallback, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import { Panel, Group, ResizeHandle } from '@/components/common/ResizeHandle';
import { PANEL_CONFIG, PANEL_COLLAPSE_THRESHOLD } from '@/lib/constants';
import { PANEL_STYLES, LAYOUT_SPACING } from '../constants';
import dynamic from 'next/dynamic';
import { usePanelControls } from '@/contexts/panel-context';
import { useAtom } from 'jotai';
import { mainHorizontalSizesAtom, mainVerticalSizesAtom } from '@/store';

// Dynamic imports for heavy components
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

// Main layout component for the portfolio
export function DesktopLayout({ children }: DesktopLayoutProps) {
	// Access panel controls from context
	const {
		sidebar,
		terminal,
		setHorizontalGroupRef,
		setVerticalGroupRef,
		setSidebarPanelRef,
		setTerminalPanelRef,
	} = usePanelControls();

	// Persisted sizes
	const [hSizes, setHSizes] = useAtom(mainHorizontalSizesAtom);
	const [vSizes, setVSizes] = useAtom(mainVerticalSizesAtom);

	// Track previous collapse state to detect changes
	const prevSidebarCollapsed = useRef(sidebar.isCollapsed);
	const prevTerminalCollapsed = useRef(terminal.isCollapsed);

	// Horizontal Layout Handler - Detects collapse via size threshold
	const handleHorizontalLayoutChange = useCallback(
		(sizes: number[]) => {
			if (!Array.isArray(sizes) || sizes.length !== 2) return;

			const sidebarSize = sizes[0];
			const isNowCollapsed = sidebarSize <= PANEL_COLLAPSE_THRESHOLD;

			// Sync collapse state if changed
			if (isNowCollapsed !== prevSidebarCollapsed.current) {
				prevSidebarCollapsed.current = isNowCollapsed;
				if (isNowCollapsed) {
					sidebar.onCollapse();
				} else {
					sidebar.onExpand();
				}
			}

			// Only persist non-collapsed sizes
			if (!isNowCollapsed) {
				setHSizes(sizes);
			}
		},
		[sidebar, setHSizes],
	);

	// Vertical Layout Handler - Detects collapse via size threshold
	const handleVerticalLayoutChange = useCallback(
		(sizes: number[]) => {
			if (!Array.isArray(sizes) || sizes.length !== 2) return;

			const terminalSize = sizes[1];
			const isNowCollapsed = terminalSize <= PANEL_COLLAPSE_THRESHOLD;

			// Sync collapse state if changed
			if (isNowCollapsed !== prevTerminalCollapsed.current) {
				prevTerminalCollapsed.current = isNowCollapsed;
				if (isNowCollapsed) {
					terminal.onCollapse();
				} else {
					terminal.onExpand();
				}
			}

			// Only persist non-collapsed sizes
			if (!isNowCollapsed) {
				setVSizes(sizes);
			}
		},
		[terminal, setVSizes],
	);

	return (
		<Group
			id="portfolio-main-h"
			orientation="horizontal"
			className={cn('h-full w-full', LAYOUT_SPACING.gap)}
			groupRef={setHorizontalGroupRef}
			onLayoutChange={handleHorizontalLayoutChange as any}
		>
			<Panel
				id="sidebar"
				panelRef={setSidebarPanelRef}
				defaultSize={sidebar.isCollapsed ? 3 : hSizes?.[0] ?? 20}
				minSize={parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.minSize)}
				maxSize={parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.maxSize)}
				collapsible
				collapsedSize={parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.collapsedSize)}
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

			<Panel id="main" defaultSize={hSizes?.[1] ?? 80} minSize={50} className="min-w-0">
				<Group
					id="portfolio-main-v"
					orientation="vertical"
					className={cn('h-full', LAYOUT_SPACING.gap)}
					groupRef={setVerticalGroupRef}
					onLayoutChange={handleVerticalLayoutChange as any}
				>
					<Panel
						id="content"
						defaultSize={vSizes?.[0] ?? 60}
						minSize={parseFloat(PANEL_CONFIG.VERTICAL.CONTENT.minSize)}
						className={cn(PANEL_STYLES.base, PANEL_STYLES.content, 'min-h-0')}
					>
						<ErrorBoundary>
							<Suspense fallback={<Loader />}>{children}</Suspense>
						</ErrorBoundary>
					</Panel>

					<ResizeHandle isCollapsed={terminal.isCollapsed} orientation="horizontal" />

					<Panel
						id="terminal"
						panelRef={setTerminalPanelRef}
						defaultSize={terminal.isCollapsed ? 3 : vSizes?.[1] ?? 40}
						minSize={parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.minSize)}
						maxSize={parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.maxSize)}
						collapsible
						collapsedSize={parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.collapsedSize)}
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
}
