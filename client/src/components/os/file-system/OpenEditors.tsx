'use client';

import { useAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getModuleIcon } from '@/lib/moduleRegistry';
import { activeWindowIdAtom, windowStackAtom, windowsAtom } from '@/store/atoms';
import { WindowState } from '@/types/window';

export function OpenEditors() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const [windowStack, setWindowStack] = useAtom(windowStackAtom);

	const ordered: WindowState[] = windowStack
		.map(id => windows.find(w => w.id === id))
		.filter(Boolean) as WindowState[];

	const focusWindow = (id: string) => {
		setWindows(ws => ws.map(w => (w.id === id ? { ...w, isMinimized: false } : w)));
		setActiveWindowId(id);
		setWindowStack(prev => [...prev.filter(w => w !== id), id]);
	};

	const closeWindow = (id: string) => {
		setWindows(ws => ws.filter(w => w.id !== id));
		setWindowStack(prev => prev.filter(w => w !== id));
		if (activeWindowId === id) {
			setActiveWindowId(windowStack.filter(w => w !== id).at(-1) ?? null);
		}
	};

	return (
		<div className="space-y-1">
			<AnimatePresence initial={false}>
				{ordered.map(win => {
					const Icon = getModuleIcon(win.id);
					const isActive = win.id === activeWindowId && !win.isMinimized;
					return (
						<motion.button
							key={win.id}
							layout
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -6 }}
							onClick={() => focusWindow(win.id)}
							className={cn(
								'w-full flex items-center justify-between px-3 py-2 rounded-md border text-left transition-all duration-200',
								'hover:border-primary/40 hover:bg-primary/5',
								isActive
									? 'border-primary/50 bg-primary/10 text-foreground'
									: 'border-border/50 text-muted-foreground',
							)}
						>
							<span className="flex items-center gap-2">
								<Icon className="w-4 h-4 opacity-80" />
								<span className="text-xs font-medium truncate">{win.title}</span>
							</span>
							<X
								className="w-3.5 h-3.5 opacity-60 hover:opacity-100"
								onClick={e => {
									e.stopPropagation();
									closeWindow(win.id);
								}}
							/>
						</motion.button>
					);
				})}
			</AnimatePresence>
			{ordered.length === 0 && (
				<div className="text-[11px] text-muted-foreground/70 px-1 py-2 border border-dashed border-border/60 rounded-md">
					No editors open yet.
				</div>
			)}
		</div>
	);
}
