# AnuragOS Backend

A TypeScript-based REST API server built on Fastify for a developer portfolio system.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3
- **Background Jobs**: BullMQ
- **Testing**: Vitest + fast-check (property-based testing)

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- AWS S3 account (or compatible storage)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Set up database**:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Access API documentation**:
   Open http://localhost:4000/api-docs

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── env.ts             # Environment validation
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   └── redis.ts           # Redis client
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── middleware/            # Fastify middleware
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── repositories/          # Database access
│   ├── utils/                 # Utility functions
│   ├── app.ts                 # Fastify app setup
│   └── server.ts              # Entry point
└── tests/                     # Test files
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/projects` - List published projects
- `GET /api/projects/:id` - Get project details
- `GET /api/journey` - Get journey timeline
- `GET /api/blog` - List published blog posts
- `GET /api/blog/:slug` - Get blog post by slug
- `POST /api/contact` - Submit contact form

### Admin Endpoints (require authentication)
- `POST /api/auth/login` - Admin login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/admin/projects` - Create project
- `PUT /api/admin/projects/:id` - Update project
- `DELETE /api/admin/projects/:id` - Delete project
- ... (more admin endpoints)

## Development

The project follows a layered architecture:

1. **Routes** - Handle HTTP requests/responses
2. **Services** - Business logic
3. **Repositories** - Database operations
4. **Middleware** - Authentication, validation, rate limiting

## Testing

Run tests with:
```bash
npm test
```

Property-based tests use fast-check to verify correctness properties across many random inputs.

## License

Private
