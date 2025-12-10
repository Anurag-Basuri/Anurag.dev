'use client';

import React from 'react';
import Image from 'next/image';
import { Download, Linkedin, Github, Mail, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProfileProps {
	onCollapse?: () => void;
}

export function SidebarProfile({ onCollapse }: SidebarProfileProps) {
	return (
		<div className="bg-sidebar">
			{/* Header with traffic lights */}
			<div className="px-3 py-2 border-b border-border/40 flex items-center gap-3 bg-muted/10">
				<div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
					<button
						onClick={onCollapse}
						className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors shadow-sm"
						aria-label="Collapse sidebar"
						title="Collapse"
					/>
					<div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-sm" />
					<div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-sm" />
				</div>
				<div className="h-4 w-px bg-border/40" />
				<div className="flex items-center gap-2">
					<FolderOpen className="w-3.5 h-3.5 text-primary" />
					<span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
						explorer
					</span>
				</div>
			</div>

			{/* Profile Section */}
			<div className="p-4 border-b border-border/40 relative overflow-hidden group/profile">
				{/* Background Pattern */}
				<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover/profile:opacity-100 transition-opacity duration-500" />

				<div className="flex items-center gap-4 mb-5 relative z-10">
					<div className="relative shrink-0 group">
						<div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary/50 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
							<Image
								src="/profile.png"
								alt="Profile"
								width={56}
								height={56}
								className="w-full h-full object-cover"
								priority
							/>
						</div>
						{/* Online indicator */}
						<div className="absolute bottom-0 right-0 flex items-center justify-center">
							<div className="absolute w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
							<div className="relative w-3 h-3 bg-emerald-500 rounded-full border-2 border-sidebar shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
						</div>
					</div>
					<div className="overflow-hidden min-w-0 flex-1">
						<h3 className="font-bold text-base truncate text-foreground tracking-tight leading-tight mb-0.5 group-hover/profile:text-primary transition-colors">
							Anurag Basuri
						</h3>
						<p className="text-[11px] text-muted-foreground truncate font-mono tracking-wide bg-muted/30 inline-block px-1.5 py-0.5 rounded">
							Full Stack Engineer
						</p>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="grid gap-2 relative z-10">
					<a
						href="/resume.pdf"
						target="_blank"
						className="flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/15 border border-primary/20 hover:border-primary/30 rounded-md text-xs font-semibold text-primary transition-all duration-200 group/btn"
					>
						<Download className="w-3.5 h-3.5 group-hover/btn:translate-y-0.5 transition-transform duration-200" />
						<span className="tracking-wide uppercase text-[10px]">Download Resume</span>
					</a>

					<div className="flex gap-2 justify-between mt-1">
						<SocialButton
							href="https://linkedin.com/in/anurag-basuri"
							icon={Linkedin}
							label="LinkedIn"
							colorClass="hover:text-[#0077b5] hover:bg-[#0077b5]/10 hover:border-[#0077b5]/30"
						/>
						<SocialButton
							href="https://github.com/Anurag-Basuri"
							icon={Github}
							label="GitHub"
							colorClass="hover:text-foreground hover:bg-foreground/10 hover:border-foreground/30"
						/>
						<SocialButton
							href="mailto:contact@anurag.dev"
							icon={Mail}
							label="Email"
							colorClass="hover:text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/30"
						/>
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
	colorClass,
}: {
	href: string;
	icon: React.ElementType<{ className?: string }>;
	label: string;
	colorClass: string;
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				'flex-1 flex items-center justify-center p-2 rounded-md border border-border/40 transition-all duration-200 text-muted-foreground',
				colorClass,
			)}
			title={label}
		>
			<Icon className="w-4 h-4" />
		</a>
	);
}
