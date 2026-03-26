# AnuragOS — Backend Server

Express.js REST API powering the AnuragOS portfolio platform. Manages authentication, content CRUD, media uploads, and the autonomous AI Agent engine.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Express.js + TypeScript |
| **ORM** | Prisma (PostgreSQL) |
| **Cache** | Redis |
| **Validation** | Zod |
| **Auth** | JWT (access + refresh rotation), bcrypt |
| **Media** | Cloudinary (via Multer) |
| **AI Primary** | HuggingFace (Qwen 2.5 72B-Instruct) via `@langchain/openai` |
| **AI Fallback** | Google Gemini 2.5 Flash via `@langchain/google-genai` |

## Quick Start

```bash
npm install
cp .env.example .env           # Fill in all variables
npm run db:generate             # Generate Prisma types
npm run db:migrate              # Push schema to PostgreSQL
npm run db:seed                 # Seed data + admin account
npm run dev                     # → http://localhost:4000
```

## 🧠 AI Agent Architecture

The Agent is a fully autonomous LangChain-powered system in `src/modules/agent/`. It uses a **manual ReAct loop** with dual-LLM failover and persistent session memory.

### Key Components

| File | Role |
|------|------|
| `agent.service.ts` | Main ReAct loop — invokes LLMs, executes tools, manages sticky fallback |
| `agent.controller.ts` | HTTP handler — zero-crash error recovery, always returns HTTP 200 |
| `core/llm.factory.ts` | Singleton dual-LLM initializer (HuggingFace primary, Gemini fallback) |
| `core/agent.logger.ts` | Structured observability with categories: `SYSTEM`, `LLM`, `TOOL`, `MEMORY`, `CTRL` |
| `core/memory.service.ts` | Persistent session memory via Prisma (PostgreSQL) |
| `core/prompts.ts` | System persona and behavioral instructions |
| `tools/*.ts` | MCP tool implementations (GitHub, LeetCode, Portfolio, Contact) |
| `rag/context.builder.ts` | RAG context retrieval from database |

### Dual-LLM Sticky Fallback

```
Request starts → Try HuggingFace (Primary)
  ✅ Success → Continue
  ❌ Fail → Set STICKY flag, try Gemini (Fallback)
    ✅ Success → Continue
    ❌ Fail → Return graceful fallback reply

Subsequent loops in same request:
  STICKY flag set? → Skip Primary → Go directly to Fallback
```

- **30-second timeout** per LLM invocation (`Promise.race`)
- Once primary fails, it's **disabled for the rest of that request**
- Both LLMs are initialized once on server startup (singleton pattern)

### MCP Tools

| Tool | Description | Source |
|------|-------------|--------|
| `get_github_activity` | GitHub profile + recent 5 events | `api.github.com` |
| `read_github_readme` | Raw README from any public repo | `api.github.com` |
| `get_leetcode_stats` | Solving stats, ranking, difficulty breakdown | `alfa-leetcode-api.onrender.com` |
| `search_projects` | Portfolio project search by keyword | PostgreSQL |
| `submit_contact_lead` | Insert contact lead into database | PostgreSQL |

### Structured Logging

Every operation is logged with timestamps, categories, and execution timing:

```
[2026-03-26 07:30:00] [INFO]  [Agent:SYSTEM] ━━━ New Request ━━━ | {"llmMode":"dual","primary":"HuggingFace"}
[2026-03-26 07:30:01] [INFO]  [Agent:LLM]    🧠 Invoking HuggingFace (Qwen2.5-72B-Instruct)
[2026-03-26 07:30:05] [INFO]  [Agent:LLM]    ✅ LLM responded | {"durationMs":4200,"hasToolCalls":true}
[2026-03-26 07:30:05] [INFO]  [Agent:TOOL]   ⚡ Executing: get_github_activity
[2026-03-26 07:30:06] [INFO]  [Agent:TOOL]   ✅ get_github_activity completed | {"durationMs":875}
[2026-03-26 07:30:08] [INFO]  [Agent:SYSTEM] ━━━ Request Complete ━━━ | {"totalDurationMs":8200}
```

## 🛡️ Error Handling

### Agent Error Philosophy: Zero-Crash

The Agent controller **never** returns HTTP 500. All errors are caught and converted to friendly chat replies:

| Error Type | Category | User Sees |
|-----------|----------|-----------|
| LLM rate limit (429) | `RATE_LIMIT` | "I'm experiencing high demand..." |
| LLM timeout (30s) | `TIMEOUT` | Automatic fallback to secondary LLM |
| Network failure | `NETWORK` | "I ran into a hiccup..." |
| Both LLMs down | `INTERNAL` | "Could you try rephrasing?" |
| Tool failure | N/A | LLM reads the error and responds naturally |

### Standard API Error Handling

- All routes use `asyncHandler` wrapper for automatic error propagation
- `ApiError` class with static factory methods (`NotFound`, `Unauthorized`, `ServiceUnavailable`)
- `ApiResponse` class for consistent success response formatting
- Global error middleware returns structured JSON errors with appropriate status codes
- Zod validation errors are caught and returned as 400 Bad Request

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

### AI Agent

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/chat` | Send message to AI Agent (15/min rate limit) |
| `POST` | `/api/v1/chat/reset` | Clear Agent session memory |

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Admin login |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Logout |
| `GET` | `/api/v1/auth/me` | Current admin info |

### Admin (JWT Required)

| Method | Endpoint | Description |
|---|---|---|
| `GET/PUT` | `/admin/profile` | Profile CRUD |
| `CRUD` | `/admin/projects/*` | Projects + media |
| `CRUD` | `/admin/journey/*` | Journey + documents |
| `CRUD` | `/admin/blog/*` | Blog + cover/images |
| `CRUD` | `/admin/achievements/*` | Achievements + proof |
| `CRUD` | `/admin/certifications/*` | Certifications + files |
| `GET/DELETE` | `/admin/messages/*` | Contact messages |
| `GET/DELETE` | `/admin/agent-sessions/*` | AI Agent session logs |

### Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/docs` | Full API endpoint manifest |
| `GET` | `/api/v1/docs/readme` | Project README content |
| `GET` | `/api/v1/docs/agent` | Live AI Agent architecture status |

## Environment Variables

```env
# Core
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/anuragos_db
REDIS_HOST=localhost
REDIS_PORT=6379

# Auth
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Media
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Agent
HF_TOKEN=your-huggingface-access-token          # Primary LLM
GEMINI_API_KEY=your-gemini-api-key               # Fallback LLM
GITHUB_TOKEN=your-github-pat                     # Elevated API limits
```

## Scripts

```bash
npm run dev          # Dev server with hot reload
npm run build        # Production build
npm start            # Start production
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:studio    # Prisma Studio GUI
npm run db:seed      # Seed database
```

## Author

**Anurag Basuri**

## License

Private
