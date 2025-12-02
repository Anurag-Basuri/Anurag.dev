'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store/atoms';
import { AnimatePresence, motion } from 'framer-motion';

export function BootAnimation() {
	const [bootComplete, setBootComplete] = useAtom(bootCompleteAtom);
	const [progress, setProgress] = useState(0);
	const [currentLog, setCurrentLog] = useState('');

	useEffect(() => {
		if (bootComplete) return;

		const logs = [
			'Initializing KERNEL...',
			'Loading MODULES...',
			'Mounting FILE SYSTEM...',
			'Starting NETWORK services...',
			'Verifying SECURITY protocols...',
			'Loading USER interface...',
			'System READY.',
		];

		let currentIndex = 0;
		const interval = setInterval(() => {
			if (currentIndex >= logs.length) {
				clearInterval(interval);
				setTimeout(() => setBootComplete(true), 800);
				return;
			}
			setCurrentLog(logs[currentIndex]);
			setProgress(prev => Math.min(prev + 100 / logs.length, 100));
			currentIndex++;
		}, 600);

		return () => clearInterval(interval);
	}, [bootComplete, setBootComplete]);

	return (
		<AnimatePresence>
			{!bootComplete && (
				<motion.div
					initial={{ opacity: 1 }}
					exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
					transition={{ duration: 0.8 }}
					className="fixed inset-0 z-[100] bg-black text-green-500 font-mono flex flex-col items-center justify-center overflow-hidden"
				>
					{/* Matrix-like background effect (simplified) */}
					<div className="absolute inset-0 opacity-10 pointer-events-none">
						<div className="w-full h-full bg-[url('https://media.giphy.com/media/o0vwzuFwCGAFO/giphy.gif')] bg-cover opacity-20"></div>
					</div>

					<div className="z-10 w-full max-w-md p-6 space-y-8">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-center space-y-2"
						>
							<h1 className="text-4xl font-bold tracking-tighter text-white glitch-text">
								AnuragOS
							</h1>
							<p className="text-sm text-green-400/80">v2.0.0-alpha</p>
						</motion.div>

						<div className="space-y-2">
							<div className="flex justify-between text-xs uppercase tracking-widest text-green-500/60">
								<span>Boot Sequence</span>
								<span>{Math.round(progress)}%</span>
							</div>
							<div className="h-1 w-full bg-green-900/30 rounded-full overflow-hidden">
								<motion.div
									className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
									initial={{ width: '0%' }}
									animate={{ width: `${progress}%` }}
									transition={{ ease: 'linear' }}
								/>
							</div>
						</div>

						<div className="h-8 flex items-center justify-center">
							<AnimatePresence mode="wait">
								<motion.p
									key={currentLog}
									initial={{ opacity: 0, y: 5 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -5 }}
									className="text-sm text-green-400/80"
								>
									{currentLog && `> ${currentLog}`}
								</motion.p>
							</AnimatePresence>
						</div>
					</div>

					<button
						onClick={() => setBootComplete(true)}
						className="absolute bottom-8 text-xs text-zinc-600 hover:text-green-500 transition-colors uppercase tracking-widest"
					>
						[ Press Any Key to Skip ]
					</button>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
