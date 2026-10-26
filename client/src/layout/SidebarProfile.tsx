'use client';

import React, { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Github, Mail, Twitter, Globe, Instagram, Youtube, Facebook, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PANEL_TOKENS } from '@/theme/colors/tokens';
import { useProfile } from '@/api';

const SOCIAL_ICONS: Record<string, React.ElementType<{ className?: string }>> = {
	GITHUB: Github,
	LINKEDIN: Linkedin,
	TWITTER: Twitter,
	X: Twitter,
	REDDIT: MessageCircle,
	INSTAGRAM: Instagram,
	FACEBOOK: Facebook,
	YOUTUBE: Youtube,
	DISCORD: MessageCircle,
	TELEGRAM: MessageCircle,
	WHATSAPP: MessageCircle,
	WEBSITE: Globe,
	OTHER: Globe,
};

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
			<Icon className={cn(PANEL_TOKENS.icons.md, 'transition-transform duration-300 group-hover:scale-125')} />
		</a>
	);
});

// ============================================================================
// Sidebar Profile Component
// ============================================================================

export const SidebarProfile = memo(function SidebarProfile({ isCollapsed }: { isCollapsed?: boolean }) {
	const { profile } = useProfile();

	return (
		<div className="bg-transparent flex flex-col shrink-0">
			{/* Profile Section */}
			<div className={cn("p-2 sm:p-3 border-b border-sidebar-border/20 bg-transparent flex flex-col transition-all duration-300", isCollapsed ? "items-center" : "")}>
				{/* Avatar + Info Row */}
				<div className={cn("flex items-center w-full transition-all duration-300", isCollapsed ? "justify-center mb-0" : "gap-2 sm:gap-3 mb-3")}>
					{/* Avatar */}
					<div className={cn("relative shrink-0 transition-all duration-500", isCollapsed ? "w-12 h-12 mb-2 mt-2" : "w-10 h-10 sm:w-12 sm:h-12")}>
						<div className="w-full h-full rounded-full overflow-hidden border border-border/60 ring-2 ring-emerald-400/20 shadow-sm">
							{profile?.avatarUrl ? (
								<img 
									src={profile.avatarUrl} 
									alt={profile.name} 
									className="w-full h-full object-cover" 
								/>
							) : (
								<Image
									src="/logo.png"
									alt="Anurag.dev Logo"
									width={40}
									height={40}
									className="w-full h-full object-cover"
									priority
								/>
							)}
						</div>
						{/* Online indicator */}
						<div
							className={cn(
								'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3',
								profile?.openToWork ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-primary shadow-[0_0_8px_rgba(52,211,153,0.6)]',
								'rounded-full border-2 border-background',
							)}
						/>
					</div>

					{/* Info */}
					<AnimatePresence>
						{!isCollapsed && (
							<motion.div 
								initial={{ width: 0, opacity: 0 }}
								animate={{ width: 'auto', opacity: 1 }}
								exit={{ width: 0, opacity: 0, overflow: 'hidden' }}
								className="min-w-0 flex-1 whitespace-nowrap overflow-hidden"
							>
								<h3 className="font-semibold text-sm sm:text-base text-foreground truncate leading-tight">
									{profile?.name || 'Anurag Basuri'}
								</h3>
								<p className="text-xs text-muted-foreground/80 font-normal truncate mt-0.5">
									{profile?.Tagline || 'Software Engineer'}
								</p>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Social Links */}
				<AnimatePresence>
					{!isCollapsed && (
						<motion.div 
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
							className="grid gap-2 relative z-10 w-full" 
							onClick={e => e.stopPropagation()}
						>
							<div className="flex flex-wrap gap-2 justify-start mt-2">
								{(profile?.socialLinks ?? []).length > 0 ? (
									(profile?.socialLinks ?? []).map((social, index) => {
										const Icon = SOCIAL_ICONS[social.platform] || Globe;
										return (
											<SocialButton
												key={social.id || `${social.platform}-${index}`}
												href={social.url}
												icon={Icon}
												label={social.customLabel || social.platform}
											/>
										);
									})
								) : (
									<>
										<SocialButton href="https://linkedin.com" icon={Linkedin} label="LinkedIn" />
										<SocialButton href="https://github.com" icon={Github} label="GitHub" />
										<SocialButton href="mailto:contact@example.com" icon={Mail} label="Email" />
									</>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
});
