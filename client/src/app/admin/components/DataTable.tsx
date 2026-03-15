'use client';

interface Column<T> {
	key: string;
	label: string;
	render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
	columns: Column<T>[];
	data: T[];
	onEdit?: (item: T) => void;
	onDelete?: (item: T) => void;
	emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
	columns,
	data,
	onEdit,
	onDelete,
	emptyMessage = 'No data found',
}: DataTableProps<T>) {
	if (data.length === 0) {
		return (
			<div className="border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">
				{emptyMessage}
			</div>
		);
	}

	return (
		<div className="border border-zinc-800 rounded-lg overflow-hidden">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-zinc-800 bg-zinc-900/50">
						{columns.map((col) => (
							<th
								key={col.key}
								className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider"
							>
								{col.label}
							</th>
						))}
						{(onEdit || onDelete) && (
							<th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider w-28">
								Actions
							</th>
						)}
					</tr>
				</thead>
				<tbody>
					{data.map((item) => (
						<tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
							{columns.map((col) => (
								<td key={col.key} className="px-4 py-3 text-zinc-300">
									{col.render
										? col.render(item)
										: String((item as Record<string, unknown>)[col.key] ?? '—')}
								</td>
							))}
							{(onEdit || onDelete) && (
								<td className="px-4 py-3 text-right">
									<div className="flex items-center justify-end gap-2">
										{onEdit && (
											<button
												onClick={() => onEdit(item)}
												className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
											>
												Edit
											</button>
										)}
										{onDelete && (
											<button
												onClick={() => onDelete(item)}
												className="px-2.5 py-1 text-xs rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
											>
												Delete
											</button>
										)}
									</div>
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

