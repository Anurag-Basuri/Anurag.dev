'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { Linkedin, Github, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSetAtom } from 'jotai';
import { folderExpansionSignalAtom } from '@/store';

interface SidebarProfileProps {
	onCollapse?: () => void;
	onExpand?: () => void;
}

export const SidebarProfile = memo(function SidebarProfile({
	onCollapse,
	onExpand,
}: SidebarProfileProps) {
	const setFolderSignal = useSetAtom(folderExpansionSignalAtom);

	return (
		<div className="bg-transparent flex flex-col shrink-0">
			{/* Profile Section - compact with better grouping */}
			<div className="p-3 border-b border-sidebar-border/20 bg-white/2">
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
						<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
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

				{/* Action Buttons - grouped closer */}
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

function SocialButton({
	href,
	icon: Icon,
	label,
}: {
	href: string;
	icon: React.ElementType<{ className?: string }>;
	label: string;
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="group flex-1 flex items-center justify-center h-7 rounded border border-border/40 bg-card/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all text-muted-foreground hover:text-emerald-400 hover:-translate-y-0.5 hover:shadow-[0_0_8px_rgba(52,211,153,0.3)]"
			title={label}
		>
			<Icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
		</a>
	);
}
