'use client';

import { useState, useEffect } from 'react';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface ReorderableListProps<T extends { id: string }> {
	items: T[];
	onSave: (reorderedItems: { id: string; order: number }[]) => Promise<void>;
	onCancel: () => void;
	renderItem: (item: T) => React.ReactNode;
}

export function ReorderableList<T extends { id: string }>({
	items,
	onSave,
	onCancel,
	renderItem,
}: ReorderableListProps<T>) {
	const [activeItems, setActiveItems] = useState(items);
	const [isSaving, setIsSaving] = useState(false);

	// Sync if items prop changes
	useEffect(() => {
		setActiveItems(items);
	}, [items]);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5, // 5px tolerance before drag starts
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setActiveItems((currentItems) => {
				const oldIndex = currentItems.findIndex((item) => item.id === active.id);
				const newIndex = currentItems.findIndex((item) => item.id === over.id);
				return arrayMove(currentItems, oldIndex, newIndex);
			});
		}
	}

	async function handleSave() {
		setIsSaving(true);
		try {
			const payload = activeItems.map((item, index) => ({
				id: item.id,
				order: Object.is(item.id, items[index]?.id) && (item as any).order === index ? (item as any).order : index, 
			}));
            // Just map to index, guaranteeing sequential 0...N ordering
            const sequentialPayload = activeItems.map((item, i) => ({ id: item.id, order: i }));
			await onSave(sequentialPayload);
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="space-y-4 max-w-5xl">
			<div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
				<div>
					<h2 className="text-lg font-bold text-white">Reorder Mode</h2>
					<p className="text-sm text-zinc-400">Drag and drop items to adjust their sequence.</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						onClick={onCancel}
						disabled={isSaving}
						className="px-4 py-2 text-sm font-medium rounded-lg text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						disabled={isSaving}
						className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50"
					>
						{isSaving ? 'Saving...' : 'Save Order'}
					</button>
				</div>
			</div>

			<div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 p-2">
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={activeItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
						<div className="space-y-2">
							{activeItems.map((item) => (
								<SortableItem key={item.id} id={item.id}>
									{renderItem(item)}
								</SortableItem>
							))}
						</div>
					</SortableContext>
				</DndContext>
			</div>
		</div>
	);
}

// Sub-component for individual draggable cards
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 50 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg group ${
				isDragging ? 'shadow-2xl shadow-blue-500/10 border-blue-500/50 scale-[1.01]' : 'hover:border-zinc-700'
			}`}
		>
			{/* Draggable Handle */}
			<div
				className="cursor-grab active:cursor-grabbing p-1 text-zinc-500 hover:text-zinc-300 transition-colors rounded"
				{...attributes}
				{...listeners}
			>
				<GripVertical className="w-5 h-5" />
			</div>

			{/* Custom Content */}
			<div className="flex-1 min-w-0">
				{children}
			</div>
		</div>
	);
}
