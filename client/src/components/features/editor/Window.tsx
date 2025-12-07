'use client';

import { Rnd } from 'react-rnd';
import { useAtom } from 'jotai';
import { activeWindowIdAtom, windowsAtom } from '@/store/atoms';
import { WindowState } from '@/types/window';
import { cn } from '@/lib/utils';
import { X, Minus, Square } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface WindowProps {
	windowState: WindowState;
}

export function Window({ windowState }: WindowProps) {
	const [activeId, setActiveId] = useAtom(activeWindowIdAtom);
	const [windows, setWindows] = useAtom(windowsAtom);
	const isMobile = useMediaQuery('(max-width: 768px)');

	const isActive = activeId === windowState.id;

	const handleClose = (e: React.MouseEvent) => {
		e.stopPropagation();
		setWindows(prev => prev.filter(w => w.id !== windowState.id));
	};

	const handleMinimize = (e: React.MouseEvent) => {
		e.stopPropagation();
		setWindows(prev =>
			prev.map(w => (w.id === windowState.id ? { ...w, isMinimized: true } : w)),
		);
	};

	const handleFocus = () => {
		setActiveId(windowState.id);
	};

	if (windowState.isMinimized) return null;

	return (
		<Rnd
			default={{
				x: windowState.position?.x || 100,
				y: windowState.position?.y || 100,
				width: 600,
				height: 400,
			}}
			position={isMobile ? { x: 0, y: 0 } : undefined}
			size={isMobile ? { width: '100%', height: '100%' } : undefined}
			disableDragging={isMobile}
			enableResizing={!isMobile}
			minWidth={300}
			minHeight={200}
			bounds="window"
			dragHandleClassName="window-handle"
			className="z-50"
			onDragStart={handleFocus}
			onClick={handleFocus}
		>
			<div
				className={cn(
					'h-full flex flex-col overflow-hidden border bg-[#0c0c0c] shadow-2xl transition-colors',
					isActive
						? 'border-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.1)]'
						: 'border-[#333]',
				)}
			>
				{/* Title Bar */}
				<div
					className={cn(
						'window-handle h-8 flex items-center px-2 select-none justify-between border-b transition-colors',
						isActive
							? 'bg-[#00ff41] text-black border-[#00ff41]'
							: 'bg-[#111] text-[#666] border-[#333]',
					)}
				>
					<div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider uppercase">
						<span>[{isActive ? 'ACTIVE' : 'INACTIVE'}]</span>
						<span>{windowState.title}</span>
					</div>

					<div className="flex items-center gap-1">
						<button
							onClick={handleMinimize}
							className={cn(
								'w-5 h-5 flex items-center justify-center hover:bg-black/20 transition-colors',
								isActive ? 'text-black' : 'text-[#666] hover:text-[#ccc]',
							)}
						>
							<Minus className="w-3 h-3" />
						</button>
						<button
							className={cn(
								'w-5 h-5 flex items-center justify-center hover:bg-black/20 transition-colors',
								isActive ? 'text-black' : 'text-[#666] hover:text-[#ccc]',
							)}
						>
							<Square className="w-3 h-3" />
						</button>
						<button
							onClick={handleClose}
							className={cn(
								'w-5 h-5 flex items-center justify-center hover:bg-black/20 transition-colors',
								isActive ? 'text-black' : 'text-[#666] hover:text-[#ccc]',
							)}
						>
							<X className="w-3 h-3" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-hidden relative bg-[#0c0c0c] text-[#ccc] font-mono">
					{/* Scanline overlay for content */}
					<div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-1 bg-size-[100%_2px,3px_100%] opacity-20"></div>
					<div className="relative z-10 h-full overflow-auto">
						{windowState.component}
					</div>
				</div>
			</div>
		</Rnd>
	);
}
