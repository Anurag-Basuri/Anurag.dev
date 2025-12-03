'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, Linkedin, Github, Mail, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SidebarProfile() {
	return (
		<div className="p-4 border-b border-border/60 bg-muted/20 backdrop-blur-sm">
			<div className="flex items-center gap-3 mb-4">
				<div className="relative shrink-0">
					<div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
						<img
							src="/profile.png"
							alt="Profile"
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
				</div>
				<div className="overflow-hidden">
					<h3 className="font-bold text-sm truncate text-foreground tracking-wide">
						Anurag Basuri
					</h3>
					<p className="text-[10px] text-muted-foreground truncate font-mono">
						Full Stack Engineer
					</p>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-2">
				<a
					href="/resume.pdf"
					target="_blank"
					className="col-span-2 flex items-center justify-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded text-xs font-medium text-primary transition-all duration-200 group"
				>
					<Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
					<span>Download Resume</span>
				</a>

				<div className="col-span-2 flex gap-1 justify-between">
					<SocialButton
						href="https://linkedin.com/in/anurag-basuri"
						icon={Linkedin}
						label="LinkedIn"
						color="hover:text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/20"
					/>
					<SocialButton
						href="https://github.com/Anurag-Basuri"
						icon={Github}
						label="GitHub"
						color="hover:text-white hover:bg-white/10 hover:border-white/20"
					/>
					<SocialButton
						href="mailto:contact@anurag.dev"
						icon={Mail}
						label="Email"
						color="hover:text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/20"
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
	color,
}: {
	href: string;
	icon: React.ElementType;
	label: string;
	color: string;
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				'flex-1 flex items-center justify-center p-1.5 rounded border border-transparent transition-all duration-200 text-muted-foreground',
				color,
			)}
			title={label}
		>
			<Icon className="w-4 h-4" />
		</a>
	);
}
