'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, MousePointer, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WelcomeDialog() {
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState(0);
	const [hasSeenWelcome, setHasSeenWelcome] = useState(true);

	useEffect(() => {
		// Check if user has seen welcome before
		const seen = localStorage.getItem('anuragos-welcome-seen');
		if (!seen) {
			setHasSeenWelcome(false);
			setIsOpen(true);
		}
	}, []);

	const handleDismiss = () => {
		setIsOpen(false);
		localStorage.setItem('anuragos-welcome-seen', 'true');
	};

	const handleKnowTerminals = () => {
		localStorage.setItem('anuragos-welcome-seen', 'true');
		localStorage.setItem('anuragos-user-level', 'technical');
		setIsOpen(false);
	};

	const handleShowAround = () => {
		localStorage.setItem('anuragos-user-level', 'non-technical');
		setStep(1);
	};

	const tutorialSteps = [
		{
			title: 'Welcome to AnuragOS! 👋',
			content:
				"I'm Anurag, and this is my interactive portfolio. How familiar are you with command-line interfaces?",
			actions: (
				<div className="flex gap-3">
					<button
						onClick={handleKnowTerminals}
						className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
					>
						<Terminal className="w-4 h-4 inline mr-2" />I know terminals 🖥️
					</button>
					<button
						onClick={handleShowAround}
						className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors font-medium text-sm"
					>
						<Sparkles className="w-4 h-4 inline mr-2" />
						Show me around 🎯
					</button>
				</div>
			),
		},
		{
			title: 'The Terminal',
			content:
				"This is the terminal on the right. You can type commands here like 'help' to see what's available, or 'about' to learn about me.",
			actions: (
				<button
					onClick={() => setStep(2)}
					className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
				>
					Next →
				</button>
			),
		},
		{
			title: 'Or Just Click',
			content:
				"Not a fan of typing? No problem! Click any file in the Explorer on the left to open it. Try clicking 'about' or 'projects'.",
			actions: (
				<button
					onClick={() => setStep(3)}
					className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
				>
					Next →
				</button>
			),
		},
		{
			title: "You're All Set! 🚀",
			content:
				"Explore at your own pace. If you need help, there's a help button in the bottom-right corner. Enjoy!",
			actions: (
				<button
					onClick={handleDismiss}
					className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
				>
					Let's Go! ✨
				</button>
			),
		},
	];

	const currentStep = tutorialSteps[step];

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={handleDismiss}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
					/>

					{/* Dialog */}
					<div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							transition={{ type: 'spring', duration: 0.5 }}
							className="pointer-events-auto w-full max-w-md"
						>
							<div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
								{/* Header */}
								<div className="relative p-6 pb-4 border-b border-border/50 bg-linear-to-br from-primary/10 via-transparent to-accent/10">
									<button
										onClick={handleDismiss}
										className="absolute top-4 right-4 p-1.5 hover:bg-muted/50 rounded-lg transition-colors"
										aria-label="Close"
									>
										<X className="w-4 h-4" />
									</button>
									<h2 className="text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
										{currentStep.title}
									</h2>
								</div>

								{/* Content */}
								<div className="p-6">
									<p className="text-muted-foreground leading-relaxed mb-6">
										{currentStep.content}
									</p>
									{currentStep.actions}
								</div>

								{/* Progress dots */}
								{step > 0 && (
									<div className="flex justify-center gap-2 pb-4">
										{tutorialSteps.slice(1).map((_, i) => (
											<div
												key={i}
												className={cn(
													'w-2 h-2 rounded-full transition-all',
													i + 1 === step ? 'bg-primary w-6' : 'bg-muted',
												)}
											/>
										))}
									</div>
								)}
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
