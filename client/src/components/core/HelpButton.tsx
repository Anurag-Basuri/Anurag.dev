'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Terminal, Folder, Key } from 'lucide-react';

export function HelpButton() {
	const [isOpen, setIsOpen] = useState(false);

	const commands = [
		{ cmd: 'help', desc: 'Show all commands' },
		{ cmd: 'about', desc: 'Learn about me' },
		{ cmd: 'projects', desc: 'View my projects' },
		{ cmd: 'ls', desc: 'List files' },
		{ cmd: 'cd [folder]', desc: 'Navigate folders' },
		{ cmd: 'clear', desc: 'Clear terminal' },
	];

	return (
		<>
			{/* Help Button */}
			<motion.button
				initial={{ scale: 0, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ delay: 1, type: 'spring' }}
				onClick={() => setIsOpen(!isOpen)}
				className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
				aria-label="Help"
			>
				<HelpCircle className="w-6 h-6" />
				<span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
			</motion.button>

			{/* Help Popover */}
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsOpen(false)}
							className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
						/>

						{/* Popover */}
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							transition={{ type: 'spring', duration: 0.3 }}
							className="fixed bottom-24 right-6 z-50 w-80"
						>
							<div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden">
								{/* Header */}
								<div className="p-4 border-b border-border/50 bg-linear-to-r from-primary/10 to-accent/10 flex justify-between items-center">
									<h3 className="font-semibold flex items-center gap-2">
										<Terminal className="w-4 h-4" />
										Quick Help
									</h3>
									<button
										onClick={() => setIsOpen(false)}
										className="p-1 hover:bg-muted/50 rounded transition-colors"
									>
										<X className="w-4 h-4" />
									</button>
								</div>

								{/* Content */}
								<div className="p-4 space-y-4">
									<div>
										<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
											Common Commands
										</h4>
										<div className="space-y-2">
											{commands.map((item, i) => (
												<div
													key={i}
													className="flex items-start gap-3 p-2 rounded hover:bg-muted/30 transition-colors group"
												>
													<code className="text-xs bg-muted px-2 py-1 rounded font-mono text-primary shrink-0">
														{item.cmd}
													</code>
													<span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
														{item.desc}
													</span>
												</div>
											))}
										</div>
									</div>

									<div className="pt-3 border-t border-border/50">
										<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
											Tips
										</h4>
										<ul className="space-y-2 text-xs text-muted-foreground">
											<li className="flex items-start gap-2">
												<Folder className="w-3 h-3 mt-0.5 shrink-0" />
												<span>Click files in Explorer to open them</span>
											</li>
											<li className="flex items-start gap-2">
												<Key className="w-3 h-3 mt-0.5 shrink-0" />
												<span>Press Tab to autocomplete commands</span>
											</li>
											<li className="flex items-start gap-2">
												<Terminal className="w-3 h-3 mt-0.5 shrink-0" />
												<span>Use ↑/↓ arrows for command history</span>
											</li>
										</ul>
									</div>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}
