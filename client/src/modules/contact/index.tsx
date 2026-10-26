'use client';

import { useState, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { publicService, useProfile } from '@/api';
import {
	Mail,
	MapPin,
	Phone,
	Copy,
	Check,
	Send,
	MessageSquare,
	ArrowUpRight,
	Briefcase,
} from 'lucide-react';
import { SiGithub, SiX } from 'react-icons/si';
import { FaLinkedinIn } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { SectionHeader } from '@/ui/SectionHeader';
import { staggerContainer, staggerItem, fadeInUp } from '@/animations/motion';

export function ContactModule() {
	const { profile, loading } = useProfile();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	});
	const [submitting, setSubmitting] = useState(false);
	const [copied, setCopied] = useState(false);

	const email = profile?.email || 'basurianurag@gmail.com';
	const phone = profile?.phone || '+91 7903476544';
	const location = profile?.Currentlocation || 'Jalandhar, Punjab, India';
	const origin = profile?.Originallocation || 'Jamshedpur, Jharkhand, India';

	const copyEmail = useCallback(() => {
		navigator.clipboard.writeText(email);
		setCopied(true);
		toast.success('Email copied to clipboard');
		setTimeout(() => setCopied(false), 2000);
	}, [email]);

	const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData(prev => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!formData.name || !formData.email || !formData.message) {
			toast.error('Please fill in all required fields');
			return;
		}

		setSubmitting(true);
		try {
			await publicService.submitContact(formData);
			toast.success('Message dispatched successfully');
			setFormData({ name: '', email: '', subject: '', message: '' });
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : 'Failed to send message');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="w-full min-h-full pb-20 sm:pb-28">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6">
				{/* 09 · Section Header */}
				<SectionHeader
					icon={MessageSquare}
					index="09"
					tag="COMMUNICATIONS"
					title="Get In Touch"
					description="Direct communication channels, verified endpoints, and collaborative opportunities."
					sectionId="contact"
				/>

				<motion.div
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 mt-6"
				>
					{/* Left Column: Direct Info (5 cols) */}
					<motion.div variants={staggerItem} className="md:col-span-5 space-y-4">
						{/* Direct Contact Card */}
						<div className="rounded-2xl border border-border/40 bg-card/25 backdrop-blur-xl p-6 space-y-5">
							<h3 className="text-lg font-light tracking-tight text-foreground/95 font-sans">
								Direct Channels
							</h3>

							{/* Email */}
							<div className="space-y-1.5">
								<span className="text-[11px] font-mono text-muted-foreground/60 uppercase">Email</span>
								<div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-foreground/[0.03] border border-border/30">
									<div className="flex items-center gap-2.5 min-w-0">
										<Mail className="w-4 h-4 text-primary shrink-0" />
										<a
											href={`mailto:${email}`}
											className="text-xs font-mono text-foreground/90 truncate hover:text-primary transition-colors"
										>
											{email}
										</a>
									</div>
									<button
										onClick={copyEmail}
										className="p-1 rounded-md hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
										title="Copy Email"
									>
										{copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
									</button>
								</div>
							</div>

							{/* Phone */}
							{phone && (
								<div className="space-y-1.5">
									<span className="text-[11px] font-mono text-muted-foreground/60 uppercase">Phone</span>
									<div className="flex items-center gap-2.5 p-3 rounded-xl bg-foreground/[0.03] border border-border/30 text-xs font-mono text-foreground/90">
										<Phone className="w-4 h-4 text-muted-foreground/70 shrink-0" />
										<span>{phone}</span>
									</div>
								</div>
							)}

							{/* Location */}
							<div className="space-y-1.5">
								<span className="text-[11px] font-mono text-muted-foreground/60 uppercase">Location</span>
								<div className="flex items-center gap-2.5 p-3 rounded-xl bg-foreground/[0.03] border border-border/30 text-xs font-mono text-foreground/90">
									<MapPin className="w-4 h-4 text-muted-foreground/70 shrink-0" />
									<div className="flex flex-col">
										<span>{location}</span>
										{origin && <span className="text-[11px] text-muted-foreground/60">Origin: {origin}</span>}
									</div>
								</div>
							</div>

							{/* Social Links */}
							<div className="pt-2 border-t border-border/20">
								<span className="text-[11px] font-mono text-muted-foreground/60 uppercase block mb-3">
									Verified Profiles
								</span>
								<div className="flex flex-wrap gap-2">
									<a
										href="https://linkedin.com/in/anuragbasuri"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground/[0.03] border border-border/30 text-xs font-mono text-foreground/80 hover:text-primary hover:border-primary/40 transition-colors"
									>
										<FaLinkedinIn className="w-3 h-3 text-[#0a66c2]" />
										<span>LinkedIn</span>
										<ArrowUpRight className="w-3 h-3 opacity-60" />
									</a>
									<a
										href="https://github.com/Anurag-Basuri"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground/[0.03] border border-border/30 text-xs font-mono text-foreground/80 hover:text-primary hover:border-primary/40 transition-colors"
									>
										<SiGithub className="w-3 h-3" />
										<span>GitHub</span>
										<ArrowUpRight className="w-3 h-3 opacity-60" />
									</a>
									<a
										href="https://x.com/anuragbasuri"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-foreground/[0.03] border border-border/30 text-xs font-mono text-foreground/80 hover:text-primary hover:border-primary/40 transition-colors"
									>
										<SiX className="w-3 h-3" />
										<span>X (Twitter)</span>
										<ArrowUpRight className="w-3 h-3 opacity-60" />
									</a>
								</div>
							</div>
						</div>

						{/* Availability Card */}
						{profile?.openToWork && (
							<div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5 flex items-start gap-3">
								<div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mt-1 shrink-0" />
								<div>
									<h4 className="text-xs font-mono font-medium uppercase tracking-wider text-emerald-400">
										Available for Opportunities
									</h4>
									<p className="text-xs text-muted-foreground/80 mt-1 leading-relaxed">
										Open to Full-Time, Internship, and High-Impact Software Engineering Roles.
										Notice Period: {profile.noticePeriod === '0' ? 'Immediate' : profile.noticePeriod || 'Immediate'}.
									</p>
								</div>
							</div>
						)}
					</motion.div>

					{/* Right Column: Clean Form (7 cols) */}
					<motion.div variants={staggerItem} className="md:col-span-7">
						<form
							onSubmit={handleSubmit}
							className="rounded-2xl border border-border/40 bg-card/25 backdrop-blur-xl p-6 sm:p-8 space-y-4"
						>
							<h3 className="text-lg font-light tracking-tight text-foreground/95 font-sans mb-1">
								Send a Message
							</h3>
							<p className="text-xs font-mono text-muted-foreground/75 mb-4">
								Submissions are delivered directly to personal inbox and notification logs.
							</p>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<label htmlFor="name" className="text-xs font-mono text-muted-foreground/80">
										Your Name *
									</label>
									<input
										id="name"
										type="text"
										name="name"
										value={formData.name}
										onChange={handleChange}
										required
										placeholder="Jane Doe"
										className="w-full px-3.5 py-2.5 rounded-xl bg-foreground/[0.03] border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-hidden focus:border-primary/60 transition-colors"
									/>
								</div>

								<div className="space-y-1.5">
									<label htmlFor="email" className="text-xs font-mono text-muted-foreground/80">
										Email Address *
									</label>
									<input
										id="email"
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										required
										placeholder="jane@company.com"
										className="w-full px-3.5 py-2.5 rounded-xl bg-foreground/[0.03] border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-hidden focus:border-primary/60 transition-colors"
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="subject" className="text-xs font-mono text-muted-foreground/80">
									Subject
								</label>
								<input
									id="subject"
									type="text"
									name="subject"
									value={formData.subject}
									onChange={handleChange}
									placeholder="Engineering Role / Collaboration"
									className="w-full px-3.5 py-2.5 rounded-xl bg-foreground/[0.03] border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-hidden focus:border-primary/60 transition-colors"
								/>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="message" className="text-xs font-mono text-muted-foreground/80">
									Message *
								</label>
								<textarea
									id="message"
									name="message"
									rows={5}
									value={formData.message}
									onChange={handleChange}
									required
									placeholder="Write your note here..."
									className="w-full px-3.5 py-2.5 rounded-xl bg-foreground/[0.03] border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-hidden focus:border-primary/60 transition-colors resize-none"
								/>
							</div>

							<button
								type="submit"
								disabled={submitting}
								className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs"
							>
								{submitting ? (
									<span>Sending Message...</span>
								) : (
									<>
										<Send className="w-3.5 h-3.5" />
										<span>Send Message</span>
									</>
								)}
							</button>
						</form>
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}

export default ContactModule;
