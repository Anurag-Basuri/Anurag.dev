'use client';

import {
	Separator,
	Panel as LibPanel,
	Group as LibGroup,
	type PanelProps as LibPanelProps,
	type GroupProps as LibGroupProps,
	type PanelImperativeHandle,
	type PanelSize,
	type Layout,
} from 'react-resizable-panels';
import { cn } from '@/lib/utils';
import {
	type ReactNode,
	type Dispatch,
	type SetStateAction,
	useRef,
	useCallback,
	type Ref,
} from 'react';

// Panel - wraps Library Panel to add collapse/expand callbacks
interface PanelProps extends Omit<LibPanelProps, 'panelRef'> {
	// Accept the callback-ref style from usePanelCallbackRef
	panelRef?: Dispatch<SetStateAction<PanelImperativeHandle | null>>;
	children?: ReactNode;
	// Custom collapse/expand callbacks triggered when panel crosses threshold
	onCollapse?: () => void;
	onExpand?: () => void;
}

export function Panel({
	panelRef,
	children,
	onCollapse,
	onExpand,
	onResize,
	...props
}: PanelProps) {
	const prevCollapsedRef = useRef<boolean | null>(null);

	// Convert callback-style ref to regular ref for the library
	const libPanelRef = useCallback(
		(handle: PanelImperativeHandle | null) => {
			panelRef?.(handle);
		},
		[panelRef],
	) as unknown as Ref<PanelImperativeHandle>;

	// Combine our collapse/expand callbacks with onResize
	const handleResize = (size: PanelSize, id: string | number | undefined) => {
		onResize?.(size, id);

		// Detect collapse/expand based on size changes
		const collapsedSize =
			typeof props.collapsedSize === 'number'
				? props.collapsedSize
				: parseFloat(String(props.collapsedSize ?? '3'));

		const isCollapsed = size.asPercentage <= collapsedSize + 0.5;

		// Only trigger callbacks when state actually changes
		if (prevCollapsedRef.current !== null) {
			if (!prevCollapsedRef.current && isCollapsed) {
				onCollapse?.();
			} else if (prevCollapsedRef.current && !isCollapsed) {
				onExpand?.();
			}
		}
		prevCollapsedRef.current = isCollapsed;
	};

	return (
		<LibPanel panelRef={libPanelRef} onResize={handleResize} {...props}>
			{children}
		</LibPanel>
	);
}

// Re-export Group with simplified onLayout callback
interface GroupProps extends Omit<LibGroupProps, 'onLayoutChange'> {
	children?: ReactNode;
	// Simplified callback that provides sizes as number array
	onLayout?: (sizes: number[]) => void;
}

export function Group({ children, onLayout, ...props }: GroupProps) {
	// Convert Layout object to number array for easier consumption
	const handleLayoutChange = onLayout
		? (layout: Layout) => {
				const sizes = Object.values(layout);
				onLayout(sizes);
		  }
		: undefined;

	return (
		<LibGroup onLayoutChange={handleLayoutChange} {...props}>
			{children}
		</LibGroup>
	);
}

// ResizeHandle - always visible, thin pill that grows on interaction
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
				// Slightly more visible when collapsed to indicate draggability
				isCollapsed ? 'opacity-60 hover:opacity-100' : 'opacity-100',
				className,
			)}
		>
			{/* Pill grip with glow on active - uses CSS variables for theme colors */}
			<div
				className={cn(
					'absolute rounded-full transition-all duration-200',
					// Background color using theme variables
					isCollapsed
						? 'bg-primary/40 group-hover:bg-primary/60'
						: 'bg-border group-hover:bg-muted-foreground/50',
					// Glow effect on active using CSS variable
					'group-active:bg-primary group-active:shadow-[0_0_12px_hsl(var(--primary)/0.6)]',
					// Focus visible for accessibility
					'group-focus-visible:ring-2 group-focus-visible:ring-primary/50 group-focus-visible:ring-offset-1',
					// Size and hover state
					isHorizontal
						? 'h-1 w-10 group-hover:w-16 group-active:h-1.5'
						: 'w-1 h-10 group-hover:h-16 group-active:w-1.5',
				)}
			/>
		</Separator>
	);
}
