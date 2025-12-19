'use client';

import { ChevronRight, Folder } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import { getIconForFile } from '@/components/common/FileIcon';

interface BreadcrumbsProps {
	path: string; // e.g., "src/components/EditorArea.tsx"
	className?: string;
}

export function Breadcrumbs({ path, className }: BreadcrumbsProps) {
	// Simple path split. In a real app we might traverse the tree to get folder names.
	const segments = path.split('/');
	const filename = segments[segments.length - 1];
	const FileIconComponent = getIconForFile(filename);

	return (
		<div
			className={cn(
				'flex items-center text-xs text-muted-foreground/60 px-4 py-1 border-b border-border/40 bg-background/50 backdrop-blur-sm select-none overflow-hidden whitespace-nowrap',
				className,
			)}
		>
			{segments.map((segment, index) => {
				const isLast = index === segments.length - 1;
				// First segments are generally folders
				const Icon = isLast ? FileIconComponent : Folder;

				return (
					<Fragment key={index}>
						<div
							className={cn(
								'flex items-center gap-1 transition-colors duration-200',
								isLast
									? 'text-foreground font-medium'
									: 'hover:text-foreground/80 cursor-pointer',
							)}
						>
							<Icon className="w-3.5 h-3.5 opacity-70" />
							<span>{segment}</span>
						</div>
						{!isLast && <ChevronRight className="w-3.5 h-3.5 mx-0.5 opacity-40" />}
					</Fragment>
				);
			})}
		</div>
	);
}
