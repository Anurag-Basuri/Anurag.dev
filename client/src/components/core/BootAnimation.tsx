'use client';

import { useEffect, useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store/atoms';
import { AnimatePresence, motion } from 'framer-motion';

export function BootAnimation() {
	const [bootComplete, setBootComplete] = useAtom(bootCompleteAtom);
	const [memory, setMemory] = useState(0);
	const [logs, setLogs] = useState<string[]>([]);
	const [showCursor, setShowCursor] = useState(true);
	const scrollRef = useRef<HTMLDivElement>(null);

	// Cursor blink effect
	useEffect(() => {
		const interval = setInterval(() => setShowCursor(prev => !prev), 500);
		return () => clearInterval(interval);
	}, []);

	// Auto-scroll to bottom
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [logs]);

	// Boot sequence
	useEffect(() => {
		if (bootComplete) return;

		const totalMemory = 65536; // 64KB base memory + extended
		const memoryInterval = setInterval(() => {
			setMemory(prev => {
				const next = prev + 1024;
				if (next >= totalMemory) {
					clearInterval(memoryInterval);
					return totalMemory;
				}
				return next;
			});
		}, 10);

		const bootSequence = [
			{ text: 'Award Modular BIOS v4.51PG, An Energy Star Ally', delay: 100 },
			{ text: 'Copyright (C) 1984-2025, AnuragOS Inc.', delay: 200 },
			{ text: 'ASUS P5A ACPI BIOS Revision 1007', delay: 400 },
			{ text: 'Pentium III 500MHz Processor', delay: 600 },
			{ text: '', delay: 800 }, // Spacer
			{ text: 'Memory Test: ', delay: 1000, keepLine: true },
			{ text: 'OK', delay: 2000, appendToLast: true },
			{ text: '', delay: 2100 },
			{ text: 'Award Plug and Play BIOS Extension v1.0A', delay: 2200 },
			{ text: 'Initialize Plug and Play Cards...', delay: 2400 },
			{ text: 'PNP Init Completed', delay: 2800 },
			{ text: '', delay: 2900 },
			{ text: 'Detecting Primary Master ... ANURAG-OS-DRIVE-01', delay: 3000 },
			{ text: 'Detecting Primary Slave  ... None', delay: 3200 },
			{ text: 'Detecting Secondary Master ... CD-ROM 52X', delay: 3400 },
			{ text: 'Detecting Secondary Slave  ... None', delay: 3600 },
			{ text: '', delay: 3700 },
			{ text: 'Verifying DMI Pool Data .........', delay: 4000 },
			{ text: 'Update Success', delay: 4500, appendToLast: true },
			{ text: 'Booting from Hard Disk...', delay: 5000 },
			{ text: 'Starting ANURAG-OS Kernel v2.0...', delay: 5500 },
			{ text: 'Loading UI Modules...', delay: 6000 },
			{ text: 'SYSTEM READY.', delay: 6500 },
		];

		let timeouts: NodeJS.Timeout[] = [];

		bootSequence.forEach(({ text, delay, keepLine, appendToLast }) => {
			const timeout = setTimeout(() => {
				setLogs(prev => {
					if (appendToLast) {
						const newLogs = [...prev];
						newLogs[newLogs.length - 1] += text;
						return newLogs;
					}
					return [...prev, text];
				});
			}, delay);
			timeouts.push(timeout);
		});

		// Finish boot
		const finishTimeout = setTimeout(() => {
			setBootComplete(true);
		}, 7000);
		timeouts.push(finishTimeout);

		return () => {
			clearInterval(memoryInterval);
			timeouts.forEach(clearTimeout);
		};
	}, [bootComplete, setBootComplete]);

	if (bootComplete) return null;

	return (
		<div className="fixed inset-0 z-[9999] bg-black text-[#cccccc] font-mono p-8 text-lg leading-relaxed overflow-hidden cursor-none select-none">
			{/* CRT Effect Overlay */}
			<div className="scanlines pointer-events-none absolute inset-0 z-20"></div>

			<div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto">
				{/* Header */}
				<div className="flex justify-between mb-8">
					<div>
						<p>Award Modular BIOS v4.51PG, An Energy Star Ally</p>
						<p>Copyright (C) 1984-2025, AnuragOS Inc.</p>
					</div>
					<div className="text-right hidden sm:block">
						<pre className="text-[10px] leading-[10px] text-[#00ff41]">
							{`   _   
  ( )  
   H   
  ( )  
 ENERGY`}
						</pre>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex-1 overflow-hidden relative" ref={scrollRef}>
					<div className="space-y-1">
						<p>PENTIUM-III 500MHz Processor</p>
						<p>Memory Test: {memory}K OK</p>

						<div className="mt-4">
							{logs.map((log, i) => (
								<p key={i} className="whitespace-pre-wrap break-words">
									{log}
								</p>
							))}
							<p className="inline-block">
								_
								<span className={`${showCursor ? 'opacity-100' : 'opacity-0'}`}>
									_
								</span>
							</p>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-8 border-t-2 border-[#cccccc] pt-2 flex justify-between text-sm">
					<div>
						<span className="mr-4">Press DEL to enter SETUP</span>
						<span>Press ESC to skip memory test</span>
					</div>
					<div>12/03/2025-i440BX-8671-2A69KD4FC-00</div>
				</div>
			</div>

			{/* Skip Button (Hidden but clickable area or subtle) */}
			<button
				onClick={() => setBootComplete(true)}
				className="absolute bottom-4 right-4 text-xs text-zinc-800 hover:text-zinc-600 z-50 uppercase tracking-widest"
			>
				[ SKIP BOOT ]
			</button>
		</div>
	);
}
