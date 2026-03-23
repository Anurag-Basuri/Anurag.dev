'use client';

import { useCallback, useState } from 'react';
import { useApi } from '@/api';
import { adminService } from '@/api';
import { DataTable } from '../components/DataTable';
import { ReorderableList } from '../components/ReorderableList';
import { FormModal } from '../components/FormModal';
import { FormField, TagField } from '../components/FormField';
import { FileUploadField } from '../components/FileUploadField';
import type { Achievement } from '@/api/schema';

const CATEGORIES = [
	{ label: 'Hackathon', value: 'hackathon' },
	{ label: 'Competition', value: 'competition' },
	{ label: 'Award', value: 'award' },
	{ label: 'Open Source', value: 'opensource' },
	{ label: 'Publication', value: 'publication' },
	{ label: 'Scholarship', value: 'scholarship' },
	{ label: 'Other', value: 'other' },
];

const EMPTY = {
	title: '',
	category: 'hackathon',
	issuer: '',
	event: '',
	description: '',
	rank: '',
	date: '',
	proofUrl: '',
	url: '',
	tags: [] as string[],
	team: [] as string[],
	featured: false,
	order: 0,
	journeyEntryId: '',
};

export default function AchievementsPage() {
	const fetcher = useCallback(() => adminService.getAchievements(), []);
	const { data: items, loading, refetch } = useApi<Achievement[]>(fetcher);

	const [modal, setModal] = useState<{ open: boolean; editing: Achievement | null }>({
		open: false,
		editing: null,
	});
	const [isReordering, setIsReordering] = useState(false);
	const [form, setForm] = useState(EMPTY);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function openCreate() {
		setForm(EMPTY);
		setModal({ open: true, editing: null });
		setError(null);
	}

	function openEdit(item: Achievement) {
		setForm({
			title: item.title,
			category: item.category,
			issuer: item.issuer || '',
			event: item.event || '',
			description: item.description || '',
			rank: item.rank || '',
			date: item.date ? item.date.slice(0, 10) : '',
			proofUrl: item.proofUrl || '',
			url: item.url || '',
			tags: item.tags,
			team: item.team,
			featured: item.featured,
			order: item.order,
			journeyEntryId: item.journeyEntryId || '',
		});
		setModal({ open: true, editing: item });
		setError(null);
	}

	function updateField(name: string, value: unknown) {
		setForm(prev => ({ ...prev, [name]: value }));
	}

	async function handleSave() {
		setSaving(true);
		setError(null);
		try {
			// Remove empty optional strings before sending
			const payload = { ...form };
			if (!payload.journeyEntryId) delete (payload as Record<string, unknown>).journeyEntryId;
			if (!payload.date) delete (payload as Record<string, unknown>).date;

			if (modal.editing) {
				await adminService.updateAchievement(
					modal.editing.id,
					payload as Partial<Achievement>,
				);
			} else {
				await adminService.createAchievement(payload as Omit<Achievement, 'id'>);
			}
			setModal({ open: false, editing: null });
			refetch();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save');
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(item: Achievement) {
		if (!confirm(`Delete "${item.title}"?`)) return;
		try {
			await adminService.deleteAchievement(item.id);
			refetch();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to delete');
		}
	}

	const columns = [
		{ key: 'title', label: 'Title' },
		{
			key: 'category',
			label: 'Category',
			render: (a: Achievement) => <span className="capitalize">{a.category}</span>,
		},
		{ key: 'issuer', label: 'Issuer', render: (a: Achievement) => a.issuer || '—' },
		{
			key: 'journeyEntry',
			label: 'Journey',
			render: (a: Achievement & { journeyEntry?: { title: string } }) =>
				a.journeyEntry ? (
					<span className="text-xs text-blue-400">{a.journeyEntry.title}</span>
				) : '—',
		},
		{
			key: 'featured',
			label: 'Featured',
			render: (a: Achievement) => (a.featured ? '⭐' : '—'),
		},
		{ key: 'order', label: 'Order' },
	];

	return (
		<div className="max-w-5xl">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Achievements</h1>
				<div className="flex gap-3">
					{!isReordering && items && items.length > 1 && (
						<button
							onClick={() => setIsReordering(true)}
							className="px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors border border-zinc-700"
						>
							Reorder List
						</button>
					)}
					{!isReordering && (
						<button
							onClick={openCreate}
							className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
						>
							+ New Achievement
						</button>
					)}
				</div>
			</div>

			{loading ? (
				<div className="text-zinc-500">Loading...</div>
			) : isReordering ? (
				<ReorderableList
					items={items || []}
					onCancel={() => setIsReordering(false)}
					onSave={async (payload) => {
						await adminService.reorderAchievements(payload);
						setIsReordering(false);
						refetch();
					}}
					renderItem={(a) => (
						<div className="flex items-center justify-between w-full">
							<div>
								<div className="font-medium text-white flex items-center gap-2">
									{a.title} {a.featured && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded">Featured</span>}
								</div>
								<div className="text-xs text-zinc-500 capitalize">{a.category} {a.issuer && `• ${a.issuer}`}</div>
							</div>
						</div>
					)}
				/>
			) : (
				<DataTable
					columns={columns}
					data={items || []}
					onEdit={openEdit}
					onDelete={handleDelete}
					emptyMessage="No achievements yet"
				/>
			)}

			<FormModal
				open={modal.open}
				onClose={() => setModal({ open: false, editing: null })}
				title={modal.editing ? 'Edit Achievement' : 'New Achievement'}
				onSubmit={handleSave}
				loading={saving}
			>
				{error && (
					<div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
						{error}
					</div>
				)}
				<FormField
					label="Title"
					name="title"
					value={form.title}
					onChange={updateField}
					required
				/>
				<FormField
					label="Category"
					name="category"
					type="select"
					value={form.category}
					onChange={updateField}
					options={CATEGORIES}
					required
				/>
				<FormField
					label="Issuer"
					name="issuer"
					value={form.issuer}
					onChange={updateField}
				/>
				<FormField label="Event" name="event" value={form.event} onChange={updateField} />
				<FormField
					label="Description"
					name="description"
					type="textarea"
					value={form.description}
					onChange={updateField}
					rows={3}
				/>
				<FormField
					label="Rank"
					name="rank"
					value={form.rank}
					onChange={updateField}
					placeholder="e.g. 1st Place, Top 10"
				/>
				<FormField
					label="Date"
					name="date"
					type="date"
					value={form.date}
					onChange={updateField}
				/>
				<FormField
					label="Proof URL"
					name="proofUrl"
					type="url"
					value={form.proofUrl}
					onChange={updateField}
					placeholder="Certificate / proof link"
				/>
				{modal.editing && (
					<div className="mb-4 space-y-2">
						<FileUploadField
							label="Upload Proof File (Optional)"
							currentUrl={form.proofUrl}
							accept=".pdf,.png,.jpg,.jpeg"
							onUpload={async file => {
								const updated = await adminService.uploadAchievementProof(modal.editing!.id, file);
								setForm(prev => ({ ...prev, proofUrl: updated.proofUrl || '' }));
								refetch();
							}}
						/>
						{form.proofUrl && (
							<button
								type="button"
								onClick={async () => {
									if (!confirm('Delete the uploaded proof file?')) return;
									await adminService.deleteAchievementProof(modal.editing!.id);
									setForm(prev => ({ ...prev, proofUrl: '' }));
									refetch();
								}}
								className="text-xs text-red-400 hover:text-red-300 underline"
							>
								Delete uploaded proof
							</button>
						)}
					</div>
				)}
				<FormField
					label="URL"
					name="url"
					type="url"
					value={form.url}
					onChange={updateField}
					placeholder="Related external link"
				/>
				<TagField label="Tags" name="tags" value={form.tags} onChange={updateField} />
				<TagField
					label="Team Members"
					name="team"
					value={form.team}
					onChange={updateField}
				/>
				<FormField
					label="Journey Entry ID"
					name="journeyEntryId"
					value={form.journeyEntryId}
					onChange={updateField}
					placeholder="Link to a journey entry (optional)"
				/>
				<FormField
					label="Order"
					name="order"
					type="number"
					value={form.order}
					onChange={updateField}
				/>
				<FormField
					label="Featured"
					name="featured"
					type="checkbox"
					value={form.featured}
					onChange={updateField}
				/>
			</FormModal>
		</div>
	);
}

