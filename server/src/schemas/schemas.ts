export const SkillSchema = z.object({
	category: z.string(),
	name: z.string(),
	level: z.number().min(0).max(100),
});

export const AboutSchema = z.object({
	id: z.string().optional(),
	name: z.string(),
	role: z.string(),
	avatarUrl: z.string().url(),
	summary: z.string(),
	bio: z.string(),
	experience: z.number(),
	projects: z.number(),
	skills: z.array(SkillSchema),
});
