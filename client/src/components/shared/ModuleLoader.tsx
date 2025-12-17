import { cn } from '@/lib/utils';

interface ModuleLoaderProps {
	message?: string;
	className?: string;
}

export function ModuleLoader({ message = 'Loading...', className }: ModuleLoaderProps) {
	return (
		<div
			className={cn(
				'flex items-center justify-center h-full w-full bg-transparent',
				className,
			)}
		>
			<div className="flex flex-col items-center gap-4">
				<div className="relative">
					{/* Outer glow ring */}
					<div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
					{/* Spinner */}
					<div className="relative w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
				</div>
				<div className="text-sm text-muted-foreground font-mono tracking-wide animate-pulse">
					{message}
				</div>
			</div>
		</div>
	);
}
