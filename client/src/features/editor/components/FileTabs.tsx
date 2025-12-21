'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getModuleMetadata } from '@/lib/routes';
import type { OpenFile } from '@/store';

interface FileTabsProps {
	openFiles: OpenFile[];
	onTabClick: (moduleId: string) => void;
	onTabClose: (moduleId: string, e: React.MouseEvent) => void;
}

export function FileTabs({ openFiles, onTabClick, onTabClose }: FileTabsProps) {
	const pathname = usePathname();

	// Get current module from pathname
	const currentModule = pathname.split('/').filter(Boolean).pop() || null;

	if (openFiles.length === 0) return null;

	return (
		<div className="h-8 flex items-center overflow-x-auto bg-zinc-900/50 border-b border-white/5 scrollbar-hide">
			<div className="flex items-center px-1 gap-0.5">
				{openFiles.map(file => {
					const isActive = file.moduleId === currentModule;
					const metadata = getModuleMetadata(file.moduleId);

					return (
						<motion.button
							key={file.moduleId}
							initial={{ opacity: 0, width: 0 }}
							animate={{ opacity: 1, width: 'auto' }}
							exit={{ opacity: 0, width: 0 }}
							transition={{ duration: 0.2 }}
							onClick={() => onTabClick(file.moduleId)}
							className={cn(
								'group relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-t-md transition-all',
								'hover:bg-white/5 min-w-[120px] max-w-[200px]',
								isActive
									? 'bg-card/80 text-white border-t border-x border-white/10'
									: 'bg-transparent text-white/60 hover:text-white/80',
							)}
						>
							{/* Tab content */}
							<span className="truncate flex-1 text-left">{metadata.title}</span>

							{/* Close button */}
							<button
								onClick={e => onTabClose(file.moduleId, e)}
								className={cn(
									'shrink-0 w-4 h-4 rounded flex items-center justify-center',
									'opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity',
									isActive && 'opacity-60',
								)}
								aria-label={`Close ${metadata.title}`}
							>
								<X className="w-3 h-3" />
							</button>

							{/* Active indicator */}
							{isActive && (
								<motion.div
									layoutId="activeTab"
									className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
									transition={{ type: 'spring', stiffness: 300, damping: 30 }}
								/>
							)}
						</motion.button>
					);
				})}
			</div>
		</div>
	);
}
