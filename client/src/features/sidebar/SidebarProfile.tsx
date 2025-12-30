'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { Linkedin, Github, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PANEL_TOKENS } from '@/lib/constants';

// ============================================================================
// Social Button Component
// ============================================================================

interface SocialButtonProps {
	href: string;
	icon: React.ElementType<{ className?: string }>;
	label: string;
}

const SocialButton = memo(function SocialButton({ href, icon: Icon, label }: SocialButtonProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				'group flex-1 flex items-center justify-center h-7 rounded',
				'border border-border/40 bg-card/50',
				'hover:bg-emerald-500/10 hover:border-emerald-500/30',
				'transition-all duration-200',
				'text-muted-foreground hover:text-emerald-400',
				'hover:-translate-y-0.5',
				PANEL_TOKENS.accent.glowBg.replace('shadow-', 'hover:shadow-'),
			)}
			title={label}
		>
			<Icon
				className={cn(PANEL_TOKENS.icons.md, 'transition-transform group-hover:scale-110')}
			/>
		</a>
	);
});

// ============================================================================
// Sidebar Profile Component
// ============================================================================

export const SidebarProfile = memo(function SidebarProfile() {
	return (
		<div className="bg-transparent flex flex-col shrink-0">
			{/* Profile Section */}
			<div className="p-3 border-b border-sidebar-border/20 bg-white/2">
				{/* Avatar + Info Row */}
				<div className="flex items-center gap-3 mb-2">
					{/* Avatar */}
					<div className="relative shrink-0">
						<div className="w-10 h-10 rounded-full overflow-hidden border border-border/40 ring-1 ring-emerald-400/20">
							<Image
								src="/logo.png"
								alt="AnuragOS Logo"
								width={40}
								height={40}
								className="w-full h-full object-cover"
								priority
							/>
						</div>
						{/* Online indicator */}
						<div
							className={cn(
								'absolute -bottom-0.5 -right-0.5 w-3 h-3',
								'bg-primary rounded-full border-2 border-background',
								'shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse',
							)}
						/>
					</div>

					{/* Info */}
					<div className="min-w-0 flex-1">
						<h3 className="font-semibold text-sm text-foreground truncate leading-tight">
							Anurag Basuri
						</h3>
						<p className="text-[10px] text-muted-foreground font-mono truncate">
							Full Stack Engineer
						</p>
					</div>
				</div>

				{/* Social Links */}
				<div className="grid gap-1.5 relative z-10" onClick={e => e.stopPropagation()}>
					<div className="flex gap-1.5">
						<SocialButton
							href="https://linkedin.com/in/anurag-basuri"
							icon={Linkedin}
							label="LinkedIn"
						/>
						<SocialButton
							href="https://github.com/Anurag-Basuri"
							icon={Github}
							label="GitHub"
						/>
						<SocialButton href="mailto:contact@anurag.dev" icon={Mail} label="Email" />
					</div>
				</div>
			</div>
		</div>
	);
});
