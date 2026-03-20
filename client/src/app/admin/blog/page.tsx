'use client';

import { useCallback, useState } from 'react';
import { useApi } from '@/api';
import { adminService } from '@/api';
import { DataTable } from '../components/DataTable';
import { FormModal } from '../components/FormModal';
import { FormField, TagField } from '../components/FormField';
import { StatusBadge } from '../components/StatusBadge';
import type { BlogPost } from '@/api/schema';

const EMPTY = {
	title: '',
	content: '',
	tags: [] as string[],
	coverImage: '',
	otherImages: [] as string[],
	link: '',
	status: 'draft',
};

export default function BlogPage() {
	const fetcher = useCallback(() => adminService.getBlogPosts(), []);
	const { data: posts, loading, refetch } = useApi<BlogPost[]>(fetcher);

	const [modal, setModal] = useState<{ open: boolean; editing: BlogPost | null }>({
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

	function openEdit(post: BlogPost) {
		setForm({
			title: post.title,
			content: post.content,
			tags: post.tags,
			coverImage: post.coverImage || '',
			otherImages: post.otherImages,
			link: post.link || '',
			status: post.status,
		});
		setModal({ open: true, editing: post });
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
				await adminService.updateBlogPost(modal.editing.id, form as Partial<BlogPost>);
			else
				await adminService.createBlogPost(
					form as Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>,
				);
			setModal({ open: false, editing: null });
			refetch();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save');
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(post: BlogPost) {
		if (!confirm(`Delete "${post.title}"?`)) return;
		try {
			await adminService.deleteBlogPost(post.id);
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
			render: (p: BlogPost) => <StatusBadge status={p.status} />,
		},
		{
			key: 'tags',
			label: 'Tags',
			render: (p: BlogPost) => p.tags.slice(0, 3).join(', ') || '—',
		},
		{
			key: 'publishedAt',
			label: 'Published',
			render: (p: BlogPost) =>
				p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—',
		},
	];

	return (
		<div className="max-w-5xl">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Blog</h1>
				<button
					onClick={openCreate}
					className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
				>
					+ New Post
				</button>
			</div>
			{loading ? (
				<div className="text-zinc-500">Loading...</div>
			) : (
				<DataTable
					columns={columns}
					data={posts || []}
					onEdit={openEdit}
					onDelete={handleDelete}
					emptyMessage="No blog posts yet"
				/>
			)}
			<FormModal
				open={modal.open}
				onClose={() => setModal({ open: false, editing: null })}
				title={modal.editing ? 'Edit Post' : 'New Post'}
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
					label="Content"
					name="content"
					type="textarea"
					value={form.content}
					onChange={updateField}
					required
					rows={8}
				/>
				<TagField label="Tags" name="tags" value={form.tags} onChange={updateField} />
				<FormField
					label="Cover Image URL"
					name="coverImage"
					type="url"
					value={form.coverImage}
					onChange={updateField}
				/>
				<FormField
					label="External Link"
					name="link"
					type="url"
					value={form.link}
					onChange={updateField}
				/>
				<FormField
					label="Status"
					name="status"
					type="select"
					value={form.status}
					onChange={updateField}
					options={[
						{ label: 'Draft', value: 'draft' },
						{ label: 'Published', value: 'published' },
						{ label: 'Archived', value: 'archived' },
					]}
				/>
			</FormModal>
		</div>
	);
}

