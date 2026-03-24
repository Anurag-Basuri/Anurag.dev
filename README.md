# AnuragOS — Developer Portfolio Platform

A full-stack personal portfolio and brand platform. Express backend with PostgreSQL + Prisma, Next.js frontend with scroll-based navigation, animated sections, and a premium personal branding system.

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   Frontend (Next.js 16)                     │
│  Personal Brand • Scroll Nav • Animated Modules • Admin    │
└────────────────────────────────────────────────────────────┘
                          │
                    REST API (HTTP)
                          │
┌────────────────────────────────────────────────────────────┐
│                   Backend (Express)                         │
│  Auth • Profile • Projects • Journey • Blog • Contact      │
│  Achievements • Certifications • Coding Stats • Media      │
└────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
   ┌──────────────┐              ┌────────────────┐
   │  PostgreSQL  │              │     Redis      │
   │   Database   │              │  Cache/Queue   │
   └──────────────┘              └────────────────┘
```

### Hybrid Data Strategy (Circuit Breaker)

The frontend implements a **Circuit Breaker** pattern:

1. **Online** — Fetches from the backend API
2. **Failover** — After 3 consecutive failures, the circuit opens
3. **Offline** — Serves static fallback data from `client/src/api/fallback/` with zero latency
4. **Recovery** — Retries the backend every 60 seconds (half-open state)

The portfolio **never goes down**, even if the API crashes.

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Setup

```bash
# Backend
cd server
npm install
cp .env.example .env           # Edit with your DB/Redis/JWT/Cloudinary values
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev                    # → http://localhost:4000

# Frontend
cd ../client
npm install
cp .env.local.example .env.local
npm run dev                    # → http://localhost:3000
```

**Default Admin**: `admin` / `admin123`

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS v4, Framer Motion, Jotai, Radix UI |
| **Backend** | Express, TypeScript, Prisma ORM, Zod validation |
| **Database** | PostgreSQL 14+ |
| **Cache** | Redis 6+ |
| **Auth** | JWT (access + refresh tokens), bcrypt |
| **Media** | Cloudinary (image/file uploads) |
| **Icons** | Lucide React, React Icons (Si/Fa6) |

## Project Structure

```
personal_portfolio/
├── server/                        # Backend (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Database seeding
│   └── src/
│       ├── controllers/           # Route handlers
│       │   ├── profile.controller.ts
│       │   ├── project.controller.ts
│       │   ├── journey.controller.ts
│       │   ├── blog.controller.ts
│       │   ├── achievement.controller.ts
│       │   ├── certification.controller.ts
│       │   ├── coding-stats.controller.ts
│       │   ├── auth.controller.ts
│       │   ├── messages.controller.ts
│       │   ├── docs.controller.ts
│       │   └── public.controller.ts
│       ├── routes/                # API route definitions
│       ├── schemas/               # Zod validation schemas
│       ├── services/              # Business logic
│       ├── middleware/            # Auth, validation, rate limiting
│       ├── config/               # Environment & app config
│       ├── lib/                  # DB & Redis clients
│       ├── utils/                # ApiError, ApiResponse helpers
│       ├── app.ts                # Express app setup
│       └── server.ts             # Entry point
│
└── client/                        # Frontend (Next.js)
    └── src/
        ├── app/                   # Next.js App Router
        │   ├── portfolio/         # Main portfolio page
        │   ├── admin/             # Admin dashboard
        │   ├── resume/            # Resume viewer
        │   └── readme/            # README viewer
        ├── modules/               # Feature modules
        │   ├── profile/           # Personal brand hero + bio + skills
        │   ├── projects/          # Project showcase
        │   ├── blog/              # Blog posts
        │   ├── experience/        # Work timeline
        │   ├── education/         # Education timeline
        │   ├── achievements/      # Awards & competitions
        │   ├── certifications/    # Professional certs
        │   ├── coding-stats/      # CP platform profiles
        │   └── contact/           # Contact form
        ├── layout/                # App shell (sidebar, topbar, scroll)
        ├── lib/                   # Utilities, skill-icons, theme, routes
        ├── ui/                    # Reusable components
        ├── animations/            # Framer Motion presets
        ├── api/                   # API client + fallback data
        ├── hooks/                 # Custom React hooks
        ├── theme/                 # Theme provider
        └── boot/                  # Boot/splash animation
```

## Features

### Frontend

- ✅ **Personal Branding** — Large photo hero, typing tagline, availability & freelance badges
- ✅ **Smart Skill Icons** — 3-layer fallback icon system (exact → category → generic)
- ✅ **Image Lightbox** — Click-to-view full profile photo
- ✅ **Social Tooltips** — Hover-reveal platform labels on social icons
- ✅ **Language Popup** — Hover Languages stat to see spoken languages
- ✅ **Scroll Navigation** — Section-based scroll spy with sidebar TOC
- ✅ **Projects Showcase** — Tech stack tags, GitHub/live links, star/fork counts
- ✅ **Blog System** — Posts with tags, content preview, published dates
- ✅ **Journey Timelines** — Experience & education with categorized entries
- ✅ **Achievements & Certifications** — Awards, competitions, credentials
- ✅ **Coding Stats** — LeetCode, Codeforces, CodeChef, GFG profiles
- ✅ **Contact Form** — Validation, sanitization, error feedback
- ✅ **Multi-Theme** — CSS custom property-based theme switching
- ✅ **Admin Dashboard** — Full CRUD for all content modules
- ✅ **Responsive Design** — Mobile, tablet, and desktop optimized
- ✅ **Circuit Breaker** — Offline fallback with auto-recovery

### Backend

- ✅ JWT auth with refresh token rotation
- ✅ Account lockout after failed attempts
- ✅ Profile CRUD with social links management
- ✅ Projects CRUD with media uploads (Cloudinary)
- ✅ Journey timeline with document attachments
- ✅ Blog CRUD with draft/published/archived workflow
- ✅ Achievements & Certifications CRUD
- ✅ Contact form with HTML sanitization
- ✅ Coding platform stats proxy
- ✅ Zod request validation
- ✅ Redis caching
- ✅ Swagger/OpenAPI documentation
- ✅ Link preview API

## API Endpoints

### Public

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Health check |
| `GET` | `/api/v1/profile` | Public profile |
| `GET` | `/api/v1/projects` | Published projects |
| `GET` | `/api/v1/projects/:id` | Project details |
| `GET` | `/api/v1/journey` | Journey timeline |
| `GET` | `/api/v1/blog` | Published blog posts |
| `GET` | `/api/v1/blog/:id` | Blog post details |
| `GET` | `/api/v1/achievements` | Achievements |
| `GET` | `/api/v1/certifications` | Certifications |
| `POST` | `/api/v1/contact` | Submit contact form |
| `GET` | `/api/v1/docs/readme` | Project README |

### Admin (JWT Required)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Login |
| `POST` | `/api/v1/auth/refresh` | Refresh token |
| `POST` | `/api/v1/auth/logout` | Logout |
| `PUT` | `/api/v1/admin/profile` | Update profile |
| `POST/PUT/DELETE` | `/api/v1/admin/projects/:id` | Project CRUD |
| `POST/PUT/DELETE` | `/api/v1/admin/journey/:id` | Journey CRUD |
| `POST/PUT/DELETE` | `/api/v1/admin/blog/:id` | Blog CRUD |
| `POST/PUT/DELETE` | `/api/v1/admin/achievements/:id` | Achievement CRUD |
| `POST/PUT/DELETE` | `/api/v1/admin/certifications/:id` | Certification CRUD |

## Development Scripts

### Backend (`server/`)

```bash
npm run dev          # Dev server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
```

### Frontend (`client/`)

```bash
npm run dev          # Dev server
npm run build        # Production build
npm start            # Start production
npm run lint         # ESLint
```

## Environment Variables

### Backend (`server/.env`)

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/anuragos_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (`client/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Deployment

### Backend

1. Provision PostgreSQL + Redis
2. Set environment variables
3. `npm run db:migrate && npm run build && npm start`

### Frontend

1. Set `NEXT_PUBLIC_API_URL` to production backend
2. `npm run build`
3. Deploy to Vercel, Netlify, or any Node.js hosting

## Security

- JWT tokens (15-min access, rotated refresh)
- Account lockout after 3 failed login attempts
- HTML sanitization on all user input
- Zod validation on all request bodies
- CORS configuration
- Environment variable validation

## Author

**Anurag Basuri**

## License

Private
