'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent, ComponentType, SVGProps } from 'react';
import { publicService } from '@/api';
import type { AboutData } from '@/api/schema';

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
	Instagram,
	Youtube,
	Facebook,
	Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { SectionHeader } from '@/ui/SectionHeader';

const SOCIAL_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
	GITHUB: Github,
	LINKEDIN: Linkedin,
	TWITTER: Twitter,
	X: Twitter,
	REDDIT: MessageSquare,
	INSTAGRAM: Instagram,
	FACEBOOK: Facebook,
	YOUTUBE: Youtube,
	DISCORD: MessageSquare,
	TELEGRAM: MessageSquare,
	WHATSAPP: MessageSquare,
	WEBSITE: Globe,
	OTHER: Globe,
};

function ContactSkeleton() {
	return (
		<div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto animate-pulse pb-32">
			<div className="space-y-4 mb-12 pb-8">
				<div className="h-6 w-24 bg-foreground/5 rounded-lg" />
				<div className="h-12 w-56 bg-foreground/5 rounded-xl" />
				<div className="h-5 w-96 bg-foreground/5 rounded-lg" />
			</div>
			<div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
				<div className="flex-1 space-y-6">
					<div className="h-40 bg-foreground/5 rounded-[2.5rem]" />
					<div className="h-40 bg-foreground/5 rounded-[2.5rem]" />
				</div>
				<div className="flex-1 lg:max-w-xl">
					<div className="h-[500px] bg-foreground/5 rounded-[2.5rem]" />
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
		let cancelled = false;
		async function fetchData() {
			try {
				const { data: profileData } = await publicService.getProfile();
				if (!cancelled) {
					setAbout(profileData);
				}
			} catch (err) {
				console.error(err);
			} finally {
				if (!cancelled) setInitialLoading(false);
			}
		}
		fetchData();
		return () => { cancelled = true; };
	}, []);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);

		try {
			await publicService.submitContact(formData);
			setSuccess(true);
			setFormData({ name: '', email: '', subject: '', message: '' });
			toast.success('Message sent successfully!');
			setTimeout(() => setSuccess(false), 5000); // Reset success after 5s
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

	const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData(prev => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	}, []);

	const copyEmail = useCallback(() => {
		if (about?.email) {
			navigator.clipboard.writeText(about.email);
			setCopied(true);
			toast.success('Email copied to clipboard');
			setTimeout(() => setCopied(false), 2000);
		}
	}, [about?.email]);

	if (initialLoading) return <ContactSkeleton />;

	return (
		<div className="h-full w-full relative">
			{/* Very subtle ambient spotlight behind contact module to signify "end of page" */}
			<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

			<div className="p-4 sm:p-5 md:p-8 max-w-5xl mx-auto pb-16 sm:pb-24">
				{/* Standardized Header */}
				<SectionHeader
					icon={MessageSquare}
					label="Connect"
					title="Get In Touch"
					description="I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions."
					sectionId="contact"
				/>

				<div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-8 md:mt-12">
					{/* Left Column: Info */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className="flex-1 space-y-6 sm:space-y-8"
					>
						<div className="space-y-6">
							{/* Email Card (Teal Accent) */}
							<div className="relative p-6 sm:p-8 rounded-3xl bg-card/80 border border-border backdrop-blur-xl transition-all duration-500 overflow-hidden group hover:border-teal-500/30 shadow-2xl">
								<div className="absolute inset-0 bg-linear-to-br from-teal-500/0 via-transparent to-transparent group-hover:from-teal-500/10 transition-colors duration-700 pointer-events-none" />
								<div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
									<div className="p-4 sm:p-5 rounded-3xl bg-card border border-border text-teal-400 group-hover:scale-110 group-hover:bg-teal-500/10 group-hover:border-teal-500/30 transition-all duration-500 shadow-xl shrink-0">
										<Mail className="w-8 h-8" />
									</div>
									<div className="flex-1 w-full max-w-[16rem] sm:max-w-none mx-auto sm:mx-0">
										<h3 className="text-xl sm:text-2xl text-foreground font-black mb-3 sm:mb-2 tracking-tight">
											Email Me
										</h3>
										<div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-card p-3 sm:p-2 sm:pl-4 rounded-2xl border border-border shadow-inner">
											<span className="text-muted-foreground font-mono text-sm sm:text-base selection:bg-teal-500/30 truncate flex-1">
												{about?.email || 'contact@example.com'}
											</span>
											{about?.email && (
												<button
													onClick={copyEmail}
													className="p-2 sm:p-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all border border-border hover:border-border shrink-0 w-full sm:w-auto flex justify-center mt-2 sm:mt-0"
													aria-label="Copy email address"
												>
													{copied ? (
														<Check className="w-4 h-4 text-teal-400" />
													) : (
														<Copy className="w-4 h-4 group-hover:text-teal-400/50" />
													)}
												</button>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Location Card (Purple Accent) */}
							<div className="relative p-6 sm:p-8 rounded-3xl bg-card/80 border border-border backdrop-blur-xl transition-all duration-500 overflow-hidden group hover:border-purple-500/30 shadow-2xl">
								<div className="absolute inset-0 bg-linear-to-br from-purple-500/0 via-transparent to-transparent group-hover:from-purple-500/10 transition-colors duration-700 pointer-events-none" />
								{/* Faint map background icon */}
								<MapPin className="absolute right-[-10%] top-[-20%] w-64 h-64 text-white/5 group-hover:text-purple-500/5 transition-colors duration-700 -rotate-12 pointer-events-none" />
								
								<div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
									<div className="p-4 sm:p-5 rounded-3xl bg-card border border-border text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-all duration-500 shadow-xl shrink-0">
										<MapPin className="w-8 h-8" />
									</div>
									<div className="mt-1">
										<h3 className="text-xl sm:text-2xl text-foreground font-black mb-2 tracking-tight">
											Location
										</h3>
										<p className="text-muted-foreground font-medium text-base sm:text-lg">
											{about?.Currentlocation || 'San Francisco Bay Area, CA'}
										</p>
										<div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
											<span className="relative flex h-2 w-2">
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
												<span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
											</span>
											<span className="text-[10px] text-purple-400 uppercase tracking-widest font-black">
												Remote Available
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Links Wrapper */}
						<div className="pt-4 px-2">
							<h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 text-center sm:text-left">
								Social Protocols
							</h3>
							<div className="flex flex-wrap justify-center sm:justify-start gap-4">
								{(about?.socialLinks ?? []).map((social, index) => {
									const Icon = SOCIAL_ICONS[social.platform] || Globe;
									return (
										<a
											key={social.id || `${social.platform}-${index}`}
											href={social.url}
											target="_blank"
											rel="noopener noreferrer"
											className="p-4 sm:p-5 flex items-center justify-center rounded-3xl bg-card border border-border hover:bg-card hover:border-white/30 transition-all duration-300 text-muted-foreground hover:text-foreground group hover:scale-110 active:scale-95 shadow-xl"
											aria-label={`Visit ${social.customLabel || social.platform} profile`}
										>
											<Icon className="w-6 sm:w-7 h-6 sm:h-7 transition-colors duration-300" />
										</a>
									);
								})}
							</div>
						</div>
					</motion.div>

					{/* Right Column: Form */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="flex-1 lg:max-w-xl"
					>
						<form
							onSubmit={handleSubmit}
							className="relative p-6 sm:p-8 rounded-3xl bg-card/80 border border-border backdrop-blur-xl shadow-2xl flex flex-col gap-5 sm:gap-6 group hover:border-teal-500/20 transition-colors duration-500"
						>
							<div className="absolute inset-0 bg-linear-to-tl from-teal-500/0 via-transparent to-transparent group-hover:from-teal-500/5 transition-colors duration-700 pointer-events-none rounded-3xl" />

							<h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2 tracking-tight relative z-10 flex items-center gap-3">
								<span className="w-2 h-8 rounded-full bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]" />
								Transmission
							</h2>
							<p className="text-muted-foreground text-sm mb-8 font-medium ml-5 relative z-10">Send a direct message. I'll get back to you soon.</p>

							<div className="space-y-6 relative z-10">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2.5">
										<label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
											Name
										</label>
										<input
											type="text"
											name="name"
											value={formData.name}
											onChange={handleChange}
											required
											className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-foreground focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder:text-muted-foreground text-sm shadow-inner outline-hidden"
											placeholder="Jane Doe"
										/>
									</div>
									<div className="space-y-2.5">
										<label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
											Email
										</label>
										<input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											required
											className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-foreground focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder:text-muted-foreground text-sm shadow-inner outline-hidden"
											placeholder="jane@example.com"
										/>
									</div>
								</div>

								<div className="space-y-2.5">
									<label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
										Subject
									</label>
									<input
										type="text"
										name="subject"
										value={formData.subject}
										onChange={handleChange}
										className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-foreground focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder:text-muted-foreground text-sm shadow-inner outline-hidden"
										placeholder="Project Inquiry"
									/>
								</div>

								<div className="space-y-2.5">
									<label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
										Message
									</label>
									<textarea
										name="message"
										value={formData.message}
										onChange={handleChange}
										required
										rows={5}
										className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-foreground focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all resize-none placeholder:text-muted-foreground text-sm shadow-inner outline-hidden"
										placeholder="Describe your vision..."
									/>
								</div>

								<div className="pt-4">
									<button
										type="submit"
										disabled={loading || success}
										className={cn(
											'w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all duration-300 shadow-xl overflow-hidden relative group/btn',
											success
												? 'bg-teal-500 text-black cursor-default border-transparent'
												: 'bg-foreground/5 border border-border text-foreground hover:bg-teal-500 hover:text-black hover:border-teal-400',
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
												<span className="relative z-10 transition-transform group-hover/btn:-translate-x-1">
													Initiate Contact
												</span>
												<Send className="w-4 h-4 relative z-10 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
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
											className="overflow-hidden"
										>
											<div className="text-rose-400 text-[10px] font-black uppercase tracking-wider text-center bg-rose-500/10 py-3 px-4 rounded-xl border border-rose-500/20 mt-4 shadow-inner">
												{error}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</form>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
