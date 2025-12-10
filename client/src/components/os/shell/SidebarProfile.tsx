'use client';

import React from 'react';
import Image from 'next/image';
import { Download, Linkedin, Github, Mail, FolderOpen, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SidebarProfileProps {
	onCollapse?: () => void;
}

export function SidebarProfile({ onCollapse }: SidebarProfileProps) {
	return (
		<div className="bg-transparent">
			{/* Header - matching terminal style (h-6) */}
			<header className="h-6 px-2 border-b border-white/8 bg-[#161b22] flex items-center justify-between shrink-0 select-none">
				{/* Left: Traffic Lights + Title */}
				<div className="flex items-center gap-2">
					{/* macOS Traffic Lights */}
					<div className="flex items-center gap-1.5">
						<motion.button
							whileHover={{ scale: 1.15 }}
							whileTap={{ scale: 0.95 }}
							onClick={onCollapse}
							className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] hover:bg-[#ff6961] transition-colors flex items-center justify-center group/btn"
							aria-label="Collapse sidebar"
							title="Collapse"
						>
							<Minus className="w-1.5 h-1.5 text-[#990000] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
						</motion.button>
						<div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
						<div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
					</div>

					{/* Separator */}
					<div className="h-3 w-px bg-white/8" aria-hidden="true" />

					{/* Explorer Title */}
					<div className="flex items-center gap-1.5 text-[10px] font-mono">
						<FolderOpen className="w-3 h-3 text-emerald-500" aria-hidden="true" />
						<span className="text-white/50">Explorer</span>
					</div>
				</div>
			</header>

			{/* Profile Section - compact */}
			<div className="p-3 border-b border-white/8">
				<div className="flex items-center gap-3">
					{/* Avatar */}
					<div className="relative shrink-0">
						<div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
							<Image
								src="/profile.png"
								alt="Profile"
								width={40}
								height={40}
								className="w-full h-full object-cover"
								priority
							/>
						</div>
						{/* Online indicator */}
						<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#161b22]" />
					</div>

					{/* Info */}
					<div className="min-w-0 flex-1">
						<h3 className="font-semibold text-sm text-white/90 truncate leading-tight">
							Anurag Basuri
						</h3>
						<p className="text-[10px] text-white/40 font-mono truncate">
							Full Stack Engineer
						</p>
					</div>
				</div>

				{/* Action Buttons - minimal */}
				<div className="mt-3 grid gap-2">
					<a
						href="/resume.pdf"
						target="_blank"
						className="flex items-center justify-center gap-1.5 h-7 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 rounded text-[10px] font-medium text-emerald-400 transition-colors"
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
			className="flex-1 flex items-center justify-center h-7 rounded border border-white/8 bg-white/2 hover:bg-white/5 hover:border-white/15 transition-colors text-white/40 hover:text-white/70"
			title={label}
		>
			<Icon className="w-3.5 h-3.5" />
		</a>
	);
}
