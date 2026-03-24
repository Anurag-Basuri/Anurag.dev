import { prisma } from '../lib/prisma';

// ─── Intent Classification ──────────────────────────────────────

type Intent =
	| 'profile'
	| 'projects'
	| 'skills'
	| 'journey'
	| 'blog'
	| 'achievements'
	| 'certifications'
	| 'coding_stats'
	| 'contact'
	| 'general';

const INTENT_KEYWORDS: Record<Intent, string[]> = {
	profile: ['who', 'about', 'name', 'bio', 'introduction', 'yourself', 'background', 'location', 'pronouns', 'available', 'freelance', 'hire'],
	projects: ['project', 'built', 'build', 'portfolio', 'app', 'application', 'github', 'repo', 'developed', 'created', 'work'],
	skills: ['skill', 'tech', 'technology', 'stack', 'framework', 'language', 'programming', 'tool', 'proficient', 'know', 'use', 'expert'],
	journey: ['experience', 'education', 'work', 'job', 'company', 'career', 'intern', 'study', 'university', 'college', 'degree', 'role'],
	blog: ['blog', 'article', 'post', 'write', 'written', 'read', 'content', 'publication'],
	achievements: ['achievement', 'award', 'hackathon', 'competition', 'prize', 'won', 'win', 'recognition'],
	certifications: ['certification', 'certificate', 'certified', 'credential', 'course', 'completed'],
	coding_stats: ['leetcode', 'codeforces', 'codechef', 'gfg', 'competitive', 'problems', 'solved', 'rating', 'coding'],
	contact: ['contact', 'reach', 'email', 'connect', 'hire', 'message', 'collaborate', 'interested'],
	general: [],
};

export function classifyIntent(message: string): Intent[] {
	const lower = message.toLowerCase();
	const intents: { intent: Intent; score: number }[] = [];

	for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [Intent, string[]][]) {
		const score = keywords.filter(kw => lower.includes(kw)).length;
		if (score > 0) intents.push({ intent, score });
	}

	if (intents.length === 0) return ['general'];

	// Sort by score desc, return top 2 intents
	intents.sort((a, b) => b.score - a.score);
	return intents.slice(0, 2).map(i => i.intent);
}

// ─── Context Retrieval (Tool Functions) ─────────────────────────

export async function getProfileContext(): Promise<string> {
	const profile = await prisma.profile.findFirst();
	if (!profile) return 'No profile data available.';

	const skills = profile.skills as Record<string, string[]> | null;
	const workPrefs = profile.workPreferences as Record<string, boolean> | null;

	return `
PROFILE:
Name: ${profile.name}
Pronouns: ${profile.pronouns ?? 'Not specified'}
Bio: ${profile.bio ?? 'Not provided'}
Tagline: ${profile.Tagline ?? ''}
Header: ${profile.header ?? ''}
Location: ${profile.Currentlocation ?? 'Not specified'}
From: ${profile.Originallocation ?? 'Not specified'}
Experience: ${profile.experienceYears} years
Open to Work: ${profile.openToWork ? 'Yes' : 'No'}
Notice Period: ${profile.noticePeriod ?? 'Not specified'}
Freelancing: ${profile.Freelancing ? 'Yes' : 'No'}
Work Preferences: ${workPrefs ? Object.entries(workPrefs).filter(([_, v]) => v).map(([k]) => k).join(', ') : 'Not specified'}
Languages Spoken: ${profile.languages?.join(', ') ?? 'Not specified'}
Skills: ${skills ? Object.entries(skills).map(([cat, items]) => `${cat}: ${items.join(', ')}`).join(' | ') : 'Not listed'}
`.trim();
}

export async function getProjectsContext(searchTerm?: string): Promise<string> {
	const projects = await prisma.project.findMany({
		where: { status: 'published' },
		orderBy: { createdAt: 'desc' },
		take: 15,
	});

	if (projects.length === 0) return 'No published projects.';

	let filtered = projects;
	if (searchTerm) {
		const lower = searchTerm.toLowerCase();
		filtered = projects.filter(
			p =>
				p.title.toLowerCase().includes(lower) ||
				p.description.toLowerCase().includes(lower) ||
				p.techStack.some(t => t.toLowerCase().includes(lower)),
		);
		if (filtered.length === 0) filtered = projects; // fallback to all
	}

	return `PROJECTS (${filtered.length}):\n` + filtered.map(p =>
		`- "${p.title}": ${p.description.slice(0, 200)}${p.description.length > 200 ? '...' : ''}\n  Tech: ${p.techStack.join(', ')}\n  GitHub: ${p.githubUrl ?? 'N/A'} | Live: ${p.liveUrl ?? 'N/A'}${p.stars ? ` | ⭐ ${p.stars}` : ''}`,
	).join('\n');
}

export async function getJourneyContext(): Promise<string> {
	const entries = await prisma.journeyEntry.findMany({
		orderBy: { startDate: 'desc' },
		take: 20,
	});

	if (entries.length === 0) return 'No journey entries.';

	return `JOURNEY (${entries.length} entries):\n` + entries.map(e => {
		const period = e.isCurrent ? `${e.date} – Present` : e.date;
		return `- [${e.type}] "${e.title}" at ${e.organization ?? 'N/A'} (${period})\n  ${e.description.slice(0, 150)}${e.description.length > 150 ? '...' : ''}${e.skills?.length ? `\n  Skills: ${e.skills.join(', ')}` : ''}`;
	}).join('\n');
}

export async function getBlogContext(tag?: string): Promise<string> {
	const posts = await prisma.blogPost.findMany({
		where: {
			status: 'published',
			...(tag ? { tags: { has: tag } } : {}),
		},
		orderBy: { publishedAt: 'desc' },
		take: 10,
	});

	if (posts.length === 0) return tag ? `No blog posts with tag "${tag}".` : 'No published blog posts.';

	return `BLOG POSTS (${posts.length}):\n` + posts.map(p =>
		`- "${p.title}" (${p.publishedAt?.toLocaleDateString() ?? 'draft'})\n  Tags: ${p.tags.join(', ')}\n  Preview: ${p.content.slice(0, 150)}...`,
	).join('\n');
}

export async function getAchievementsContext(): Promise<string> {
	const achievements = await prisma.achievement.findMany({
		orderBy: { date: 'desc' },
		take: 15,
	});

	if (achievements.length === 0) return 'No achievements listed.';

	return `ACHIEVEMENTS (${achievements.length}):\n` + achievements.map(a =>
		`- "${a.title}" [${a.category}]${a.issuer ? ` by ${a.issuer}` : ''}${a.event ? ` at ${a.event}` : ''}${a.rank ? ` — Rank: ${a.rank}` : ''}\n  ${a.description?.slice(0, 120) ?? ''}`,
	).join('\n');
}

export async function getCertificationsContext(): Promise<string> {
	const certs = await prisma.certification.findMany({
		orderBy: { startDate: 'desc' },
		take: 15,
	});

	if (certs.length === 0) return 'No certifications listed.';

	return `CERTIFICATIONS (${certs.length}):\n` + certs.map(c =>
		`- "${c.title}" by ${c.issuer}${c.credentialId ? ` (ID: ${c.credentialId})` : ''}${c.skills?.length ? `\n  Skills: ${c.skills.join(', ')}` : ''}`,
	).join('\n');
}

export async function getCodingStatsContext(): Promise<string> {
	const profile = await prisma.profile.findFirst({
		select: { leetcode: true, codeforces: true, codechef: true, gfg: true, hackerrank: true, kaggle: true },
	});

	if (!profile) return 'No coding profiles configured.';

	const platforms = Object.entries(profile)
		.filter(([_, v]) => v)
		.map(([k, v]) => `${k}: ${v}`);

	return platforms.length > 0
		? `CODING PROFILES:\n${platforms.join('\n')}`
		: 'No competitive programming profiles configured.';
}

// ─── Master Context Builder ─────────────────────────────────────

export async function buildContext(intents: Intent[], message: string): Promise<string> {
	const chunks: string[] = [];

	for (const intent of intents) {
		switch (intent) {
			case 'profile':
			case 'general':
				chunks.push(await getProfileContext());
				break;
			case 'projects':
				chunks.push(await getProjectsContext(message));
				break;
			case 'skills':
				chunks.push(await getProfileContext()); // skills are in profile
				break;
			case 'journey':
				chunks.push(await getJourneyContext());
				break;
			case 'blog':
				chunks.push(await getBlogContext());
				break;
			case 'achievements':
				chunks.push(await getAchievementsContext());
				break;
			case 'certifications':
				chunks.push(await getCertificationsContext());
				break;
			case 'coding_stats':
				chunks.push(await getCodingStatsContext());
				break;
			case 'contact':
				chunks.push(await getProfileContext());
				chunks.push('NOTE: If the visitor wants to contact Anurag, encourage them to use the contact form on the website or provide them with relevant social links.');
				break;
		}
	}

	// Deduplicate
	return [...new Set(chunks)].join('\n\n');
}
