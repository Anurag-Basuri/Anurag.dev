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
		<div className="bg-[#0d1117]">
			{/* Header with traffic lights */}
			<div className="px-3 py-2 border-b border-white/5 flex items-center gap-3">
				<div className="flex items-center gap-1.5">
					<button
						onClick={onCollapse}
						className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors shadow-[0_0_4px_rgba(239,68,68,0.5)]"
						aria-label="Collapse sidebar"
						title="Collapse"
					/>
					<div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_4px_rgba(234,179,8,0.5)]" />
					<div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
				</div>
				<div className="h-4 w-px bg-white/10" />
				<div className="flex items-center gap-2">
					<FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
					<span className="text-xs font-medium text-white/80 tracking-wide">
						explorer
					</span>
				</div>
			</div>

			{/* Profile Section */}
			<div className="p-4 border-b border-white/5">
				<div className="flex items-center gap-3 mb-4">
					<div className="relative shrink-0 group">
						<div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
							<Image
								src="/profile.png"
								alt="Profile"
								width={48}
								height={48}
								className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
								priority
							/>
						</div>
						{/* Online indicator */}
						<div className="absolute bottom-0 right-0 flex items-center justify-center">
							<div className="absolute w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
							<div className="relative w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d1117] shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
						</div>
					</div>
					<div className="overflow-hidden min-w-0 flex-1">
						<h3 className="font-semibold text-sm truncate text-white tracking-wide leading-tight mb-0.5">
							Anurag Basuri
						</h3>
						<p className="text-[10px] text-white/50 truncate font-mono tracking-wide">
							Full Stack Engineer
						</p>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="grid gap-2">
					<a
						href="/resume.pdf"
						target="_blank"
						className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg text-xs font-semibold text-emerald-400 transition-all duration-200 group"
					>
						<Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-200" />
						<span className="tracking-wide">Download Resume</span>
					</a>

					<div className="flex gap-1.5 justify-between mt-0.5">
						<SocialButton
							href="https://linkedin.com/in/anurag-basuri"
							icon={Linkedin}
							label="LinkedIn"
							colorClass="hover:text-blue-400 hover:bg-blue-500/15 hover:border-blue-500/40"
						/>
						<SocialButton
							href="https://github.com/Anurag-Basuri"
							icon={Github}
							label="GitHub"
							colorClass="hover:text-white hover:bg-white/10 hover:border-white/30"
						/>
						<SocialButton
							href="mailto:contact@anurag.dev"
							icon={Mail}
							label="Email"
							colorClass="hover:text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/40"
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
				'flex-1 flex items-center justify-center p-2.5 rounded-lg border border-white/10 transition-all duration-200 text-white/50',
				colorClass,
			)}
			title={label}
		>
			<Icon className="w-4 h-4" />
		</a>
	);
}
