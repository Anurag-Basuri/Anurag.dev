'use client';

import { Suspense, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import { Panel, Group, ResizeHandle } from '@/components/common/ResizeHandle';
import { PANEL_CONFIG, PANEL_COLLAPSE_THRESHOLD } from '@/lib/constants';
import { PANEL_STYLES, LAYOUT_SPACING } from '../constants';
import dynamic from 'next/dynamic';
import type { Layout } from 'react-resizable-panels';
import { usePanelControls } from '@/contexts/panel-context';
import { useAtom, useSetAtom } from 'jotai';
import {
	mainHorizontalSizesAtom,
	mainVerticalSizesAtom,
	sidebarCollapsedAtom,
	terminalCollapsedAtom,
} from '@/store';

// Dynamic imports for heavy components
const CLI = dynamic(() => import('@/features/terminal/CLI').then(mod => mod.CLI), {
	ssr: false,
	loading: () => <Loader height="h-32" />,
});

const Sidebar = dynamic(() => import('@/features/sidebar/Sidebar').then(mod => mod.Sidebar), {
	ssr: false,
});

// Simplified props - only children needed now
interface DesktopLayoutProps {
	children: ReactNode;
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
	// Access panel controls from context (reduces prop drilling)
	const {
		sidebar,
		terminal,
		setHorizontalGroupRef,
		setVerticalGroupRef,
		setSidebarPanelRef,
		setTerminalPanelRef,
	} = usePanelControls();

	// Access store atoms directly
	const [hSizes, setHSizes] = useAtom(mainHorizontalSizesAtom);
	const [vSizes, setVSizes] = useAtom(mainVerticalSizesAtom);
	const setSidebarCollapsed = useSetAtom(sidebarCollapsedAtom);
	const setTerminalCollapsed = useSetAtom(terminalCollapsedAtom);

	const COLLAPSE_EPS = PANEL_COLLAPSE_THRESHOLD;

	// Horizontal Layout Handler (Sidebar vs Main)
	const handleHorizontalLayoutChange = useCallback(
		(sizes: any) => {
			if (!Array.isArray(sizes) || sizes.length !== 2) return;

			const sidebarSize = sizes[0];
			const mainSize = sizes[1];

			// Detect collapse based on size
			const isNowCollapsed = sidebarSize <= COLLAPSE_EPS;
			if (isNowCollapsed !== sidebar.isCollapsed) {
				setSidebarCollapsed(isNowCollapsed);
			}

			if (!isNowCollapsed) {
				setHSizes(sizes);
			}
		},
		[COLLAPSE_EPS, sidebar.isCollapsed, setSidebarCollapsed, setHSizes],
	);

	// Vertical Layout Handler (Content vs Terminal)
	const handleVerticalLayoutChange = useCallback(
		(sizes: any) => {
			if (!Array.isArray(sizes) || sizes.length !== 2) return;

			const contentSize = sizes[0];
			const terminalSize = sizes[1];

			// Detect collapse based on size
			const isNowCollapsed = terminalSize <= COLLAPSE_EPS;
			if (isNowCollapsed !== terminal.isCollapsed) {
				setTerminalCollapsed(isNowCollapsed);
			}

			if (!isNowCollapsed) {
				setVSizes(sizes);
			}
		},
		[COLLAPSE_EPS, terminal.isCollapsed, setTerminalCollapsed, setVSizes],
	);

	return (
		<Group
			id="portfolio-main-h"
			orientation="horizontal"
			className={cn('h-full w-full', LAYOUT_SPACING.gap)}
			groupRef={setHorizontalGroupRef}
			defaultLayout={(hSizes ?? [20, 80]) as any}
			onLayoutChange={handleHorizontalLayoutChange}
		>
			<Panel
				id="sidebar"
				panelRef={setSidebarPanelRef}
				defaultSize={parseFloat(PANEL_CONFIG.HORIZONTAL.SIDEBAR.defaultSize)}
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

			<Panel id="main" defaultSize={80} minSize={50} className="min-w-0">
				<Group
					id="portfolio-main-v"
					orientation="vertical"
					className={cn('h-full', LAYOUT_SPACING.gap)}
					groupRef={setVerticalGroupRef}
					defaultLayout={(vSizes ?? [60, 40]) as any}
					onLayoutChange={handleVerticalLayoutChange}
				>
					<Panel
						id="content"
						defaultSize={parseFloat(PANEL_CONFIG.VERTICAL.CONTENT.defaultSize)}
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
						defaultSize={parseFloat(PANEL_CONFIG.VERTICAL.TERMINAL.defaultSize)}
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
