# AnuragOS - Developer Portfolio System

A full-stack developer portfolio with a unique terminal-style interface. Features an Express backend with PostgreSQL and a Next.js frontend with an OS-like experience.

## 🎯 Project Overview

**Backend**: RESTful API built with Express, Prisma ORM, PostgreSQL, Redis, and JWT authentication
**Frontend**: Terminal-style UI built with Next.js, featuring CLI commands and draggable windows

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  Terminal UI • File Explorer • Draggable Windows        │
└─────────────────────────────────────────────────────────┘
                          │
                    REST API (HTTP)
                          │
┌─────────────────────────────────────────────────────────┐
│                  Backend (Express)                      │
│  Auth • Projects • Journey • Blog • Contact • Media     │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
┌───────────────┐                  ┌────────────────┐
│  PostgreSQL   │                  │     Redis      │
│   Database    │                  │  Cache/Queue   │
└───────────────┘                  └────────────────┘
```

### 🛡️ Hybrid Data Strategy (Circuit Breaker)

The frontend implements an industry-grade **Circuit Breaker** pattern for maximum reliability:

1.  **Online Mode**: Fetches data from the backend API.
2.  **Failover**: If the backend is unreachable (3 consecutive failures), the system "opens the circuit".
3.  **Offline Mode**: Instantly serves optimized static data from local files (`client/src/data`) with **zero latency**.
4.  **Auto-Recovery**: Automatically attempts to reconnect to the backend every 60 seconds (half-open state).

This ensures the portfolio **never goes down**, even if the API server crashes or the user loses internet connection.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd personal-portfolio

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Set Up Backend

```bash
cd server

# Copy environment file
cp .env.example .env

# Edit .env with your values
# Required: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, Cloudinary credentials

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Start backend server
npm run dev
```

Backend will run on http://localhost:4000

### 3. Set Up Frontend

```bash
cd client

# Copy environment file
cp .env.local.example .env.local

# Start frontend server
npm run dev
```

Frontend will run on http://localhost:3000

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:4000/api/v1/docs
- **Default Admin**: username: `admin`, password: `admin123`

## 📁 Project Structure

```
.
├── server/                 # Backend (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Database seeding
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── lib/            # Database & Redis clients
│   │   ├── middleware/     # Auth, validation, etc.
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/
│   │   │   ├── projects/
│   │   │   └── contact/
│   │   ├── routes/         # API routes
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── types/          # TypeScript types
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Entry point
│   └── tests/              # Test files
│
├── client/                 # Frontend (Next.js)
│   ├── src/
│   │   ├── app/            # Next.js app directory
│   │   ├── components/
│   │   │   ├── core/       # Core UI components
│   │   │   ├── modules/    # Feature modules
│   │   │   └── ui/         # Reusable components
│   │   ├── lib/
│   │   │   ├── api.ts      # Backend API client
│   │   │   ├── commands.ts # CLI commands
│   │   │   └── data.ts     # File system data
│   │   └── store/          # State management
│   └── public/             # Static assets
│
└── .kiro/                  # Spec documents
    └── specs/
        └── anuragos-backend/
            ├── requirements.md
            ├── design.md
            └── tasks.md
```

## 🎮 Features

### Backend Features

- ✅ JWT authentication with refresh tokens
- ✅ Account lockout after failed attempts
- ✅ Projects CRUD with media uploads
- ✅ Journey timeline management
- ✅ Blog posts with draft/published workflow
- ✅ Contact form with HTML sanitization
- ✅ Prisma ORM with PostgreSQL
- ✅ Redis for caching and sessions
- ✅ Swagger API documentation
- 🚧 Audit logging
- 🚧 Content versioning
- ✅ Media management (Cloudinary)
- 🚧 Background jobs (BullMQ)
- 🚧 Rate limiting
- 🚧 Caching layer

### Frontend Features

- ✅ Terminal-style CLI interface
- ✅ File explorer navigation
- ✅ Draggable, resizable windows
- ✅ About module
- ✅ Projects showcase
- ✅ Journey timeline
- ✅ Blog listing
- ✅ Contact form
- ✅ Real-time API integration
- ✅ Dark theme with terminal aesthetics
- 🚧 AI Lab module
- 🚧 Admin dashboard
- ✅ Hybrid Data Layer (Circuit Breaker & Offline Support)

## 🔧 Development

### Backend Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
```

### Frontend Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 🔐 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/anuragos_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-long
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📚 API Documentation

Access the API documentation manifest at:
http://localhost:4000/api/v1/docs

### Public Endpoints

- `GET /api/v1/health` - Health check
- `GET /api/v1/profile` - Public profile
- `GET /api/v1/projects` - List published projects
- `GET /api/v1/projects/:id` - Get project details
- `GET /api/v1/journey` - Journey timeline
- `GET /api/v1/blog` - List blog posts
- `POST /api/v1/contact` - Submit contact form

### Admin Endpoints (require authentication)

- `POST /api/v1/auth/login` - Admin login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/admin/projects` - Create project
- `PUT /api/v1/admin/projects/:id` - Update project
- `PATCH /api/v1/admin/projects/:id/status` - Update project status
- `DELETE /api/v1/admin/projects/:id` - Delete project

## 🎨 CLI Commands

Type these commands in the terminal interface:

- `help` - Show available commands
- `ls` - List directory contents
- `about` - Open About module
- `projects` - Open Projects Hub
- `journey` - Open Journey timeline
- `blog` - Open Blog posts
- `contact` - Open Contact form
- `clear` - Clear terminal
- `exit` - End session

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests (when implemented)
cd client
npm test
```

## 🚀 Deployment

### Backend Deployment

1. Set up PostgreSQL and Redis instances
2. Configure environment variables
3. Run migrations: `npm run db:migrate`
4. Build: `npm run build`
5. Start: `npm start`

### Frontend Deployment

1. Configure `NEXT_PUBLIC_API_URL` to production backend
2. Build: `npm run build`
3. Deploy to Vercel, Netlify, or any Node.js hosting

## 🔒 Security

- JWT tokens with 15-minute expiry
- Refresh token rotation
- Account lockout after 3 failed attempts
- HTML sanitization for user input
- Rate limiting (to be implemented)
- CORS configuration
- Environment variable validation

## 📝 License

Private

## 👤 Author

Anurag Basuri

## 🙏 Acknowledgments

- Express for the backend framework
- Next.js for the frontend framework
- Prisma for the ORM
- Radix UI for accessible components
