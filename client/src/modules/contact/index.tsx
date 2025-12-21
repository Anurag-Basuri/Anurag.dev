'use client';

import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { api, AboutData } from '@/lib/api';
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
import { ModuleHeader } from '@/modules/shared/ModuleHeader';

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
	const [about, setAbout] = useState<AboutData | null>(null);

	// Fetch data
	useEffect(() => {
		const fetchData = async () => {
			try {
				const aboutData = await api.getAbout();
				setAbout(aboutData);
			} catch (err) {
				console.error('Failed to fetch about data in contact module', err);
			} finally {
				setInitialLoading(false);
			}
		};
		fetchData();
	}, []);

	const handleSubmit = async (e: FormEvent) => {
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

	const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

	if (error) {
		return <div className="text-center py-24 text-muted-foreground">{error}</div>;
	}

	const socialIcons: Record<string, any> = {
		GitHub: Github,
		Twitter: Twitter,
		LinkedIn: Linkedin,
	};

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
							<div className="p-4 sm:p-6 rounded-2xl bg-card/30 border border-white/5 backdrop-blur-sm hover:border-emerald-500/30 transition-all group">
								<div className="flex items-start gap-4">
									<div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform shadow-inner shadow-emerald-500/5">
										<Mail className="w-6 h-6" />
									</div>
									<div className="flex-1">
										<h3 className="text-foreground font-semibold mb-1">
											Email Me
										</h3>
										<div className="flex items-center gap-2">
											<span className="text-muted-foreground font-mono text-sm sm:text-base">
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

							<div className="p-4 sm:p-6 rounded-2xl bg-card/30 border border-white/5 backdrop-blur-sm hover:border-purple-500/30 transition-all group">
								<div className="flex items-start gap-4">
									<div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform shadow-inner shadow-purple-500/5">
										<MapPin className="w-6 h-6" />
									</div>
									<div>
										<h3 className="text-foreground font-semibold mb-1">
											Location
										</h3>
										<p className="text-muted-foreground">
											San Francisco Bay Area, CA
										</p>
										<p className="text-xs text-muted-foreground/60 mt-1 uppercase tracking-wider font-medium">
											Remote Available
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">
								Social Protocols
							</h3>
							<div className="flex gap-2 sm:gap-3">
								{about?.socials.map(social => {
									const Icon = socialIcons[social.platform] || Mail;
									return (
										<a
											key={social.platform}
											href={social.url}
											target="_blank"
											rel="noopener noreferrer"
											className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-muted-foreground hover:text-white group hover:scale-105 active:scale-95"
											title={social.platform}
										>
											<Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
										</a>
									);
								})}
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
							<div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent pointer-events-none" />

							<h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 relative z-10">
								<span className="w-1.5 h-8 rounded-full bg-linear-to-b from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
								Send Message
							</h2>

							<form onSubmit={handleSubmit} className="space-y-5 relative z-10">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
											Name
										</label>
										<input
											type="text"
											name="name"
											value={formData.name}
											onChange={handleChange}
											required
											className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 min-h-[44px] text-foreground focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-hidden transition-all placeholder:text-muted-foreground/20 text-sm"
											placeholder="John Doe"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
											Email
										</label>
										<input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											required
											className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 min-h-[44px] text-foreground focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-hidden transition-all placeholder:text-muted-foreground/20 text-sm"
											placeholder="john@example.com"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
										Subject
									</label>
									<input
										type="text"
										name="subject"
										value={formData.subject}
										onChange={handleChange}
										className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 min-h-[44px] text-foreground focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-hidden transition-all placeholder:text-muted-foreground/20 text-sm"
										placeholder="Project Inquiry"
									/>
								</div>

								<div className="space-y-2">
									<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
										Message
									</label>
									<textarea
										name="message"
										value={formData.message}
										onChange={handleChange}
										required
										rows={5}
										className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-hidden transition-all resize-none placeholder:text-muted-foreground/20 text-sm"
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
