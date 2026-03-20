'use client';

import React, { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Linkedin, Github, Mail, Twitter, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PANEL_TOKENS } from '@/theme/colors/tokens';
import { publicService } from '@/api';
import type { Profile } from '@/api/schema';

const SOCIAL_ICONS: Record<string, React.ElementType<{ className?: string }>> = {
	GitHub: Github,
	Twitter: Twitter,
	LinkedIn: Linkedin,
	Website: Globe,
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
			<Icon className={cn(PANEL_TOKENS.icons.md, 'transition-transform group-hover:scale-110')} />
		</a>
	);
});

// ============================================================================
// Sidebar Profile Component
// ============================================================================

export const SidebarProfile = memo(function SidebarProfile() {
	const [profile, setProfile] = useState<Profile | null>(null);

	useEffect(() => {
		publicService.getProfile().then(({ data }) => setProfile(data)).catch(console.error);
	}, []);

	return (
		<div className="bg-transparent flex flex-col shrink-0">
			{/* Profile Section */}
			<div className="p-2 sm:p-3 border-b border-sidebar-border/20 bg-transparent">
				{/* Avatar + Info Row */}
				<div className="flex items-center gap-2 sm:gap-3 mb-3">
					{/* Avatar */}
					<div className="relative shrink-0">
						<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-border/40 ring-1 ring-emerald-400/20">
							{profile?.avatarUrl ? (
								<img 
									src={profile.avatarUrl} 
									alt={profile.name} 
									className="w-full h-full object-cover" 
								/>
							) : (
								<Image
									src="/logo.png"
									alt="AnuragOS Logo"
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
								'rounded-full border-2 border-background animate-pulse',
							)}
						/>
					</div>

					{/* Info */}
					<div className="min-w-0 flex-1">
						<h3 className="font-semibold text-xs sm:text-sm text-foreground truncate leading-tight">
							{profile?.name || 'Anurag Basuri'}
						</h3>
						<p className="text-[9px] sm:text-[10px] text-muted-foreground font-mono truncate">
							{profile?.header ? profile.header.split(',')[0] : 'Full Stack Engineer'}
						</p>
					</div>
				</div>

				{/* Social Links */}
				<div className="grid gap-1.5 relative z-10" onClick={e => e.stopPropagation()}>
					<div className="flex flex-wrap gap-1.5 justify-start">
						{(profile?.socialLinks ?? []).length > 0 ? (
							(profile?.socialLinks ?? []).map(social => {
								const Icon = SOCIAL_ICONS[social.platform] || Globe;
								return (
									<SocialButton
										key={social.platform}
										href={social.url}
										icon={Icon}
										label={social.platform}
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
				</div>
			</div>
		</div>
	);
});
