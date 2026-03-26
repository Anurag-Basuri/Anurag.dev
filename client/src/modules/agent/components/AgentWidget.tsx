import { AnimatePresence, motion } from 'framer-motion';
import { Bot, X } from 'lucide-react';
import { AgentWindow } from './AgentWindow';
import { useAgentSession } from '../hooks/useAgentSession';

export function AgentWidget() {
	const session = useAgentSession();
	const { isOpen, setIsOpen } = session;

	return (
		<>
			{/* The Floating Action Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="group fixed bottom-4 right-4 z-9999 flex h-14 w-14 items-center justify-center rounded-full bg-primary tracking-wide text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 active:scale-95 sm:bottom-6 sm:right-6 ring-4 ring-primary/20"
				aria-label="Toggle AI Assistant"
			>
				<div className="relative">
					<AnimatePresence mode="wait">
						{isOpen ? (
							<motion.div
								key="close"
								initial={{ rotate: -90, opacity: 0 }}
								animate={{ rotate: 0, opacity: 1 }}
								exit={{ rotate: 90, opacity: 0 }}
								transition={{ duration: 0.15 }}
							>
								<X size={24} />
							</motion.div>
						) : (
							<motion.div
								key="bot"
								initial={{ scale: 0.5, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.5, opacity: 0 }}
								transition={{ duration: 0.15 }}
							>
								<Bot size={24} />
							</motion.div>
						)}
					</AnimatePresence>
					{/* Notification Dot */}
					{!isOpen && (
						<span className="absolute -right-1 -top-1 flex h-3 w-3">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75"></span>
							<span className="relative inline-flex h-3 w-3 rounded-full bg-primary-foreground/80 border-2 border-primary"></span>
						</span>
					)}
				</div>
			</button>

			{/* The Chat Window popup wrapped in AnimatePresence */}
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Invisible Backdrop for Click-Outside-to-Close */}
						<div
							className="fixed inset-0 z-9998 bg-black/5 backdrop-blur-[1px]"
							onClick={() => setIsOpen(false)}
							aria-hidden="true"
						/>
						<AgentWindow {...session} />
					</>
				)}
			</AnimatePresence>
		</>
	);
}
