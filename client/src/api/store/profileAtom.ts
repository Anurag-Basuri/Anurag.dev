'use client';

import { atom, useAtom } from 'jotai';
import { useEffect, useCallback } from 'react';
import { publicService } from '../services/public';
import { FALLBACK_PROFILE, FALLBACK_PROJECTS } from '../fallback';
import type { AboutData, Project } from '../schema';

/**
 * Centralized Jotai Store for Profile and Projects.
 * Prevents redundant waterfall API calls across SidebarProfile, ProfileModule, ContactModule, etc.
 */

// ── Profile Atoms ─────────────────────────────────────────────────────────────
export const profileAtom = atom(null as AboutData | null);
export const profileLoadingAtom = atom(true);
export const profileErrorAtom = atom(null as string | null);

// ── Projects Atoms ────────────────────────────────────────────────────────────
export const projectsAtom = atom(null as Project[] | null);
export const projectsLoadingAtom = atom(true);
export const projectsErrorAtom = atom(null as string | null);

// ── Interactive Cross-Filter Atom (Skill ↔ Project Highlight) ─────────────────
// When a user hovers or clicks a skill badge in the Profile Bento,
// this atom holds the skill name so all project cards using this skill illuminate.
export const activeSkillFilterAtom = atom(null as string | null);

// ── Hook: useProfile ──────────────────────────────────────────────────────────
export function useProfile() {
	const [profile, setProfile] = useAtom(profileAtom);
	const [loading, setLoading] = useAtom(profileLoadingAtom);
	const [error, setError] = useAtom(profileErrorAtom);

	const fetchProfile = useCallback(async (force = false) => {
		if (profile && !force) return;
		try {
			setLoading(true);
			setError(null);
			const { data } = await publicService.getProfile();
			setProfile(data || FALLBACK_PROFILE);
		} catch (err) {
			console.warn('[useProfile] Failed to fetch profile from API, utilizing fallback:', err);
			setProfile(FALLBACK_PROFILE);
			setError('Using offline profile data');
		} finally {
			setLoading(false);
		}
	}, [profile, setProfile, setLoading, setError]);

	useEffect(() => {
		if (!profile) {
			fetchProfile();
		} else {
			setLoading(false);
		}
	}, [profile, fetchProfile, setLoading]);

	return {
		profile: profile || FALLBACK_PROFILE,
		loading,
		error,
		refreshProfile: () => fetchProfile(true),
	};
}

// ── Hook: useProjects ─────────────────────────────────────────────────────────
export function useProjects() {
	const [projects, setProjects] = useAtom(projectsAtom);
	const [loading, setLoading] = useAtom(projectsLoadingAtom);
	const [error, setError] = useAtom(projectsErrorAtom);

	const fetchProjects = useCallback(async (force = false) => {
		if (projects && !force) return;
		try {
			setLoading(true);
			setError(null);
			const { data } = await publicService.getProjects();
			setProjects(data && data.length > 0 ? data : FALLBACK_PROJECTS);
		} catch (err) {
			console.warn('[useProjects] Failed to fetch projects, utilizing fallback:', err);
			setProjects(FALLBACK_PROJECTS);
			setError('Using offline projects data');
		} finally {
			setLoading(false);
		}
	}, [projects, setProjects, setLoading, setError]);

	useEffect(() => {
		if (!projects) {
			fetchProjects();
		} else {
			setLoading(false);
		}
	}, [projects, fetchProjects, setLoading]);

	return {
		projects: projects || FALLBACK_PROJECTS,
		loading,
		error,
		refreshProjects: () => fetchProjects(true),
	};
}
