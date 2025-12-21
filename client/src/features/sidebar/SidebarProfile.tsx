'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { Download, Linkedin, Github, Mail, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSetAtom } from 'jotai';
import { folderExpansionSignalAtom } from '@/store';
import { SidebarControls } from '@/components/common/WindowControls';

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
			{/* Header - standardized to h-7 */}
			<header className="h-7 px-2 border-b border-white/5 bg-zinc-900/90 backdrop-blur-sm flex items-center justify-between shrink-0 select-none z-20 relative">
				<div className="flex items-center gap-2">
					<SidebarControls
						onClose={onCollapse}
						onMaximize={onExpand}
						onToggleFolders={() => setFolderSignal(prev => prev + 1)}
					/>

					{/* Separator */}
					<div className="h-3.5 w-px bg-white/10" aria-hidden="true" />

					{/* Explorer Title */}
					<div className="flex items-center gap-1.5 text-xs font-mono">
						<FolderOpen className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
						<span className="text-emerald-300 font-medium tracking-tight">
							EXPLORER
						</span>
					</div>
				</div>
			</header>

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
