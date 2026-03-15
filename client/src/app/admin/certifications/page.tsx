'use client';

import { useCallback, useState } from 'react';
import { useApi } from '@/api';
import { adminService } from '@/api';
import { DataTable } from '../components/DataTable';
import { FormModal } from '../components/FormModal';
import { FormField, TagField } from '../components/FormField';
import type { Certification } from '@/api/schema';

const EMPTY = {
	title: '',
	issuer: '',
	description: '',
	credentialId: '',
	credentialUrl: '',
	certificateUrl: '',
	skills: [] as string[],
	startDate: '',
	endDate: '',
};

export default function CertificationsPage() {
	const fetcher = useCallback(() => adminService.getCertifications(), []);
	const { data: items, loading, refetch } = useApi<Certification[]>(fetcher);

	const [modal, setModal] = useState<{ open: boolean; editing: Certification | null }>({
		open: false,
		editing: null,
	});
	const [form, setForm] = useState(EMPTY);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function openCreate() {
		setForm(EMPTY);
		setModal({ open: true, editing: null });
		setError(null);
	}

	function openEdit(item: Certification) {
		setForm({
			title: item.title,
			issuer: item.issuer,
			description: item.description || '',
			credentialId: item.credentialId || '',
			credentialUrl: item.credentialUrl || '',
			certificateUrl: item.certificateUrl || '',
			skills: item.skills,
			startDate: item.startDate || '',
			endDate: item.endDate || '',
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
			if (modal.editing)
				await adminService.updateCertification(
					modal.editing.id,
					form as Partial<Certification>,
				);
			else await adminService.createCertification(form as Omit<Certification, 'id'>);
			setModal({ open: false, editing: null });
			refetch();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save');
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(item: Certification) {
		if (!confirm(`Delete "${item.title}"?`)) return;
		try {
			await adminService.deleteCertification(item.id);
			refetch();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to delete');
		}
	}

	const columns = [
		{ key: 'title', label: 'Title' },
		{ key: 'issuer', label: 'Issuer' },
		{
			key: 'credentialId',
			label: 'Credential ID',
			render: (c: Certification) =>
				c.credentialId ? (
					<span className="font-mono text-xs text-zinc-500">{c.credentialId}</span>
				) : (
					'—'
				),
		},
	];

	return (
		<div className="max-w-5xl">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Certifications</h1>
				<button
					onClick={openCreate}
					className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
				>
					+ New Certification
				</button>
			</div>
			{loading ? (
				<div className="text-zinc-500">Loading...</div>
			) : (
				<DataTable
					columns={columns}
					data={items || []}
					onEdit={openEdit}
					onDelete={handleDelete}
					emptyMessage="No certifications yet"
				/>
			)}
			<FormModal
				open={modal.open}
				onClose={() => setModal({ open: false, editing: null })}
				title={modal.editing ? 'Edit Certification' : 'New Certification'}
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
					label="Issuer"
					name="issuer"
					value={form.issuer}
					onChange={updateField}
					required
				/>
				<FormField
					label="Description"
					name="description"
					type="textarea"
					value={form.description}
					onChange={updateField}
					rows={3}
				/>
				<FormField
					label="Credential ID"
					name="credentialId"
					value={form.credentialId}
					onChange={updateField}
				/>
				<FormField
					label="Credential URL"
					name="credentialUrl"
					type="url"
					value={form.credentialUrl}
					onChange={updateField}
				/>
				<FormField
					label="Certificate URL"
					name="certificateUrl"
					type="url"
					value={form.certificateUrl}
					onChange={updateField}
				/>
				<TagField label="Skills" name="skills" value={form.skills} onChange={updateField} />
				<FormField
					label="Start Date"
					name="startDate"
					type="date"
					value={form.startDate}
					onChange={updateField}
				/>
				<FormField
					label="End Date"
					name="endDate"
					type="date"
					value={form.endDate}
					onChange={updateField}
				/>
			</FormModal>
		</div>
	);
}

