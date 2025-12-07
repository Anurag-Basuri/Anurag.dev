'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Linkedin, Github, Mail, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SidebarProfile() {
	return (
		<div className="p-4 border-b border-border/40 bg-linear-to-b from-muted/30 via-muted/10 to-transparent backdrop-blur-sm">
			{/* Profile Section */}
			<div className="flex items-center gap-3 mb-4">
				<div className="relative shrink-0 group">
					<div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary/40 shadow-[0_0_20px_-4px_var(--primary)] group-hover:border-primary/60 transition-all duration-300">
						<img
							src="/profile.png"
							alt="Profile"
							className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					</div>
					<div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
				</div>
				<div className="overflow-hidden min-w-0">
					<h3 className="font-semibold text-sm truncate text-foreground tracking-wide leading-tight">
						Anurag Basuri
					</h3>
					<p className="text-[10px] text-muted-foreground/80 truncate font-mono tracking-wide">
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
					className="flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/25 hover:border-primary/40 rounded-md text-xs font-medium text-primary transition-all duration-200 group shadow-sm hover:shadow-[0_0_16px_-4px_var(--primary)]"
				>
					<Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-200" />
					<span className="tracking-wide">Download Resume</span>
				</a>

				{/* Social Links */}
				<div className="flex gap-1.5 justify-between mt-1">
					<SocialButton
						href="https://linkedin.com/in/anurag-basuri"
						icon={Linkedin}
						label="LinkedIn"
						colorClass="hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/25"
					/>
					<SocialButton
						href="https://github.com/Anurag-Basuri"
						icon={Github}
						label="GitHub"
						colorClass="hover:text-foreground hover:bg-foreground/10 hover:border-foreground/20"
					/>
					<SocialButton
						href="mailto:contact@anurag.dev"
						icon={Mail}
						label="Email"
						colorClass="hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/25"
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
				'flex-1 flex items-center justify-center p-2 rounded-md border border-transparent transition-all duration-200 text-muted-foreground',
				colorClass,
			)}
			title={label}
		>
			<Icon className="w-4 h-4" />
		</a>
	);
}
