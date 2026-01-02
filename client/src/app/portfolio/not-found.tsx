'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, FolderSearch, FileCode, FileText, User, Mail, Award } from 'lucide-react';

// Suggested modules to help user navigate
const SUGGESTED_MODULES = [
	{ id: 'about', icon: User, label: 'About.tsx', description: 'Profile & Skills' },
	{ id: 'projects', icon: FileCode, label: 'Projects.tsx', description: 'Portfolio Work' },
	{ id: 'contact', icon: Mail, label: 'Contact.tsx', description: 'Get in Touch' },
	{ id: 'certifications', icon: Award, label: 'Certs.tsx', description: 'Achievements' },
];

export default function PortfolioNotFound() {
	return (
		<div className="h-full w-full flex items-center justify-center bg-transparent p-6 font-mono">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
				className="max-w-md w-full"
			>
				{/* File Explorer Card */}
				<div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-lg overflow-hidden shadow-xl">
					{/* Header */}
					<div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border/30">
						<FolderSearch className="w-4 h-4 text-amber-400" />
						<span className="text-sm text-foreground/70">File Explorer</span>
						<span className="ml-auto text-xs text-muted-foreground">
							~/portfolio/???
						</span>
					</div>

					{/* Content */}
					<div className="p-6 text-center">
						{/* Icon */}
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
							className="relative inline-block mb-5"
						>
							<div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
							<div className="relative bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
								<FileText className="w-10 h-10 text-amber-400" />
							</div>
						</motion.div>

						{/* Message */}
						<h1 className="text-xl font-bold text-foreground mb-2">Module Not Found</h1>
						<p className="text-muted-foreground text-sm mb-6">
							The requested file doesn&apos;t exist in this directory.
						</p>

						{/* Suggested Files */}
						<div className="bg-background/50 rounded-lg border border-border/30 p-3 mb-6">
							<p className="text-xs text-muted-foreground mb-3 text-left">
								Available modules:
							</p>
							<div className="grid grid-cols-2 gap-2">
								{SUGGESTED_MODULES.map((module, index) => (
									<motion.div
										key={module.id}
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.3 + index * 0.1 }}
									>
										<Link
											href={`/portfolio/${module.id}`}
											className="flex items-center gap-2 p-2 rounded-md bg-muted/30 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all group text-left"
										>
											<module.icon className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
											<div className="min-w-0">
												<p className="text-xs font-medium text-foreground/80 truncate">
													{module.label}
												</p>
												<p className="text-[10px] text-muted-foreground truncate">
													{module.description}
												</p>
											</div>
										</Link>
									</motion.div>
								))}
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center justify-center gap-3">
							<Link
								href="/portfolio"
								className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all border border-emerald-500/30 text-sm font-medium hover:scale-105"
							>
								<Home className="w-4 h-4" />
								~/home
							</Link>
							<button
								onClick={() => window.history.back()}
								className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-foreground/70 hover:bg-muted transition-all border border-border/50 text-sm font-medium hover:scale-105"
							>
								<ArrowLeft className="w-4 h-4" />
								cd ..
							</button>
						</div>
					</div>
				</div>

				{/* Path hint */}
				<p className="text-center text-muted-foreground/50 text-xs mt-4 font-mono">
					Error: ENOENT: no such file or directory
				</p>
			</motion.div>
		</div>
	);
}
