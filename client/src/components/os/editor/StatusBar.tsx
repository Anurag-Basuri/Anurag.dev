'use client';

import { GitBranch, AlertCircle, Check, Wifi, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBranchName } from '@/lib/editorUtils';

interface StatusBarProps {
	language: string;
	className?: string;
}

export function StatusBar() {
	return (
		<div className="h-6 bg-primary text-primary-foreground flex items-center justify-between px-3 text-[10px] select-none font-mono z-30 shadow-md">
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
					<GitBranch className="w-3 h-3" />
					<span className="font-semibold">main</span>
				</div>
				<div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
					<Check className="w-3 h-3 text-emerald-400" />
					<span>0 errors</span>
				</div>
				<div className="hidden sm:flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
					<span>Build: Passing</span>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<div className="hidden sm:flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
					<span>UTF-8</span>
					<span>TSX</span>
				</div>
				<div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
					<Wifi className="w-3 h-3" />
					<span>Online</span>
				</div>
				<div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
					<Bell className="w-3 h-3" />
				</div>
			</div>
		</div>
	);
}
