'use client';

import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { apiClient } from '@/api/client';
import type { AboutData } from '@/api/schema';
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
import { SectionHeader } from '@/components/layout/SectionHeader';

function ContactSkeleton() {
	return (
		<div className="p-6 md:p-10 max-w-6xl mx-auto animate-pulse">
			<div className="flex flex-col md:flex-row gap-12">
				<div className="flex-1 space-y-8">
					<div className="h-8 bg-white/5 rounded w-64" />
					<div className="h-20 bg-white/5 rounded" />
					<div className="space-y-4">
						<div className="h-32 bg-[#0a0a0a]/60 backdrop-blur rounded-[2rem] border border-white/5" />
						<div className="h-32 bg-[#0a0a0a]/60 backdrop-blur rounded-[2rem] border border-white/5" />
					</div>
				</div>
				<div className="flex-1">
					<div className="h-96 bg-[#0a0a0a]/60 backdrop-blur rounded-[2.5rem] border border-white/5" />
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
				const profileData = await apiClient.get<AboutData>('/profile');
				setAbout(profileData);
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
			await apiClient.post('/contact', formData);
			setSuccess(true);
			setFormData({ name: '', email: '', subject: '', message: '' });
			toast.success('Message sent successfully!');
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
		if (about?.email) {
			navigator.clipboard.writeText(about.email);
		} else {
			navigator.clipboard.writeText('contact@example.com');
		}
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
		<ScrollArea className="h-full w-full">
			<div className="p-4 sm:p-6 md:p-12 max-w-6xl mx-auto pb-32">
				{/* Standardized Header */}
				<SectionHeader
					icon={MessageSquare}
					label="Connect"
					title="Get In Touch"
					description="I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions."
				/>

				<div className="flex flex-col md:flex-row gap-12 mt-12">
					{/* Left Column: Info */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className="flex-1 space-y-8"
					>
						<div className="space-y-6">
							<div className="relative p-6 sm:p-8 rounded-[2rem] bg-[#0a0a0a]/80 border border-white/5 backdrop-blur-xl hover:border-primary/40 hover:shadow-[0_0_40px_0px_rgba(16,185,129,0.1)] transition-all duration-500 overflow-hidden group">
								<div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
								<div className="relative z-10 flex items-start gap-5">
									<div className="p-4 rounded-[1.25rem] bg-white/5 text-primary group-hover:scale-110 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-500 shadow-inner">
										<Mail className="w-6 h-6" />
									</div>
									<div className="flex-1 mt-1">
										<h3 className="text-white font-bold mb-2 tracking-tight">
											Email Me
										</h3>
										<div className="flex items-center gap-3">
											<span className="text-muted-foreground font-mono text-sm sm:text-base selection:bg-primary/30">
												{about?.email || 'contact@example.com'}
											</span>
											<button
												onClick={copyEmail}
												className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors border border-white/5 hover:border-white/10"
												title="Copy Email"
											>
												{copied ? (
													<Check className="w-4 h-4 text-primary" />
												) : (
													<Copy className="w-4 h-4" />
												)}
											</button>
										</div>
									</div>
								</div>
							</div>

							<div className="relative p-6 sm:p-8 rounded-[2rem] bg-[#0a0a0a]/80 border border-white/5 backdrop-blur-xl hover:border-purple-500/40 hover:shadow-[0_0_40px_0px_rgba(168,85,247,0.1)] transition-all duration-500 overflow-hidden group">
								<div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
								<div className="relative z-10 flex items-start gap-5">
									<div className="p-4 rounded-[1.25rem] bg-white/5 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all duration-500 shadow-inner">
										<MapPin className="w-6 h-6" />
									</div>
									<div className="mt-1">
										<h3 className="text-white font-bold mb-2 tracking-tight">
											Location
										</h3>
										<p className="text-muted-foreground">
											{about?.Currentlocation || 'San Francisco Bay Area, CA'}
										</p>
										<p className="text-[10px] text-primary/80 mt-2 uppercase tracking-[0.2em] font-bold">
											Remote Available
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-4 pt-4">
							<h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
								Social Protocols
							</h3>
							<div className="flex gap-4">
								{about?.socials.map(social => {
									const Icon = socialIcons[social.platform] || Mail;
									return (
										<a
											key={social.platform}
											href={social.url}
											target="_blank"
											rel="noopener noreferrer"
											className="p-4 rounded-[1.25rem] bg-[#0a0a0a]/80 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-muted-foreground hover:text-white group hover:scale-105 active:scale-95 shadow-inner hover:shadow-[0_0_20px_0px_rgba(255,255,255,0.05)]"
											title={social.platform}
										>
											<Icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-500" />
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
						<div className="p-8 sm:p-10 rounded-[2.5rem] bg-[#0a0a0a]/80 border border-white/5 backdrop-blur-xl shadow-[0_0_40px_0_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-white/10 transition-colors duration-500">
							<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

							<h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4 relative z-10 tracking-tight">
								<span className="w-2 h-10 rounded-full bg-linear-to-b from-primary to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
								Send a Message
							</h2>

							<form onSubmit={handleSubmit} className="space-y-6 relative z-10">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2.5">
										<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] ml-1">
											Name
										</label>
										<input
											type="text"
											name="name"
											value={formData.name}
											onChange={handleChange}
											required
											className="w-full bg-black/40 border border-white/10 rounded-[1.25rem] px-5 py-4 min-h-[52px] text-white focus:border-primary/50 focus:bg-black/60 transition-all placeholder:text-muted-foreground/30 text-sm shadow-inner outline-hidden"
											placeholder="Jane Doe"
										/>
									</div>
									<div className="space-y-2.5">
										<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] ml-1">
											Email
										</label>
										<input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											required
											className="w-full bg-black/40 border border-white/10 rounded-[1.25rem] px-5 py-4 min-h-[52px] text-white focus:border-primary/50 focus:bg-black/60 transition-all placeholder:text-muted-foreground/30 text-sm shadow-inner outline-hidden"
											placeholder="jane@example.com"
										/>
									</div>
								</div>

								<div className="space-y-2.5">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] ml-1">
										Subject
									</label>
									<input
										type="text"
										name="subject"
										value={formData.subject}
										onChange={handleChange}
										className="w-full bg-black/40 border border-white/10 rounded-[1.25rem] px-5 py-4 min-h-[52px] text-white focus:border-primary/50 focus:bg-black/60 transition-all placeholder:text-muted-foreground/30 text-sm shadow-inner outline-hidden"
										placeholder="Inquiry or Project Idea"
									/>
								</div>

								<div className="space-y-2.5">
									<label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] ml-1">
										Message
									</label>
									<textarea
										name="message"
										value={formData.message}
										onChange={handleChange}
										required
										rows={5}
										className="w-full bg-black/40 border border-white/10 rounded-[1.25rem] px-5 py-4 text-white focus:border-primary/50 focus:bg-black/60 transition-all resize-none placeholder:text-muted-foreground/30 text-sm shadow-inner outline-hidden"
										placeholder="Describe your vision..."
									/>
								</div>

								<div className="pt-4">
									<button
										type="submit"
										disabled={loading || success}
										className={cn(
											'w-full py-4 min-h-[56px] rounded-[1.25rem] font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-3 transition-all duration-300 shadow-xl overflow-hidden relative',
											success
												? 'bg-primary text-black cursor-default border-transparent'
												: 'bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black hover:border-transparent hover:scale-[1.02]',
										)}
									>
										{loading ? (
											<span className="animate-pulse">Transmitting...</span>
										) : success ? (
											<>
												<CheckCircle className="w-5 h-5" />
												<span>Message Delivered</span>
											</>
										) : (
											<>
												<span className="relative z-10">
													Initiate Contact
												</span>
												<Send className="w-4 h-4 relative z-10" />
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
											className="text-rose-400 text-sm text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 font-medium"
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

