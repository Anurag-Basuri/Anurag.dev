'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useContextMenu } from '@/components/providers/context-menu-provider';
import { motion, AnimatePresence } from 'framer-motion';
import {
	RefreshCw,
	Monitor,
	Settings,
	Terminal,
	Github,
	Maximize,
	LogOut,
	Sun,
	Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSetAtom } from 'jotai';
import { terminalCollapsedAtom } from '@/store/atoms';

export function DesktopContextMenu() {
	const { isOpen, position, type, hideMenu } = useContextMenu();
	const menuRef = useRef<HTMLDivElement>(null);
	const { theme, setTheme } = useTheme();
	const setTerminalCollapsed = useSetAtom(terminalCollapsedAtom);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Adjust position to keep menu on screen
	const [adjustedPosition, setAdjustedPosition] = useState(position);

	useEffect(() => {
		if (isOpen && menuRef.current) {
			const { innerWidth, innerHeight } = window;
			const { offsetWidth, offsetHeight } = menuRef.current;

			let x = position.x;
			let y = position.y;

			if (x + offsetWidth > innerWidth) x = innerWidth - offsetWidth - 10;
			if (y + offsetHeight > innerHeight) y = innerHeight - offsetHeight - 10;

			setAdjustedPosition({ x, y });
		}
	}, [isOpen, position]);

	if (!isMounted) return null;

	const menuItems = [
		{
			label: 'Refresh',
			icon: RefreshCw,
			shortcut: 'F5',
			action: () => window.location.reload(),
		},
		{ type: 'separator' },
		{
			label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
			icon: theme === 'dark' ? Sun : Moon,
			action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
		},
		{
			label: 'Toggle Terminal',
			icon: Terminal,
			shortcut: 'Ctrl+`',
			action: () => setTerminalCollapsed((prev: boolean) => !prev),
		},
		{ type: 'separator' },
		{
			label: 'Source Code',
			icon: Github,
			action: () =>
				window.open('https://github.com/Anurag-Basuri/personal_portfolio', '_blank'),
		},
	];

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					ref={menuRef}
					initial={{ opacity: 0, scale: 0.95, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 10 }}
					transition={{ duration: 0.15, ease: 'easeOut' }}
					className="fixed z-9999 min-w-[220px] bg-background/80 backdrop-blur-xl border border-border/40 rounded-lg shadow-2xl overflow-hidden py-1.5"
					style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
					onContextMenu={e => e.preventDefault()}
				>
					{menuItems.map((item, index) => {
						if (item.type === 'separator') {
							return <div key={index} className="h-px bg-border/40 my-1 mx-2" />;
						}

						// Type guard to ensure item properties exist
						if (!item.label || !item.action) return null;

						const Icon = item.icon || Settings;

						return (
							<button
								key={index}
								onClick={() => {
									item.action();
									hideMenu();
								}}
								className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-colors group relative"
							>
								<Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
								<span>{item.label}</span>
								{item.shortcut && (
									<span className="ml-auto text-[10px] text-muted-foreground/50 font-mono tracking-wider">
										{item.shortcut}
									</span>
								)}
							</button>
						);
					})}
				</motion.div>
			)}
		</AnimatePresence>
	);
}
