import type { FileSystemItem } from '@/types/file-system';
export type { FileSystemItem } from '@/types/file-system';
import { FileSystemBuilder as fs } from '@/lib/filesystem-builder';

export const INITIAL_FILE_SYSTEM: FileSystemItem[] = [
	// Root README - Project overview
	{
		name: 'README.md',
		type: 'file',
		id: 'root/readme',
		content: `# Welcome to Anurag's Portfolio

I am a Full Stack Engineer passionate about building elegant solutions.

## Quick Start
- Click files in the sidebar to explore
- Use terminal for commands (type \`help\`)
- Navigate with keyboard shortcuts

## Structure
- **bio/** - About me, my journey, and certifications
- **work/** - Projects, AI experiments, and coding stats
- **connect/** - Contact info and blog

## Tech Stack
Next.js 15 • React 18 • TypeScript • Tailwind CSS • Framer Motion • Three.js

---
*Built with ❤️ by Anurag Basuri*`,
	},

	// Bio folder - Personal information (.md files)
	fs.folder('bio', 'bio', [
		fs.app('about', { name: 'about.md' }),
		fs.app('journey', { name: 'journey.md' }),
		fs.app('certifications', { name: 'certifications.md' }),
	]),

	// Work folder - Projects and experiments (.app files)
	fs.folder('work', 'work', [
		fs.app('projects', { name: 'projects.app' }),
		fs.app('ailab', { name: 'ailab.app' }),
		fs.app('profiles', { name: 'profiles.app' }),
	]),

	// Connect folder - Communication (.md files)
	fs.folder('connect', 'connect', [
		fs.app('contact', { name: 'contact.md' }),
		fs.app('blog', { name: 'blog.md' }),
	]),
];
