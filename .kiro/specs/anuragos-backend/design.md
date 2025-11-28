# Design Document

## Overview

The AnuragOS Backend is a TypeScript-based REST API server built on Fastify, providing secure content management and public data access for a developer portfolio system. The backend implements a modular architecture with distinct layers for authentication, content management (projects, journey timeline, blog posts), media handling, contact form processing, and administrative features including audit logging, content versioning, and background job processing.

The system serves two primary user types: public users accessing read-only portfolio data, and authenticated admin users managing content through protected endpoints. The architecture emphasizes security through JWT-based authentication, input validation, rate limiting, and comprehensive audit trails.

## Architecture

### High-Level Architecture

The backend follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────────────┐
│                    API Layer (Fastify)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Public     │  │    Admin     │  │   Auth       │  │
│  │   Routes     │  │    Routes    │  │   Routes     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  Middleware Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Rate Limiter │  │     Auth     │  │  Validation  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Projects │ │ Journey  │ │   Blog   │ │  Media   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Contact  │ │  Audit   │ │ Version  │ │   Jobs   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                 Repository Layer                         │
│         (Database Access & Cache Management)             │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│              Data Storage Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │  S3/Cloud    │  │
│  │   Database   │  │    Cache     │  │   Storage    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Runtime**: Node.js with TypeScript
- **Web Framework**: Fastify (chosen for performance and TypeScript support)
- **Database**: PostgreSQL (relational data with ACID guarantees)
- **Cache**: Redis (session storage, rate limiting, response caching)
- **ORM**: Prisma (type-safe database access)
- **Validation**: Zod (runtime type validation)
- **Authentication**: JWT with refresh token rotation
- **File Storage**: AWS S3 or compatible cloud storage
- **Background Jobs**: BullMQ (Redis-backed job queue)
- **Documentation**: Swagger/OpenAPI via @fastify/swagger

### Design Rationale

**Fastify over Express**: Fastify provides better TypeScript support, built-in schema validation, and superior performance through its plugin architecture.

**PostgreSQL**: Relational database chosen for complex queries, ACID compliance for audit logs, and strong consistency requirements for content versioning.

**Redis**: Used for multiple purposes - session storage (refresh tokens), rate limiting counters, and response caching. Single Redis instance simplifies deployment while providing high performance.

**Prisma ORM**: Type-safe database access with automatic migration generation and excellent TypeScript integration reduces runtime errors.

**BullMQ**: Reliable job queue with retry logic, priority queues, and job scheduling capabilities for background tasks like GitHub sync and thumbnail generation.

## Components and Interfaces

### Authentication Module

**Responsibilities**:
- User credential verification
- JWT access token generation (short-lived, 15 minutes)
- Refresh token generation and rotation
- Account lockout after failed attempts
- Token validation middleware

**Key Interfaces**:

```typescript
interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthTokens>
  refreshToken(refreshToken: string): Promise<AuthTokens>
  logout(userId: string, refreshToken: string): Promise<void>
  validateAccessToken(token: string): Promise<TokenPayload>
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

interface LoginCredentials {
  username: string
  password: string
}
```

### Projects Module

**Responsibilities**:
- CRUD operations for project entries
- Status management (draft/published)
- Version snapshot creation on updates
- Soft deletion with audit trail
- Public API with caching

**Key Interfaces**:

```typescript
interface ProjectService {
  create(data: CreateProjectDto): Promise<Project>
  update(id: string, data: UpdateProjectDto): Promise<Project>
  publish(id: string): Promise<Project>
  delete(id: string): Promise<void>
  getPublished(filters: ProjectFilters): Promise<Project[]>
  getById(id: string): Promise<Project>
}

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  githubUrl?: string
  liveUrl?: string
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
```

### Journey Module

**Responsibilities**:
- Timeline entry management
- Chronological ordering
- Category validation
- Public API with sorting

**Key Interfaces**:

```typescript
interface JourneyService {
  create(data: CreateJourneyDto): Promise<JourneyEntry>
  update(id: string, data: UpdateJourneyDto): Promise<JourneyEntry>
  reorder(entries: ReorderDto[]): Promise<void>
  getTimeline(): Promise<JourneyEntry[]>
}

interface JourneyEntry {
  id: string
  year: number
  title: string
  description: string
  category: JourneyCategory
  order: number
  createdAt: Date
  updatedAt: Date
}

type JourneyCategory = 'education' | 'work' | 'project' | 'achievement'
```

### Blog Module

**Responsibilities**:
- Blog post CRUD operations
- Slug uniqueness validation
- Draft/published workflow
- Tag management
- Search and filtering
- Pagination

**Key Interfaces**:

```typescript
interface BlogService {
  create(data: CreateBlogDto): Promise<BlogPost>
  update(id: string, data: UpdateBlogDto): Promise<BlogPost>
  publish(id: string): Promise<BlogPost>
  delete(id: string): Promise<void>
  search(filters: BlogFilters): Promise<PaginatedResult<BlogPost>>
  getBySlug(slug: string): Promise<BlogPost>
}

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  tags: string[]
  status: 'draft' | 'published'
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Media Module

**Responsibilities**:
- Presigned URL generation for uploads
- File metadata storage
- MIME type validation
- Cloud storage integration
- Thumbnail generation job enqueueing
- File deletion from storage

**Key Interfaces**:

```typescript
interface MediaService {
  generateUploadUrl(filename: string, mimeType: string): Promise<UploadUrl>
  saveMetadata(data: MediaMetadata): Promise<Media>
  delete(id: string): Promise<void>
  getById(id: string): Promise<Media>
}

interface UploadUrl {
  uploadUrl: string
  fileKey: string
  expiresIn: number
}

interface Media {
  id: string
  filename: string
  fileKey: string
  size: number
  mimeType: string
  storageUrl: string
  thumbnailUrl?: string
  createdAt: Date
}
```

### Contact Module

**Responsibilities**:
- Form submission validation
- HTML sanitization
- Rate limiting per IP
- Email notification
- Admin message retrieval

**Key Interfaces**:

```typescript
interface ContactService {
  submit(data: ContactFormDto, ipAddress: string): Promise<ContactMessage>
  getAll(pagination: PaginationDto): Promise<PaginatedResult<ContactMessage>>
  markAsRead(id: string): Promise<void>
}

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  ipAddress: string
  isRead: boolean
  createdAt: Date
}
```

### Audit Module

**Responsibilities**:
- Immutable log creation for all admin actions
- Paginated log retrieval with filtering
- Change tracking (before/after snapshots)
- Rollback event logging

**Key Interfaces**:

```typescript
interface AuditService {
  log(entry: CreateAuditLogDto): Promise<AuditLog>
  getLogs(filters: AuditFilters): Promise<PaginatedResult<AuditLog>>
}

interface AuditLog {
  id: string
  userId: string
  action: 'create' | 'update' | 'delete' | 'rollback'
  resourceType: string
  resourceId: string
  changes: Record<string, any>
  timestamp: Date
}
```

### Version Module

**Responsibilities**:
- Automatic snapshot creation on content updates
- Version history retrieval
- Content rollback with preservation
- Version metadata management

**Key Interfaces**:

```typescript
interface VersionService {
  createSnapshot(resourceType: string, resourceId: string, data: any): Promise<Version>
  getHistory(resourceType: string, resourceId: string): Promise<Version[]>
  rollback(versionId: string): Promise<void>
}

interface Version {
  id: string
  resourceType: string
  resourceId: string
  versionNumber: number
  data: Record<string, any>
  changeSummary: string
  createdAt: Date
  createdBy: string
}
```

### Background Jobs Module

**Responsibilities**:
- Job enqueueing and scheduling
- GitHub statistics synchronization
- Thumbnail generation
- Retry logic with exponential backoff
- Job status tracking

**Key Interfaces**:

```typescript
interface JobService {
  enqueueGithubSync(projectId: string): Promise<Job>
  enqueueThumbnailGeneration(mediaId: string): Promise<Job>
  getJobStatus(jobId: string): Promise<JobStatus>
}

interface Job {
  id: string
  type: 'github-sync' | 'thumbnail-generation'
  payload: Record<string, any>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  attempts: number
  completedAt?: Date
  error?: string
}
```

## Data Models

### Database Schema

```prisma
model User {
  id            String         @id @default(uuid())
  username      String         @unique
  passwordHash  String
  email         String         @unique
  isLocked      Boolean        @default(false)
  lockedUntil   DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  refreshTokens RefreshToken[]
  auditLogs     AuditLog[]
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
  isRevoked Boolean  @default(false)
}

model Project {
  id          String    @id @default(uuid())
  title       String
  description String
  techStack   String[]
  githubUrl   String?
  liveUrl     String?
  status      String    @default("draft")
  stars       Int?
  forks       Int?
  commits     Int?
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  versions    Version[]
}

model JourneyEntry {
  id          String   @id @default(uuid())
  year        Int
  title       String
  description String
  category    String
  order       Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model BlogPost {
  id          String    @id @default(uuid())
  title       String
  slug        String    @unique
  content     String
  tags        String[]
  status      String    @default("draft")
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  versions    Version[]
}

model Media {
  id           String   @id @default(uuid())
  filename     String
  fileKey      String   @unique
  size         Int
  mimeType     String
  storageUrl   String
  thumbnailUrl String?
  createdAt    DateTime @default(now())
}

model ContactMessage {
  id        String   @id @default(uuid())
  name      String
  email     String
  subject   String
  message   String
  ipAddress String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model AuditLog {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  action       String
  resourceType String
  resourceId   String
  changes      Json
  timestamp    DateTime @default(now())
}

model Version {
  id            String   @id @default(uuid())
  resourceType  String
  resourceId    String
  versionNumber Int
  data          Json
  changeSummary String
  createdBy     String
  createdAt     DateTime @default(now())
  project       Project? @relation(fields: [resourceId], references: [id])
  blogPost      BlogPost? @relation(fields: [resourceId], references: [id])
}

model Job {
  id          String    @id @default(uuid())
  type        String
  payload     Json
  status      String    @default("pending")
  attempts    Int       @default(0)
  error       String?
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Redis Data Structures

**Rate Limiting**:
- Key: `ratelimit:{ip}:{endpoint}`
- Type: String (counter)
- TTL: Based on rate limit window

**Response Caching**:
- Key: `cache:public:{endpoint}:{params}`
- Type: String (JSON)
- TTL: Content-type specific (projects: 5min, journey: 10min, blog: 5min)

**Contact Form Rate Limiting**:
- Key: `contact:ratelimit:{ip}`
- Type: String (counter)
- TTL: 5 minutes

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Authentication Properties

Property 1: Valid credentials generate token pair
*For any* valid admin credentials, calling login should return both a valid JWT access token and a valid refresh token
**Validates: Requirements 1.1**

Property 2: Refresh token generates new access token
*For any* valid refresh token, calling the refresh endpoint should return a new valid access token without requiring credentials
**Validates: Requirements 1.2**

Property 3: Refresh token rotation invalidates previous token
*For any* refresh token, after using it to get a new token pair, attempting to use the old refresh token should fail with an invalid token error
**Validates: Requirements 1.3**

Property 4: Logout invalidates all refresh tokens
*For any* authenticated user, after logout, all refresh tokens associated with that user should be invalid and unusable
**Validates: Requirements 1.4**

### Project Management Properties

Property 5: Project creation persists all fields
*For any* valid project data, creating a project and then retrieving it should return all fields (title, description, techStack, githubUrl, liveUrl, status) with matching values
**Validates: Requirements 2.1**

Property 6: Project updates create version snapshots
*For any* existing project, updating it should increase the version count by exactly 1
**Validates: Requirements 2.2**

Property 7: Publishing makes projects publicly visible
*For any* draft project, after publishing, the project should have status "published" and appear in public API results
**Validates: Requirements 2.3**

Property 8: Deletion soft-deletes projects
*For any* project, after deletion, the project record should still exist in the database with a non-null deletedAt timestamp
**Validates: Requirements 2.4**

Property 9: Public API returns only published projects
*For any* set of projects with mixed statuses, the public projects endpoint should return only those with status "published"
**Validates: Requirements 2.5**

### Journey Timeline Properties

Property 10: Journey entry creation persists all fields
*For any* valid journey entry data, creating an entry and retrieving it should return all fields (year, title, description, category, order) with matching values
**Validates: Requirements 3.1**

Property 11: Reordering preserves all entries
*For any* set of journey entries, after reordering, all entries should still exist and have their order fields updated according to the reorder operation
**Validates: Requirements 3.2**

Property 12: Timeline returns sorted entries
*For any* set of journey entries, the public timeline endpoint should return entries sorted first by year (ascending) then by order (ascending)
**Validates: Requirements 3.3**

Property 13: Invalid categories are rejected
*For any* journey entry with a category not in the predefined set (education, work, project, achievement), creation or update should fail with a validation error
**Validates: Requirements 3.4**

### Media Management Properties

Property 14: Upload request generates valid presigned URL
*For any* valid filename and MIME type, requesting an upload URL should return a presigned URL with a valid structure and future expiration time
**Validates: Requirements 4.1**

Property 15: Media metadata persists all fields
*For any* valid media metadata, saving it and retrieving it should return all fields (filename, fileKey, size, mimeType, storageUrl) with matching values
**Validates: Requirements 4.2**

Property 16: Media deletion removes storage and metadata
*For any* existing media file, after deletion, both the cloud storage file and database metadata record should be removed
**Validates: Requirements 4.3**

Property 17: Invalid MIME types are rejected
*For any* MIME type not in the allowed list of image and document formats, upload requests should fail with a validation error
**Validates: Requirements 4.4**

Property 18: Image uploads enqueue thumbnail jobs
*For any* media upload with an image MIME type, a background job of type "thumbnail-generation" should be created
**Validates: Requirements 4.5**

### Contact Form Properties

Property 19: Invalid contact forms are rejected
*For any* contact form submission with missing or invalid fields (name, email, subject, message), the submission should fail with a validation error
**Validates: Requirements 5.1**

Property 20: Valid submissions are stored
*For any* valid contact form submission, after submission, a contact message record should exist in the database with matching field values
**Validates: Requirements 5.2**

Property 21: Contact messages are sorted by date
*For any* set of contact messages, the admin endpoint should return messages sorted by createdAt in descending order (newest first)
**Validates: Requirements 5.4**

Property 22: Malicious content is sanitized
*For any* contact message containing HTML or script tags, the stored message should have those tags removed or escaped
**Validates: Requirements 5.5**

### Audit Logging Properties

Property 23: Admin actions create audit logs
*For any* admin create, update, or delete action, an audit log entry should be created with userId, action, resourceType, resourceId, changes, and timestamp
**Validates: Requirements 6.1**

Property 24: Audit log filtering works correctly
*For any* set of audit logs, filtering by date range, user, or action type should return only logs matching all specified criteria
**Validates: Requirements 6.2**

Property 25: Audit logs are immutable
*For any* existing audit log, attempts to modify or delete it should fail
**Validates: Requirements 6.3**

Property 26: Rollback creates audit log
*For any* content rollback operation, an audit log entry with action "rollback" should be created referencing the restored version
**Validates: Requirements 6.4**

### Content Versioning Properties

Property 27: Content updates create versions
*For any* content update (project or blog post), a version snapshot should be created with the previous state before the update is applied
**Validates: Requirements 7.1**

Property 28: Version history is complete
*For any* content item, requesting version history should return all versions created for that item in chronological order
**Validates: Requirements 7.2**

Property 29: Rollback restores exact previous state
*For any* content version, rolling back to that version should result in the content matching the version's data exactly
**Validates: Requirements 7.3**

Property 30: Rollback preserves current state
*For any* rollback operation, the current state should be saved as a new version before the rollback is applied
**Validates: Requirements 7.4**

### Background Jobs Properties

Property 31: GitHub sync creates job
*For any* project, triggering a GitHub sync should create a job with type "github-sync" and status "pending"
**Validates: Requirements 8.1**

Property 32: GitHub sync updates project stats
*For any* project with a GitHub URL, after a successful GitHub sync job, the project should have updated values for stars, forks, and commits
**Validates: Requirements 8.2**

Property 33: Failed jobs schedule retries
*For any* background job that fails, the job should have its attempts count incremented and be rescheduled with exponential backoff
**Validates: Requirements 8.3**

Property 34: Completed jobs update status
*For any* background job that completes successfully, the job status should be "completed" and completedAt should be set to a valid timestamp
**Validates: Requirements 8.4**

### Security Properties

Property 35: Rate limiting blocks excessive requests
*For any* IP address and endpoint, after exceeding the rate limit threshold, subsequent requests should be rejected with a 429 status code
**Validates: Requirements 9.1**

Property 36: Invalid inputs are rejected
*For any* API endpoint, submitting data that doesn't match the Zod schema should result in a validation error response
**Validates: Requirements 9.2**

Property 37: Sensitive data is redacted in logs
*For any* log entry, fields containing passwords, tokens, or personal information should be redacted or masked
**Validates: Requirements 9.3**

Property 38: Errors return generic messages externally
*For any* error condition, the API response should contain a generic error message while internal logs contain detailed error information
**Validates: Requirements 9.4**

### API Documentation Properties

Property 39: All endpoints have complete documentation
*For any* defined API endpoint, the documentation should include request schema, response schema, and example payloads
**Validates: Requirements 10.2**

Property 40: Error responses are structured
*For any* API error, the response should include an error code, message, and status code in a consistent structure
**Validates: Requirements 10.3**

Property 41: Responses include consistent metadata
*For any* API response, it should include metadata fields for pagination (if applicable), timestamps, and status
**Validates: Requirements 10.4**

### Blog Management Properties

Property 42: Blog post creation persists all fields
*For any* valid blog post data, creating a post and retrieving it should return all fields (title, slug, content, tags, status) with matching values
**Validates: Requirements 11.1**

Property 43: Duplicate slugs are rejected
*For any* blog post, attempting to publish with a slug that already exists should fail with a validation error
**Validates: Requirements 11.2**

Property 44: Public API returns only published blog posts
*For any* set of blog posts with mixed statuses, the public blog endpoint should return only those with status "published"
**Validates: Requirements 11.3**

Property 45: Blog search filtering works correctly
*For any* set of blog posts, filtering by tags, status, or date range should return only posts matching all specified criteria
**Validates: Requirements 11.4**

### Caching Properties

Property 46: Cache is checked before database
*For any* public API endpoint call, if cached data exists for the request, the response should come from cache without executing database queries
**Validates: Requirements 12.1**

Property 47: Content updates invalidate cache
*For any* content update operation, related cache entries should be removed or invalidated
**Validates: Requirements 12.3**

Property 48: Cache entries have appropriate TTL
*For any* cached response, the TTL should match the configured value for that content type (projects: 5min, journey: 10min, blog: 5min)
**Validates: Requirements 12.4**

## Error Handling

### Error Categories

**Validation Errors (400)**:
- Invalid input data (Zod validation failures)
- Missing required fields
- Invalid MIME types
- Duplicate slugs

**Authentication Errors (401)**:
- Invalid credentials
- Expired access tokens
- Invalid refresh tokens
- Missing authentication headers

**Authorization Errors (403)**:
- Insufficient permissions
- Account locked
- Revoked tokens

**Not Found Errors (404)**:
- Resource doesn't exist
- Deleted resources (soft-deleted)

**Rate Limit Errors (429)**:
- Too many requests from IP
- Contact form rate limit exceeded

**Server Errors (500)**:
- Database connection failures
- External service failures (S3, email)
- Unexpected exceptions

### Error Response Format

All errors follow a consistent structure:

```typescript
interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, any>
    timestamp: string
  }
}
```

### Error Handling Strategy

**Client-Facing Errors**: Generic messages that don't expose internal implementation details or sensitive information.

**Internal Logging**: Detailed error information including stack traces, request context, and user information (redacted sensitive fields).

**Retry Logic**: Background jobs implement exponential backoff (1s, 2s, 4s, 8s, 16s) with a maximum of 5 retry attempts.

**Circuit Breaker**: External service calls (GitHub API, email service) implement circuit breaker pattern to prevent cascading failures.

**Graceful Degradation**: Cache failures fall back to database queries. Email notification failures don't block contact form submissions.

## Testing Strategy

### Unit Testing

Unit tests verify specific functionality of individual components:

- **Service Layer**: Test business logic in isolation with mocked repositories
- **Repository Layer**: Test database queries with test database
- **Validation**: Test Zod schemas with valid and invalid inputs
- **Utilities**: Test helper functions (password hashing, JWT generation, sanitization)
- **Middleware**: Test authentication, rate limiting, and validation middleware

**Framework**: Vitest (fast, TypeScript-native, compatible with Fastify)

**Coverage Target**: 80% code coverage for service and repository layers

### Property-Based Testing

Property-based tests verify universal properties across many randomly generated inputs:

- **Framework**: fast-check (JavaScript/TypeScript property-based testing library)
- **Iterations**: Minimum 100 iterations per property test
- **Tagging**: Each property test must include a comment with format: `**Feature: anuragos-backend, Property {number}: {property_text}**`
- **Coverage**: Each correctness property from the design document must have a corresponding property-based test

**Key Property Tests**:
- Authentication token generation and validation
- Content CRUD operations with field persistence
- Sorting and filtering operations
- Cache behavior and invalidation
- Version creation and rollback
- Input validation and sanitization
- Rate limiting enforcement

### Integration Testing

Integration tests verify component interactions:

- **API Endpoints**: Test full request/response cycle with test database
- **Background Jobs**: Test job enqueueing, processing, and completion
- **Cache Integration**: Test Redis cache with actual Redis instance
- **File Upload Flow**: Test presigned URL generation and metadata storage

### End-to-End Testing

E2E tests verify complete user workflows:

- Admin authentication and session management
- Content creation, update, and publishing workflow
- Public API data retrieval
- Contact form submission and rate limiting
- Content versioning and rollback

**Framework**: Supertest (HTTP assertions) with test Fastify instance

### Test Database Strategy

- **Test Database**: Separate PostgreSQL database for testing
- **Migrations**: Run migrations before test suite
- **Cleanup**: Truncate tables between test suites
- **Seeding**: Seed test data for integration and E2E tests

### Continuous Integration

- Run all tests on every commit
- Enforce code coverage thresholds
- Run linting and type checking
- Generate test reports

## Security Considerations

### Authentication Security

- **Password Storage**: Bcrypt with salt rounds of 12
- **JWT Secrets**: Strong random secrets stored in environment variables
- **Token Expiration**: Access tokens expire in 15 minutes, refresh tokens in 7 days
- **Token Rotation**: Refresh tokens are rotated on every use
- **Account Lockout**: 3 failed attempts within 15 minutes locks account for 30 minutes

### Input Validation

- **Schema Validation**: All inputs validated with Zod schemas
- **Sanitization**: HTML and script tags sanitized in user-generated content
- **MIME Type Validation**: File uploads restricted to allowed types
- **SQL Injection Prevention**: Prisma ORM provides parameterized queries

### Rate Limiting

- **Global Rate Limit**: 100 requests per minute per IP
- **Auth Endpoints**: 5 requests per minute per IP
- **Contact Form**: 1 submission per 5 minutes per IP
- **Admin Endpoints**: 60 requests per minute per authenticated user

### Data Protection

- **Sensitive Data Redaction**: Passwords, tokens, and PII redacted in logs
- **Audit Logging**: All admin actions logged immutably
- **Soft Deletion**: Deleted content retained for audit purposes
- **HTTPS Only**: All API communication over HTTPS in production

### Environment Variables

Required environment variables with validation on startup:

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
AWS_REGION=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASSWORD=...
ADMIN_EMAIL=...
NODE_ENV=development|production
PORT=3000
```

## Deployment Considerations

### Infrastructure Requirements

- **Application Server**: Node.js 20+ with PM2 for process management
- **Database**: PostgreSQL 15+ with connection pooling
- **Cache**: Redis 7+ for sessions and caching
- **Storage**: AWS S3 or compatible object storage
- **Email**: SMTP service (SendGrid, AWS SES, etc.)

### Scaling Strategy

- **Horizontal Scaling**: Stateless application servers behind load balancer
- **Database**: Read replicas for public API queries
- **Cache**: Redis cluster for high availability
- **Background Jobs**: Multiple worker processes for job processing

### Monitoring

- **Application Metrics**: Request rate, response time, error rate
- **Database Metrics**: Connection pool usage, query performance
- **Cache Metrics**: Hit rate, memory usage
- **Job Metrics**: Queue length, processing time, failure rate

### Logging

- **Structured Logging**: JSON format with correlation IDs
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Log Aggregation**: Centralized logging (CloudWatch, Datadog, etc.)
- **Sensitive Data**: Automatic redaction of passwords, tokens, PII

## API Endpoints Summary

### Public Endpoints

- `GET /api/projects` - List published projects
- `GET /api/projects/:id` - Get project details
- `GET /api/journey` - Get journey timeline
- `GET /api/blog` - List published blog posts
- `GET /api/blog/:slug` - Get blog post by slug
- `POST /api/contact` - Submit contact form

### Admin Endpoints

**Authentication**:
- `POST /api/auth/login` - Admin login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

**Projects**:
- `POST /api/admin/projects` - Create project
- `PUT /api/admin/projects/:id` - Update project
- `POST /api/admin/projects/:id/publish` - Publish project
- `DELETE /api/admin/projects/:id` - Delete project

**Journey**:
- `POST /api/admin/journey` - Create journey entry
- `PUT /api/admin/journey/:id` - Update journey entry
- `POST /api/admin/journey/reorder` - Reorder entries
- `DELETE /api/admin/journey/:id` - Delete entry

**Blog**:
- `POST /api/admin/blog` - Create blog post
- `PUT /api/admin/blog/:id` - Update blog post
- `POST /api/admin/blog/:id/publish` - Publish blog post
- `DELETE /api/admin/blog/:id` - Delete blog post
- `GET /api/admin/blog/search` - Search blog posts

**Media**:
- `POST /api/admin/media/upload-url` - Get presigned upload URL
- `POST /api/admin/media` - Save media metadata
- `DELETE /api/admin/media/:id` - Delete media file

**Contact**:
- `GET /api/admin/contact` - List contact messages
- `PUT /api/admin/contact/:id/read` - Mark as read

**Audit**:
- `GET /api/admin/audit` - List audit logs

**Versions**:
- `GET /api/admin/versions/:resourceType/:resourceId` - Get version history
- `POST /api/admin/versions/:id/rollback` - Rollback to version

**Jobs**:
- `POST /api/admin/jobs/github-sync/:projectId` - Trigger GitHub sync
- `GET /api/admin/jobs/:id` - Get job status

**Documentation**:
- `GET /api-docs` - Swagger UI (development only)

## Performance Optimization

### Caching Strategy

- **Response Caching**: Public endpoints cached in Redis with content-specific TTLs
- **Cache Invalidation**: Automatic invalidation on content updates
- **Cache Warming**: Pre-populate cache on application startup
- **Cache Keys**: Structured keys with endpoint and parameter hashing

### Database Optimization

- **Indexes**: Indexes on frequently queried fields (status, publishedAt, slug, year)
- **Connection Pooling**: Prisma connection pool with max 10 connections
- **Query Optimization**: Select only required fields, use pagination
- **Soft Delete Filtering**: Indexes on deletedAt for efficient filtering

### API Optimization

- **Pagination**: Default page size of 20, max 100
- **Field Selection**: Support for field filtering in responses
- **Compression**: Gzip compression for responses
- **ETags**: Support for conditional requests

### Background Job Optimization

- **Job Prioritization**: High priority for user-triggered jobs
- **Batch Processing**: Batch thumbnail generation for multiple images
- **Job Deduplication**: Prevent duplicate jobs for same resource
- **Concurrency**: Configurable worker concurrency based on resources

## Future Enhancements

- **GraphQL API**: Alternative to REST for flexible querying
- **Real-time Updates**: WebSocket support for live content updates
- **Advanced Search**: Full-text search with Elasticsearch
- **Analytics**: Track page views, popular content, user engagement
- **Multi-language Support**: Content localization
- **CDN Integration**: CloudFront or similar for static assets
- **Advanced Media Processing**: Video transcoding, image optimization
- **Scheduled Publishing**: Schedule content publication for future dates
- **Content Drafts**: Multiple draft versions before publishing
- **Collaborative Editing**: Multiple admins with role-based permissions
