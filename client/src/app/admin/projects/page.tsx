'use client';

import { useCallback, useState } from 'react';
import { useApi } from '@/api';
import { adminService } from '@/api';
import { DataTable } from '../components/DataTable';
import { FormModal } from '../components/FormModal';
import { FormField, TagField } from '../components/FormField';
import { StatusBadge } from '../components/StatusBadge';
import { FileUploadField } from '../components/FileUploadField';
import type { Project } from '@/api/schema';

const EMPTY_PROJECT = {
	title: '',
	description: '',
	techStack: [] as string[],
	thumbnail: '',
	images: [] as string[],
	githubUrl: '',
	liveUrl: '',
	status: 'draft',
	stars: 0,
	forks: 0,
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
			description: project.description,
			techStack: project.techStack,
			thumbnail: project.thumbnail || '',
			images: project.images,
			githubUrl: project.githubUrl || '',
			liveUrl: project.liveUrl || '',
			status: project.status,
			stars: project.stars ?? 0,
			forks: project.forks ?? 0,
		});
		setModal({ open: true, editing: project });
		setError(null);
	}

	function updateField(name: string, value: unknown) {
		setForm(prev => ({ ...prev, [name]: value }));
	}

	async function handleSave() {
		setSaving(true);
		setError(null);
		try {
			if (modal.editing) {
				await adminService.updateProject(modal.editing.id, form);
			} else {
				await adminService.createProject(
					form as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
				);
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
		{
			key: 'status',
			label: 'Status',
			render: (p: Project) => <StatusBadge status={p.status} />,
		},
		{ key: 'techStack', label: 'Tech', render: (p: Project) => p.techStack.slice(0, 3).join(', ') || '—' },
	];

	return (
		<div className="max-w-5xl">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Projects</h1>
				<button
					onClick={openCreate}
					className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
				>
					+ New Project
				</button>
			</div>

			{loading ? (
				<div className="text-zinc-500">Loading...</div>
			) : (
				<DataTable
					columns={columns}
					data={projects || []}
					onEdit={openEdit}
					onDelete={handleDelete}
					emptyMessage="No projects yet"
				/>
			)}

			<FormModal
				open={modal.open}
				onClose={() => setModal({ open: false, editing: null })}
				title={modal.editing ? 'Edit Project' : 'New Project'}
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
					label="Description"
					name="description"
					type="textarea"
					value={form.description}
					onChange={updateField}
					required
					rows={4}
				/>
				<TagField
					label="Tech Stack"
					name="techStack"
					value={form.techStack}
					onChange={updateField}
				/>
				<FormField
					label="Thumbnail URL"
					name="thumbnail"
					type="url"
					value={form.thumbnail}
					onChange={updateField}
				/>
				{modal.editing && (
					<div className="mb-4">
						<FileUploadField
							label="Upload Thumbnail File (Optional)"
							currentUrl={form.thumbnail}
							onUpload={async file => {
								const updated = await adminService.uploadProjectThumbnail(modal.editing!.id, file);
								setForm(prev => ({ ...prev, thumbnail: updated.thumbnail || '' }));
								refetch();
							}}
						/>
					</div>
				)}
				<TagField
					label="Image URLs"
					name="images"
					value={form.images}
					onChange={updateField}
					placeholder="Paste image URLs"
				/>
				{modal.editing && (
					<div className="mb-4 space-y-3">
						<FileUploadField
							label="Upload Project Images"
							currentUrl={undefined}
							onUpload={async file => {
								const updated = await adminService.uploadProjectImages(modal.editing!.id, [file]);
								setForm(prev => ({ ...prev, images: updated.images }));
								refetch();
							}}
						/>
						{form.images.length > 0 && (
							<div className="space-y-1">
								<p className="text-xs text-zinc-500 font-medium">Current images ({form.images.length}):</p>
								{form.images.map((url, i) => (
									<div key={i} className="flex items-center gap-2 text-xs bg-zinc-800/50 rounded px-2 py-1">
										<span className="flex-1 truncate text-zinc-400">{url.split('/').pop()}</span>
										<button
											type="button"
											onClick={async () => {
												if (!confirm('Delete this image?')) return;
												await adminService.deleteProjectImages(modal.editing!.id, [url]);
												setForm(prev => ({ ...prev, images: prev.images.filter(u => u !== url) }));
												refetch();
											}}
											className="text-red-400 hover:text-red-300 shrink-0"
										>
											×
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				)}
				<FormField
					label="GitHub URL"
					name="githubUrl"
					type="url"
					value={form.githubUrl}
					onChange={updateField}
				/>
				<FormField
					label="Live URL"
					name="liveUrl"
					type="url"
					value={form.liveUrl}
					onChange={updateField}
				/>
				<div className="grid grid-cols-2 gap-4">
					<FormField
						label="Stars"
						name="stars"
						type="number"
						value={form.stars}
						onChange={updateField}
					/>
					<FormField
						label="Forks"
						name="forks"
						type="number"
						value={form.forks}
						onChange={updateField}
					/>
				</div>
				<FormField
					label="Status"
					name="status"
					type="select"
					value={form.status}
					onChange={updateField}
					options={[
						{ label: 'Draft', value: 'draft' },
						{ label: 'Published', value: 'published' },
						{ label: 'Completed', value: 'completed' },
						{ label: 'Archived', value: 'archived' },
					]}
				/>
			</FormModal>
		</div>
	);
}

