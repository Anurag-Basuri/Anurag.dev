'use client';

import { memo } from 'react';
import { Wifi, WifiOff, Battery } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface StatusBarProps {
	isOnline: boolean;
	batteryLevel: number;
}

export const StatusBar = memo(function StatusBar({ isOnline, batteryLevel }: StatusBarProps) {
	return (
		<div className="hidden md:flex items-center gap-2 lg:gap-2.5 px-2 lg:px-2.5 py-0.5 rounded-full bg-muted/50 border border-border/50 h-6 hover:bg-muted transition-colors duration-200">
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-center gap-1.5 cursor-help" role="status">
						{isOnline ? (
							<span className="relative flex h-2.5 w-2.5" aria-label="System online">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
								<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary shadow-[0_0_8px_var(--primary)]" />
							</span>
						) : (
							<span
								className="relative flex h-2.5 w-2.5 bg-destructive rounded-full"
								aria-label="System offline"
							/>
						)}
						<span className="text-[9px] uppercase font-bold tracking-[0.15em] text-muted-foreground">
							{isOnline ? 'Online' : 'Offline'}
						</span>
					</div>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p>{isOnline ? 'System is online and ready' : 'System is offline'}</p>
				</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<button
						className="focus:outline-none focus:ring-2 focus:ring-ring/40 rounded-full p-0.5 hover:scale-110 transition-transform duration-200"
						aria-label="Network status"
					>
						{isOnline ? (
							<Wifi
								className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
								aria-hidden="true"
							/>
						) : (
							<WifiOff className="w-3 h-3 text-destructive/60" aria-hidden="true" />
						)}
					</button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p>{isOnline ? 'Network Connected' : 'Network Disconnected'}</p>
				</TooltipContent>
			</Tooltip>

			{batteryLevel < 100 && (
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							className="focus:outline-none focus:ring-2 focus:ring-ring/40 rounded-full p-0.5 flex items-center gap-1 hover:scale-105 transition-transform duration-200"
							aria-label={`Battery level ${batteryLevel}%`}
						>
							<Battery
								className={cn(
									'w-3 h-3',
									batteryLevel > 20
										? 'text-muted-foreground/60'
										: 'text-destructive',
								)}
								aria-hidden="true"
							/>
							<span className="text-[8px] font-mono text-muted-foreground/60">
								{batteryLevel}%
							</span>
						</button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						<p>Battery: {batteryLevel}%</p>
					</TooltipContent>
				</Tooltip>
			)}
		</div>
	);
});
