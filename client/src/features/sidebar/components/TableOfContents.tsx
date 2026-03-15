'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { FileSystemItem } from '@/data/filesystem';
import { File, ChevronRight } from 'lucide-react';

interface TableOfContentsProps {
	items: FileSystemItem[];
	activeSectionId: string | null;
	onSelect: (item: FileSystemItem) => void;
}

export function TableOfContents({ items, activeSectionId, onSelect }: TableOfContentsProps) {
	return (
		<div className="flex flex-col gap-1 w-full relative">
			{items.map((item, idx) => {
				const isActive = activeSectionId === item.id || activeSectionId === item.moduleId;

				return (
					<button
						key={item.id}
						onClick={() => onSelect(item)}
						className={cn(
							'relative flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg transition-colors overflow-hidden group',
							isActive
								? 'text-primary bg-primary/10 font-medium'
								: 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
						)}
					>
						{/* Active Background Indicator */}
						{isActive && (
							<motion.div
								layoutId="active-toc-bg"
								className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
								transition={{ type: 'spring', stiffness: 300, damping: 30 }}
							/>
						)}

						{/* Small glow line on the left for active */}
						{isActive && (
							<motion.div
								layoutId="active-toc-line"
								className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-primary rounded-r-full"
							/>
						)}

						{/* Icon / File Extension styled */}
						<div className="flex items-center justify-center shrink-0 w-5 h-5 opacity-70">
							{item.name.endsWith('.md') ? (
								<span className="text-xs font-bold text-blue-400">MD</span>
							) : item.name.endsWith('.pdf') ? (
								<span className="text-xs font-bold text-red-400">PDF</span>
							) : item.name.endsWith('.sh') ? (
								<span className="text-xs font-bold text-green-400">SH</span>
							) : item.name.endsWith('.app') ? (
								<span className="text-xs font-bold text-yellow-400">APP</span>
							) : item.name.endsWith('.log') ? (
								<span className="text-xs font-bold text-purple-400">LOG</span>
							) : item.name.endsWith('.ai') ? (
								<span className="text-[10px] font-bold text-emerald-400">AI</span>
							) : item.name.endsWith('.me') ? (
								<span className="text-xs font-bold text-pink-400">ME</span>
							) : (
								<File className="w-4 h-4" />
							)}
						</div>

						{/* File Name */}
						<span className="truncate text-sm tracking-wide mt-0.5">
							{item.name}
						</span>
						
						{/* Arrow on hover */}
						<ChevronRight className={cn(
							"w-4 h-4 ml-auto opacity-0 -translate-x-2 transition-all duration-300",
							isActive ? "opacity-100 translate-x-0" : "group-hover:opacity-50 group-hover:translate-x-0"
						)} />
					</button>
				);
			})}
		</div>
	);
}
