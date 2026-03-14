'use client';

import { useCallback, useState } from 'react';
import { useApi } from '@/api';
import { adminService } from '@/api';
import { DataTable } from '../components/DataTable';
import { FormModal } from '../components/FormModal';
import { FormField, TagField } from '../components/FormField';
import type { JourneyEntry } from '@/types/schema';

const TYPES = [
	{ label: 'Work', value: 'work' },
	{ label: 'Education', value: 'education' },
	{ label: 'Volunteering', value: 'volunteering' },
	{ label: 'Research', value: 'research' },
	{ label: 'Other', value: 'other' },
];

const EMPTY: Record<string, unknown> = {
	type: 'education',
	title: '',
	organization: '',
	location: '',
	date: '',
	description: '',
	skills: [],
	isCurrent: false,
	highlighted: false,
	order: 0,
};

export default function JourneyPage() {
	const fetcher = useCallback(() => adminService.getJourney(), []);
	const { data: entries, loading, refetch } = useApi<JourneyEntry[]>(fetcher);

	const [modal, setModal] = useState<{ open: boolean; editing: JourneyEntry | null }>({ open: false, editing: null });
	const [form, setForm] = useState(EMPTY);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function openCreate() {
		setForm(EMPTY);
		setModal({ open: true, editing: null });
		setError(null);
	}

	function openEdit(entry: JourneyEntry) {
		setForm({
			type: entry.type,
			title: entry.title,
			organization: entry.organization || '',
			location: entry.location || '',
			date: entry.date,
			description: entry.description,
			skills: entry.skills,
			isCurrent: entry.isCurrent,
			highlighted: entry.highlighted,
			order: entry.order,
			degree: entry.degree || '',
			fieldOfStudy: entry.fieldOfStudy || '',
			grade: entry.grade || '',
			employmentType: entry.employmentType || '',
		});
		setModal({ open: true, editing: entry });
		setError(null);
	}

	function updateField(name: string, value: unknown) {
		setForm((prev) => ({ ...prev, [name]: value }));
	}

	async function handleSave() {
		setSaving(true);
		setError(null);
		try {
			if (modal.editing) {
				await adminService.updateJourney(modal.editing.id, form as Partial<JourneyEntry>);
			} else {
				await adminService.createJourney(form as Omit<JourneyEntry, 'id'>);
			}
			setModal({ open: false, editing: null });
			refetch();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save');
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(entry: JourneyEntry) {
		if (!confirm(`Delete "${entry.title}"?`)) return;
		try {
			await adminService.deleteJourney(entry.id);
			refetch();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to delete');
		}
	}

	const columns = [
		{ key: 'title', label: 'Title' },
		{ key: 'type', label: 'Type', render: (e: JourneyEntry) => <span className="capitalize">{e.type}</span> },
		{ key: 'organization', label: 'Organization', render: (e: JourneyEntry) => e.organization || '—' },
		{ key: 'date', label: 'Date' },
		{ key: 'order', label: 'Order' },
	];

	return (
		<div className="max-w-5xl">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Journey</h1>
				<button onClick={openCreate} className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">
					+ New Entry
				</button>
			</div>

			{loading ? (
				<div className="text-zinc-500">Loading...</div>
			) : (
				<DataTable columns={columns} data={entries || []} onEdit={openEdit} onDelete={handleDelete} emptyMessage="No journey entries yet" />
			)}

			<FormModal open={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Edit Entry' : 'New Entry'} onSubmit={handleSave} loading={saving}>
				{error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}
				<FormField label="Type" name="type" type="select" value={form.type as string} onChange={updateField} options={TYPES} />
				<FormField label="Title" name="title" value={form.title as string} onChange={updateField} required />
				<FormField label="Organization" name="organization" value={form.organization as string} onChange={updateField} />
				<FormField label="Location" name="location" value={form.location as string} onChange={updateField} />
				<FormField label="Date" name="date" value={form.date as string} onChange={updateField} required placeholder="e.g. 2022 - Present" />
				<FormField label="Description" name="description" type="textarea" value={form.description as string} onChange={updateField} required rows={4} />
				<TagField label="Skills" name="skills" value={form.skills as string[]} onChange={updateField} />
				<FormField label="Order" name="order" type="number" value={form.order as number} onChange={updateField} />
				<FormField label="Currently Active" name="isCurrent" type="checkbox" value={form.isCurrent as boolean} onChange={updateField} />
				<FormField label="Highlighted" name="highlighted" type="checkbox" value={form.highlighted as boolean} onChange={updateField} />
				{form.type === 'education' && (
					<>
						<FormField label="Degree" name="degree" value={(form.degree as string) || ''} onChange={updateField} />
						<FormField label="Field of Study" name="fieldOfStudy" value={(form.fieldOfStudy as string) || ''} onChange={updateField} />
						<FormField label="Grade" name="grade" value={(form.grade as string) || ''} onChange={updateField} />
					</>
				)}
				{form.type === 'work' && (
					<FormField label="Employment Type" name="employmentType" value={(form.employmentType as string) || ''} onChange={updateField} placeholder="full-time, internship, etc." />
				)}
			</FormModal>
		</div>
	);
}
