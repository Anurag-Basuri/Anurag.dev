'use client';

import {
	Separator,
	Panel as LibPanel,
	Group as LibGroup,
	type PanelProps as LibPanelProps,
	type GroupProps as LibGroupProps,
	type PanelImperativeHandle,
} from 'react-resizable-panels';
import { cn } from '@/lib/utils';
import { type ReactNode, type Dispatch, type SetStateAction, useCallback, type Ref } from 'react';

// ============================================================================
// Panel Wrapper - accepts callback-style panelRef
// ============================================================================

interface PanelProps extends Omit<LibPanelProps, 'panelRef'> {
	panelRef?: Dispatch<SetStateAction<PanelImperativeHandle | null>>;
	children?: ReactNode;
}

export function Panel({ panelRef, children, ...props }: PanelProps) {
	const libPanelRef = useCallback(
		(handle: PanelImperativeHandle | null) => {
			panelRef?.(handle);
		},
		[panelRef],
	) as unknown as Ref<PanelImperativeHandle>;

	return (
		<LibPanel panelRef={libPanelRef} {...props}>
			{children}
		</LibPanel>
	);
}

// ============================================================================
// Group Wrapper - simple re-export
// ============================================================================

interface GroupProps extends LibGroupProps {
	children?: ReactNode;
}

export function Group({ children, ...props }: GroupProps) {
	return <LibGroup {...props}>{children}</LibGroup>;
}

// ============================================================================
// ResizeHandle - always visible, minimal pill indicator
// ============================================================================

interface ResizeHandleProps {
	className?: string;
	id?: string;
	isCollapsed?: boolean;
	orientation?: 'horizontal' | 'vertical';
}

export function ResizeHandle({
	className,
	id,
	isCollapsed = false,
	orientation = 'vertical',
}: ResizeHandleProps) {
	const isHorizontal = orientation === 'horizontal';

	return (
		<Separator
			id={id}
			className={cn(
				'group relative flex items-center justify-center',
				isHorizontal ? 'h-2 w-full cursor-row-resize' : 'w-2 h-full cursor-col-resize',
				'outline-none transition-opacity duration-200',
				isCollapsed ? 'opacity-60 hover:opacity-100' : 'opacity-100',
				className,
			)}
		>
			<div
				className={cn(
					'absolute rounded-full transition-all duration-200',
					isCollapsed
						? 'bg-primary/40 group-hover:bg-primary/60'
						: 'bg-border group-hover:bg-muted-foreground/50',
					'group-active:bg-primary group-active:shadow-[0_0_12px_hsl(var(--primary)/0.6)]',
					'group-focus-visible:ring-2 group-focus-visible:ring-primary/50',
					isHorizontal
						? 'h-1 w-10 group-hover:w-16 group-active:h-1.5'
						: 'w-1 h-10 group-hover:h-16 group-active:w-1.5',
				)}
			/>
		</Separator>
	);
}
