'use client';

import { GitBranch, AlertCircle, AlertTriangle, Check, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBranchName } from '@/lib/editorUtils';

interface StatusBarProps {
	language: string;
	className?: string;
}

export function StatusBar({ language, className }: StatusBarProps) {
	const branch = getBranchName();

	return (
		<div
			className={cn(
				'h-6 min-h-6 flex items-center justify-between px-3 text-[10px] bg-primary/5 border-t border-border/40 select-none text-muted-foreground/80 whitespace-nowrap overflow-hidden',
				className,
			)}
		>
			{/* Left Side: Git & Errors */}
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors">
					<GitBranch className="w-3 h-3" />
					<span className="font-medium">{branch}</span>
				</div>
				<div className="flex items-center gap-2 hover:text-foreground cursor-pointer transition-colors">
					<div className="flex items-center gap-1">
						<XCircle className="w-3 h-3 text-red-400/80" />
						<span>0</span>
					</div>
					<div className="flex items-center gap-1">
						<AlertTriangle className="w-3 h-3 text-yellow-400/80" />
						<span>0</span>
					</div>
				</div>
			</div>

			{/* Right Side: Language & Info */}
			<div className="flex items-center gap-4">
				<div className="hidden sm:flex items-center gap-4">
					<div className="hover:text-foreground cursor-pointer transition-colors">
						Ln 1, Col 1
					</div>
					<div className="hover:text-foreground cursor-pointer transition-colors">
						UTF-8
					</div>
				</div>
				<div className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors font-medium text-primary/80">
					{language === 'TypeScript React' ? (
						<span className="text-blue-400">TSX</span>
					) : (
						<span>{language}</span>
					)}
					{language.includes('React') || language.includes('Type') ? (
						<div className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
					) : (
						<div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60" />
					)}
				</div>
				<div className="hover:text-foreground cursor-pointer transition-colors">
					<AlertCircle className="w-3 h-3" />
				</div>
			</div>
		</div>
	);
}
