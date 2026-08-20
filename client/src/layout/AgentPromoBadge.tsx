'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ExternalLink, Bot, X } from 'lucide-react';

const AGENT_WEBSITE_URL =
	process.env.NEXT_PUBLIC_AGENT_WEBSITE_URL || 'https://agent.anuragbasuri.me';

export function AgentPromoBadge() {
	const [isVisible, setIsVisible] = useState(true);
	const [isHovered, setIsHovered] = useState(false);

	if (!isVisible) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.9 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ delay: 0.8, duration: 0.5, type: 'spring' }}
			className="fixed bottom-4 left-4 z-40 hidden sm:block"
		>
			<div
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				className="group relative flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-background/85 px-3.5 py-2 text-xs font-medium text-foreground backdrop-blur-xl shadow-[0_0_25px_-5px_rgba(16,185,129,0.25)] transition-all hover:border-emerald-500/60 hover:shadow-[0_0_30px_0_rgba(16,185,129,0.4)]"
			>
				{/* Pulsing Dot */}
				<div className="relative flex h-2.5 w-2.5 items-center justify-center">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
					<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
				</div>

				{/* Agent Link */}
				<a
					href={AGENT_WEBSITE_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-2 text-foreground/90 hover:text-white transition-colors"
				>
					<Bot className="h-4 w-4 text-emerald-400" />
					<span className="font-semibold tracking-wide text-xs">
						Autonomous Agent
					</span>
					<span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
						LIVE
					</span>
					<ExternalLink className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-400" />
				</a>

				{/* Dismiss Button */}
				<button
					onClick={(e) => {
						e.stopPropagation();
						setIsVisible(false);
					}}
					className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors cursor-pointer"
					aria-label="Dismiss banner"
				>
					<X size={12} />
				</button>

				{/* Hover Tooltip Card */}
				<AnimatePresence>
					{isHovered && (
						<motion.div
							initial={{ opacity: 0, y: 10, scale: 0.95 }}
							animate={{ opacity: 1, y: -8, scale: 1 }}
							exit={{ opacity: 0, y: 5, scale: 0.95 }}
							className="absolute bottom-full left-0 mb-2 w-64 rounded-xl border border-emerald-500/30 bg-card/95 p-3 text-xs text-foreground shadow-2xl backdrop-blur-xl pointer-events-none"
						>
							<div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] mb-1 uppercase tracking-wider">
								<Sparkles size={13} />
								<span>Multi-Tier Autonomous AI</span>
							</div>
							<p className="text-[11px] text-muted-foreground leading-relaxed">
								Experience deep tool execution, full conversation memory, and live RAG retrieval in Anurag's full Agent platform.
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
}
