# Anurag.dev — Frontend Client

A premium personal portfolio and brand platform built with Next.js, featuring a scrollable single-page layout, animated sections, an AI Agent chat widget, and a personal branding system.

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

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # Set NEXT_PUBLIC_API_URL
npm run dev                        # → http://localhost:3000
```

## Features

- 🎨 **Personal Branding** — Photo hero, typing tagline, availability badges
- 🤖 **AI Agent Chat Widget** — Floating chat interface with autonomous LLM responses
- 🛠️ **Smart Skill Icons** — 3-layer fallback (exact → category → generic) with 100+ tech
- 📊 **Coding Profiles** — LeetCode, Codeforces, CodeChef, GFG integrations
- 📝 **Blog System** — Posts with tags, content preview, published dates
- 🎓 **Journey Timeline** — Experience & education with chronological entries
- 🏆 **Achievements & Certifications** — Awards, competitions, credentials
- ⚡ **Scroll Navigation** — Section-based scroll spy with sidebar TOC
- 📱 **Fully Responsive** — Mobile, tablet, and desktop optimized
- 🎭 **Multi-Theme** — CSS custom property-based theme switching
- 🔒 **Admin Dashboard** — Full CRUD for all content modules
- 🛡️ **Circuit Breaker** — Offline fallback with auto-recovery

## 🤖 AI Agent Widget

The floating chat widget (`modules/agent/`) connects to the backend's LangChain-powered Agent engine.

### Architecture

| Component | Role |
|-----------|------|
| `AgentChat.tsx` | Main chat window with message scroll and input |
| `AgentToggler.tsx` | Floating action button to open/close the widget |
| `ChatBubble.tsx` | Message renderer with Markdown support |
| `ToolCallingIndicator.tsx` | Animated loader when the Agent is executing tools |
| `useAgentSession.ts` | Core hook — manages state, API calls, error isolation |

### Error Handling (Zero-Crash)

The `useAgentSession` hook implements **complete error isolation**:

```
API call fails → Caught in catch block
  → Reads error.message from ApiClientError
  → Displays error as a red chat bubble
  → Error NEVER propagates to React tree
  → Global error.tsx page is NEVER triggered by the Agent
```

This is critical because:
- The backend always returns HTTP 200 (even on LLM failures)
- But network errors, CORS issues, or timeouts could still throw
- The hook catches these at the boundary and converts them to chat messages

### Autonomous Navigation

The Agent can navigate the user by embedding `[NAVIGATE:/path]` tokens in its responses. The `useAgentSession` hook:
1. Detects the token in the response
2. Executes `router.push(path)` for client-side navigation
3. Strips the token from the visible message

## 🛡️ Circuit Breaker

The API client (`api/`) implements a resilience pattern:

1. **Closed (Online)** — Normal API requests to the backend
2. **Open (Offline)** — After 3 consecutive failures, serves static fallback JSON from `api/fallback/`
3. **Half-Open (Recovery)** — Background health check every 60 seconds; resumes live API on success

The portfolio **never goes down**, even if the backend crashes.

## Project Structure

```
client/src/
├── app/                       # Next.js App Router
│   ├── portfolio/             # Main portfolio page
│   ├── admin/                 # Admin dashboard
│   ├── resume/                # Resume viewer
│   ├── readme/                # README viewer
│   ├── error.tsx              # Global error boundary (terminal theme)
│   └── not-found.tsx          # 404 page
├── modules/                   # Feature modules
│   ├── profile/               # Hero + bio + skills
│   ├── projects/              # Project showcase
│   ├── blog/                  # Blog posts
│   ├── experience/            # Work timeline
│   ├── education/             # Education timeline
│   ├── achievements/          # Awards & competitions
│   ├── certifications/        # Credentials
│   ├── coding-stats/          # CP platform profiles
│   ├── contact/               # Contact form
│   └── agent/                 # AI Chat Widget
│       ├── components/        # Chat UI elements
│       ├── hooks/             # useAgentSession (error isolation)
│       └── types/             # Message interfaces
├── layout/                    # App shell
│   ├── Sidebar.tsx            # Left navigation
│   ├── TopBar.tsx             # Top bar
│   ├── ScrollContainer.tsx    # Scroll-based section renderer
│   └── TableOfContents.tsx    # Right-side TOC
├── api/                       # API client + circuit breaker
│   ├── services/              # admin.ts, public.ts
│   └── fallback/              # Offline static data
├── lib/                       # Core utilities
│   ├── skill-icons.ts         # 3-layer icon mapping (100+ tech)
│   ├── routes.ts              # Route config
│   └── utils.ts               # cn() and helpers
├── animations/                # Framer Motion presets
├── boot/                      # Splash animation
├── hooks/                     # Custom React hooks
├── theme/                     # Theme provider
└── ui/                        # Reusable components
```

## Skill Icons System (`lib/skill-icons.ts`)

A 3-layer icon resolution system:

1. **Exact/Alias Match** — Direct mapping for 100+ technologies
2. **Smart Category Fallback** — Keywords like "AI", "cloud", "data" → semantic Lucide icons
3. **Generic Hashed Fallback** — Unknown skills get a deterministic icon from a pool

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm start            # Start production
npm run lint         # ESLint
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend API URL |
| `NEXT_PUBLIC_API_TIMEOUT_MS` | `5000` | Base API timeout (ms). Mobile requests automatically use at least 10s. |

Production note: never point `NEXT_PUBLIC_API_URL` to `localhost` for deployed builds. Use your public backend origin.

## Browser Support

Chrome, Edge, Firefox, Safari (latest versions).

## Author

**Anurag Basuri**

## License

Private
