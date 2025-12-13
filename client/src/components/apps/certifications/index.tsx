'use client';

import { useEffect, useState } from 'react';
import { api, Certification } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Award, Calendar, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { ModuleError } from '@/components/ui/module-error';
import { staggerContainer, staggerItem, viewportSettings } from '@/lib/animations';

function CertificationsSkeleton() {
	return (
		<div className="p-6 md:p-10 max-w-5xl mx-auto pb-20 animate-pulse">
			<div className="mb-10 border-b border-border/40 pb-6">
				<div className="h-4 bg-muted rounded w-32 mb-2" />
				<div className="h-8 bg-muted rounded w-64" />
			</div>
			<div className="grid gap-6 md:grid-cols-2">
				{[1, 2, 3, 4].map(i => (
					<div key={i} className="p-6 rounded-2xl bg-card/20 border border-border/40">
						<div className="flex justify-between items-start mb-4">
							<div className="h-12 w-12 bg-muted rounded-xl" />
							<div className="h-4 w-4 bg-muted rounded" />
						</div>
						<div className="h-6 bg-muted rounded w-3/4 mb-2" />
						<div className="h-4 bg-muted rounded w-1/2 mb-4" />
						<div className="h-4 bg-muted rounded w-24 mb-4" />
						<div className="flex gap-2">
							<div className="h-6 w-16 bg-muted rounded" />
							<div className="h-6 w-16 bg-muted rounded" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export function CertificationModule() {
	const [certs, setCerts] = useState<Certification[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await api.getCertifications();
			setCerts(data);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (loading) return <CertificationsSkeleton />;

	if (error) return <ModuleError message={error} onRetry={fetchData} />;

	return (
		<ScrollArea className="h-full">
			<div className="p-6 md:p-10 max-w-5xl mx-auto pb-20">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-border/40 pb-6">
					<div>
						<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">
							<ShieldCheck className="w-4 h-4" />
							<span>Verified Attributes</span>
						</div>
						<h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-cyan-500">
							Certifications
						</h1>
					</div>
				</div>

				<motion.div
					className="grid gap-6 md:grid-cols-2"
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
				>
					{certs.map(cert => (
						<motion.div
							key={cert.id}
							variants={staggerItem}
							whileHover={{ y: -4, transition: { duration: 0.2 } }}
							className="group relative p-6 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm hover:border-emerald-500/30 transition-all hover:shadow-xl"
						>
							<div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

							<div className="relative z-10">
								<div className="flex justify-between items-start mb-4">
									<div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
										<Award className="w-6 h-6" />
									</div>
									{cert.credentialUrl && (
										<a
											href={cert.credentialUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
										>
											<ExternalLink className="w-4 h-4" />
										</a>
									)}
								</div>

								<h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-emerald-400 transition-colors">
									{cert.title}
								</h3>
								<p className="text-sm text-muted-foreground mb-4">{cert.issuer}</p>

								<div className="flex items-center gap-2 text-xs text-muted-foreground/60 mb-4 font-mono">
									<Calendar className="w-3.5 h-3.5" />
									<span>{new Date(cert.date).toLocaleDateString()}</span>
								</div>

								<div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
									{cert.skills.map(skill => (
										<span
											key={skill}
											className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-muted-foreground border border-white/5"
										>
											{skill}
										</span>
									))}
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</ScrollArea>
	);
}
