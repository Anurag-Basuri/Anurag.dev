'use client';

import { useCallback, useState } from 'react';
import { useApi, adminService } from '@/api';
import type { AgentSession } from '@/api/schema';

export default function AgentSessionsPage() {
	const fetcher = useCallback(() => adminService.getAgentSessions(), []);
	const { data: pageData, loading, refetch } = useApi<{ sessions: AgentSession[]; total: number; page: number; totalPages: number }>(fetcher);
	const sessions: AgentSession[] = pageData?.sessions || [];

	const [selected, setSelected] = useState<any | null>(null);

	async function handleDelete(session: any) {
		if (!confirm(`Delete AI session ID ${session.sessionId}?`)) return;
		try {
			await adminService.deleteAgentSession(session.id);
			if (selected?.id === session.id) setSelected(null);
			refetch();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to delete');
		}
	}

	return (
		<div className="max-w-6xl">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-foreground">AI Agent Sessions</h1>
				<span className="text-sm text-muted-foreground">{pageData?.total ?? 0} total sessions</span>
			</div>

			{loading ? (
				<div className="text-muted-foreground animate-pulse">Loading AI histories...</div>
			) : !sessions.length ? (
				<div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
					No active AI sessions recorded. Check back when users chat with the Agent.
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh]">
					{/* Sidebar List */}
					<div className="lg:col-span-4 border border-border rounded-lg overflow-hidden h-full flex flex-col">
						<div className="bg-card border-b border-border p-4">
							<h3 className="font-semibold text-sm text-foreground">Stored Conversations</h3>
						</div>
						<div className="overflow-y-auto flex-1 p-2 space-y-2">
							{sessions.map((session: any) => (
								<button
									key={session.id}
									onClick={() => setSelected(session)}
									className={`w-full text-left p-4 rounded-lg border transition-colors ${
										selected?.id === session.id
											? 'bg-primary/10 border-primary/50'
											: 'bg-card border-border hover:bg-muted'
									}`}
								>
									<div className="flex items-center justify-between mb-1">
										<span className="font-medium text-sm text-foreground truncate">
											Session {session.sessionId.substring(0, 8)}
										</span>
									</div>
									<p className="text-xs text-muted-foreground">
										{new Date(session.updatedAt).toLocaleString()}
									</p>
									<p className="text-xs font-mono text-primary/80 mt-2">
										Memory Blocks: {Array.isArray(session.history) ? session.history.length : 0}
									</p>
								</button>
							))}
						</div>
					</div>

					{/* Detail View */}
					<div className="lg:col-span-8 border border-border rounded-lg flex flex-col h-full bg-card overflow-hidden">
						{selected ? (
							<>
								{/* Detail Header */}
								<div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
									<div>
										<h2 className="text-sm font-bold text-foreground font-mono">
											{selected.sessionId}
										</h2>
										<p className="text-xs text-muted-foreground mt-1">
											Started at {new Date(selected.createdAt).toLocaleString()}
										</p>
									</div>
									<button
										onClick={() => handleDelete(selected)}
										className="px-3 py-1.5 text-xs rounded bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors font-medium border border-destructive/20"
									>
										Delete Session
									</button>
								</div>
								
								{/* Messages Timeline */}
								<div className="flex-1 overflow-y-auto p-6 space-y-6">
									{Array.isArray(selected.history) && selected.history.map((msg: any, i: number) => {
										// Crack open Langchain BaseMessage serialized format
										const type = msg.type || msg?.id?.[msg?.id?.length - 1]?.replace('Message', '').toLowerCase();
										const isUser = type === 'human';
										const isAI = type === 'ai';
										const isSystem = type === 'system';
										const isTool = type === 'tool';
										
										// Do not show the massive system prompt to the admin dashboard, it's just visual noise
										if (isSystem) return null;

										// Handle Tool Call records inside AI messages natively
										const hasToolCalls = msg.kwargs?.tool_calls?.length > 0;

										return (
											<div key={i} className={`flex flex-col ${isUser ? 'items-end' : isTool ? 'items-center' : 'items-start'}`}>
												<div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm flex flex-col shadow-sm ${
													isUser ? 'bg-primary text-primary-foreground rounded-br-sm' 
													: isTool ? 'bg-accent/40 text-accent-foreground border border-accent text-xs font-mono w-full break-all shadow-inner'
													: 'bg-muted text-foreground rounded-bl-sm border border-border'
												}`}>
													
													{isTool && (
														<div className="text-[10px] uppercase font-bold tracking-wider mb-2 opacity-50 border-b border-border pb-1 w-full">
															[SYS] Tool Execution Result
														</div>
													)}

													{isUser && (
														<div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-60">Visitor</div>
													)}

													{isAI && (
														<div className="text-[10px] uppercase font-bold tracking-wider mb-1 text-primary">Agent</div>
													)}
													
													<div className="whitespace-pre-wrap leading-relaxed">
														{msg.kwargs?.content || msg.content || (isTool ? JSON.stringify(msg) : '')}
													</div>

													{hasToolCalls && (
														<div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
															<span className="text-[10px] uppercase text-muted-foreground font-bold">Requested Tools:</span>
															{msg.kwargs.tool_calls.map((tc: any, tIdx: number) => (
																<div key={tIdx} className="bg-background/50 rounded p-2 text-xs font-mono border border-border">
																	<span className="text-primary">{tc.name}()</span>
																	<span className="text-muted-foreground ml-2">{JSON.stringify(tc.args)}</span>
																</div>
															))}
														</div>
													)}

												</div>
											</div>
										);
									})}
									{(!Array.isArray(selected.history) || selected.history.length === 0) && (
										<div className="text-center text-muted-foreground mt-10">No messages in this memory block.</div>
									)}
								</div>
							</>
						) : (
							<div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
								<div className="w-16 h-16 rounded-full border border-dashed border-border flex items-center justify-center">
									<span className="text-2xl opacity-50">💬</span>
								</div>
								<p>Select a session timeline from the sidebar to read exactly what the visitor asked the Artificial Intelligence.</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
