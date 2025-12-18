'use client';

import * as React from 'react';
import { GripVerticalIcon } from 'lucide-react';
import { Group as PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

import { cn } from '@/lib/utils';

const ResizablePanelGroup = React.forwardRef<
	React.ElementRef<typeof PanelGroup>,
	React.ComponentProps<typeof PanelGroup>
>(({ className, ...props }, ref) => (
	<PanelGroup
		{...props}
		className={cn(
			'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
			className,
		)}
	/>
));
ResizablePanelGroup.displayName = 'ResizablePanelGroup';

const ResizablePanel = React.forwardRef<
	React.ElementRef<typeof Panel>,
	React.ComponentProps<typeof Panel>
>(({ className, ...props }, ref) => <Panel ref={ref} className={cn(className)} {...props} />);
ResizablePanel.displayName = 'ResizablePanel';

const ResizableHandle = React.forwardRef<
	React.ElementRef<typeof PanelResizeHandle>,
	React.ComponentProps<typeof PanelResizeHandle> & {
		withHandle?: boolean;
	}
>(({ withHandle, className, ...props }, ref) => (
	<PanelResizeHandle
		className={cn(
			'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90',
			'transition-colors duration-200 hover:bg-primary/50 data-[resize-handle-state=drag]:bg-primary',
			className,
		)}
		{...props}
	>
		{withHandle && (
			<div
				ref={ref}
				className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border"
			>
				<GripVerticalIcon className="h-2.5 w-2.5" />
			</div>
		)}
	</PanelResizeHandle>
));
ResizableHandle.displayName = 'ResizableHandle';

// Export all necessary types from react-resizable-panels
export type { GroupProps as PanelGroupProps, PanelProps } from 'react-resizable-panels';

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
