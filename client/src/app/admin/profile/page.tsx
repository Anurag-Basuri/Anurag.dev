'use client';

import { useCallback, useState, useEffect } from 'react';
import { useApi } from '@/api';
import { adminService } from '@/api';
import { FormField, TagField } from '../components/FormField';
import type { Profile } from '@/api/schema';

// ─── Socials sub-editor ──────────────────────────────────────────

interface SocialEntry {
	platform: string;
	url: string;
	icon?: string;
	handle?: string;
}

function SocialsEditor({
	value,
	onChange,
}: {
	value: SocialEntry[];
	onChange: (v: SocialEntry[]) => void;
}) {
	function addEntry() {
		onChange([...value, { platform: '', url: '' }]);
	}

	function updateEntry(idx: number, field: keyof SocialEntry, val: string) {
		const next = value.map((e, i) => (i === idx ? { ...e, [field]: val } : e));
		onChange(next);
	}

	function removeEntry(idx: number) {
		onChange(value.filter((_, i) => i !== idx));
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<label className="block text-sm font-medium text-zinc-400">Social Links</label>
				<button
					type="button"
					onClick={addEntry}
					className="text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
				>
					+ Add
				</button>
			</div>
			{value.map((entry, i) => (
				<div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
					<input
						type="text"
						value={entry.platform}
						onChange={e => updateEntry(i, 'platform', e.target.value)}
						placeholder="Platform"
						className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm placeholder-zinc-600 outline-none focus:ring-2 focus:ring-blue-500/40"
					/>
					<input
						type="url"
						value={entry.url}
						onChange={e => updateEntry(i, 'url', e.target.value)}
						placeholder="https://..."
						className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm placeholder-zinc-600 outline-none focus:ring-2 focus:ring-blue-500/40"
					/>
					<button
						type="button"
						onClick={() => removeEntry(i)}
						className="px-2 py-2 text-xs rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
					>
						×
					</button>
				</div>
			))}
			{value.length === 0 && <p className="text-xs text-zinc-600">No social links added.</p>}
		</div>
	);
}

// ─── Skills JSON editor (Record<string, string[]>) ──────────────

function SkillsEditor({
	value,
	onChange,
}: {
	value: Record<string, string[]>;
	onChange: (v: Record<string, string[]>) => void;
}) {
	const [newCategory, setNewCategory] = useState('');

	function addCategory() {
		const cat = newCategory.trim();
		if (!cat || cat in value) return;
		onChange({ ...value, [cat]: [] });
		setNewCategory('');
	}

	function removeCategory(cat: string) {
		const next = { ...value };
		delete next[cat];
		onChange(next);
	}

	function updateSkills(cat: string, skills: string[]) {
		onChange({ ...value, [cat]: skills });
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<label className="block text-sm font-medium text-zinc-400">Skills</label>
			</div>

			{Object.entries(value).map(([category, skills]) => (
				<div
					key={category}
					className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 space-y-2"
				>
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-zinc-300">{category}</span>
						<button
							type="button"
							onClick={() => removeCategory(category)}
							className="text-xs text-red-400 hover:text-red-300 transition-colors"
						>
							Remove
						</button>
					</div>
					<TagField
						label=""
						name={`skills-${category}`}
						value={skills}
						onChange={(_, v) => updateSkills(category, v)}
						placeholder="Add skills..."
					/>
				</div>
			))}

			<div className="flex gap-2">
				<input
					type="text"
					value={newCategory}
					onChange={e => setNewCategory(e.target.value)}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							e.preventDefault();
							addCategory();
						}
					}}
					placeholder="New category name"
					className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm placeholder-zinc-600 outline-none focus:ring-2 focus:ring-blue-500/40"
				/>
				<button
					type="button"
					onClick={addCategory}
					className="px-3 py-2 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
				>
					+ Category
				</button>
			</div>
		</div>
	);
}

// ─── Work Preferences ──────────────────────────────────────────

interface WorkPrefs {
	remote?: boolean;
	hybrid?: boolean;
	onsite?: boolean;
	relocation?: boolean;
}

function WorkPreferencesEditor({
	value,
	onChange,
}: {
	value: WorkPrefs;
	onChange: (v: WorkPrefs) => void;
}) {
	function toggle(key: keyof WorkPrefs) {
		onChange({ ...value, [key]: !value[key] });
	}

	const options: { key: keyof WorkPrefs; label: string }[] = [
		{ key: 'remote', label: 'Remote' },
		{ key: 'hybrid', label: 'Hybrid' },
		{ key: 'onsite', label: 'On-site' },
		{ key: 'relocation', label: 'Open to Relocation' },
	];

	return (
		<div>
			<label className="block text-sm font-medium text-zinc-400 mb-2">Work Preferences</label>
			<div className="flex flex-wrap gap-4">
				{options.map(opt => (
					<label key={opt.key} className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={!!value[opt.key]}
							onChange={() => toggle(opt.key)}
							className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500/40"
						/>
						<span className="text-sm text-zinc-300">{opt.label}</span>
					</label>
				))}
			</div>
		</div>
	);
}

// ─── Main Profile Page ──────────────────────────────────────────

export default function ProfilePage() {
	const fetcher = useCallback(() => adminService.getProfile(), []);
	const { data: profile, loading, refetch } = useApi<Profile>(fetcher);

	const [form, setForm] = useState<Partial<Profile>>({});
	const [initialized, setInitialized] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Initialize form when profile loads (useEffect instead of in-render setState)
	useEffect(() => {
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
				workPreferences: profile.workPreferences || {
					remote: false,
					hybrid: false,
					onsite: false,
					relocation: false,
				},
				jobTypes: profile.jobTypes || [],
				avatarUrl: profile.avatarUrl || '',
				coverUrl: profile.coverUrl || '',
				resumeUrl: profile.resumeUrl || '',
				experienceYears: profile.experienceYears,
				projectsCount: profile.projectsCount,
				skills: profile.skills || {},
				languages: profile.languages || [],
				socials: profile.socials || [],
				website: profile.website || '',
				github: profile.github || '',
				leetcode: profile.leetcode || '',
				codeforces: profile.codeforces || '',
				codechef: profile.codechef || '',
				gfg: profile.gfg || '',
				kaggle: profile.kaggle || '',
				otherProfiles: profile.otherProfiles || [],
				seoTitle: profile.seoTitle || '',
				seoDesc: profile.seoDesc || '',
				seoKeywords: profile.seoKeywords || [],
			});
			setInitialized(true);
		}
	}, [profile, initialized]);

	function updateField(name: string, value: unknown) {
		setForm(prev => ({ ...prev, [name]: value }));
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

	if (loading) {
		return (
			<div className="max-w-3xl space-y-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="h-12 bg-zinc-900 rounded-lg animate-pulse" />
				))}
			</div>
		);
	}

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

			{error && (
				<div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
					{error}
				</div>
			)}
			{saved && (
				<div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 text-sm mb-4">
					Profile saved successfully!
				</div>
			)}

			<div className="space-y-8">
				{/* Personal Info */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
						Personal Info
					</h2>
					<div className="grid grid-cols-2 gap-4">
						<FormField
							label="Name"
							name="name"
							value={(form.name as string) || ''}
							onChange={updateField}
							required
						/>
						<FormField
							label="Pronouns"
							name="pronouns"
							value={(form.pronouns as string) || ''}
							onChange={updateField}
							required
						/>
						<FormField
							label="Email"
							name="email"
							type="email"
							value={(form.email as string) || ''}
							onChange={updateField}
							required
						/>
						<FormField
							label="Phone"
							name="phone"
							value={(form.phone as string) || ''}
							onChange={updateField}
							required
						/>
					</div>
				</section>

				{/* Career & Bio */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
						Career &amp; Bio
					</h2>
					<div className="space-y-4">
						<FormField
							label="Header"
							name="header"
							value={(form.header as string) || ''}
							onChange={updateField}
							placeholder="One-liner headline"
						/>
						<FormField
							label="Bio"
							name="bio"
							type="textarea"
							value={(form.bio as string) || ''}
							onChange={updateField}
							rows={5}
						/>
					</div>
				</section>

				{/* Location */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
						Location
					</h2>
					<div className="grid grid-cols-2 gap-4">
						<FormField
							label="Current Location"
							name="Currentlocation"
							value={(form.Currentlocation as string) || ''}
							onChange={updateField}
						/>
						<FormField
							label="Original Location"
							name="Originallocation"
							value={(form.Originallocation as string) || ''}
							onChange={updateField}
						/>
					</div>
				</section>

				{/* Job Seeking */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
						Job Seeking
					</h2>
					<div className="space-y-4">
						<FormField
							label="Open to Work"
							name="openToWork"
							type="checkbox"
							value={(form.openToWork as boolean) ?? true}
							onChange={updateField}
						/>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								label="Available From"
								name="availableFrom"
								value={(form.availableFrom as string) || ''}
								onChange={updateField}
								placeholder="Immediately"
							/>
							<FormField
								label="Notice Period"
								name="noticePeriod"
								value={(form.noticePeriod as string) || ''}
								onChange={updateField}
								placeholder="30 days"
							/>
						</div>
						<WorkPreferencesEditor
							value={(form.workPreferences as WorkPrefs) || {}}
							onChange={v => updateField('workPreferences', v)}
						/>
						<TagField
							label="Job Types"
							name="jobTypes"
							value={(form.jobTypes as string[]) || []}
							onChange={updateField}
							placeholder="full-time, internship, contract"
						/>
					</div>
				</section>

				{/* Media */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
						Media &amp; Links
					</h2>
					<div className="grid grid-cols-2 gap-4">
						<FormField
							label="Avatar URL"
							name="avatarUrl"
							type="url"
							value={(form.avatarUrl as string) || ''}
							onChange={updateField}
						/>
						<FormField
							label="Cover URL"
							name="coverUrl"
							type="url"
							value={(form.coverUrl as string) || ''}
							onChange={updateField}
						/>
						<FormField
							label="Resume URL"
							name="resumeUrl"
							type="url"
							value={(form.resumeUrl as string) || ''}
							onChange={updateField}
						/>
						<FormField
							label="Website"
							name="website"
							type="url"
							value={(form.website as string) || ''}
							onChange={updateField}
						/>
					</div>
				</section>

				{/* Quick Stats */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
						Quick Stats
					</h2>
					<div className="grid grid-cols-2 gap-4">
						<FormField
							label="Years of Experience"
							name="experienceYears"
							type="number"
							value={(form.experienceYears as number) ?? 0}
							onChange={updateField}
						/>
						<FormField
							label="Projects Count"
							name="projectsCount"
							type="number"
							value={(form.projectsCount as number) ?? 0}
							onChange={updateField}
						/>
					</div>
				</section>

				{/* Skills */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
						Skills
					</h2>
					<SkillsEditor
						value={(form.skills as Record<string, string[]>) || {}}
						onChange={v => updateField('skills', v)}
					/>
				</section>

				{/* Languages */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
						Personal
					</h2>
					<TagField
						label="Languages"
						name="languages"
						value={(form.languages as string[]) || []}
						onChange={updateField}
						placeholder="English, Hindi"
					/>
				</section>

				{/* Socials */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
						Social Links
					</h2>
					<SocialsEditor
						value={(form.socials as SocialEntry[]) || []}
						onChange={v => updateField('socials', v)}
					/>
				</section>

				{/* Coding Platforms */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
						Coding Platforms
					</h2>
					<div className="grid grid-cols-2 gap-4">
						<FormField
							label="GitHub"
							name="github"
							type="url"
							value={(form.github as string) || ''}
							onChange={updateField}
						/>
						<FormField
							label="LeetCode"
							name="leetcode"
							type="url"
							value={(form.leetcode as string) || ''}
							onChange={updateField}
						/>
						<FormField
							label="Codeforces"
							name="codeforces"
							type="url"
							value={(form.codeforces as string) || ''}
							onChange={updateField}
						/>
						<FormField
							label="CodeChef"
							name="codechef"
							type="url"
							value={(form.codechef as string) || ''}
							onChange={updateField}
						/>
						<FormField
							label="GFG"
							name="gfg"
							type="url"
							value={(form.gfg as string) || ''}
							onChange={updateField}
						/>
						<FormField
							label="Kaggle"
							name="kaggle"
							type="url"
							value={(form.kaggle as string) || ''}
							onChange={updateField}
						/>
					</div>
					<div className="mt-4">
						<TagField
							label="Other Profiles"
							name="otherProfiles"
							value={(form.otherProfiles as string[]) || []}
							onChange={updateField}
							placeholder="URLs to other platforms"
						/>
					</div>
				</section>

				{/* SEO */}
				<section>
					<h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
						SEO / Meta
					</h2>
					<div className="space-y-4">
						<FormField
							label="SEO Title"
							name="seoTitle"
							value={(form.seoTitle as string) || ''}
							onChange={updateField}
						/>
						<FormField
							label="SEO Description"
							name="seoDesc"
							type="textarea"
							value={(form.seoDesc as string) || ''}
							onChange={updateField}
							rows={3}
						/>
						<TagField
							label="SEO Keywords"
							name="seoKeywords"
							value={(form.seoKeywords as string[]) || []}
							onChange={updateField}
						/>
					</div>
				</section>
			</div>
		</div>
	);
}

