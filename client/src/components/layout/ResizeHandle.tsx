'use client';

import { cn } from '@/lib/utils';

interface ResizeHandleProps {
	direction: 'horizontal' | 'vertical';
	onResize: (delta: number) => void;
	className?: string;
}

export function ResizeHandle({ direction, onResize, className }: ResizeHandleProps) {
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		const startPos = direction === 'horizontal' ? e.clientX : e.clientY;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			const currentPos = direction === 'horizontal' ? moveEvent.clientX : moveEvent.clientY;
			const delta = currentPos - startPos;
			onResize(delta);
		};

		const handleMouseUp = () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
		document.body.style.userSelect = 'none';
	};

	return (
		<div
			onMouseDown={handleMouseDown}
			className={cn(
				'group relative flex-shrink-0 bg-border hover:bg-primary/60 transition-colors',
				direction === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
				className,
			)}
		>
			<div
				className={cn(
					'absolute bg-primary opacity-0 group-hover:opacity-100 transition-opacity',
					direction === 'horizontal'
						? 'inset-y-0 left-1/2 -translate-x-1/2 w-1'
						: 'inset-x-0 top-1/2 -translate-y-1/2 h-1',
				)}
			/>
		</div>
	);
}
