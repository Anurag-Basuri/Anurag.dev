'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { FileSystemItem } from '@/lib/filesystem';
import {
	User,
	Briefcase,
	GraduationCap,
	Layers,
	Trophy,
	ShieldCheck,
	Feather,
	Activity,
	Send,
	ChevronRight,
	File,
} from 'lucide-react';

interface TableOfContentsProps {
	items: FileSystemItem[];
	activeSectionId: string | null;
	onSelect: (item: FileSystemItem) => void;
}

const getSectionIcon = (id: string, className: string) => {
	switch (id) {
		case 'profile':
			return <User className={cn(className, 'text-pink-400')} />;
		case 'experience':
			return <Briefcase className={cn(className, 'text-purple-400')} />;
		case 'education':
			return <GraduationCap className={cn(className, 'text-blue-400')} />;
		case 'projects':
			return <Layers className={cn(className, 'text-yellow-400')} />;
		case 'achievements':
			return <Trophy className={cn(className, 'text-orange-400')} />;
		case 'certifications':
			return <ShieldCheck className={cn(className, 'text-emerald-400')} />;
		case 'blog':
			return <Feather className={cn(className, 'text-sky-400')} />;
		case 'coding_stats':
			return <Activity className={cn(className, 'text-red-400')} />;
		case 'contact':
			return <Send className={cn(className, 'text-indigo-400')} />;
		default:
			return <File className={cn(className, 'text-muted-foreground')} />;
	}
};

export function TableOfContents({ items, activeSectionId, onSelect }: TableOfContentsProps) {
	return (
		<div className="flex flex-col gap-1 w-full relative p-2">
			{items.map((item, idx) => {
				const isActive = activeSectionId === item.id || activeSectionId === item.moduleId;

				return (
					<button
						key={item.id}
						onClick={() => onSelect(item)}
						className={cn(
							'relative flex items-center gap-4 w-full px-4 py-3 text-left rounded-xl transition-all duration-300 overflow-hidden group',
							isActive
								? 'text-primary bg-primary/5 font-semibold shadow-sm'
								: 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
						)}
					>
						{/* Active Background Indicator */}
						{isActive && (
							<motion.div
								layoutId="active-toc-bg"
								className="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent rounded-xl -z-10"
								transition={{ type: 'spring', stiffness: 400, damping: 35 }}
							/>
						)}

						{/* Small glow line on the left for active */}
						{isActive && (
							<motion.div
								layoutId="active-toc-line"
								className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-primary rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
							/>
						)}

						{/* Dynamic Icon */}
						<div
							className={cn(
								'flex items-center justify-center shrink-0 w-8 h-8 rounded-lg transition-transform duration-300',
								isActive
									? 'scale-110 bg-background/50 shadow-sm'
									: 'group-hover:scale-110',
							)}
						>
							{getSectionIcon(item.id, 'w-4 h-4')}
						</div>

						{/* File Name (Creative Label) */}
						<span className="truncate text-[13px] tracking-wider uppercase mt-0.5">
							{item.name}
						</span>

						{/* Arrow on hover/active */}
						<ChevronRight
							className={cn(
								'w-4 h-4 ml-auto transition-all duration-300',
								isActive
									? 'opacity-100 translate-x-0 text-primary'
									: 'opacity-0 -translate-x-4 group-hover:opacity-40 group-hover:translate-x-0',
							)}
						/>
					</button>
				);
			})}
		</div>
	);
}

