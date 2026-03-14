const STATUS_COLORS: Record<string, string> = {
	published: 'bg-green-500/15 text-green-400 border-green-500/30',
	completed: 'bg-green-500/15 text-green-400 border-green-500/30',
	draft: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
	archived: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
};

interface StatusBadgeProps {
	status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
	const colors = STATUS_COLORS[status] || 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
	return (
		<span className={`inline-flex px-2 py-0.5 text-xs rounded-full border ${colors} capitalize`}>
			{status}
		</span>
	);
}
