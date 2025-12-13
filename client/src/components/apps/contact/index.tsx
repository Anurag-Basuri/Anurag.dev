'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Send,
	CheckCircle,
	Mail,
	MapPin,
	Github,
	Twitter,
	Linkedin,
	Copy,
	Check,
	MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { ModuleHeader } from '@/components/apps/shared/ModuleHeader';

function ContactSkeleton() {
	return (
		<div className="p-6 md:p-10 max-w-6xl mx-auto animate-pulse">
			<div className="flex flex-col md:flex-row gap-12">
				<div className="flex-1 space-y-8">
					<div className="h-8 bg-muted rounded w-64" />
					<div className="h-20 bg-muted rounded" />
					<div className="space-y-4">
						<div className="h-32 bg-card/20 rounded-2xl" />
						<div className="h-32 bg-card/20 rounded-2xl" />
					</div>
				</div>
				<div className="flex-1">
					<div className="h-96 bg-card/20 rounded-3xl" />
				</div>
			</div>
		</div>
	);
}

export function ContactModule() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	});
	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	// Simulate initial load
	useEffect(() => {
		setTimeout(() => setInitialLoading(false), 300);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			const result = await api.submitContact(formData);
			if (result.success) {
				setSuccess(true);
				setFormData({ name: '', email: '', subject: '', message: '' });
				if (result.message) {
					toast.success(result.message);
				}
			} else {
				// Handle offline success or specific server errors that aren't exceptions
				if (result.message.includes('Offline')) {
					setSuccess(true); // Still treat as success for UI flow
					setFormData({ name: '', email: '', subject: '', message: '' });
					toast(result.message, {
						icon: '⚠️',
						style: {
							borderRadius: '10px',
							background: '#333',
							color: '#fff',
						},
					});
				} else {
					setError(result.message);
				}
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('Failed to send message');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData(prev => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const copyEmail = () => {
		navigator.clipboard.writeText('contact@anuragos.dev'); // Replace with actual email
		setCopied(true);
		toast.success('Email copied to clipboard');
		setTimeout(() => setCopied(false), 2000);
	};

	if (initialLoading) return <ContactSkeleton />;

	return (
		<ScrollArea className="h-full">
			<div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto pb-20">
				{/* Standardized Header */}
				<ModuleHeader
					icon={MessageSquare}
					label="Communication Channel"
					title="Get In Touch"
				/>

				<div className="flex flex-col md:flex-row gap-12">
					{/* Left Column: Info */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className="flex-1 space-y-8"
					>
						<p className="text-muted-foreground text-base md:text-lg leading-relaxed">
							I&apos;m always open to discussing new projects, creative ideas, or
							opportunities to be part of your visions.
						</p>

						<div className="space-y-6">
							<div className="p-4 sm:p-6 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm hover:border-emerald-500/30 transition-all group">
								<div className="flex items-start gap-4">
									<div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
										<Mail className="w-6 h-6" />
									</div>
									<div className="flex-1">
										<h3 className="text-foreground font-semibold mb-1">
											Email Me
										</h3>
										<div className="flex items-center gap-2">
											<span className="text-muted-foreground font-mono">
												contact@anuragos.dev
											</span>
											<button
												onClick={copyEmail}
												className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
												title="Copy Email"
											>
												{copied ? (
													<Check className="w-3.5 h-3.5 text-green-400" />
												) : (
													<Copy className="w-3.5 h-3.5" />
												)}
											</button>
										</div>
									</div>
								</div>
							</div>

							<div className="p-4 sm:p-6 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm hover:border-purple-500/30 transition-all group">
								<div className="flex items-start gap-4">
									<div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
										<MapPin className="w-6 h-6" />
									</div>
									<div>
										<h3 className="text-foreground font-semibold mb-1">
											Location
										</h3>
										<p className="text-muted-foreground">
											San Francisco Bay Area, CA
										</p>
										<p className="text-xs text-muted-foreground mt-1">
											Remote Available
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
								Social Protocols
							</h3>
							<div className="flex gap-2 sm:gap-3">
								<a
									href="#"
									target="_blank"
									className="p-3 sm:p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-muted-foreground hover:text-white group"
								>
									<Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
								</a>
								<a
									href="#"
									target="_blank"
									className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all text-muted-foreground hover:text-blue-400 group"
								>
									<Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
								</a>
								<a
									href="#"
									target="_blank"
									className="p-3 rounded-xl bg-blue-600/5 border border-blue-600/10 hover:bg-blue-600/10 hover:border-blue-600/20 transition-all text-muted-foreground hover:text-blue-500 group"
								>
									<Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
								</a>
							</div>
						</div>
					</motion.div>

					{/* Right Column: Form */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="flex-1"
					>
						<div className="p-6 sm:p-8 rounded-3xl bg-card/30 border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
							<div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-transparent pointer-events-none" />

							<h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 relative z-10">
								<span className="w-2 h-8 rounded-full bg-green-500" />
								Send Message
							</h2>

							<form onSubmit={handleSubmit} className="space-y-5 relative z-10">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
											Name
										</label>
										<input
											type="text"
											name="name"
											value={formData.name}
											onChange={handleChange}
											required
											className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 min-h-[44px] text-foreground focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 focus:outline-none transition-all placeholder:text-muted-foreground/30"
											placeholder="John Doe"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
											Email
										</label>
										<input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											required
											className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 focus:outline-none transition-all placeholder:text-muted-foreground/30"
											placeholder="john@example.com"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										Subject
									</label>
									<input
										type="text"
										name="subject"
										value={formData.subject}
										onChange={handleChange}
										className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 focus:outline-none transition-all placeholder:text-muted-foreground/30"
										placeholder="Project Inquiry"
									/>
								</div>

								<div className="space-y-2">
									<label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										Message
									</label>
									<textarea
										name="message"
										value={formData.message}
										onChange={handleChange}
										required
										rows={5}
										className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 focus:outline-none transition-all resize-none placeholder:text-muted-foreground/30"
										placeholder="Tell me about your project..."
									/>
								</div>

								<div className="pt-2">
									<button
										type="submit"
										disabled={loading || success}
										className={cn(
											'w-full py-3.5 min-h-[48px] rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg',
											success
												? 'bg-green-500 text-black cursor-default'
												: 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02]',
										)}
									>
										{loading ? (
											<span className="animate-pulse">Sending...</span>
										) : success ? (
											<>
												<CheckCircle className="w-5 h-5" />
												<span>Message Sent</span>
											</>
										) : (
											<>
												<span>Send Message</span>
												<Send className="w-4 h-4" />
											</>
										)}
									</button>
								</div>

								<AnimatePresence>
									{error && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											exit={{ opacity: 0, height: 0 }}
											className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20"
										>
											{error}
										</motion.div>
									)}
								</AnimatePresence>
							</form>
						</div>
					</motion.div>
				</div>
			</div>
		</ScrollArea>
	);
}
