import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Seeding database...\n');

	// ─── Admin User ─────────────────────────────────────────────

	const adminUsername = process.env.ADMIN_USERNAME || 'admin';
	const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
	const passwordHash = await bcrypt.hash(adminPassword, 12);

	const admin = await prisma.admin.upsert({
		where: { username: adminUsername },
		update: { passwordHash },
		create: {
			username: adminUsername,
			passwordHash,
		},
	});
	console.log(`✅ Admin user: ${admin.username}`);

	// ─── Profile (singleton) ─────────────────────────────────────

	const profile = await prisma.profile.upsert({
		where: { id: 'main' },
		update: {},
		create: {
			id: 'main',
			name: 'Anurag Basuri',
			role: 'Full Stack Engineer',
			tagline: 'Building the Future with Code & AI',
			summary:
				'I specialize in building scalable web applications and exploring the frontiers of artificial intelligence. With a passion for clean code and intuitive design, I create digital experiences that perform as beautifully as they look.',
			bio: "I'm a Full Stack Engineer with a deep passion for building scalable, user-centric web applications. My journey began with a curiosity about how things work on the internet, which quickly evolved into a career in software development.\n\nI specialize in the React ecosystem (Next.js, TypeScript) and modern backend architectures. I strongly believe in writing clean, maintainable code and testing thoroughly. Beyond coding, I'm an advocate for developer experience and often contribute to open-source projects.\n\nWhen I'm not pushing commits, you can find me exploring new AI technologies, reading sci-fi novels, or capturing moments through my camera lens.",
			location: 'India',
			timezone: 'Asia/Kolkata',
			openToWork: true,
			avatarUrl: '/logo.png',
			coverUrl: '/about-cover.jpg',
			experienceYears: 2,
			projectsCount: 15,
			currentStatus: {
				label: 'Building the future of web',
				description: 'Currently focused on scalable architectures and AI integration',
				show: true,
			},
			focusAreas: [
				'Full-Stack Development',
				'AI/ML Integration',
				'System Architecture',
				'Developer Experience',
			],
			highlights: [
				{ label: 'Code Quality', value: '98%', icon: 'Code2' },
				{ label: 'Projects Delivered', value: '15+', icon: 'CheckCircle' },
				{ label: 'Client Satisfaction', value: '100%', icon: 'Star' },
			],
			languages: ['English (Native)', 'Hindi (Native)', 'Japanese (Elementary)'],
			hobbies: ['Photography', 'Sci-Fi Literature', 'Chess', 'Hiking'],
			workPreferences: { remote: true, hybrid: true, onsite: false, relocation: false },
			jobTypes: ['full-time', 'contract'],
			preferredRoles: ['Full Stack Engineer', 'Backend Engineer', 'AI/ML Engineer'],
			techStack: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'PostgreSQL'],
			skills: {
				frontend: [
					{ name: 'React / Next.js', level: 95 },
					{ name: 'TypeScript', level: 90 },
					{ name: 'Tailwind CSS', level: 98 },
					{ name: 'Framer Motion', level: 85 },
				],
				backend: [
					{ name: 'Node.js / Fastify', level: 88 },
					{ name: 'PostgreSQL', level: 85 },
					{ name: 'Prisma', level: 90 },
					{ name: 'Serverless / NeonDB', level: 80 },
				],
				ml: [
					{ name: 'Python', level: 85 },
					{ name: 'LangChain', level: 75 },
					{ name: 'LLM Integration', level: 80 },
					{ name: 'TensorFlow', level: 60 },
				],
				devops: [
					{ name: 'Docker', level: 70 },
					{ name: 'GitHub Actions', level: 75 },
					{ name: 'Vercel / Railway', level: 85 },
				],
			},
			socials: [
				{
					platform: 'GitHub',
					url: 'https://github.com/Anurag-Basuri',
					handle: 'Anurag-Basuri',
				},
				{
					platform: 'LinkedIn',
					url: 'https://linkedin.com/in/anuragbasuri',
					handle: 'anuragbasuri',
				},
				{
					platform: 'Twitter',
					url: 'https://twitter.com/AnuragBasuri',
					handle: 'AnuragBasuri',
				},
			],
			// Coding platforms (merged from former CodingProfile table)
			github: {
				username: 'Anurag-Basuri',
				url: 'https://github.com/Anurag-Basuri',
			},
			leetcode: {
				username: 'Anurag_Basuri',
				url: 'https://leetcode.com/u/Anurag_Basuri',
			},
			codeforces: {
				username: 'Anurag_Basuri',
				url: 'https://codeforces.com/profile/Anurag_Basuri',
			},
			codechef: {
				username: 'anurag_basuri',
				url: 'https://www.codechef.com/users/anurag_basuri',
			},
		},
	});
	console.log(`✅ Profile: ${profile.name}`);

	// ─── Projects ───────────────────────────────────────────────

	const projects = [
		{
			title: 'AnuragOS',
			slug: 'anuragos-portfolio',
			description:
				'A terminal-style personal portfolio website with a fully functional file system and window manager.',
			content: 'Full case study of AnuragOS...',
			techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
			tags: ['Portfolio', 'Operating System', 'Web Design'],
			thumbnail: '/projects/anuragos-thumb.png',
			images: ['/projects/anuragos-1.png', '/projects/anuragos-2.png'],
			githubUrl: 'https://github.com/Anurag-Basuri/personal_portfolio',
			liveUrl: 'https://anurag.dev',
			status: 'completed',
			featured: true,
			priority: 10,
			stars: 120,
			forks: 45,
		},
		{
			title: 'AI Lab',
			slug: 'ai-lab-experiments',
			description:
				'Experimental AI playground for testing LLM interactions and agent functionalities.',
			content: 'Full case study of AI Lab...',
			techStack: ['Python', 'LangChain', 'OpenAI', 'React'],
			tags: ['AI', 'LLM', 'Agents'],
			thumbnail: '/projects/ailab-thumb.png',
			images: [],
			status: 'draft',
			featured: false,
			priority: 5,
		},
	];

	for (const project of projects) {
		await prisma.project.upsert({
			where: { slug: project.slug },
			update: project,
			create: project,
		});
	}
	console.log(`✅ Projects: ${projects.length} seeded`);

	// ─── Journey ────────────────────────────────────────────────

	const journeyEntries = [
		{
			type: 'work',
			title: 'Full Stack Engineer',
			company: 'Tech Innovators Inc.',
			location: 'San Francisco, CA',
			date: '2024 - Present',
			startDate: new Date('2024-01-01'),
			description:
				'Developing high-performance web applications and AI-integrated solutions. Leading the frontend migration to Next.js.',
			skills: ['React', 'Node.js', 'AWS', 'System Design'],
			order: 1,
		},
		{
			type: 'work',
			title: 'Frontend Developer Intern',
			company: 'Creative Solutions',
			location: 'Remote',
			date: '2023 - 2024',
			startDate: new Date('2023-05-01'),
			endDate: new Date('2023-12-31'),
			description:
				'Contributed to the core design system and improved UI performance by 40%. Implemented accessible components.',
			skills: ['TypeScript', 'Tailwind CSS', 'Storybook'],
			order: 2,
		},
		{
			type: 'education',
			title: 'Bachelor of Computer Science',
			company: 'University of Technology',
			location: 'City, Country',
			date: '2020 - 2024',
			startDate: new Date('2020-09-01'),
			endDate: new Date('2024-05-01'),
			description:
				'Specialized in Artificial Intelligence and Software Engineering. Graduated with Honors.',
			skills: ['Algorithms', 'Data Structures', 'CS Fundamentals'],
			order: 3,
		},
	];

	// Delete existing and re-create to avoid duplicate issues
	await prisma.journeyEntry.deleteMany();
	for (const entry of journeyEntries) {
		await prisma.journeyEntry.create({ data: entry });
	}
	console.log(`✅ Journey: ${journeyEntries.length} entries seeded`);

	// ─── Certifications ─────────────────────────────────────────

	const certifications = [
		{
			title: 'AWS Certified Solutions Architect',
			issuer: 'Amazon Web Services',
			date: new Date('2024-01-15'),
			credentialUrl: 'https://aws.amazon.com',
			skills: ['Cloud Computing', 'AWS', 'System Design'],
		},
		{
			title: 'Meta Frontend Developer Certificate',
			issuer: 'Meta / Coursera',
			date: new Date('2023-08-20'),
			credentialUrl: 'https://coursera.org',
			skills: ['React', 'UI/UX', 'JavaScript'],
		},
		{
			title: 'TensorFlow Developer Certificate',
			issuer: 'Google',
			date: new Date('2023-05-10'),
			credentialUrl: 'https://tensorflow.org',
			skills: ['Machine Learning', 'Deep Learning', 'Python'],
		},
	];

	await prisma.certification.deleteMany();
	for (const cert of certifications) {
		await prisma.certification.create({ data: cert });
	}
	console.log(`✅ Certifications: ${certifications.length} seeded`);

	// ─── Blog Posts ─────────────────────────────────────────────

	const blogPosts = [
		{
			title: 'Building AnuragOS: A Deep Dive',
			slug: 'building-anuragos',
			summary: 'The journey of creating a terminal-based portfolio website from scratch.',
			content:
				'The journey of creating a terminal-based portfolio website from scratch. This post covers the architecture decisions, challenges faced, and lessons learned.',
			tags: ['Next.js', 'Design', 'Portfolio'],
			status: 'published',
			featured: true,
			readingTime: 5,
			publishedAt: new Date('2024-01-15'),
		},
		{
			title: 'The Future of AI Agents',
			slug: 'future-of-ai-agents',
			summary: 'How autonomous agents are reshaping the software landscape.',
			content:
				'How autonomous agents are reshaping the software development landscape. An exploration of current trends and future possibilities.',
			tags: ['AI', 'Agents', 'Future'],
			status: 'published',
			featured: false,
			readingTime: 8,
			publishedAt: new Date('2024-03-20'),
		},
	];

	for (const post of blogPosts) {
		await prisma.blogPost.upsert({
			where: { slug: post.slug },
			update: post,
			create: post,
		});
	}
	console.log(`✅ Blog posts: ${blogPosts.length} seeded`);

	console.log('\n🎉 Database seeded successfully!');
}

main()
	.catch(e => {
		console.error('❌ Seed failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
