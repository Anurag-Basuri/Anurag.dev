'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Download, Linkedin, Github, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SidebarProfile() {
	return (
		<div className="p-4 border-b border-border/50 bg-gradient-to-b from-muted/40 via-muted/20 to-transparent backdrop-blur-sm">
			{/* Profile Section */}
			<div className="flex items-center gap-3 mb-4">
				<div className="relative shrink-0 group">
					<div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
						<Image
							src="/profile.png"
							alt="Profile"
							width={48}
							height={48}
							className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
							priority
						/>
					</div>
					{/* Online indicator with pulse */}
					<div className="absolute bottom-0 right-0 flex items-center justify-center">
						<div className="absolute w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
						<div className="relative w-3 h-3 bg-emerald-500 rounded-full border-2 border-background shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
					</div>
				</div>
				<div className="overflow-hidden min-w-0 flex-1">
					<h3 className="font-semibold text-sm truncate text-foreground tracking-wide leading-tight mb-0.5">
						Anurag Basuri
					</h3>
					<p className="text-[10px] text-muted-foreground truncate font-mono tracking-wide">
						Full Stack Engineer
					</p>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="grid gap-2">
				{/* Resume Download */}
				<a
					href="/resume.pdf"
					target="_blank"
					className="flex items-center justify-center gap-2 px-3 py-2.5 bg-primary/12 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 rounded-lg text-xs font-semibold text-primary transition-all duration-200 group shadow-sm hover:shadow-[0_0_20px_-6px_var(--primary)]"
				>
					<Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-200" />
					<span className="tracking-wide">Download Resume</span>
				</a>

				{/* Social Links */}
				<div className="flex gap-1.5 justify-between mt-0.5">
					<SocialButton
						href="https://linkedin.com/in/anurag-basuri"
						icon={Linkedin}
						label="LinkedIn"
						colorClass="hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/12 hover:border-blue-500/30 hover:shadow-[0_0_12px_-4px_rgb(59,130,246)]"
					/>
					<SocialButton
						href="https://github.com/Anurag-Basuri"
						icon={Github}
						label="GitHub"
						colorClass="hover:text-foreground hover:bg-foreground/12 hover:border-foreground/25 hover:shadow-[0_0_12px_-4px_currentColor]"
					/>
					<SocialButton
						href="mailto:contact@anurag.dev"
						icon={Mail}
						label="Email"
						colorClass="hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/12 hover:border-emerald-500/30 hover:shadow-[0_0_12px_-4px_rgb(16,185,129)]"
					/>
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
				'flex-1 flex items-center justify-center p-2.5 rounded-lg border border-border/40 transition-all duration-200 text-muted-foreground backdrop-blur-sm',
				colorClass,
			)}
			title={label}
		>
			<Icon className="w-4 h-4" />
		</a>
	);
}
