import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

export function TerminalWelcome() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="select-none text-xs space-y-2 pb-2"
		>
			<div className="flex items-center gap-2">
				<Terminal className="w-5 h-5 text-primary" />
				<span className="text-primary font-bold text-sm">
					AnuragOS Terminal v1.0
				</span>
			</div>
			<div className="text-muted-foreground space-y-1 pl-7">
				<div>
					Type{' '}
					<code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded font-semibold">
						help
					</code>{' '}
					to see available commands
				</div>
				<div className="text-[10px] opacity-70">
					Pro tip: Use <kbd className="kbd">↑</kbd> /{' '}
					<kbd className="kbd">↓</kbd> for history,{' '}
					<kbd className="kbd">Tab</kbd> to autocomplete
				</div>
			</div>
		</motion.div>
	);
}
