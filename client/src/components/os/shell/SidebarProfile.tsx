'use client';

import React from 'react';
import Image from 'next/image';
import { Download, Linkedin, Github, Mail, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSetAtom } from 'jotai';
import { folderExpansionSignalAtom } from '@/store';
import { SidebarControls } from '@/components/shared/WindowControls';

interface SidebarProfileProps {
	onCollapse?: () => void;
	onExpand?: () => void;
}

export function SidebarProfile({ onCollapse, onExpand }: SidebarProfileProps) {
	const setFolderSignal = useSetAtom(folderExpansionSignalAtom);

	return (
		<div className="bg-transparent">
			{/* Header - standardized to h-10 (mobile) / h-8 (desktop) */}
			<header className="h-10 sm:h-8 px-2 sm:px-3 border-b border-white/5 flex items-center justify-between shrink-0 select-none">
				{/* Left: Traffic Lights + Title */}
				<div className="flex items-center gap-2.5">
					{/* macOS Traffic Lights - Hidden on mobile */}
					<div className="hidden md:flex items-center gap-1.5 group">
						<SidebarControls
							onClose={onCollapse}
							onMaximize={onExpand}
							onToggleFolders={() => setFolderSignal(prev => prev + 1)}
						/>
					</div>

					{/* Separator */}
					<div className="h-4 w-px bg-border/40" aria-hidden="true" />

					{/* Explorer Title */}
					<div className="flex items-center gap-1.5 text-xs font-mono">
						<FolderOpen className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
						<span className="text-muted-foreground font-medium">Explorer</span>
					</div>
				</div>
			</header>

			{/* Profile Section - compact */}
			<div className="p-3 border-b border-sidebar-border/20">
				<div className="flex items-center gap-3">
					{/* Avatar */}
					<div className="relative shrink-0">
						<div className="w-10 h-10 rounded-full overflow-hidden border border-border/40">
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
						<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />
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

				{/* Action Buttons - minimal */}
				<div className="mt-3 grid gap-2 relative z-10" onClick={e => e.stopPropagation()}>
					<a
						href="/resume.pdf"
						target="_blank"
						className="flex items-center justify-center gap-1.5 h-7 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 rounded text-[10px] font-medium text-emerald-400 transition-all hover:shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:-translate-y-0.5 cursor-pointer"
					>
						<Download className="w-3 h-3" />
						<span className="uppercase tracking-wider">Resume</span>
					</a>

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
}

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
			className="flex-1 flex items-center justify-center h-7 rounded border border-border/40 bg-card/50 hover:bg-white/10 hover:border-white/20 transition-all text-muted-foreground hover:text-white hover:-translate-y-0.5 hover:shadow-sm"
			title={label}
		>
			<Icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
		</a>
	);
}
