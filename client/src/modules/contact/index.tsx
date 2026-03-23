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
import { staggerContainer, staggerItem } from '@/animations/motion';

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
					<div className="h-40 bg-foreground/5 rounded-3xl" />
					<div className="h-40 bg-foreground/5 rounded-3xl" />
				</div>
				<div className="flex-1 lg:max-w-xl">
					<div className="h-[500px] bg-foreground/5 rounded-3xl" />
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
			<div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[600px] rounded-[100%] bg-[radial-gradient(ellipse_at_center,var(--theme-primary)_0%,transparent_60%)] opacity-5 blur-[120px] pointer-events-none -z-10" />

			<div className="px-4 sm:px-8 md:px-12 max-w-7xl mx-auto pb-16 sm:pb-24 pt-6 md:pt-8">
				<SectionHeader
					icon={MessageSquare}
					label="Connect"
					title="Get In Touch"
					description="I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions."
					sectionId="contact"
				/>

				<div className="flex flex-col lg:flex-row gap-8 lg:gap-14 mt-10 md:mt-16">
					{/* Left Column: Info & Socials */}
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: '-40px' }}
						className="flex-1 space-y-6 sm:space-y-8"
					>
						{/* Email Card */}
						<motion.div
							variants={staggerItem}
							className="group relative rounded-4xl p-6 sm:p-8 bg-card/30 backdrop-blur-3xl border border-border overflow-hidden hover:border-primary/50 transition-colors duration-500 shadow-2xl"
						>
							<div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
							<div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/40 transition-colors duration-700 pointer-events-none" />

							<div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
								<div className="p-4 rounded-2xl bg-card border border-border text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-transform duration-500 shadow-lg shrink-0">
									<Mail className="w-8 h-8" />
								</div>
								<div className="flex-1 w-full mx-auto sm:mx-0 pt-1">
									<h3 className="text-xl text-foreground font-bold mb-3 tracking-tight">
										Drop an Email
									</h3>
									<div className="flex items-center justify-between gap-4 bg-muted/30 p-3 pl-5 rounded-2xl border border-border/50 group-hover:border-primary/30 transition-colors">
										<span className="text-muted-foreground font-medium text-sm sm:text-base truncate">
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
							className="group relative rounded-4xl p-6 sm:p-8 bg-card/30 backdrop-blur-3xl border border-border overflow-hidden hover:border-primary/50 transition-colors duration-500 shadow-2xl"
						>
							<div className="absolute inset-0 bg-linear-to-bl from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
							<MapPin className="absolute right-[-5%] top-[-5%] w-48 h-48 text-foreground/[0.02] group-hover:text-primary/5 transition-colors duration-700 -rotate-12 pointer-events-none" />

							<div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
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
							<div className="flex items-center gap-4 mb-6 justify-center sm:justify-start">
								<div className="h-px bg-border flex-1 max-w-[40px] hidden sm:block" />
								<h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground text-center sm:text-left">
									Find Me Online
								</h3>
								<div className="h-px bg-border flex-1 max-w-[40px] hidden sm:block" />
							</div>
							<div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4">
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
						className="flex-1 lg:max-w-136 w-full mt-4 lg:mt-0"
					>
						<form
							onSubmit={handleSubmit}
							className="relative p-6 sm:p-10 rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-border shadow-2xl flex flex-col gap-6 w-full"
						>
							<div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent rounded-[2.5rem] pointer-events-none" />

							<div className="relative z-10 mb-2">
								<h2 className="text-3xl font-black text-foreground mb-3 tracking-tight flex items-center gap-3">
									<Sparkles className="w-6 h-6 text-primary" />
									Send a Message
								</h2>
								<p className="text-muted-foreground text-base font-medium">
									Got a question or proposal, or just want to say hello? Go ahead.
								</p>
							</div>

							<div className="space-y-5 relative z-10">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
									<div className="space-y-2">
										<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
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
										<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
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
									<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
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
									<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
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
											'w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden relative group/btn',
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
			</div>
		</div>
	);
}
