'use client';

import { useCallback, useState, useMemo } from 'react';
import { useApi } from '@/api';
import { adminService } from '@/api';
import { DataTable } from '../components/DataTable';
import { FormModal } from '../components/FormModal';
import { FormField, TagField } from '../components/FormField';
import type { JourneyEntry } from '@/api/schema';

const TYPES = [
	{ label: 'Work', value: 'WORK' },
	{ label: 'Education', value: 'EDUCATION' },
	{ label: 'Volunteering', value: 'VOLUNTEERING' },
	{ label: 'Research', value: 'RESEARCH' },
	{ label: 'Educator', value: 'EDUCATOR' },
	{ label: 'Other', value: 'OTHER' },
];

const EMPLOYMENT_TYPES = [
	{ label: '— None —', value: '' },
	{ label: 'Full-time', value: 'FULL_TIME' },
	{ label: 'Part-time', value: 'PART_TIME' },
	{ label: 'Internship', value: 'INTERNSHIP' },
	{ label: 'Contract', value: 'CONTRACT' },
	{ label: 'Freelance', value: 'FREELANCE' },
];

const WORK_MODES = [
	{ label: '— None —', value: '' },
	{ label: 'Onsite', value: 'ONSITE' },
	{ label: 'Remote', value: 'REMOTE' },
	{ label: 'Hybrid', value: 'HYBRID' },
];

const WORK_TYPES = [
	{ label: '— None —', value: '' },
	{ label: 'Individual Contributor', value: 'INDIVIDUAL_CONTRIBUTOR' },
	{ label: 'Team Lead', value: 'LEAD' },
	{ label: 'Manager', value: 'MANAGER' },
	{ label: 'Consultant', value: 'CONSULTANT' },
	{ label: 'Other', value: 'OTHER' },
];

interface JourneyForm {
	type: string;
	title: string;
	organization: string;
	location: string;
	date: string;
	startDate: string;
	endDate: string;
	description: string;
	skills: string[];
	url: string;
	isCurrent: boolean;
	highlighted: boolean;
	order: number;
	degree: string;
	fieldOfStudy: string;
	grade: string;
	board: string;
	employmentType: string;
	workMode: string;
	workType: string;
	workLocation: string;
	offerUrl: string;
	experienceUrl: string;
	publication: string;
	doi: string;
	icon: string;
}

const EMPTY: JourneyForm = {
	type: 'WORK',
	title: '',
	organization: '',
	location: '',
	date: '',
	startDate: '',
	endDate: '',
	description: '',
	skills: [],
	url: '',
	isCurrent: false,
	highlighted: false,
	order: 0,
	degree: '',
	fieldOfStudy: '',
	grade: '',
	board: '',
	employmentType: '',
	workMode: '',
	workType: '',
	workLocation: '',
	offerUrl: '',
	experienceUrl: '',
	publication: '',
	doi: '',
	icon: '',
};

/** Build a display date string from startDate / endDate / isCurrent */
function buildDisplayDate(startDate: string, endDate: string, isCurrent: boolean): string {
	if (!startDate) return '';
	const start = new Date(startDate);
	const startStr = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
	if (isCurrent) return `${startStr} - Present`;
	if (!endDate) return startStr;
	const end = new Date(endDate);
	const endStr = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
	return `${startStr} - ${endStr}`;
}

/** Strip type-specific fields that don't belong to the selected type */
function cleanPayload(form: JourneyForm): Record<string, unknown> {
	const payload: Record<string, unknown> = { ...form };

	if (form.type !== 'EDUCATION') {
		payload.degree = '';
		payload.fieldOfStudy = '';
		payload.grade = '';
		payload.board = '';
	}
	if (form.type !== 'WORK') {
		payload.employmentType = '';
		payload.workMode = '';
		payload.workType = '';
		payload.workLocation = '';
		payload.offerUrl = '';
		payload.experienceUrl = '';
	}
	if (form.type !== 'RESEARCH') {
		payload.publication = '';
		payload.doi = '';
	}

	return payload;
}

// ─── Section divider ────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
	return (
		<div className="flex items-center gap-3 pt-3 pb-1">
			<div className="h-px flex-1 bg-zinc-800" />
			<span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
				{label}
			</span>
			<div className="h-px flex-1 bg-zinc-800" />
		</div>
	);
}

// ─── Main Page ──────────────────────────────────────────────────

export default function JourneyPage() {
	const fetcher = useCallback(() => adminService.getJourney(), []);
	const { data: entries, loading, refetch } = useApi<JourneyEntry[]>(fetcher);

	const [modal, setModal] = useState<{ open: boolean; editing: JourneyEntry | null }>({
		open: false,
		editing: null,
	});
	const [form, setForm] = useState<JourneyForm>(EMPTY);
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
			startDate: entry.startDate ? entry.startDate.slice(0, 10) : '',
			endDate: entry.endDate ? entry.endDate.slice(0, 10) : '',
			description: entry.description,
			skills: entry.skills,
			url: entry.url || '',
			isCurrent: entry.isCurrent,
			highlighted: entry.highlighted,
			order: entry.order,
			degree: entry.degree || '',
			fieldOfStudy: entry.fieldOfStudy || '',
			grade: entry.grade || '',
			board: entry.board || '',
			employmentType: entry.employmentType || '',
			workMode: entry.workMode || '',
			workType: entry.workType || '',
			workLocation: entry.workLocation || '',
			offerUrl: entry.offerUrl || '',
			experienceUrl: entry.experienceUrl || '',
			publication: entry.publication || '',
			doi: entry.doi || '',
			icon: entry.icon || '',
		});
		setModal({ open: true, editing: entry });
		setError(null);
	}

	function updateField(name: string, value: unknown) {
		setForm(prev => {
			const next = { ...prev, [name]: value };

			// Auto-generate display date when date fields or isCurrent change
			if (name === 'startDate' || name === 'endDate' || name === 'isCurrent') {
				const startDate = name === 'startDate' ? (value as string) : prev.startDate;
				const endDate = name === 'endDate' ? (value as string) : prev.endDate;
				const isCurrent = name === 'isCurrent' ? (value as boolean) : prev.isCurrent;
				const auto = buildDisplayDate(startDate, endDate, isCurrent);
				if (auto) next.date = auto;
			}

			return next;
		});
	}

	async function handleSave() {
		setSaving(true);
		setError(null);
		try {
			const payload = cleanPayload(form);
			if (modal.editing) {
				await adminService.updateJourney(
					modal.editing.id,
					payload as Partial<JourneyEntry>,
				);
			} else {
				await adminService.createJourney(payload as Omit<JourneyEntry, 'id'>);
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

	const columns = useMemo(
		() => [
			{ key: 'title', label: 'Title' },
			{
				key: 'type',
				label: 'Type',
				render: (e: JourneyEntry) => (
					<span
						className={`capitalize text-xs font-medium px-2 py-0.5 rounded ${
							e.type === 'WORK'
								? 'bg-blue-500/10 text-blue-400'
								: e.type === 'EDUCATION'
									? 'bg-emerald-500/10 text-emerald-400'
									: e.type === 'RESEARCH'
										? 'bg-purple-500/10 text-purple-400'
										: 'bg-zinc-500/10 text-zinc-400'
						}`}
					>
						{e.type}
					</span>
				),
			},
			{
				key: 'organization',
				label: 'Organization',
				render: (e: JourneyEntry) => e.organization || '—',
			},
			{ key: 'date', label: 'Date' },
			{ key: 'order', label: '#' },
		],
		[],
	);

	return (
		<div className="max-w-5xl">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Journey</h1>
				<button
					onClick={openCreate}
					className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
				>
					+ New Entry
				</button>
			</div>

			{loading ? (
				<div className="text-zinc-500">Loading...</div>
			) : (
				<DataTable
					columns={columns}
					data={entries || []}
					onEdit={openEdit}
					onDelete={handleDelete}
					emptyMessage="No journey entries yet"
				/>
			)}

			<FormModal
				open={modal.open}
				onClose={() => setModal({ open: false, editing: null })}
				title={modal.editing ? 'Edit Entry' : 'New Entry'}
				onSubmit={handleSave}
				loading={saving}
				wide
			>
				{error && (
					<div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
						{error}
					</div>
				)}

				{/* ── Core Information ── */}
				<SectionDivider label="Core Information" />

				<div className="grid grid-cols-2 gap-4">
					<FormField
						label="Type"
						name="type"
						type="select"
						value={form.type}
						onChange={updateField}
						options={TYPES}
						required
					/>
					<FormField
						label="Order"
						name="order"
						type="number"
						value={form.order}
						onChange={updateField}
					/>
				</div>

				<FormField
					label="Title"
					name="title"
					value={form.title}
					onChange={updateField}
					required
					placeholder={
						form.type === 'WORK'
							? 'e.g. Software Engineer'
							: form.type === 'EDUCATION'
								? 'e.g. B.Tech Computer Science'
								: 'Title of the entry'
					}
				/>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						label="Organization"
						name="organization"
						value={form.organization}
						onChange={updateField}
						placeholder={
							form.type === 'WORK'
								? 'Company name'
								: form.type === 'EDUCATION'
									? 'School / University'
									: 'Organization'
						}
					/>
					<FormField
						label="Location"
						name="location"
						value={form.location}
						onChange={updateField}
						placeholder="City, Country"
					/>
				</div>

				{/* ── Timeline ── */}
				<SectionDivider label="Timeline" />

				<div className="grid grid-cols-2 gap-4">
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
				</div>

				<div className="grid grid-cols-2 gap-4 items-end">
					<FormField
						label="Display Date"
						name="date"
						value={form.date}
						onChange={updateField}
						required
						placeholder="e.g. Jan 2023 - Present"
					/>
					<FormField
						label="Currently Active"
						name="isCurrent"
						type="checkbox"
						value={form.isCurrent}
						onChange={updateField}
					/>
				</div>

				{form.startDate && !form.date && (
					<p className="text-xs text-zinc-500 -mt-2">
						Tip: Display date auto-fills when you set start/end dates.
					</p>
				)}

				{/* ── Details ── */}
				<SectionDivider label="Details" />

				<FormField
					label="Description"
					name="description"
					type="textarea"
					value={form.description}
					onChange={updateField}
					required
					rows={4}
					placeholder="Describe the role, responsibilities, or coursework..."
				/>

				<TagField
					label="Skills / Technologies"
					name="skills"
					value={form.skills}
					onChange={updateField}
					placeholder="Type a skill and press Enter"
				/>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						label="Related URL"
						name="url"
						type="url"
						value={form.url}
						onChange={updateField}
						placeholder="https://..."
					/>
					<FormField
						label="Icon / Logo URL"
						name="icon"
						value={form.icon}
						onChange={updateField}
						placeholder="Organization logo URL"
					/>
				</div>

				{/* ── Education-specific ── */}
				{form.type === 'EDUCATION' && (
					<>
						<SectionDivider label="Education Details" />
						<div className="grid grid-cols-2 gap-4">
							<FormField
								label="Degree"
								name="degree"
								value={form.degree}
								onChange={updateField}
								placeholder="e.g. B.Tech, M.Sc, High School"
							/>
							<FormField
								label="Field of Study"
								name="fieldOfStudy"
								value={form.fieldOfStudy}
								onChange={updateField}
								placeholder="e.g. Computer Science"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								label="Grade / GPA"
								name="grade"
								value={form.grade}
								onChange={updateField}
								placeholder="e.g. 9.2 CGPA, 85%"
							/>
							<FormField
								label="Board"
								name="board"
								value={form.board}
								onChange={updateField}
								placeholder="e.g. CBSE, ICSE, State Board"
							/>
						</div>
					</>
				)}

				{/* ── Work-specific ── */}
				{form.type === 'WORK' && (
					<>
						<SectionDivider label="Work Details" />
						<div className="grid grid-cols-2 gap-4">
							<FormField
								label="Employment Type"
								name="employmentType"
								type="select"
								value={form.employmentType}
								onChange={updateField}
								options={EMPLOYMENT_TYPES}
							/>
							<FormField
								label="Work Location Map"
								name="workLocation"
								value={form.workLocation}
								onChange={updateField}
								placeholder="e.g. Remote, Bangalore"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								label="Work Mode"
								name="workMode"
								type="select"
								value={form.workMode}
								onChange={updateField}
								options={WORK_MODES}
							/>
							<FormField
								label="Work Type / Role"
								name="workType"
								type="select"
								value={form.workType}
								onChange={updateField}
								options={WORK_TYPES}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								label="Offer Letter URL"
								name="offerUrl"
								type="url"
								value={form.offerUrl}
								onChange={updateField}
								placeholder="https://..."
							/>
							<FormField
								label="Experience Certificate URL"
								name="experienceUrl"
								type="url"
								value={form.experienceUrl}
								onChange={updateField}
								placeholder="https://..."
							/>
						</div>
					</>
				)}

				{/* ── Research-specific ── */}
				{form.type === 'RESEARCH' && (
					<>
						<SectionDivider label="Research Details" />
						<div className="grid grid-cols-2 gap-4">
							<FormField
								label="Publication"
								name="publication"
								value={form.publication}
								onChange={updateField}
								placeholder="Journal / Conference name"
							/>
							<FormField
								label="DOI"
								name="doi"
								value={form.doi}
								onChange={updateField}
								placeholder="10.xxxx/xxxxx"
							/>
						</div>
					</>
				)}

				{/* ── Display Options ── */}
				<SectionDivider label="Display Options" />
				<FormField
					label="Highlighted (pinned entry)"
					name="highlighted"
					type="checkbox"
					value={form.highlighted}
					onChange={updateField}
				/>
			</FormModal>
		</div>
	);
}
