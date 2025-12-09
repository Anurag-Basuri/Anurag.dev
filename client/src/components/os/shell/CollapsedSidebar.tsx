'use client';

import { PanelLeftOpen, Download, Linkedin, Github, Mail } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CollapsedSidebarProps {
	onExpand: () => void;
}

const iconButtons = [
	{
		href: 'https://github.com/Anurag-Basuri',
		icon: Github,
		label: 'GitHub',
		color: 'hover:text-foreground hover:bg-foreground/10',
	},
	{
		href: 'https://www.linkedin.com/in/anurag-basuri-941546214/',
		icon: Linkedin,
		label: 'LinkedIn',
		color: 'hover:text-blue-400 hover:bg-blue-500/10',
	},
	{
		href: 'mailto:anurag.basuri@gmail.com',
		icon: Mail,
		label: 'Email',
		color: 'hover:text-emerald-400 hover:bg-emerald-500/10',
	},
	{
		href: '/resume.pdf',
		icon: Download,
		label: 'Download Resume',
		color: 'hover:text-primary hover:bg-primary/10',
	},
];

export function CollapsedSidebar({ onExpand }: CollapsedSidebarProps) {
	return (
		<TooltipProvider delayDuration={0}>
			<div className="h-full flex flex-col items-center justify-between py-4 bg-background/70 backdrop-blur-xl">
				<div className="flex flex-col items-center gap-3">
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								onClick={onExpand}
								className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted/40 hover:bg-primary/15 text-muted-foreground hover:text-primary transition-all duration-200"
								aria-label="Expand sidebar"
							>
								<PanelLeftOpen className="w-5 h-5" />
							</button>
						</TooltipTrigger>
						<TooltipContent side="right" align="center">
							<p>Expand Sidebar</p>
						</TooltipContent>
					</Tooltip>
				</div>

				<div className="flex flex-col items-center gap-2">
					{iconButtons.map(item => (
						<Tooltip key={item.label}>
							<TooltipTrigger asChild>
								<a
									href={item.href}
									target="_blank"
									rel="noopener noreferrer"
									className={cn(
										'h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground transition-all duration-200',
										item.color,
									)}
								>
									<item.icon className="w-4 h-4" />
								</a>
							</TooltipTrigger>
							<TooltipContent side="right" align="center">
								<p>{item.label}</p>
							</TooltipContent>
						</Tooltip>
					))}
				</div>
			</div>
		</TooltipProvider>
	);
}
