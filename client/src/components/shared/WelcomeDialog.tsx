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
				"This is my interactive portfolio. Navigate using the terminal (CLI) or by clicking files. What's your style?",
			actions: (
				<div className="flex flex-col gap-3">
					<button
						onClick={handleKnowTerminals}
						className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
					>
						<Terminal className="w-4 h-4" />I love terminals 🖥️
					</button>
					<button
						onClick={handleShowAround}
						className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-lg transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
					>
						<Sparkles className="w-4 h-4" />
						Show me how it works ✨
					</button>
					<button
						onClick={handleDismiss}
						className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
					>
						Maybe later →
					</button>
				</div>
			),
		},
		{
			title: 'Two Ways to Explore',
			content: (
				<div className="space-y-4 text-sm">
					<div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
						<Terminal className="w-5 h-5 text-primary shrink-0 mt-0.5" />
						<div>
							<div className="font-semibold text-foreground mb-1">
								Terminal Commands
							</div>
							<div className="text-muted-foreground text-xs space-y-1">
								<div>
									• Type{' '}
									<code className="text-primary bg-primary/10 px-1 rounded">
										about
									</code>{' '}
									or{' '}
									<code className="text-primary bg-primary/10 px-1 rounded">
										projects
									</code>
								</div>
								<div>
									• Use{' '}
									<code className="text-primary bg-primary/10 px-1 rounded">
										help
									</code>{' '}
									for all commands
								</div>
							</div>
						</div>
					</div>
					<div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
						<MousePointer className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
						<div>
							<div className="font-semibold text-foreground mb-1">
								Click & Explore
							</div>
							<div className="text-muted-foreground text-xs">
								Click any file in the Explorer (left side) to open it instantly
							</div>
						</div>
					</div>
				</div>
			),
			actions: (
				<button
					onClick={handleDismiss}
					className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium w-full"
				>
					Got it! Let's explore 🚀
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
								{step === 1 && (
									<div className="flex justify-center gap-2 pb-4">
										{[0, 1].map(i => (
											<div
												key={i}
												className={cn(
													'w-2 h-2 rounded-full transition-all duration-200',
													i === step ? 'bg-primary w-6' : 'bg-muted',
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
