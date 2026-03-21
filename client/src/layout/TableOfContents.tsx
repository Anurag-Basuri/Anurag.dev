'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SECTION_THEMES, DEFAULT_THEME } from '@/lib/theme';
import type { SectionConfig } from '@/lib/sections';
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
	items: SectionConfig[];
	activeSectionId: string | null;
	onSelect: (item: SectionConfig) => void;
	isCollapsed?: boolean;
}

const getSectionIcon = (id: string, className: string, isActive: boolean) => {
	const theme = SECTION_THEMES[id] || DEFAULT_THEME;
	const iconColor = isActive ? theme.color : theme.color.replace('400', '500/70');
	
	switch (id) {
		case 'profile': return <User className={cn(className, iconColor)} />;
		case 'experience': return <Briefcase className={cn(className, iconColor)} />;
		case 'education': return <GraduationCap className={cn(className, iconColor)} />;
		case 'projects': return <Layers className={cn(className, iconColor)} />;
		case 'achievements': return <Trophy className={cn(className, iconColor)} />;
		case 'certifications': return <ShieldCheck className={cn(className, iconColor)} />;
		case 'blog': return <Feather className={cn(className, iconColor)} />;
		case 'coding_stats': return <Activity className={cn(className, iconColor)} />;
		case 'contact': return <Send className={cn(className, iconColor)} />;
		default: return <File className={cn(className, iconColor)} />;
	}
};

export function TableOfContents({ items, activeSectionId, onSelect, isCollapsed }: TableOfContentsProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// Sync active section to scroll view in the sidebar
	useEffect(() => {
		if (activeSectionId && containerRef.current) {
			const activeEl = containerRef.current.querySelector(`[data-section-id="${activeSectionId}"]`);
			if (activeEl) {
				activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}
		}
	}, [activeSectionId]);

	return (
		<div ref={containerRef} className={cn("flex flex-col w-full relative", isCollapsed ? "h-full justify-between gap-1 py-4 px-1" : "gap-1.5 p-2")}>
			{items.map(item => {
				const isActive = activeSectionId === item.id || activeSectionId === item.moduleId;
				const theme = SECTION_THEMES[item.id] || DEFAULT_THEME;

				return (
					<button
						key={item.id}
						data-section-id={item.id}
						onClick={() => onSelect(item)}
						title={isCollapsed ? item.file : undefined}
						className={cn(
							'relative flex items-center w-full rounded-xl transition-all duration-300 overflow-hidden group',
							isCollapsed ? 'justify-center p-2.5' : 'gap-4 px-4 py-3 text-left',
							isActive
								? cn('font-bold shadow-sm', theme.activeText)
								: cn('text-muted-foreground font-medium', theme.hoverBg, 'hover:scale-[1.02]')
						)}
					>
						{/* Active Background Indicator */}
						{isActive && (
							<motion.div
								layoutId="active-toc-bg"
								className={cn('absolute inset-0 bg-linear-to-r to-transparent rounded-xl -z-10', theme.activeBg)}
								transition={{ type: 'spring', stiffness: 400, damping: 35 }}
							/>
						)}

						{/* Small glow line on the left for active */}
						{!isCollapsed && isActive && (
							<motion.div
								layoutId="active-toc-line"
								className={cn('absolute left-0 top-[20%] bottom-[20%] w-[4px] rounded-r-full', theme.activeGlow)}
							/>
						)}

						{/* Dynamic Icon */}
						<div
							className={cn(
								'flex items-center justify-center shrink-0 w-8 h-8 rounded-lg transition-transform duration-300',
								isActive
									? 'scale-110 shadow-sm bg-background/60'
									: 'group-hover:scale-110 bg-transparent group-hover:bg-background/40',
							)}
						>
							{getSectionIcon(item.id, 'w-[18px] h-[18px]', isActive)}
						</div>

						{/* File Name (Creative Label) */}
						<AnimatePresence>
							{!isCollapsed && (
								<motion.span
									initial={{ opacity: 0, width: 0 }}
									animate={{ opacity: 1, width: 'auto' }}
									exit={{ opacity: 0, width: 0, overflow: 'hidden' }}
									className={cn('truncate text-[13px] tracking-wider uppercase mt-0.5 transition-colors', isActive ? theme.activeText : 'group-hover:text-foreground')}
								>
									{item.file}
								</motion.span>
							)}
						</AnimatePresence>

						{/* Arrow on hover/active */}
						<AnimatePresence>
							{!isCollapsed && (
								<motion.div
									initial={{ opacity: 0, width: 0 }}
									animate={{ opacity: 1, width: 'auto' }}
									exit={{ opacity: 0, width: 0, overflow: 'hidden' }}
									className="ml-auto flex items-center"
								>
									<ChevronRight
										className={cn(
											'w-4 h-4 transition-all duration-300',
											isActive
												? cn('opacity-100 translate-x-0', theme.activeText)
												: 'opacity-0 -translate-x-4 group-hover:opacity-40 group-hover:translate-x-0 group-hover:text-foreground',
										)}
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</button>
				);
			})}
		</div>
	);
}
