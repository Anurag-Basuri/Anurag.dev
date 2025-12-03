import React from 'react';

export default function HomeIntro() {
	return (
		<section className="relative z-10">
			<div className="px-6 py-8 md:py-10">
				<h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
					Hello, World — I’m Anurag.
				</h1>
				<p className="mt-3 text-sm md:text-base text-muted-foreground max-w-3xl">
					It started with “Hello, World!” and grew into a passion for building intelligent
					systems that make an impact.
				</p>
				<p className="mt-3 text-sm md:text-base text-muted-foreground max-w-4xl">
					I’m Anurag Basuri, a CSE undergrad who loves building at the intersection of
					full‑stack engineering and machine intelligence. I enjoy designing clean,
					scalable user experiences with MERN & Next.js, while diving deep into AI/ML,
					LLMs, and NLP to understand how machines learn, reason, and adapt.
				</p>

				<div className="mt-6 grid gap-3">
					<div className="text-sm md:text-base">
						<span className="font-medium">I’m currently:</span>
						<ul className="mt-2 grid gap-2 text-muted-foreground">
							<li>
								🚀 Building a Next.js project focused on intelligence + user
								experience
							</li>
							<li>
								🤖 Learning Advanced Machine Learning and NLP to strengthen my AI
								foundation
							</li>
							<li>
								🔢 Staying consistent on LeetCode (450+ problems) to sharpen
								problem‑solving
							</li>
							<li>
								💼 Exploring internship/freelancing opportunities to create impact
								through real engineering work
							</li>
							<li>
								🌱 Staying curious about automations and the future of intelligent
								software
							</li>
						</ul>
					</div>
				</div>

				<p className="mt-6 text-sm md:text-base text-muted-foreground max-w-4xl">
					My projects reflect what I believe in — technology that solves real problems.
					From AI‑based evaluation systems to multi‑portal platforms and scalable apps, I
					love building things that genuinely help people.
				</p>

				<p className="mt-4 text-sm md:text-base text-muted-foreground">
					If you’re working in AI, full‑stack development, startups, or anything that
					pushes boundaries, let’s connect and build something meaningful — and
					intelligent — together.
				</p>
			</div>
		</section>
	);
}
