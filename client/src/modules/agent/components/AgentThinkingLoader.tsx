import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, Sparkles, Zap } from 'lucide-react';

const PHASES = [
	{ icon: Brain, text: 'Thinking...', delay: 0 },
	{ icon: Search, text: 'Searching portfolio...', delay: 3000 },
	{ icon: Sparkles, text: 'Analyzing data...', delay: 8000 },
	{ icon: Zap, text: 'Almost there...', delay: 15000 },
] as const;

export function AgentThinkingLoader() {
	const [phaseIndex, setPhaseIndex] = useState(0);

	useEffect(() => {
		const timers: ReturnType<typeof setTimeout>[] = [];

		PHASES.forEach((phase, i) => {
			if (i === 0) return; // already showing phase 0
			timers.push(setTimeout(() => setPhaseIndex(i), phase.delay));
		});

		return () => timers.forEach(clearTimeout);
	}, []);

	const phase = PHASES[phaseIndex];
	const Icon = phase.icon;

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex w-fit items-center gap-3 self-start rounded-2xl bg-card border border-border px-4 py-3 text-sm text-muted-foreground"
		>
			<AnimatePresence mode="wait">
				<motion.div
					key={phaseIndex}
					initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
					animate={{ opacity: 1, scale: 1, rotate: 0 }}
					exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
					transition={{ duration: 0.3 }}
					className="relative flex items-center gap-2.5"
				>
					{/* Pulsing icon */}
					<div className="relative">
						<motion.div
							animate={{ scale: [1, 1.2, 1] }}
							transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
							className="text-primary"
						>
							<Icon size={16} />
						</motion.div>
						{/* Glow ring */}
						<motion.div
							animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.5, 1] }}
							transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
							className="absolute inset-0 rounded-full bg-primary/20 blur-sm"
						/>
					</div>

					{/* Phase text */}
					<span className="font-medium">{phase.text}</span>
				</motion.div>
			</AnimatePresence>

			{/* Bouncing dots */}
			<div className="flex items-center gap-1">
				{[0, 1, 2].map(i => (
					<motion.div
						key={i}
						animate={{ y: [0, -4, 0] }}
						transition={{
							duration: 0.6,
							repeat: Infinity,
							delay: i * 0.15,
							ease: 'easeInOut',
						}}
						className="h-1 w-1 rounded-full bg-primary/50"
					/>
				))}
			</div>
		</motion.div>
	);
}
