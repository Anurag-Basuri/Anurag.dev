'use client';

import { useCallback, useState } from 'react';
import { useApi } from '@/api';
import { adminService } from '@/api';
import { FormField, TagField } from '../components/FormField';
import type { Profile } from '@/types/schema';

export default function ProfilePage() {
	const fetcher = useCallback(() => adminService.getProfile(), []);
	const { data: profile, loading, refetch } = useApi<Profile>(fetcher);

	const [form, setForm] = useState<Partial<Profile>>({});
	const [initialized, setInitialized] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Initialize form from fetched profile (once)
	if (profile && !initialized) {
		setForm({
			name: profile.name,
			pronouns: profile.pronouns,
			email: profile.email,
			phone: profile.phone,
			header: profile.header || '',
			bio: profile.bio || '',
			Currentlocation: profile.Currentlocation || '',
			Originallocation: profile.Originallocation || '',
			openToWork: profile.openToWork,
			availableFrom: profile.availableFrom || '',
			noticePeriod: profile.noticePeriod || '',
			jobTypes: profile.jobTypes,
			avatarUrl: profile.avatarUrl || '',
			coverUrl: profile.coverUrl || '',
			resumeUrl: profile.resumeUrl || '',
			experienceYears: profile.experienceYears,
			projectsCount: profile.projectsCount,
			languages: profile.languages,
			website: profile.website || '',
			github: profile.github || '',
			leetcode: profile.leetcode || '',
			codeforces: profile.codeforces || '',
			codechef: profile.codechef || '',
			gfg: profile.gfg || '',
			kaggle: profile.kaggle || '',
			seoTitle: profile.seoTitle || '',
			seoDesc: profile.seoDesc || '',
			seoKeywords: profile.seoKeywords,
		});
		setInitialized(true);
	}

	function updateField(name: string, value: unknown) {
		setForm((prev) => ({ ...prev, [name]: value }));
		setSaved(false);
	}

	async function handleSave() {
		setSaving(true);
		setError(null);
		setSaved(false);
		try {
			await adminService.updateProfile(form);
			setSaved(true);
			refetch();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save');
		} finally {
			setSaving(false);
		}
	}

	if (loading) return <div className="text-zinc-500">Loading profile...</div>;

	return (
		<div className="max-w-3xl">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Profile</h1>
				<button
					onClick={handleSave}
					disabled={saving}
					className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium transition-colors"
				>
					{saving ? 'Saving...' : 'Save Changes'}
				</button>
			</div>

			{error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">{error}</div>}
			{saved && <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 text-sm mb-4">Profile saved successfully!</div>}

			<div className="space-y-8">
				{/* Personal Info */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Personal Info</h2>
					<div className="grid grid-cols-2 gap-4">
						<FormField label="Name" name="name" value={(form.name as string) || ''} onChange={updateField} required />
						<FormField label="Pronouns" name="pronouns" value={(form.pronouns as string) || ''} onChange={updateField} />
						<FormField label="Email" name="email" type="email" value={(form.email as string) || ''} onChange={updateField} />
						<FormField label="Phone" name="phone" value={(form.phone as string) || ''} onChange={updateField} />
					</div>
				</section>

				{/* Career & Bio */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Career & Bio</h2>
					<div className="space-y-4">
						<FormField label="Header" name="header" value={(form.header as string) || ''} onChange={updateField} placeholder="One-liner headline" />
						<FormField label="Bio" name="bio" type="textarea" value={(form.bio as string) || ''} onChange={updateField} rows={5} />
					</div>
				</section>

				{/* Location */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Location</h2>
					<div className="grid grid-cols-2 gap-4">
						<FormField label="Current Location" name="Currentlocation" value={(form.Currentlocation as string) || ''} onChange={updateField} />
						<FormField label="Original Location" name="Originallocation" value={(form.Originallocation as string) || ''} onChange={updateField} />
					</div>
				</section>

				{/* Job Seeking */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Job Seeking</h2>
					<div className="space-y-4">
						<FormField label="Open to Work" name="openToWork" type="checkbox" value={(form.openToWork as boolean) ?? true} onChange={updateField} />
						<div className="grid grid-cols-2 gap-4">
							<FormField label="Available From" name="availableFrom" value={(form.availableFrom as string) || ''} onChange={updateField} placeholder="Immediately" />
							<FormField label="Notice Period" name="noticePeriod" value={(form.noticePeriod as string) || ''} onChange={updateField} placeholder="30 days" />
						</div>
						<TagField label="Job Types" name="jobTypes" value={(form.jobTypes as string[]) || []} onChange={updateField} placeholder="full-time, internship, contract" />
					</div>
				</section>

				{/* Media */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Media & Links</h2>
					<div className="grid grid-cols-2 gap-4">
						<FormField label="Avatar URL" name="avatarUrl" type="url" value={(form.avatarUrl as string) || ''} onChange={updateField} />
						<FormField label="Cover URL" name="coverUrl" type="url" value={(form.coverUrl as string) || ''} onChange={updateField} />
						<FormField label="Resume URL" name="resumeUrl" type="url" value={(form.resumeUrl as string) || ''} onChange={updateField} />
						<FormField label="Website" name="website" type="url" value={(form.website as string) || ''} onChange={updateField} />
					</div>
				</section>

				{/* Stats */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Quick Stats</h2>
					<div className="grid grid-cols-2 gap-4">
						<FormField label="Years of Experience" name="experienceYears" type="number" value={(form.experienceYears as number) ?? 0} onChange={updateField} />
						<FormField label="Projects Count" name="projectsCount" type="number" value={(form.projectsCount as number) ?? 0} onChange={updateField} />
					</div>
				</section>

				{/* Personal */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Personal</h2>
					<TagField label="Languages" name="languages" value={(form.languages as string[]) || []} onChange={updateField} placeholder="English, Hindi" />
				</section>

				{/* Coding Platforms */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Coding Platforms</h2>
					<div className="grid grid-cols-2 gap-4">
						<FormField label="GitHub" name="github" type="url" value={(form.github as string) || ''} onChange={updateField} />
						<FormField label="LeetCode" name="leetcode" type="url" value={(form.leetcode as string) || ''} onChange={updateField} />
						<FormField label="Codeforces" name="codeforces" type="url" value={(form.codeforces as string) || ''} onChange={updateField} />
						<FormField label="CodeChef" name="codechef" type="url" value={(form.codechef as string) || ''} onChange={updateField} />
						<FormField label="GFG" name="gfg" type="url" value={(form.gfg as string) || ''} onChange={updateField} />
						<FormField label="Kaggle" name="kaggle" type="url" value={(form.kaggle as string) || ''} onChange={updateField} />
					</div>
				</section>

				{/* SEO */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">SEO / Meta</h2>
					<div className="space-y-4">
						<FormField label="SEO Title" name="seoTitle" value={(form.seoTitle as string) || ''} onChange={updateField} />
						<FormField label="SEO Description" name="seoDesc" type="textarea" value={(form.seoDesc as string) || ''} onChange={updateField} rows={3} />
						<TagField label="SEO Keywords" name="seoKeywords" value={(form.seoKeywords as string[]) || []} onChange={updateField} />
					</div>
				</section>
			</div>
		</div>
	);
}
