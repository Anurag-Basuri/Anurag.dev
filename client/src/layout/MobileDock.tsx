'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { User, Briefcase, GraduationCap, Award, Mail, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SECTIONS } from '@/lib/sections';

const DOCK_ITEMS = [
	{ id: 'profile', label: 'Profile', icon: User },
	{ id: 'projects', label: 'Projects', icon: Briefcase },
	{ id: 'experience', label: 'Journey', icon: GraduationCap },
	{ id: 'achievements', label: 'Awards', icon: Award },
	{ id: 'contact', label: 'Contact', icon: Mail },
];

/**
 * MobileDock: Floating frosted navigation dock displayed only on screens < 768px (mobile).
 * Provides 1-tap seamless navigation without sacrificing screen estate to desktop sidebars.
 */
export function MobileDock() {
	const [activeSectionId, setActiveSectionId] = useState('profile');

	useEffect(() => {
		const handler = (e: CustomEvent<{ sectionId: string }>) => {
			if (e.detail?.sectionId) {
				setActiveSectionId(e.detail.sectionId);
			}
		};
		window.addEventListener('sidebar-active-section', handler as EventListener);
		return () => window.removeEventListener('sidebar-active-section', handler as EventListener);
	}, []);

	const scrollTo = useCallback((sectionId: string) => {
		setActiveSectionId(sectionId);
		window.dispatchEvent(
			new CustomEvent('scroll-to-section', {
				detail: { sectionId },
			}),
		);
	}, []);

	return (
		<nav
			aria-label="Mobile Navigation"
			className="flex md:hidden fixed bottom-3 inset-x-0 mx-auto w-fit z-40 items-center justify-center pointer-events-auto"
		>
			<div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface-1/90 backdrop-blur-xl border border-border/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
				{DOCK_ITEMS.map(item => {
					const Icon = item.icon;
					const isActive = activeSectionId === item.id;

					return (
						<button
							key={item.id}
							onClick={() => scrollTo(item.id)}
							aria-label={item.label}
							className={cn(
								'relative p-2 rounded-full transition-all duration-200 select-none flex items-center justify-center cursor-pointer',
								isActive
									? 'text-primary font-bold'
									: 'text-muted-foreground hover:text-foreground active:scale-95',
							)}
						>
							{isActive && (
								<motion.div
									layoutId="mobile-dock-active-pill"
									className="absolute inset-0 rounded-full bg-primary/15 border border-primary/30"
									transition={{ type: 'spring', stiffness: 400, damping: 30 }}
								/>
							)}
							<Icon className="w-4 h-4 relative z-10" />
						</button>
					);
				})}
			</div>
		</nav>
	);
}
