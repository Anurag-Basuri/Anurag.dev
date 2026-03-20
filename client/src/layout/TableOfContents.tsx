'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
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
}

const SECTION_THEMES: Record<
	string,
	{ color: string; hoverBg: string; activeBg: string; activeText: string; activeGlow: string }
> = {
	profile: { color: 'text-pink-400', hoverBg: 'hover:bg-pink-500/10', activeBg: 'from-pink-500/15', activeText: 'text-pink-400', activeGlow: 'bg-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.6)]' },
	experience: { color: 'text-purple-400', hoverBg: 'hover:bg-purple-500/10', activeBg: 'from-purple-500/15', activeText: 'text-purple-400', activeGlow: 'bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.6)]' },
	education: { color: 'text-blue-400', hoverBg: 'hover:bg-blue-500/10', activeBg: 'from-blue-500/15', activeText: 'text-blue-400', activeGlow: 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.6)]' },
	projects: { color: 'text-yellow-400', hoverBg: 'hover:bg-yellow-500/10', activeBg: 'from-yellow-500/15', activeText: 'text-yellow-400', activeGlow: 'bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)]' },
	achievements: { color: 'text-orange-400', hoverBg: 'hover:bg-orange-500/10', activeBg: 'from-orange-500/15', activeText: 'text-orange-400', activeGlow: 'bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.6)]' },
	certifications: { color: 'text-emerald-400', hoverBg: 'hover:bg-emerald-500/10', activeBg: 'from-emerald-500/15', activeText: 'text-emerald-400', activeGlow: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]' },
	blog: { color: 'text-sky-400', hoverBg: 'hover:bg-sky-500/10', activeBg: 'from-sky-500/15', activeText: 'text-sky-400', activeGlow: 'bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]' },
	coding_stats: { color: 'text-red-400', hoverBg: 'hover:bg-red-500/10', activeBg: 'from-red-500/15', activeText: 'text-red-400', activeGlow: 'bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.6)]' },
	contact: { color: 'text-indigo-400', hoverBg: 'hover:bg-indigo-500/10', activeBg: 'from-indigo-500/15', activeText: 'text-indigo-400', activeGlow: 'bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.6)]' },
};

const DEFAULT_THEME = { color: 'text-muted-foreground', hoverBg: 'hover:bg-muted/10', activeBg: 'from-muted/20', activeText: 'text-foreground', activeGlow: 'bg-foreground shadow-[0_0_12px_rgba(255,255,255,0.3)]' };

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

export function TableOfContents({ items, activeSectionId, onSelect }: TableOfContentsProps) {
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
		<div ref={containerRef} className="flex flex-col gap-1.5 w-full relative p-2">
			{items.map(item => {
				const isActive = activeSectionId === item.id || activeSectionId === item.moduleId;
				const theme = SECTION_THEMES[item.id] || DEFAULT_THEME;

				return (
					<button
						key={item.id}
						data-section-id={item.id}
						onClick={() => onSelect(item)}
						className={cn(
							'relative flex items-center gap-4 w-full px-4 py-3 text-left rounded-xl transition-all duration-300 overflow-hidden group',
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
						{isActive && (
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
						<span className={cn('truncate text-[13px] tracking-wider uppercase mt-0.5 transition-colors', isActive ? theme.activeText : 'group-hover:text-foreground')}>
							{item.file}
						</span>

						{/* Arrow on hover/active */}
						<ChevronRight
							className={cn(
								'w-4 h-4 ml-auto transition-all duration-300',
								isActive
									? cn('opacity-100 translate-x-0', theme.activeText)
									: 'opacity-0 -translate-x-4 group-hover:opacity-40 group-hover:translate-x-0 group-hover:text-foreground',
							)}
						/>
					</button>
				);
			})}
		</div>
	);
}
