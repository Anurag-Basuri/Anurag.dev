# AnuragOS Frontend

A premium personal portfolio and brand platform built with Next.js, featuring a scrollable single-page layout, animated sections, and a personal branding system.

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16 (React 19) |
| **Styling** | Tailwind CSS v4 |
| **State** | Jotai |
| **Animations** | Framer Motion |
| **Icons** | Lucide React, React Icons (Si/Fa6) |
| **UI Primitives** | Radix UI (Sheet, Tooltip, Scroll Area) |
| **Theming** | CSS custom properties with multi-theme support |

## Features

- 🎨 **Personal Branding** — Photo-centric hero with typing tagline, availability badges, and freelance status
- 🛠️ **Smart Skill Icons** — Auto-categorizing skill-to-icon mapping with 3-layer fallback (exact → category → generic)
- 📸 **Image Lightbox** — Click profile photo for a full-screen view
- 🌐 **Social Tooltips** — Hover-reveal tooltips on social platform icons
- 🗺️ **Language Popup** — Hover the Languages stat card to see all spoken languages
- 📊 **Coding Profiles** — LeetCode, Codeforces, CodeChef, GFG stats integration
- 📝 **Blog System** — Published blog posts with tags and content preview
- 🎓 **Journey Timeline** — Experience, education, and milestones in chronological order
- 🏆 **Achievements & Certifications** — Categorized awards and credentials
- 📄 **Resume Page** — Dedicated resume viewer route
- ⚡ **Smooth Scroll Navigation** — Section-based scroll spy with sidebar table-of-contents
- 📱 **Fully Responsive** — Optimized for mobile, tablet, and desktop
- 🎭 **Multi-Theme** — Theme switching with CSS custom properties

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on port 4000

### Installation

```bash
npm install
cp .env.local.example .env.local   # Edit if backend is on a different port
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
client/src/
├── animations/                # Framer Motion variant presets
│   └── motion.ts              # fadeInUp, stagger, fadeIn, etc.
├── api/                       # Backend API client
│   ├── schema.ts              # Zod schemas & TypeScript types
│   ├── services/              # admin.ts, public.ts
│   └── fallback/              # Offline fallback data
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home (redirects to /portfolio)
│   ├── globals.css            # Design tokens & themes
│   ├── portfolio/             # Main portfolio page
│   ├── admin/                 # Admin dashboard
│   ├── resume/                # Resume viewer
│   ├── readme/                # README page
│   ├── sitemap.ts             # Dynamic sitemap generation
│   ├── error.tsx              # Error boundary page
│   └── not-found.tsx          # 404 page
├── boot/                      # Boot/splash animation
├── hooks/                     # Custom React hooks
│   └── useJourney.ts          # Journey data hook
├── layout/                    # App shell components
│   ├── AppProviders.tsx       # Theme + state providers
│   ├── TopBar.tsx             # Top navigation bar
│   ├── Sidebar.tsx            # Left sidebar navigation
│   ├── SidebarProfile.tsx     # Sidebar profile card
│   ├── ResizableSidebar.tsx   # Drag-to-resize sidebar
│   ├── ScrollContainer.tsx    # Scroll-based section renderer
│   ├── ScrollSection.tsx      # Individual scroll section
│   ├── ScrollIndicator.tsx    # Scroll progress indicator
│   ├── TableOfContents.tsx    # Right-side TOC navigation
│   ├── useScrollSpy.ts        # Active section detection
│   └── useScrollNavigation.ts # Scroll-to-section utility
├── lib/                       # Core utilities
│   ├── skill-icons.ts         # 3-layer skill → icon mapping
│   ├── theme.ts               # Theme definitions
│   ├── routes.ts              # Route configuration
│   ├── sections.ts            # Section registry
│   ├── siteConfig.ts          # Site metadata
│   ├── moduleRegistry.tsx     # Dynamic module loader
│   └── utils.ts               # cn() and helpers
├── modules/                   # Feature modules (each has index.tsx)
│   ├── profile/               # Personal branding hero + bio + skills
│   ├── projects/              # Project showcase
│   ├── blog/                  # Blog posts
│   ├── experience/            # Work experience timeline
│   ├── education/             # Education timeline
│   ├── achievements/          # Awards & competitions
│   ├── certifications/        # Professional certifications
│   ├── coding-stats/          # Competitive programming profiles
│   └── contact/               # Contact form
├── theme/                     # Theme provider & switching logic
└── ui/                        # Reusable UI components
    ├── SectionHeader.tsx       # Consistent section headings
    ├── TerminalFrame.tsx       # Terminal-style card wrapper
    ├── WindowControls.tsx      # macOS-style window buttons
    ├── ErrorBoundary.tsx       # Error boundary component
    ├── FileIcon.tsx            # File type icon resolver
    ├── UrlThumbnail.tsx        # URL preview thumbnail
    ├── Loader.tsx              # Loading spinner
    ├── Portal.tsx              # React portal helper
    ├── button.tsx              # Button component
    ├── scroll-area.tsx         # Radix scroll area
    ├── sheet.tsx               # Radix sheet/drawer
    └── tooltip.tsx             # Radix tooltip
```

## Modules

### Profile Module (`modules/profile/`)

Personal brand landing page featuring:
- Large profile photo with click-to-view lightbox
- Name + typing tagline animation beside the photo
- Role/header line, availability & freelance badges
- Social links with hover tooltips
- Stats bar (Location, Experience, Languages with hover popup)
- Separated Bio and Technical Arsenal (Skills) sections
- Smart skill icons with brand-colored hover effects

### Projects Module (`modules/projects/`)

Project showcase with tech stack tags, GitHub/live links, and star/fork counts.

### Blog Module (`modules/blog/`)

Published blog posts with tags, content preview, and publication dates.

### Experience & Education (`modules/experience/`, `modules/education/`)

Timeline views of work history and educational background with categorized entries.

### Achievements & Certifications (`modules/achievements/`, `modules/certifications/`)

Awards, competitions, and professional certifications.

### Coding Stats (`modules/coding-stats/`)

Competitive programming profile stats from LeetCode, Codeforces, CodeChef, GFG, etc.

### Contact Module (`modules/contact/`)

Contact form with validation, error handling, and rate limiting.

## Skill Icons System (`lib/skill-icons.ts`)

A robust 3-layer icon mapping system:

1. **Exact/Alias Match** — Direct mapping for 100+ technologies (React, Python, Docker, etc.)
2. **Smart Category Fallback** — Keywords like "AI", "cloud", "data" map to semantic Lucide icons
3. **Generic Hashed Fallback** — Unknown skills get a deterministic icon from a pool

Supports AI/ML tools (LangChain, RAG, VectorDB, MCP, MLOps), cloud platforms, databases, and more.

## API Integration

Connects to the backend at `NEXT_PUBLIC_API_URL` (default: `http://localhost:4000`).

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/profile` | Public profile |
| `GET` | `/api/v1/projects` | Published projects |
| `GET` | `/api/v1/journey` | Journey timeline |
| `GET` | `/api/v1/blog` | Blog posts |
| `GET` | `/api/v1/achievements` | Achievements |
| `GET` | `/api/v1/certifications` | Certifications |
| `POST` | `/api/v1/contact` | Submit contact form |

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend API URL |

## Browser Support

Chrome, Edge, Firefox, Safari (latest versions).

## License

Private
