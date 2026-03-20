'use client';

import { useEffect, useState } from 'react';
import { TerminalFrame } from '@/ui/TerminalFrame';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PANEL_TOKENS } from '@/theme/colors/tokens';

export function ResumeViewer({
	resumeUrl,
	profileName,
}: {
	resumeUrl: string;
	profileName: string;
}) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile(); // Check immediately on mount
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	const isGoogleDocView = resumeUrl.endsWith('.doc') || resumeUrl.endsWith('.docx') || resumeUrl.includes('docs.google');
	
	// Mobile browsers forcefully download PDFs in iframes. Route them through GDocs viewer to ensure rendering.
	const forceDocsViewer = isGoogleDocView || isMobile;

	const embedUrl = forceDocsViewer 
		? `https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true` 
		: resumeUrl;

	const handleDownload = async () => {
		try {
			const response = await fetch(resumeUrl);
			if (!response.ok) throw new Error('Network response was not ok');
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			const filename = `${profileName.replace(/\s+/g, '_')}_Resume.${isGoogleDocView ? 'docx' : 'pdf'}`;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			// Small delay before removing to ensure it fires in Firefox
			setTimeout(() => document.body.removeChild(a), 100);
		} catch (error) {
			console.error('Download failed, falling back to new tab', error);
			window.open(resumeUrl, '_blank');
		}
	};

	return (
		<div className="w-full h-full flex flex-col p-1 sm:p-2 bg-transparent">
			<TerminalFrame 
				title={`${profileName.replace(/\s+/g, '_')}_Resume.${isGoogleDocView ? 'docx' : 'pdf'}`}
				meta={{
					sizeBytes: 1048576,
					lines: 100,
					words: 500,
					lastModified: new Date().toISOString()
				}}
			>
				<div className="flex flex-col h-full w-full bg-foreground/5 backdrop-blur-md">
					{/* Action Bar */}
					<div className="flex items-center justify-between px-3 py-1.5 sm:py-2 border-b border-border bg-card/60 backdrop-blur-md relative z-20">
						<div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground font-mono tracking-wider uppercase font-bold">
							<FileText className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
							Document Viewer
						</div>
						<div className="flex items-center gap-3">
							<a
								href={resumeUrl}
								target="_blank"
								rel="noopener noreferrer"
								className={cn(
									'hidden sm:flex group items-center justify-center h-8 px-4 rounded-md',
									'border border-border/40 bg-card/80 hover:bg-emerald-500/10 hover:border-emerald-500/30',
									'transition-all duration-200 text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:text-emerald-400',
									PANEL_TOKENS.accent.glowBg.replace('shadow-', 'hover:shadow-')
								)}
							>
								<ExternalLink className="w-3 h-3 mr-2" />
								Open Raw
							</a>
							<button
								onClick={handleDownload}
								className={cn(
									'group flex items-center justify-center h-8 px-4 rounded-md',
									'bg-primary/90 hover:bg-primary text-primary-foreground',
									'transition-all duration-200 text-[10px] font-bold tracking-widest uppercase hover:scale-105 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] cursor-pointer'
								)}
							>
								<Download className="w-3.5 h-3.5 mr-2" />
								Download
							</button>
						</div>
					</div>

					{/* Viewer Frame */}
					<div className="flex-1 w-full bg-[#323639] relative overflow-hidden flex items-center justify-center">
						<iframe 
							src={`${embedUrl}#toolbar=0&navpanes=0&scrollbar=0`}
							title="Resume Document Viewer"
							className="w-full h-full border-none shadow-2xl"
							loading="lazy"
						/>
					</div>
				</div>
			</TerminalFrame>
		</div>
	);
}
