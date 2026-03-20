'use client';

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
	const isGoogleDocView = resumeUrl.endsWith('.doc') || resumeUrl.endsWith('.docx') || resumeUrl.includes('docs.google');
	const embedUrl = isGoogleDocView 
		? `https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true` 
		: resumeUrl;

	return (
		<div className="w-full h-full flex flex-col p-2 sm:p-4 pt-4 pb-4 bg-transparent">
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
					<div className="flex items-center justify-between p-3 border-b border-border bg-card/60 backdrop-blur-md relative z-20">
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
							<a
								href={resumeUrl}
								download={`${profileName}_Resume`}
								target="_blank"
								rel="noopener noreferrer"
								className={cn(
									'group flex items-center justify-center h-8 px-4 rounded-md',
									'bg-primary/90 hover:bg-primary text-primary-foreground',
									'transition-all duration-200 text-[10px] font-bold tracking-widest uppercase hover:scale-105 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'
								)}
							>
								<Download className="w-3.5 h-3.5 mr-2" />
								Download
							</a>
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
