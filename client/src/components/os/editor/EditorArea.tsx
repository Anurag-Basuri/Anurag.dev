'use client';

import { useAtom } from 'jotai';
import { windowsAtom } from '@/store/atoms';
import { WindowFrame } from './WindowFrame';

import { motion } from 'framer-motion';
import { Command, MousePointer2 } from 'lucide-react';

export function EditorArea() {
	const [windows] = useAtom(windowsAtom);

	return (
		<div id="editor-boundary" className="h-full w-full relative group">
			{/* Grid Pattern Background */}
			<div
				className="absolute inset-0 pointer-events-none hidden"
				style={{
					backgroundImage:
						'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
					backgroundSize: '24px 24px',
				}}
			/>

			{windows.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3 }}
					className="h-full w-full flex flex-col items-center justify-center text-muted-foreground select-none"
				>
					<div className="relative">
						<div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl animate-pulse" />
						<Command className="w-16 h-16 mb-6 text-muted-foreground/50 relative z-10" />
					</div>
					<h3 className="text-xl font-medium text-foreground/80 mb-2">No Files Open</h3>
					<p className="text-sm text-muted-foreground/60 max-w-xs text-center leading-relaxed">
						Select a file from the explorer or use the terminal to navigate.
					</p>
					<div className="mt-8 flex gap-4 text-xs font-mono text-muted-foreground/40">
						<div className="flex items-center gap-2">
							<span className="px-1.5 py-1 rounded bg-muted/50 border border-border/50">
								⌘
							</span>
							<span>+</span>
							<span className="px-1.5 py-1 rounded bg-muted/50 border border-border/50">
								P
							</span>
							<span>to search</span>
						</div>
					</div>
				</motion.div>
			) : (
				windows.map(window => (
					<WindowFrame key={window.id} windowState={window} bounds="#editor-boundary" />
				))
			)}
		</div>
	);
}
