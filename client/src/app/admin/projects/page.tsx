'use client';

import { useCallback, useState } from 'react';
import { useApi } from '@/api';
import { adminService } from '@/api';
import { DataTable } from '../components/DataTable';
import { FormModal } from '../components/FormModal';
import { FormField, TagField } from '../components/FormField';
import { StatusBadge } from '../components/StatusBadge';
import type { Project } from '@/types/schema';

const EMPTY_PROJECT = {
	title: '',
	slug: '',
	description: '',
	techStack: [] as string[],
	thumbnail: '',
	images: [] as string[],
	githubUrl: '',
	liveUrl: '',
	status: 'draft',
	featured: false,
};

export default function ProjectsPage() {
	const fetcher = useCallback(() => adminService.getProjects(), []);
	const { data: projects, loading, refetch } = useApi<Project[]>(fetcher);

	const [modal, setModal] = useState<{ open: boolean; editing: Project | null }>({
		open: false,
		editing: null,
	});
	const [form, setForm] = useState(EMPTY_PROJECT);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function openCreate() {
		setForm(EMPTY_PROJECT);
		setModal({ open: true, editing: null });
		setError(null);
	}

	function openEdit(project: Project) {
		setForm({
			title: project.title,
			slug: project.slug,
			description: project.description,
			techStack: project.techStack,
			thumbnail: project.thumbnail || '',
			images: project.images,
			githubUrl: project.githubUrl || '',
			liveUrl: project.liveUrl || '',
			status: project.status,
			featured: project.featured,
		});
		setModal({ open: true, editing: project });
		setError(null);
	}

	function updateField(name: string, value: string | number | boolean) {
		setForm((prev) => ({ ...prev, [name]: value }));
	}

	function updateTags(name: string, value: string[]) {
		setForm((prev) => ({ ...prev, [name]: value }));
	}

	async function handleSave() {
		setSaving(true);
		setError(null);
		try {
			if (modal.editing) {
				await adminService.updateProject(modal.editing.id, form);
			} else {
				await adminService.createProject(form as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>);
			}
			setModal({ open: false, editing: null });
			refetch();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save');
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(project: Project) {
		if (!confirm(`Delete "${project.title}"?`)) return;
		try {
			await adminService.deleteProject(project.id);
			refetch();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to delete');
		}
	}

	const columns = [
		{ key: 'title', label: 'Title' },
		{ key: 'slug', label: 'Slug', render: (p: Project) => <span className="font-mono text-xs text-zinc-500">{p.slug}</span> },
		{ key: 'status', label: 'Status', render: (p: Project) => <StatusBadge status={p.status} /> },
		{ key: 'featured', label: 'Featured', render: (p: Project) => (p.featured ? '⭐' : '—') },
	];

	return (
		<div className="max-w-5xl">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Projects</h1>
				<button onClick={openCreate} className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">
					+ New Project
				</button>
			</div>

			{loading ? (
				<div className="text-zinc-500">Loading...</div>
			) : (
				<DataTable columns={columns} data={projects || []} onEdit={openEdit} onDelete={handleDelete} emptyMessage="No projects yet" />
			)}

			<FormModal open={modal.open} onClose={() => setModal({ open: false, editing: null })} title={modal.editing ? 'Edit Project' : 'New Project'} onSubmit={handleSave} loading={saving}>
				{error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}
				<FormField label="Title" name="title" value={form.title} onChange={updateField} required />
				<FormField label="Slug" name="slug" value={form.slug} onChange={updateField} required />
				<FormField label="Description" name="description" type="textarea" value={form.description} onChange={updateField} required rows={4} />
				<TagField label="Tech Stack" name="techStack" value={form.techStack} onChange={updateTags} />
				<FormField label="Thumbnail URL" name="thumbnail" type="url" value={form.thumbnail} onChange={updateField} />
				<FormField label="GitHub URL" name="githubUrl" type="url" value={form.githubUrl} onChange={updateField} />
				<FormField label="Live URL" name="liveUrl" type="url" value={form.liveUrl} onChange={updateField} />
				<FormField label="Status" name="status" type="select" value={form.status} onChange={updateField} options={[{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }, { label: 'Completed', value: 'completed' }, { label: 'Archived', value: 'archived' }]} />
				<FormField label="Featured" name="featured" type="checkbox" value={form.featured} onChange={updateField} />
			</FormModal>
		</div>
	);
}
