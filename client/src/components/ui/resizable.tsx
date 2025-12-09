'use client';

import * as React from 'react';
import { GripVerticalIcon } from 'lucide-react';
import * as ResizablePrimitive from 'react-resizable-panels';

import { cn } from '@/lib/utils';

const ResizablePanelGroup = React.forwardRef<
	React.ComponentRef<typeof ResizablePrimitive.PanelGroup>,
	React.ComponentProps<typeof ResizablePrimitive.PanelGroup>
>(({ className, ...props }, ref) => (
	<ResizablePrimitive.PanelGroup
		ref={ref}
		className={cn(
			'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
			className,
		)}
		{...props}
	/>
));
ResizablePanelGroup.displayName = ResizablePrimitive.PanelGroup.displayName;

const ResizablePanel = React.forwardRef<
	React.ComponentRef<typeof ResizablePrimitive.Panel>,
	React.ComponentProps<typeof ResizablePrimitive.Panel>
>((props, ref) => {
	return <ResizablePrimitive.Panel ref={ref} {...props} />;
});
ResizablePanel.displayName = ResizablePrimitive.Panel.displayName;

type ResizableHandleProps = React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
	withHandle?: boolean;
	className?: string;
};

const ResizableHandle = ({
	withHandle,
	className,
	...props
}: ResizableHandleProps) => {
	return (
		<ResizablePrimitive.PanelResizeHandle
			className={cn(
				'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90',
				'transition-colors duration-200 hover:bg-primary/50 data-[resize-handle-state=drag]:bg-primary',
				className,
			)}
			{...props}
		>
			{withHandle && (
				<div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
					<GripVerticalIcon className="h-2.5 w-2.5" />
				</div>
			)}
		</ResizablePrimitive.PanelResizeHandle>
	);
};

ResizableHandle.displayName = 'ResizableHandle';

export {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
}
