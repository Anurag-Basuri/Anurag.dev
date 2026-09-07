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
	Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { SectionHeader } from '@/ui/SectionHeader';
import { staggerContainer, staggerItem, fadeInUp } from '@/animations/motion';

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
		<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto animate-pulse pb-16 pt-6">
			<div className="space-y-3 mb-8">
				<div className="h-5 w-24 bg-foreground/5 rounded-lg" />
				<div className="h-8 w-56 bg-foreground/5 rounded-xl" />
			</div>
			<div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-8">
				<div className="flex-1 space-y-6">
					<div className="h-36 bg-foreground/5 rounded-2xl" />
					<div className="h-36 bg-foreground/5 rounded-2xl" />
				</div>
				<div className="flex-1 lg:max-w-xl">
					<div className="h-120 bg-foreground/5 rounded-2xl" />
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
		return () => {
			cancelled = true;
		};
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
			setTimeout(() => setSuccess(false), 5000);
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
			{/* Ambient Bottom Glow */}
			<div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-150 rounded-[100%] bg-[radial-gradient(ellipse_at_center,var(--theme-primary)_0%,transparent_60%)] opacity-5 blur-[120px] pointer-events-none -z-10" />

			<div className="px-4 sm:px-6 md:px-10 max-w-7xl mx-auto pb-10 sm:pb-16 pt-4 md:pt-6">
				<SectionHeader
					icon={MessageSquare}
					label="Connect"
					title="Get In Touch"
					description="I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions."
					sectionId="contact"
				/>

				{/* ─────────────── Desktop Large Screen View ─────────────── */}
				<div className="hidden lg:flex flex-row gap-8 lg:gap-10 mt-12">
					{/* Left Column: Info & Socials */}
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-40px' }}
						className="flex-1 space-y-8"
					>
						{/* Email Card */}
						<motion.div
							variants={staggerItem}
							className="group relative rounded-4xl p-8 bg-card/30 backdrop-blur-3xl border border-border overflow-hidden hover:border-primary/50 transition-colors duration-500 shadow-2xl"
						>
							<div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
							<div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/40 transition-colors duration-700 pointer-events-none" />

							<div className="relative z-10 flex flex-row items-start gap-6">
								<div className="p-4 rounded-2xl bg-card border border-border text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-transform duration-500 shadow-lg shrink-0">
									<Mail className="w-8 h-8" />
								</div>
								<div className="flex-1 mx-0 pt-1">
									<h3 className="text-xl text-foreground font-bold mb-3 tracking-tight">
										Drop an Email
									</h3>
									<div className="flex items-center justify-between gap-4 bg-muted/30 p-3 pl-5 rounded-2xl border border-border/50 group-hover:border-primary/30 transition-colors">
										<span className="text-muted-foreground font-medium text-base truncate">
											{about?.email || 'hello@example.com'}
										</span>
										{about?.email && (
											<button
												onClick={copyEmail}
												className="p-2.5 rounded-xl bg-card hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-all border border-border hover:border-transparent shrink-0 flex justify-center items-center shadow-xs"
												aria-label="Copy email address"
											>
												{copied ? (
													<Check className="w-5 h-5 text-emerald-500 shrink-0" />
												) : (
													<Copy className="w-5 h-5 shrink-0" />
												)}
											</button>
										)}
									</div>
								</div>
							</div>
						</motion.div>

						{/* Location Card */}
						<motion.div
							variants={staggerItem}
							className="group relative rounded-4xl p-8 bg-card/30 backdrop-blur-3xl border border-border overflow-hidden hover:border-primary/50 transition-colors duration-500 shadow-2xl"
						>
							<div className="absolute inset-0 bg-linear-to-bl from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
							<MapPin className="absolute right-[-5%] top-[-5%] w-48 h-48 text-foreground/[0.02] group-hover:text-primary/5 transition-colors duration-700 -rotate-12 pointer-events-none" />

							<div className="relative z-10 flex flex-row items-start gap-6">
								<div className="p-4 rounded-2xl bg-card border border-border text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-transform duration-500 shadow-lg shrink-0">
									<MapPin className="w-8 h-8" />
								</div>
								<div className="flex-1 pt-1">
									<h3 className="text-xl text-foreground font-bold mb-2 tracking-tight">
										Location
									</h3>
									<p className="text-muted-foreground font-medium text-lg mb-4">
										{about?.Currentlocation || 'Global (Remote)'}
									</p>
									<div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
										<span className="relative flex h-2.5 w-2.5">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
											<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
										</span>
										<span className="text-[11px] text-emerald-400 uppercase tracking-widest font-bold">
											Available for Remote
										</span>
									</div>
								</div>
							</div>
						</motion.div>

						{/* Social Protocols */}
						<motion.div variants={staggerItem} className="pt-2">
							<div className="flex items-center gap-4 mb-6 justify-start">
								<h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground text-left">
									Find Me Online
								</h3>
								<div className="h-px bg-border flex-1 max-w-10 block" />
							</div>
							<div className="flex flex-wrap justify-start gap-4">
								{(about?.socialLinks ?? []).map((social, index) => {
									const Icon = SOCIAL_ICONS[social.platform] || Globe;
									return (
										<a
											key={social.id || `${social.platform}-${index}`}
											href={social.url}
											target="_blank"
											rel="noopener noreferrer"
											className="group relative p-4 flex items-center justify-center rounded-[1.25rem] bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-muted-foreground hover:text-primary active:scale-95 shadow-lg overflow-hidden"
											aria-label={`Visit ${social.customLabel || social.platform} profile`}
										>
											<div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
											<Icon className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:scale-110" />
										</a>
									);
								})}
							</div>
						</motion.div>
					</motion.div>

					{/* Right Column: Form */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 30 }}
						whileInView={{ opacity: 1, scale: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
						className="flex-1 max-w-136 w-full"
					>
						<form
							onSubmit={handleSubmit}
							className="relative p-6 sm:p-8 rounded-2xl bg-card/40 backdrop-blur-3xl border border-border shadow-2xl flex flex-col gap-5 w-full"
						>
							<div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent rounded-2xl pointer-events-none" />

							<div className="relative z-10 mb-2">
								<h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight flex items-center gap-3 font-sans">
									<Sparkles className="w-6 h-6 text-primary" />
									Send a Message
								</h2>
								<p className="text-muted-foreground/80 text-sm sm:text-base font-normal leading-relaxed font-sans">
									Got a question or proposal, or just want to say hello? Go ahead.
								</p>
							</div>

							<div className="space-y-5 relative z-10">
								<div className="grid grid-cols-2 gap-5">
									<div className="space-y-2">
										<label className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider ml-1">
											Your Name
										</label>
										<input
											type="text"
											name="name"
											value={formData.name}
											onChange={handleChange}
											required
											className="w-full bg-background/50 backdrop-blur-md border border-border hover:border-primary/50 rounded-2xl px-5 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50 text-base shadow-inner outline-hidden"
											placeholder="Jane Doe"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider ml-1">
											Email Address
										</label>
										<input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											required
											className="w-full bg-background/50 backdrop-blur-md border border-border hover:border-primary/50 rounded-2xl px-5 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50 text-base shadow-inner outline-hidden"
											placeholder="jane@example.com"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider ml-1">
										Subject
									</label>
									<input
										type="text"
										name="subject"
										value={formData.subject}
										onChange={handleChange}
										required
										className="w-full bg-background/50 backdrop-blur-md border border-border hover:border-primary/50 rounded-2xl px-5 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50 text-base shadow-inner outline-hidden"
										placeholder="What's this about?"
									/>
								</div>

								<div className="space-y-2">
									<label className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider ml-1">
										Message
									</label>
									<textarea
										name="message"
										value={formData.message}
										onChange={handleChange}
										required
										rows={5}
										className="w-full bg-background/50 backdrop-blur-md border border-border hover:border-primary/50 rounded-2xl px-5 py-4 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none placeholder:text-muted-foreground/50 text-base shadow-inner outline-hidden"
										placeholder="Hi, I think we need a design system for our products..."
									/>
								</div>

								<div className="pt-4">
									<button
										type="submit"
										disabled={loading || success}
										className={cn(
											'w-full py-3.5 rounded-xl font-sans font-semibold tracking-normal text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden relative group/btn',
											success
												? 'bg-emerald-500 text-black cursor-default border-transparent'
												: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.4)] hover:-translate-y-1',
										)}
									>
										{loading ? (
											<span className="animate-pulse flex items-center gap-2">
												<div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
												Transmitting...
											</span>
										) : success ? (
											<motion.div
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												className="flex items-center gap-2 text-white"
											>
												<CheckCircle className="w-5 h-5" />
												<span>Message Sent Successfully</span>
											</motion.div>
										) : (
											<>
												<span className="relative z-10 font-bold transition-transform group-hover/btn:-translate-x-1">
													Send Message
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
											<div className="text-rose-400 text-xs font-bold uppercase tracking-wider text-center bg-rose-500/10 py-3 px-4 rounded-xl border border-rose-500/20 mt-4 shadow-inner">
												{error}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</form>
					</motion.div>
				</div>

				{/* ─────────────── Mobile Small Screen View ─────────────── */}
				<div className="flex flex-col lg:hidden gap-8 mt-8 w-full max-w-xl mx-auto">
					
					{/* Compact Direct Contact Info Row */}
					<motion.div 
						variants={fadeInUp}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="flex flex-col sm:flex-row gap-3"
					>
						{/* Location Pill */}
						<div className="flex-1 flex items-center gap-3 p-4 rounded-3xl bg-card/30 backdrop-blur-3xl border border-border shadow-md relative overflow-hidden group">
							<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
							<div className="p-2.5 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
								<MapPin className="w-5 h-5" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Location</p>
								<p className="text-sm font-semibold text-foreground truncate">{about?.Currentlocation || 'Remote'}</p>
							</div>
						</div>

						{/* Email Pill */}
						<div className="flex-1 flex items-center justify-between gap-3 p-4 rounded-3xl bg-card/30 backdrop-blur-3xl border border-border shadow-md relative overflow-hidden group">
							<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
							<div className="flex items-center gap-3 flex-1 min-w-0">
								<div className="p-2.5 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shrink-0">
									<Mail className="w-5 h-5" />
								</div>
								<div className="flex-1 min-w-0 pr-2">
									<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Email</p>
									<p className="text-sm font-semibold text-foreground truncate">{about?.email || 'hello@example.com'}</p>
								</div>
							</div>
							
							{about?.email && (
								<button
									onClick={copyEmail}
									className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shrink-0 z-10 shadow-xs"
									aria-label="Copy email address"
								>
									{copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
								</button>
							)}
						</div>
					</motion.div>

					{/* Simplified Form */}
					<motion.form
						variants={fadeInUp}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="relative p-6 sm:p-8 rounded-4xl bg-card/30 backdrop-blur-3xl border border-border hover:border-primary/30 shadow-2xl flex flex-col gap-5 transition-colors duration-500 group overflow-hidden"
						onSubmit={handleSubmit}
					>
						<div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
						<div className="space-y-1.5 relative z-10">
							<label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
								Name
							</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleChange}
								required
								className="w-full bg-background/50 backdrop-blur-xl border border-border rounded-2xl px-5 py-3.5 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-primary/50 transition-all placeholder:text-muted-foreground/50 text-sm outline-hidden shadow-inner"
								placeholder="Your Name"
							/>
						</div>

						<div className="space-y-1.5 relative z-10">
							<label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
								Email
							</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								required
								className="w-full bg-background/50 backdrop-blur-xl border border-border rounded-2xl px-5 py-3.5 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-primary/50 transition-all placeholder:text-muted-foreground/50 text-sm outline-hidden shadow-inner"
								placeholder="you@example.com"
							/>
						</div>

						<div className="space-y-1.5 relative z-10">
							<label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
								Subject
							</label>
							<input
								type="text"
								name="subject"
								value={formData.subject}
								onChange={handleChange}
								required
								className="w-full bg-background/50 backdrop-blur-xl border border-border rounded-2xl px-5 py-3.5 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-primary/50 transition-all placeholder:text-muted-foreground/50 text-sm outline-hidden shadow-inner"
								placeholder="What's this about?"
							/>
						</div>

						<div className="space-y-1.5 relative z-10">
							<label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
								Message
							</label>
							<textarea
								name="message"
								value={formData.message}
								onChange={handleChange}
								required
								rows={4}
								className="w-full bg-background/50 backdrop-blur-xl border border-border rounded-2xl px-5 py-3.5 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-primary/50 transition-all resize-none placeholder:text-muted-foreground/50 text-sm outline-hidden shadow-inner"
								placeholder="How can we collaborate?"
							/>
						</div>

						<div className="pt-2 relative z-10">
							<button
								type="submit"
								disabled={loading || success}
								className={cn(
									'w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group/mbtn',
									success
										? 'bg-emerald-500 text-black cursor-default border-transparent shadow-[0_0_20px_rgba(16,185,129,0.3)]'
										: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-1 active:scale-95 shadow-[0_0_15px_rgba(var(--theme-primary-rgb),0.3)] hover:shadow-[0_0_25px_rgba(var(--theme-primary-rgb),0.5)]',
								)}
							>
								{loading ? (
									<span className="animate-pulse flex items-center gap-2">
										<div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
										Sending...
									</span>
								) : success ? (
									<>
										<CheckCircle className="w-5 h-5" /> Message Delivered
									</>
								) : (
									<>
										<span className="relative z-10 transition-transform group-hover/mbtn:-translate-x-1">Send Message</span>
										<Send className="w-4 h-4 relative z-10 transition-transform group-hover/mbtn:translate-x-1 group-hover/mbtn:-translate-y-1" />
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
								>
									<div className="text-rose-400 text-xs font-bold uppercase text-center mt-2">
										{error}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</motion.form>

					{/* Simple Social Icons Row */}
					<motion.div 
						variants={fadeInUp}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="flex flex-wrap justify-center gap-3 pt-2"
					>
						{(about?.socialLinks ?? []).map((social, index) => {
							const Icon = SOCIAL_ICONS[social.platform] || Globe;
							return (
								<a
									key={social.id || `${social.platform}-${index}`}
									href={social.url}
									target="_blank"
									rel="noopener noreferrer"
									className="group relative p-3.5 rounded-2xl bg-card/30 backdrop-blur-3xl border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-md overflow-hidden"
									aria-label={`Visit ${social.customLabel || social.platform} profile`}
								>
									<div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
									<Icon className="w-5 h-5 relative z-10" />
								</a>
							);
						})}
					</motion.div>
				</div>
			</div>
		</div>
	);
}
