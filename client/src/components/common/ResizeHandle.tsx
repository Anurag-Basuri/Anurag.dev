'use client';

import { Group, Panel, Separator } from 'react-resizable-panels';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
	className?: string;
	id?: string;
}

// Custom resize handle for react-resizable-panels.
function ResizeHandle({ className, id }: ResizeHandleProps) {
	return (
		<Separator
			id={id}
			className={cn(
				'group relative flex items-center justify-center z-50 transition-all duration-300',
				// State-based styling
				'data-[resize-handle-state="drag"]:bg-emerald-500/50',
				'data-[resize-handle-state="hover"]:bg-emerald-500/30',
				'data-[resize-handle-state="inactive"]:bg-white/5',
				// Direction-based sizing (automatically set by library)
				'data-[panel-group-direction=vertical]:h-1',
				'data-[panel-group-direction=vertical]:w-full',
				'data-[panel-group-direction=vertical]:cursor-row-resize',
				'data-[panel-group-direction=horizontal]:w-1',
				'data-[panel-group-direction=horizontal]:h-full',
				'data-[panel-group-direction=horizontal]:cursor-col-resize',
				// Effects
				'hover:shadow-[0_0_8px_#34d399]',
				className,
			)}
		/>
	);
}

// Export with aliases to match layout.tsx usage
export { Panel as ResizablePanel, Group as PanelGroup, ResizeHandle };
