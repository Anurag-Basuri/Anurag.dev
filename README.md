# AnuragOS — Enterprise Personal Portfolio & Autonomous AI Agent

AnuragOS is a bleeding-edge, full-stack personal brand platform. It transcends traditional static portfolios by integrating a **fully autonomous LangChain LLM Agent** that serves as a 24/7 personal assistant for visitors. Built on an Express REST API backend with PostgreSQL + Prisma and a highly animated Next.js frontend, this project demonstrates scalability, resilience, and advanced AI integration.

---

## 🏗️ Master System Architecture

AnuragOS relies on a strictly decoupled architecture, meaning the frontend, backend, database, and AI inference engines can all crash, restart, and scale independently without tearing each other down.

```mermaid
flowchart TB
    subgraph Frontend [Next.js Client Domain]
        subgraph UI [React Layout & Logic]
            Port["Portfolio Views"]
            AgentW["Agent Widget Floating UI"]
            Admin["Admin Dashboard"]
        end
        
        subgraph Hooks [State & API Hooks]
            SessionHook["useAgentSession.ts"]
            Api["Axios Singletons"]
        end
        
        CircuitBreaker{"Offline Circuit Breaker"}
    end

    subgraph Backend [Node.js / Express API Domain]
        Router["Express Router /api/v1/"]
        StandardBusiness["Standard CRUD Services"]
        
        subgraph LangChain_Agent [Enterprise LangChain Engine]
            AgentLoop[".bindTools() ReAct Loop"]
            Memory["Session Message History"]
            RouterAgent{"Multi-Model Router"}
            
            subgraph Models
                Gemini["Primary: Gemini 2.0 Flash"]
                HF["Fallback: Qwen 2.5 72B"]
            end
            
            subgraph MCP_Tools [Model Context Protocols]
                GitHubTool["GitHub Live Activity"]
                LeetCodeTool["LeetCode Contest Stats"]
                PortfolioTool["Prisma Vector-style Search"]
                ContactTool["Direct DB Lead Insertion"]
            end
        end
    end

    subgraph Persistence [Data Layer]
        Postgres[("PostgreSQL Database")]
        Redis[("Redis Cache")]
    end

    %% Connections
    Port <--> Api
    AgentW <--> SessionHook
    SessionHook <--> Api
    Api <--> CircuitBreaker
    CircuitBreaker <--> Router
    
    Router <--> StandardBusiness
    Router <--> AgentLoop
    
    StandardBusiness <--> Postgres
    StandardBusiness <--> Redis
    
    AgentLoop <--> Memory
    AgentLoop --> RouterAgent
    RouterAgent --> Gemini
    RouterAgent -.-> |429 Error| HF
    
    AgentLoop <--> MCP_Tools
    MCP_Tools <--> Postgres
    MCP_Tools -.-> |External APIs| GitHubTool
```

---

## 🧠 Deep Dive: The AI Agent Architecture

Instead of basic chatbot text-in/text-out completions, the AnuragOS agent operates using the **Model Context Protocol (MCP)** and **LangChain's ReAct (Reasoning and Acting) framework.**

### How a Chat Query Works (Step-by-Step)
1. **User Input:** A visitor types *"What React projects have you built? And how many LeetCode questions have you solved?"*
2. **Context Injection (RAG):** The backend grabs Anurag's static profile (Bio, primary Skills, Job Status) directly from Postgres and silently injects it into the `SystemPersona`.
3. **The LLM Loop Begins:** The model reads the user's prompt and decides it needs external information. It generates a rigid JSON payload requesting two tools: `search_projects("React")` and `get_leetcode_stats()`.
4. **Tool Execution:** The Express backend intercepts these requests. 
   - It performs a semantic-style search on Postgres for "React" projects. 
   - It simultaneously pings a LeetCode proxy for live competitive programming data.
5. **Final Generation:** The backend feeds the raw tool outputs back into the LLM. The LLM then structures a human-readable, highly polite Markdown message comparing the results, and sends it back to the React UI. Everything happens in under ~2 seconds.

### The Fail-Proof Dual-Model Fallback
To bypass free-tier rate limits, the system operates on a dual-engine core (`src/modules/agent/core/llm.factory.ts`):
- **Google Gemini 2.0 Flash** acts as the primary brain. It's wildly fast and native at tool-calling.
- If Gemini errors out (e.g. `429 Quota Exceeded`), LangChain's native `.withFallbacks()` automatically catches the error before the user notices, rerouting the entire payload and conversation history seamlessly to **Hugging Face's Serverless API (Qwen 2.5 72B-Instruct)**.

### Action Capabilities (Write Operations)
The agent is not strictly read-only. Using the `submit_contact_lead` tool, the LLM is instructed to proactively ask for a visitor's name and email if they express interest in hiring. The LLM then writes the lead directly into the PostgreSQL Database, skipping the manual contact form entirely.

---

## 🛡️ Frontend Hybrid Strategy (Circuit Breaker)

To guarantee 100% uptime regardless of backend maintenance windows, the frontend wraps API calls in a **Circuit Breaker state machine**:
1. **Online (Closed):** The Next.js app queries the Express API normally.
2. **Tripped (Open):** After 3 consecutive HTTP timeouts or 500 errors, the frontend "trips" its breaker.
3. **Offline Mode:** The application instantly and seamlessly falls back to reading static hard-coded JSON files (`client/src/api/fallback/`) containing last-known-good profile states.
4. **Recovery (Half-Open):** A background chron-job pings the backend `health` route every 60 seconds. Once healthy, the breaker closes and live API requests resume.

The visitor never sees a white error screen.

---

## 💻 Technical Stack

### Frontend Hierarchy
- **Framework:** Next.js (App Router) + React 19.
- **Styling & Motion:** Tailwind CSS v4 alongside Framer Motion for scroll-linked animations, bouncing tool-calling indicators, and parallax effects.
- **State isolation:** Heavily relies on Custom Hooks (e.g., `useAgentSession`) to detach UI components from Axios API handlers and `localStorage` persistence.
- **Rich Media:** Integrates `react-markdown` to safely render the agent's complex syntax (lists, links, code blocks).

### Backend Hierarchy
- **Framework:** Express.js + strict TypeScript compiler settings (`skipLibCheck`).
- **Data ORM:** Prisma Client interacting with PostgreSQL (supporting schemas for Profiles, Projects, Experiences, Education, Blog Posts, and Contact Messages).
- **AI Brain:** Initialized exclusively via the official `@langchain/core` & `@langchain/openai` SDKs to guarantee perfect Tool JSON stringification.
- **Rate Limiting:** `express-rate-limit` prevents spam on both generic API paths and strict bot loops.

---

## ⚙️ Environment Variables Explained in Detail

Correctly filling out your environments is required to enable all fallback arrays and storage hooks.

### Backend (`server/.env`)

**Core System Configuration:**
- `NODE_ENV`: Operations mode (`development` or `production`). Dictates error stack verbosity.
- `PORT`: Backend listener port (defaults to 4000).
- `DATABASE_URL`: Connection string to PostgreSQL (`postgresql://user:password@node:5432/db`).
- `REDIS_HOST` & `REDIS_PORT`: (Optional) Connects to an external Redis instance like Upstash for robust route caching.

**Authentication & Cryptography:**
- `JWT_SECRET`: The cryptographic symmetric key used to sign `access_tokens`. Make this a random 64-character string.
- `JWT_REFRESH_SECRET`: The cryptographic key used to sign long-lived `refresh_tokens` for the admin panel.

**Media & Storage Layer (Cloudinary):**
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Required to serve optimized images. When a user creates a project from the admin dashboard, images are routed through Multer directly to this Cloudinary bucket, saving bandwidth on your NodeJS server.

**AI Ecosystem (The Agent Brain):**
- `AI_PROVIDER`: Force-selects the primary provider (`gemini` or `huggingface`). Leave as `gemini` for the intended dual-fallback behavior.
- `GEMINI_API_KEY`: The API key mapped to your Google Generative AI account. Powers `gemini-2.0-flash`.
- `HF_TOKEN`: The Access Token pointing to your Hugging Face Hub account. MUST have read/Inference permissions enabled natively on Hugging Face to process the fallback Qwen 72B requests.
- `GITHUB_TOKEN`: A generic fine-grained Personal Access Token (Read-Only). Passed into the GitHub API (`github.tool.ts`) so the LLM doesn't hit unauthenticated 60 Request/Hour rate limits from standard IPs.

### Frontend (`client/.env.local`)

- `NEXT_PUBLIC_API_URL`: The fully qualified URL pointing to your backend (e.g. `http://localhost:4000` locally, or `https://api.portfolio.com` in production). Injected into the primary Axios Singleton (`apiClient.ts`).

---

## 🚀 Quick Start & Development Setup

### 1. Database & Backend Configuration

```bash
cd server
npm install

# 1. Setup Environment
cp .env.example .env

# 2. Database Type Generation & Migration
npm run db:generate   # Generates Prisma TS definitions Based on your schema
npm run db:migrate    # Pushes table structures (Profile, Blog, Contacts) to Postgres
npm run db:seed       # Injects initial mock data and the Admin Account

# 3. Development Mode
npm run dev           # Ignites the Express runtime on http://localhost:4000 with Hot Reloading
```

### 2. Frontend Application

```bash
cd client
npm install

# Setup Environment
cp .env.local.example .env.local

# Build the web app
npm run dev           # Opens the Next.js React Router on http://localhost:3000
```

**Default Admin Credentials**: Check `server/prisma/seed.ts` (usually `admin` / `admin123`). Log in via `http://localhost:3000/admin`.

---

## 📦 File System Master Structure

```
personal_portfolio/
├── server/                        # Node.js + Express + Prisma Ecosystem
│   ├── prisma/                    # Schema models & migrations
│   └── src/
│       ├── controllers/           # Standard HTTP logic (Parsing bodies)
│       ├── services/              # Business logic (DB calls, external requests)
│       ├── routes/                # Express routing trees
│       ├── schemas/               # Zod strict validations
│       └── modules/
│           └── agent/             # [STANDALONE] The Enterprise Chatbot
│               ├── agent.service.ts   # Main executor while loop mapped to history
│               ├── agent.controller.ts# Rate-limited endpoint handler
│               ├── core/              # Memory isolation & Dual-Prov LLM factory
│               ├── tools/             # Native LangChain action tools
│               └── rag/               # Context retrieval functions
│
└── client/                        # React + Next.js App Router
    └── src/
        ├── app/                   # Public Portfolio, Login logic, Admin Dashboard
        ├── components/
        │   └── modules/
        │       ├── agent/         # [STANDALONE] AI Widget UI Library
        │       │   ├── components/  # Floating Toggler, Chat Scroll Window, Bubbles
        │       │   ├── hooks/       # useAgentSession isolating network states
        │       │   └── types/       # Message interfaces
        │       ├── profile/       # Classic Portfolio Sections
        │       ├── projects/
        │       └── blog/
        ├── layout/                # Global Shell (Sidebar, Fixed backgrounds)
        ├── api/                   # HTTP Singletons wrapping Circuit Breakers
        └── boot/                  # Preloaders and Welcome branding
```

---

## 🛡️ Production Security Measures

- **LangChain Memory Isolation:** Conversation history is stored natively in a dictionary mapped to randomized browser `sessionIds`. External sessions cannot overlap, meaning users cannot poison other clients' LLM generation context.
- **Form Injection Defense:** Tools like `submit_contact_lead` programmatically run inputs through advanced `sanitize-html` modules *before* executing the Prisma insert.
- **DDoS/Spam Protection:** Strict `express-rate-limit` windows are placed dynamically. Standard JSON routes allow more throughput, while the Agent LLM loop restricts IPs to extremely limited calls per minute to block prompt-engineering bill-spam.
- **Admin JWT Refresh Cycle:** The Control dashboard relies on rotating Refresh JWTs instead of long-lived LocalStorage tokens, preventing session hijack extraction.

---

### Author
Designed and Architected by **Anurag Basuri**  
*The ecosystem seamlessly merges rigid REST paradigms alongside dynamic LangChain AI reasoning, resulting in a virtually indestructible personal brand platform.*
