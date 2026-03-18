import { Terminal, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';
import { publicService } from '@/api/services/public';

export const metadata = {
	title: 'System Diagnostics | Anurag.dev',
	description: 'Terminal-style README document reader',
};

// Next.js config to ensure the backend is polled for live document size/sync metrics
export const dynamic = 'force-dynamic';

export default async function ReadmePage() {
	const { data } = await publicService.getReadme();

	if (!data) {
		return (
            <div className="w-full h-full flex items-center justify-center p-8 pt-24 font-mono">
                <div className="flex flex-col items-center gap-4 text-red-500/80 p-8 border border-red-500/20 bg-red-950/20 rounded-xl">
                    <ShieldAlert className="w-12 h-12" />
                    <h2 className="text-xl font-bold tracking-widest uppercase">CONNECTION FAILED</h2>
                    <p className="text-sm opacity-80 max-w-sm text-center">The backend documentation endpoint is offline or the source README.md could not be resolved.</p>
                </div>
            </div>
        );
	}

	const { content, metadata } = data;

	return (
		<div className="w-full grow flex flex-col p-4 sm:p-8 pt-24 pb-12 animate-in fade-in zoom-in-95 duration-1000">
			{/* Terminal Window Wrapper */}
			<div className="w-full max-w-5xl mx-auto flex flex-col grow bg-black/80 border border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)] font-mono relative backdrop-blur-xl group">
                
                {/* Dynamic Edge Lighting (hover effect) */}
                <div className="absolute inset-0 bg-linear-to-b from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-1000 pointer-events-none" />

				{/* Header */}
				<div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-emerald-950/40 border-b border-emerald-500/20 relative z-10 box-border">
					<div className="flex items-center gap-3 text-emerald-500">
						<Terminal className="w-4 h-4" />
						<span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase">SYS_DOC // README.MD</span>
					</div>
					<div className="text-[10px] text-emerald-500/60 font-mono hidden md:flex items-center gap-6">
						<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" /> SIZE: {(metadata.sizeBytes / 1024).toFixed(2)} KB</span>
						<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" /> LINES: {metadata.lines}</span>
						<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-teal-500/50" /> WORDS: {metadata.words}</span>
					</div>
				</div>

				{/* Content Body */}
				<div className="grow p-6 sm:p-10 lg:p-14 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent relative z-10 box-border h-[65vh]">
					<div className="max-w-3xl mx-auto space-y-6">
						<ReactMarkdown
							remarkPlugins={[remarkGfm]}
							components={{
                                // Advanced Component Mapping for Cyberpunk Styling
								h1: ({ node, ...props }) => <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400 tracking-tighter mt-12 mb-6 uppercase first:mt-0 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" {...props} />,
								h2: ({ node, ...props }) => <h2 className="text-2xl sm:text-3xl font-bold text-emerald-400/90 tracking-tight border-b border-emerald-500/20 pb-3 mt-10 mb-5" {...props} />,
								h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-emerald-300 mt-8 mb-4 border-l-2 border-emerald-500 pl-3" {...props} />,
								p: ({ node, ...props }) => <p className="text-emerald-100/70 text-base sm:text-lg leading-relaxed mb-6 font-sans font-light" {...props} />,
								a: ({ node, ...props }) => <a className="text-cyan-400 no-underline hover:underline hover:text-cyan-300 transition-colors cursor-pointer border-b border-cyan-400/30 hover:border-cyan-400 pb-0.5" target="_blank" rel="noopener noreferrer" {...props} />,
								ul: ({ node, ...props }) => <ul className="list-none space-y-2 mb-6 text-emerald-100/70 font-sans" {...props} />,
								ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 mb-6 text-emerald-100/70 font-sans marker:text-emerald-500 font-bold" {...props} />,
								li: ({ node, ...props }) => (
                                    <li className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-emerald-500/50 before:rounded-sm" {...props} />
                                ),
								blockquote: ({ node, ...props }) => (
									<blockquote className="border-l-4 border-emerald-500/50 bg-linear-to-r from-emerald-950/30 to-transparent px-6 py-3 rounded-r-xl my-8 text-emerald-200/80 italic font-serif relative overflow-hidden" {...props}>
                                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgxNiwgMTg1LCAxMjksIDAuMSkiLz4KPC9zdmc+')] opacity-50" />
                                        <div className="relative z-10">{props.children}</div>
                                    </blockquote>
								),
								pre: ({ node, ...props }) => (
									<div className="relative group my-8">
										<div className="absolute -inset-1 bg-linear-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
										<div className="absolute top-0 right-0 px-3 py-1 bg-emerald-950/80 text-[9px] text-emerald-500/50 tracking-widest uppercase rounded-bl-lg rounded-tr-lg border-b border-l border-emerald-500/20 font-bold">RAW_CODE_BLOCK</div>
                                        <pre className="relative bg-[#050B08] border border-emerald-500/30 p-6 pt-8 rounded-xl overflow-x-auto shadow-inner" {...props} />
									</div>
								),
								code: ({ node, className, children, ...props }) => {
									const isBlock = /language-(\w+)/.exec(className || '');
									if (isBlock) {
										return <code className={`block font-mono text-xs sm:text-sm text-emerald-300/90 leading-relaxed ${className || ''}`} {...props}>{children}</code>;
									}
									return <code className="bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded-md border border-emerald-500/30 font-mono text-sm wrap-break-word mx-0.5" {...props}>{children}</code>;
								},
								img: ({ node, ...props }) => (
                                    <div className="relative my-10 rounded-xl overflow-hidden border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img className="max-w-full h-auto w-full object-cover opacity-90 hover:opacity-100 transition-opacity" loading="lazy" {...props} alt={props.alt || 'Documentation Image'} />
                                    </div>
                                ),
								hr: ({ node, ...props }) => (
                                    <div className="w-full flex items-center justify-center my-12" {...props}>
                                        <div className="w-full h-px bg-linear-to-r from-transparent via-emerald-500/30 to-transparent" />
                                        <div className="w-2 h-2 rounded bg-emerald-500/50 rotate-45 mx-[-4px] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <div className="w-full h-px bg-linear-to-r from-emerald-500/30 via-emerald-500/30 to-transparent" />
                                    </div>
                                ),
								table: ({ node, ...props }) => <div className="overflow-x-auto w-full my-8 rounded-xl border border-emerald-500/20 bg-emerald-950/20"><table className="w-full text-left border-collapse text-sm" {...props} /></div>,
								thead: ({ node, ...props }) => <thead className="bg-[#050A08] border-b border-emerald-500/30 text-emerald-400 font-bold" {...props} />,
								th: ({ node, ...props }) => <th className="p-4 tracking-wider uppercase text-xs" {...props} />,
								td: ({ node, ...props }) => <td className="p-4 border-b border-emerald-500/10 text-emerald-100/70" {...props} />,
							}}
						>
							{content}
						</ReactMarkdown>
					</div>
				</div>

				{/* Footer / Status */}
				<div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-2 bg-[#020504] border-t border-emerald-500/30 relative z-10 box-border">
					<div className="flex items-center gap-3">
						<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
						<span className="text-[9px] text-emerald-500/60 font-mono tracking-[0.2em]">CONNECTION_SECURE</span>
					</div>
					<div className="text-[9px] text-emerald-500/40 font-mono uppercase tracking-[0.2em]">
						SYNC: {new Date(metadata.lastModified).toLocaleTimeString()}
					</div>
				</div>
			</div>
		</div>
	);
}
