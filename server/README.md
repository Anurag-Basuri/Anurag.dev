# Portfolio Backend API

A TypeScript REST API for a developer portfolio, built with **Express 5**, **Prisma ORM**, and **PostgreSQL**.

## Tech Stack

| Layer            | Technology                              |
| ---------------- | --------------------------------------- |
| **Runtime**      | Node.js + TypeScript                    |
| **Framework**    | Express 5                               |
| **Database**     | PostgreSQL (NeonDB) via Prisma ORM      |
| **Auth**         | Stateless JWT (access + refresh tokens) |
| **Validation**   | Zod                                     |
| **File Storage** | Cloudinary (images + documents/PDF)     |
| **Testing**      | Vitest                                  |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or NeonDB)
- Cloudinary account

## Setup

1. **Install dependencies**:

    ```bash
    npm install
    ```

2. **Configure environment** — create a `.env` file:

    ```env
    # App
    NODE_ENV=development
    PORT=4000

    # Database (NeonDB)
    DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

    # JWT (generate strong random strings, min 32 chars)
    JWT_SECRET=your-access-token-secret-min-32-chars
    JWT_REFRESH_SECRET=your-refresh-token-secret-min-32-chars
    JWT_ACCESS_EXPIRY=15m
    JWT_REFRESH_EXPIRY=7d

    # Admin (single admin, no DB model)
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=your-secure-password

    # CORS
    CORS_ORIGIN=http://localhost:3000

    # Cloudinary
    CLOUDINARY_CLOUD_NAME=your-cloud-name
    CLOUDINARY_API_KEY=your-api-key
    CLOUDINARY_API_SECRET=your-api-secret
    ```

    > All variables are validated at startup with Zod. The server will refuse to start if any are missing or invalid.

3. **Set up database**:

    ```bash
    npx prisma generate     # Generate Prisma client
    npx prisma migrate dev  # Run migrations
    ```

4. **Start development server**:

    ```bash
    npm run dev
    ```

5. **API docs**: Visit `GET /api/v1/docs` for a full endpoint manifest.

---

## Project Structure

```
server/src/
├── app.ts                      # Express app — middleware, route mounting, error handler
├── server.ts                   # Bootstrap — DB/Cloudinary check, startup banner, shutdown
│
├── config/
│   └── env.ts                  # Zod-validated environment variables
│
├── controllers/                # Request handlers (business logic)
│   ├── public.controller.ts    # All public-facing endpoints
│   ├── auth.controller.ts      # Login, refresh, logout, me
│   ├── profile.controller.ts   # Admin profile CRUD
│   ├── project.controller.ts   # Admin project CRUD
│   ├── journey.controller.ts   # Admin journey CRUD + documents
│   ├── achievement.controller.ts
│   ├── certification.controller.ts
│   ├── blog.controller.ts      # Admin blog CRUD + status
│   └── messages.controller.ts  # Admin message management
│
├── services/
│   └── auth.service.ts         # JWT generation/verification, login logic
│
├── routes/                     # Route definitions (thin — validation + middleware → controller)
│   ├── public.routes.ts        # Public GET endpoints + contact POST
│   ├── auth.routes.ts          # /auth/login, /auth/refresh, etc.
│   ├── admin.routes.ts         # Aggregator — applies authMiddleware to all sub-routes
│   ├── profile.routes.ts       # /profile
│   ├── project.routes.ts       # /projects, /projects/:id
│   ├── journey.routes.ts       # /journey, /journey/:id, /journey/reorder, /journey/:id/documents
│   ├── achievement.routes.ts   # /achievements, /achievements/:id
│   ├── certification.routes.ts # /certifications, /certifications/:id
│   ├── blog.routes.ts          # /blog, /blog/:id, /blog/:id/status
│   ├── messages.routes.ts      # /messages, /messages/:id
│   └── docs.routes.ts          # GET /docs — self-documenting API manifest
│
├── middleware/
│   ├── auth.middleware.ts       # JWT Bearer token verification
│   ├── validate.middleware.ts   # Zod schema validation (body, params, query)
│   ├── rate-limit.middleware.ts # In-memory rate limiter
│   ├── cache.middleware.ts      # Cache-Control + ETag for public endpoints
│   ├── cors.middleware.ts       # CORS configuration
│   └── multer.middleware.ts     # File upload handling (Cloudinary)
│
├── schemas/
│   └── zod-schemas.ts          # All Zod schemas — base + derived (create/update/status)
│
├── lib/
│   ├── prisma.ts               # Prisma client singleton + connection helpers
│   ├── cloudinary.ts           # Cloudinary client + upload/delete utilities
│   └── audit.ts                # Audit logging helper
│
└── utils/
    ├── ApiError.ts             # Centralized error class with factory methods
    ├── ApiResponse.ts          # Standardized response envelope
    ├── asyncHandler.ts         # Async route wrapper (catches thrown errors)
   └── types.ts                # Typed request helpers (IdRequest)
```

---

## Architecture

The server follows a layered architecture with clear separation of concerns:

```
Request → Route → [Middleware] → Controller → Service/Prisma → Response
                                     ↓
                               ApiError (thrown)
                                     ↓
                          Global Error Handler → JSON response
```

| Layer           | Responsibility                                                         |
| --------------- | ---------------------------------------------------------------------- |
| **Routes**      | Define endpoints, apply validation/middleware, delegate to controllers |
| **Controllers** | Business logic — query DB, enforce rules, return via `ApiResponse`     |
| **Services**    | Reusable logic (auth/JWT handling)                                     |
| **Middleware**  | Cross-cutting concerns: auth, validation, rate limiting, caching       |
| **Schemas**     | Single source of truth for all Zod validation schemas                  |
| **Utils**       | `ApiError`, `ApiResponse`, `asyncHandler` — shared across all layers   |

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Public Endpoints

| Method | Path              | Description                            |
| ------ | ----------------- | -------------------------------------- |
| `GET`  | `/health`         | Health check (env, uptime)             |
| `GET`  | `/profile`        | Get public profile                     |
| `GET`  | `/projects`       | List published/completed projects      |
| `GET`  | `/projects/:id`   | Get project by id                      |
| `GET`  | `/journey`        | List journey entries with achievements |
| `GET`  | `/achievements`   | List all achievements                  |
| `GET`  | `/certifications` | List all certifications                |
| `GET`  | `/blog`           | List published blog posts (summary)    |
| `GET`  | `/blog/:id`       | Get full blog post by id               |
| `POST` | `/contact`        | Submit contact message (rate-limited)  |
| `GET`  | `/docs`           | API documentation manifest             |

> Public GET endpoints have `Cache-Control: public, max-age=300` and auto-generated `ETag` headers.

### Auth Endpoints

| Method | Path            | Description                                 |
| ------ | --------------- | ------------------------------------------- |
| `POST` | `/auth/login`   | Login with username/password → tokens       |
| `POST` | `/auth/refresh` | Rotate refresh token → new token pair       |
| `POST` | `/auth/logout`  | Logout (stateless — client discards tokens) |
| `GET`  | `/auth/me`      | Get current admin info (🔒 requires auth)   |

### Admin Endpoints (🔒 all require `Authorization: Bearer <token>`)

All admin routes are mounted under `/api/v1/admin/`.

| Method   | Path                                    | Description                 |
| -------- | --------------------------------------- | --------------------------- |
| `GET`    | `/admin/profile`                        | Get admin profile           |
| `PUT`    | `/admin/profile`                        | Update profile              |
| `GET`    | `/admin/profile/social-links`           | List social links           |
| `POST`   | `/admin/profile/social-links`           | Create social link          |
| `PUT`    | `/admin/profile/social-links/:id`       | Update social link          |
| `DELETE` | `/admin/profile/social-links/:id`       | Delete social link          |
| `GET`    | `/admin/projects`                       | List all projects           |
| `POST`   | `/admin/projects`                       | Create project              |
| `PUT`    | `/admin/projects/:id`                   | Update project              |
| `PATCH`  | `/admin/projects/:id/status`            | Update project status       |
| `POST`   | `/admin/projects/:id/thumbnail`         | Upload project thumbnail    |
| `POST`   | `/admin/projects/:id/images`            | Append project images       |
| `PUT`    | `/admin/projects/:id/images`            | Replace project images      |
| `DELETE` | `/admin/projects/:id/images`            | Delete project images       |
| `DELETE` | `/admin/projects/:id`                   | Delete project              |
| `GET`    | `/admin/journey`                        | List journey entries        |
| `POST`   | `/admin/journey`                        | Create journey entry        |
| `PUT`    | `/admin/journey/:id`                    | Update journey entry        |
| `PATCH`  | `/admin/journey/reorder`                | Reorder entries             |
| `GET`    | `/admin/journey/:id/documents`          | List journey documents      |
| `POST`   | `/admin/journey/:id/documents`          | Create journey document     |
| `PUT`    | `/admin/journey/documents/:id`          | Update journey document     |
| `DELETE` | `/admin/journey/documents/:id`          | Delete journey document     |
| `DELETE` | `/admin/journey/:id`                    | Delete journey entry        |
| `GET`    | `/admin/achievements`                   | List achievements           |
| `POST`   | `/admin/achievements`                   | Create achievement          |
| `PUT`    | `/admin/achievements/:id`               | Update achievement          |
| `PATCH`  | `/admin/achievements/reorder`           | Reorder achievements        |
| `POST`   | `/admin/achievements/:id/proof`         | Upload achievement proof    |
| `DELETE` | `/admin/achievements/:id/proof`         | Delete achievement proof    |
| `DELETE` | `/admin/achievements/:id`               | Delete achievement          |
| `GET`    | `/admin/certifications`                 | List certifications         |
| `POST`   | `/admin/certifications`                 | Create certification        |
| `PUT`    | `/admin/certifications/:id`             | Update certification        |
| `POST`   | `/admin/certifications/:id/certificate` | Upload certification file   |
| `DELETE` | `/admin/certifications/:id/certificate` | Delete certification file   |
| `DELETE` | `/admin/certifications/:id`             | Delete certification        |
| `GET`    | `/admin/blog`                           | List all blog posts         |
| `POST`   | `/admin/blog`                           | Create blog post            |
| `PUT`    | `/admin/blog/:id`                       | Update blog post            |
| `PATCH`  | `/admin/blog/:id/status`                | Update blog post status     |
| `POST`   | `/admin/blog/:id/cover`                 | Upload blog cover image     |
| `POST`   | `/admin/blog/:id/images`                | Append blog images          |
| `PUT`    | `/admin/blog/:id/images`                | Replace blog images         |
| `DELETE` | `/admin/blog/:id/images`                | Delete blog images          |
| `DELETE` | `/admin/blog/:id`                       | Delete blog post            |
| `GET`    | `/admin/messages`                       | List messages (paginated)   |
| `GET`    | `/admin/messages/:id`                   | Get message (marks as read) |
| `DELETE` | `/admin/messages/:id`                   | Delete message              |

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  },
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": 404,
    "message": "Project not found",
    "details": { ... }
  },
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

### 204 No Content

Delete operations return `204` with no body.

---

## Authentication

The API uses **stateless JWT** authentication with no database-backed sessions.

1. **Login**: `POST /api/v1/auth/login` with `{ username, password }` → returns `{ accessToken, refreshToken, expiresIn }`
2. **Use token**: Include `Authorization: Bearer <accessToken>` on all admin requests
3. **Refresh**: When access token expires, `POST /api/v1/auth/refresh` with `{ refreshToken }` → new token pair
4. **Logout**: Client-side only — discard both tokens

Admin credentials are stored in environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). There is intentionally no `Admin` database model — this is a single-admin portfolio system.

---

## Error Handling

Errors flow through a centralized pipeline:

1. **Controllers** throw `ApiError` instances with factory methods:

    ```ts
    throw ApiError.NotFound('Project'); // 404: "Project not found"
    throw ApiError.Conflict('Resource already exists'); // 409
    throw ApiError.Unauthorized(); // 401
    throw ApiError.BadRequest('Invalid', { field: 'id' }); // 400 + details
    ```

2. **`asyncHandler`** wraps all controller functions and forwards thrown errors to Express's error handler.

3. **Global error handler** in `app.ts`:
    - `ApiError` instances → structured JSON with status code, source, and request context
    - Unknown errors → `500 Internal Server Error` (stack trace only in development)
    - Logs: method, URL, IP, source, stack trace (dev mode)

4. **Invalid routes** return `404` with the attempted method/URL and a hint to check `/api/v1/docs`.

---

## Middleware

| Middleware              | Purpose                                                               |
| ----------------------- | --------------------------------------------------------------------- |
| `auth.middleware`       | Verifies JWT Bearer token, attaches `req.admin`                       |
| `validate.middleware`   | Validates `req.body` / `req.params` / `req.query` against Zod schemas |
| `rate-limit.middleware` | In-memory rate limiter (configurable per-route)                       |
| `cache.middleware`      | Sets `Cache-Control` + generates `ETag` headers                       |
| `cors.middleware`       | CORS configuration from `CORS_ORIGIN` env var                         |
| `multer.middleware`     | File upload handling with Cloudinary integration                      |

---

## Available Scripts

| Script                | Description                                      |
| --------------------- | ------------------------------------------------ |
| `npm run dev`         | Start dev server with hot reload (nodemon + tsx) |
| `npm run build`       | Compile TypeScript to `dist/`                    |
| `npm start`           | Run production build                             |
| `npm test`            | Run tests (Vitest)                               |
| `npm run test:watch`  | Run tests in watch mode                          |
| `npm run db:generate` | Generate Prisma client                           |
| `npm run db:migrate`  | Run database migrations                          |
| `npm run db:push`     | Push schema changes (no migration file)          |
| `npm run db:reset`    | Reset database + run all migrations              |
| `npm run db:seed`     | Seed database                                    |
| `npm run db:studio`   | Open Prisma Studio GUI                           |

---

## Environment Variables

| Variable                | Required | Default                 | Description                                 |
| ----------------------- | -------- | ----------------------- | ------------------------------------------- |
| `NODE_ENV`              | No       | `development`           | `development` / `production` / `test`       |
| `PORT`                  | No       | `4000`                  | Server port                                 |
| `DATABASE_URL`          | Yes      | —                       | PostgreSQL connection string                |
| `JWT_SECRET`            | Yes      | —                       | Access token signing secret (min 32 chars)  |
| `JWT_REFRESH_SECRET`    | Yes      | —                       | Refresh token signing secret (min 32 chars) |
| `JWT_ACCESS_EXPIRY`     | No       | `15m`                   | Access token TTL                            |
| `JWT_REFRESH_EXPIRY`    | No       | `7d`                    | Refresh token TTL                           |
| `ADMIN_USERNAME`        | Yes      | —                       | Admin login username                        |
| `ADMIN_PASSWORD`        | Yes      | —                       | Admin login password                        |
| `CORS_ORIGIN`           | No       | `http://localhost:3000` | Allowed CORS origin                         |
| `CLOUDINARY_CLOUD_NAME` | Yes      | —                       | Cloudinary cloud name                       |
| `CLOUDINARY_API_KEY`    | Yes      | —                       | Cloudinary API key                          |
| `CLOUDINARY_API_SECRET` | Yes      | —                       | Cloudinary API secret                       |

---

## License

Private
