# Implementation Plan

- [ ] 1. Set up project structure and core dependencies
  - Replace Express with Fastify framework
  - Install and configure Prisma ORM with PostgreSQL
  - Install Zod for validation
  - Install Redis client (ioredis) and BullMQ for background jobs
  - Install AWS SDK for S3 (or compatible storage)
  - Install JWT libraries (jsonwebtoken, @fastify/jwt)
  - Install bcrypt for password hashing
  - Install fast-check for property-based testing
  - Install Vitest for unit testing
  - Configure TypeScript with strict mode
  - Set up environment variable validation with Zod
  - Create proper directory structure (routes, services, repositories, middleware, utils, types)
  - _Requirements: 9.5_

- [ ] 2. Set up database schema and migrations
  - Define Prisma schema for all models (User, RefreshToken, Project, JourneyEntry, BlogPost, Media, ContactMessage, AuditLog, Version, Job)
  - Create initial migration
  - Set up database connection with connection pooling
  - Configure test database for testing
  - _Requirements: 2.1, 3.1, 4.2, 5.1, 6.1, 7.1, 8.1, 11.1_

- [ ] 3. Implement authentication module
  - [ ] 3.1 Create User model and repository
    - Implement user repository with CRUD operations
    - Add account lockout tracking fields
    - _Requirements: 1.1, 1.5_

  - [ ] 3.2 Implement password hashing utilities
    - Create bcrypt wrapper with salt rounds of 12
    - _Requirements: 1.1_

  - [ ] 3.3 Implement JWT token generation and validation
    - Create access token generation (15 min expiry)
    - Create refresh token generation (7 day expiry)
    - Implement token validation middleware
    - _Requirements: 1.1, 1.2_

  - [ ] 3.4 Write property test for valid credentials generating token pair
    - **Property 1: Valid credentials generate token pair**
    - **Validates: Requirements 1.1**

  - [ ] 3.5 Implement refresh token repository
    - Create refresh token storage and retrieval
    - Implement token rotation logic
    - _Requirements: 1.2, 1.3_

  - [ ] 3.6 Write property test for refresh token rotation
    - **Property 3: Refresh token rotation invalidates previous token**
    - **Validates: Requirements 1.3**

  - [ ] 3.7 Implement login service
    - Validate credentials
    - Track failed login attempts
    - Implement account lockout logic (3 attempts in 15 min = 30 min lock)
    - Generate token pair on success
    - _Requirements: 1.1, 1.5_

  - [ ] 3.8 Implement refresh token service
    - Validate refresh token
    - Generate new token pair
    - Rotate refresh token
    - _Requirements: 1.2, 1.3_

  - [ ] 3.9 Write property test for refresh token generating new access token
    - **Property 2: Refresh token generates new access token**
    - **Validates: Requirements 1.2**

  - [ ] 3.10 Implement logout service
    - Invalidate all user refresh tokens
    - _Requirements: 1.4_

  - [ ] 3.11 Write property test for logout invalidating tokens
    - **Property 4: Logout invalidates all refresh tokens**
    - **Validates: Requirements 1.4**

  - [ ] 3.12 Create authentication routes
    - POST /api/auth/login
    - POST /api/auth/refresh
    - POST /api/auth/logout
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ]* 3.13 Write unit tests for authentication module
    - Test password hashing
    - Test JWT generation and validation
    - Test account lockout logic
    - _Requirements: 1.1, 1.5_

- [ ] 4. Implement audit logging module
  - [ ] 4.1 Create audit log repository
    - Implement immutable log creation
    - Implement paginated log retrieval with filtering
    - _Requirements: 6.1, 6.2_

  - [ ] 4.2 Create audit logging middleware
    - Capture admin actions (create, update, delete)
    - Record user, action, resource, timestamp, changes
    - _Requirements: 6.1_

  - [ ] 4.3 Write property test for admin actions creating logs
    - **Property 23: Admin actions create audit logs**
    - **Validates: Requirements 6.1**

  - [ ] 4.4 Write property test for audit log immutability
    - **Property 25: Audit logs are immutable**
    - **Validates: Requirements 6.3**

  - [ ] 4.5 Create audit log routes
    - GET /api/admin/audit (with filtering)
    - _Requirements: 6.2_

  - [ ] 4.6 Write property test for audit log filtering
    - **Property 24: Audit log filtering works correctly**
    - **Validates: Requirements 6.2**

- [ ] 5. Implement content versioning module
  - [ ] 5.1 Create version repository
    - Implement version snapshot creation
    - Implement version history retrieval
    - _Requirements: 7.1, 7.2_

  - [ ] 5.2 Create versioning service
    - Auto-create snapshots before updates
    - Implement rollback logic with state preservation
    - _Requirements: 7.1, 7.3, 7.4_

  - [ ] 5.3 Write property test for updates creating versions
    - **Property 27: Content updates create versions**
    - **Validates: Requirements 7.1**

  - [ ] 5.4 Write property test for rollback restoring state
    - **Property 29: Rollback restores exact previous state**
    - **Validates: Requirements 7.3**

  - [ ] 5.5 Write property test for rollback preserving current state
    - **Property 30: Rollback preserves current state**
    - **Validates: Requirements 7.4**

  - [ ] 5.6 Create version routes
    - GET /api/admin/versions/:resourceType/:resourceId
    - POST /api/admin/versions/:id/rollback
    - _Requirements: 7.2, 7.3_

  - [ ] 5.7 Write property test for version history completeness
    - **Property 28: Version history is complete**
    - **Validates: Requirements 7.2**

  - [ ] 5.8 Write property test for rollback creating audit log
    - **Property 26: Rollback creates audit log**
    - **Validates: Requirements 6.4**

- [ ] 6. Implement projects module
  - [ ] 6.1 Create project repository
    - Implement CRUD operations
    - Implement soft delete
    - Implement published projects query with caching
    - _Requirements: 2.1, 2.4, 2.5_

  - [ ] 6.2 Create project service
    - Implement create with all fields
    - Implement update with version snapshot
    - Implement publish with status change
    - Implement soft delete
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 6.3 Write property test for project field persistence
    - **Property 5: Project creation persists all fields**
    - **Validates: Requirements 2.1**

  - [ ] 6.4 Write property test for updates creating versions
    - **Property 6: Project updates create version snapshots**
    - **Validates: Requirements 2.2**

  - [ ] 6.5 Write property test for publishing visibility
    - **Property 7: Publishing makes projects publicly visible**
    - **Validates: Requirements 2.3**

  - [ ] 6.6 Write property test for soft deletion
    - **Property 8: Deletion soft-deletes projects**
    - **Validates: Requirements 2.4**

  - [ ] 6.7 Create project routes
    - POST /api/admin/projects
    - PUT /api/admin/projects/:id
    - POST /api/admin/projects/:id/publish
    - DELETE /api/admin/projects/:id
    - GET /api/projects (public)
    - GET /api/projects/:id (public)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 6.8 Write property test for public API filtering
    - **Property 9: Public API returns only published projects**
    - **Validates: Requirements 2.5**

- [ ] 7. Implement journey timeline module
  - [ ] 7.1 Create journey repository
    - Implement CRUD operations
    - Implement sorted timeline query
    - Implement reorder operation
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 7.2 Create journey service with category validation
    - Validate category against predefined values
    - Implement create with all fields
    - Implement update
    - Implement reorder with consistency
    - _Requirements: 3.1, 3.2, 3.4_

  - [ ] 7.3 Write property test for journey field persistence
    - **Property 10: Journey entry creation persists all fields**
    - **Validates: Requirements 3.1**

  - [ ] 7.4 Write property test for category validation
    - **Property 13: Invalid categories are rejected**
    - **Validates: Requirements 3.4**

  - [ ] 7.5 Write property test for reordering preservation
    - **Property 11: Reordering preserves all entries**
    - **Validates: Requirements 3.2**

  - [ ] 7.6 Create journey routes
    - POST /api/admin/journey
    - PUT /api/admin/journey/:id
    - POST /api/admin/journey/reorder
    - DELETE /api/admin/journey/:id
    - GET /api/journey (public)
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 7.7 Write property test for timeline sorting
    - **Property 12: Timeline returns sorted entries**
    - **Validates: Requirements 3.3**

- [ ] 8. Implement blog module
  - [ ] 8.1 Create blog repository
    - Implement CRUD operations
    - Implement published posts query with pagination
    - Implement search with filtering (tags, status, date range)
    - _Requirements: 11.1, 11.3, 11.4_

  - [ ] 8.2 Create blog service
    - Implement create with all fields
    - Implement update with version snapshot
    - Implement publish with slug uniqueness validation
    - Implement soft delete
    - _Requirements: 11.1, 11.2_

  - [ ] 8.3 Write property test for blog field persistence
    - **Property 42: Blog post creation persists all fields**
    - **Validates: Requirements 11.1**

  - [ ] 8.4 Write property test for slug uniqueness
    - **Property 43: Duplicate slugs are rejected**
    - **Validates: Requirements 11.2**

  - [ ] 8.5 Write property test for public API filtering
    - **Property 44: Public API returns only published blog posts**
    - **Validates: Requirements 11.3**

  - [ ] 8.6 Create blog routes
    - POST /api/admin/blog
    - PUT /api/admin/blog/:id
    - POST /api/admin/blog/:id/publish
    - DELETE /api/admin/blog/:id
    - GET /api/admin/blog/search
    - GET /api/blog (public)
    - GET /api/blog/:slug (public)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 8.7 Write property test for blog search filtering
    - **Property 45: Blog search filtering works correctly**
    - **Validates: Requirements 11.4**

- [ ] 9. Implement media management module
  - [ ] 9.1 Create media repository
    - Implement metadata CRUD operations
    - _Requirements: 4.2_

  - [ ] 9.2 Implement S3 service
    - Generate presigned upload URLs
    - Delete files from S3
    - _Requirements: 4.1, 4.3_

  - [ ] 9.3 Create media service
    - Validate MIME types against allowed list
    - Generate presigned URLs
    - Save metadata after upload
    - Enqueue thumbnail job for images
    - Delete from storage and database
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 9.4 Write property test for presigned URL generation
    - **Property 14: Upload request generates valid presigned URL**
    - **Validates: Requirements 4.1**

  - [ ] 9.5 Write property test for metadata persistence
    - **Property 15: Media metadata persists all fields**
    - **Validates: Requirements 4.2**

  - [ ] 9.6 Write property test for MIME type validation
    - **Property 17: Invalid MIME types are rejected**
    - **Validates: Requirements 4.4**

  - [ ] 9.7 Write property test for thumbnail job enqueueing
    - **Property 18: Image uploads enqueue thumbnail jobs**
    - **Validates: Requirements 4.5**

  - [ ] 9.8 Create media routes
    - POST /api/admin/media/upload-url
    - POST /api/admin/media
    - DELETE /api/admin/media/:id
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 9.9 Write property test for media deletion
    - **Property 16: Media deletion removes storage and metadata**
    - **Validates: Requirements 4.3**

- [ ] 10. Implement contact form module
  - [ ] 10.1 Create contact repository
    - Implement message storage
    - Implement paginated retrieval sorted by date
    - Implement mark as read
    - _Requirements: 5.2, 5.4_

  - [ ] 10.2 Implement HTML sanitization utility
    - Remove or escape HTML and script tags
    - _Requirements: 5.5_

  - [ ] 10.3 Write property test for sanitization
    - **Property 22: Malicious content is sanitized**
    - **Validates: Requirements 5.5**

  - [ ] 10.4 Create contact service
    - Validate all required fields
    - Sanitize message content
    - Check rate limit (1 per 5 min per IP)
    - Store message
    - Send email notification
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [ ] 10.5 Write property test for field validation
    - **Property 19: Invalid contact forms are rejected**
    - **Validates: Requirements 5.1**

  - [ ] 10.6 Write property test for message storage
    - **Property 20: Valid submissions are stored**
    - **Validates: Requirements 5.2**

  - [ ] 10.7 Create contact routes
    - POST /api/contact (public, with rate limiting)
    - GET /api/admin/contact
    - PUT /api/admin/contact/:id/read
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 10.8 Write property test for message sorting
    - **Property 21: Contact messages are sorted by date**
    - **Validates: Requirements 5.4**

- [ ] 11. Implement background jobs module
  - [ ] 11.1 Set up BullMQ with Redis
    - Configure job queue
    - Set up worker processes
    - Configure retry logic with exponential backoff
    - _Requirements: 8.3_

  - [ ] 11.2 Implement GitHub sync job
    - Fetch repository statistics from GitHub API
    - Update project with stars, forks, commits
    - Handle API errors
    - _Requirements: 8.1, 8.2_

  - [ ] 11.3 Write property test for GitHub sync job creation
    - **Property 31: GitHub sync creates job**
    - **Validates: Requirements 8.1**

  - [ ] 11.4 Write property test for GitHub sync updating stats
    - **Property 32: GitHub sync updates project stats**
    - **Validates: Requirements 8.2**

  - [ ] 11.5 Implement thumbnail generation job
    - Generate optimized thumbnails for images
    - Store thumbnail URL in media metadata
    - _Requirements: 4.5_

  - [ ] 11.6 Create job service
    - Enqueue jobs
    - Track job status
    - Update completion status and timestamp
    - _Requirements: 8.1, 8.4_

  - [ ] 11.7 Write property test for job retry logic
    - **Property 33: Failed jobs schedule retries**
    - **Validates: Requirements 8.3**

  - [ ] 11.8 Write property test for job completion
    - **Property 34: Completed jobs update status**
    - **Validates: Requirements 8.4**

  - [ ] 11.9 Create job routes
    - POST /api/admin/jobs/github-sync/:projectId
    - GET /api/admin/jobs/:id
    - _Requirements: 8.1_

- [ ] 12. Implement caching layer
  - [ ] 12.1 Set up Redis cache client
    - Configure connection
    - Implement cache key generation
    - _Requirements: 12.1_

  - [ ] 12.2 Create cache middleware
    - Check cache before database queries
    - Set TTL based on content type
    - Return cached responses
    - _Requirements: 12.1, 12.4_

  - [ ] 12.3 Write property test for cache-first behavior
    - **Property 46: Cache is checked before database**
    - **Validates: Requirements 12.1**

  - [ ] 12.4 Write property test for cache TTL
    - **Property 48: Cache entries have appropriate TTL**
    - **Validates: Requirements 12.4**

  - [ ] 12.5 Implement cache invalidation
    - Invalidate on content updates
    - Invalidate related cache entries
    - _Requirements: 12.3_

  - [ ] 12.6 Write property test for cache invalidation
    - **Property 47: Content updates invalidate cache**
    - **Validates: Requirements 12.3**

  - [ ] 12.7 Apply caching to public endpoints
    - Cache GET /api/projects (5 min TTL)
    - Cache GET /api/journey (10 min TTL)
    - Cache GET /api/blog (5 min TTL)
    - _Requirements: 12.1, 12.4_

- [ ] 13. Implement security middleware
  - [ ] 13.1 Create rate limiting middleware
    - Implement IP-based rate limiting
    - Configure limits per endpoint
    - Store counters in Redis
    - _Requirements: 9.1_

  - [ ] 13.2 Write property test for rate limiting
    - **Property 35: Rate limiting blocks excessive requests**
    - **Validates: Requirements 9.1**

  - [ ] 13.3 Create input validation middleware
    - Integrate Zod schemas
    - Validate all request bodies
    - Return structured validation errors
    - _Requirements: 9.2_

  - [ ] 13.4 Write property test for input validation
    - **Property 36: Invalid inputs are rejected**
    - **Validates: Requirements 9.2**

  - [ ] 13.5 Implement logging with sensitive data redaction
    - Redact passwords, tokens, PII
    - Log detailed errors internally
    - _Requirements: 9.3_

  - [ ] 13.6 Write property test for sensitive data redaction
    - **Property 37: Sensitive data is redacted in logs**
    - **Validates: Requirements 9.3**

  - [ ] 13.7 Create error handling middleware
    - Return generic error messages to clients
    - Log detailed errors internally
    - Use consistent error response format
    - _Requirements: 9.4, 10.3_

  - [ ] 13.8 Write property test for error message handling
    - **Property 38: Errors return generic messages externally**
    - **Validates: Requirements 9.4**

  - [ ] 13.9 Write property test for error response structure
    - **Property 40: Error responses are structured**
    - **Validates: Requirements 10.3**

- [ ] 14. Implement API documentation
  - [ ] 14.1 Set up Swagger/OpenAPI with Fastify
    - Install @fastify/swagger and @fastify/swagger-ui
    - Configure Swagger UI
    - Serve at /api-docs in development
    - _Requirements: 10.1_

  - [ ] 14.2 Add schemas to all endpoints
    - Define request/response schemas
    - Add example payloads
    - Document error responses
    - _Requirements: 10.2_

  - [ ] 14.3 Write property test for documentation completeness
    - **Property 39: All endpoints have complete documentation**
    - **Validates: Requirements 10.2**

  - [ ] 14.4 Add response metadata to all endpoints
    - Include pagination metadata
    - Include timestamps
    - Include status fields
    - _Requirements: 10.4_

  - [ ] 14.5 Write property test for response metadata
    - **Property 41: Responses include consistent metadata**
    - **Validates: Requirements 10.4**

- [ ] 15. Final integration and testing
  - [ ] 15.1 Wire all modules together in main application
    - Register all routes
    - Apply middleware in correct order
    - Configure error handling
    - _Requirements: All_

  - [ ] 15.2 Set up environment variable validation
    - Validate all required variables on startup
    - Provide clear error messages for missing variables
    - _Requirements: 9.5_

  - [ ]* 15.3 Write integration tests for complete workflows
    - Test admin authentication flow
    - Test content creation and publishing flow
    - Test public API access
    - Test contact form submission
    - Test versioning and rollback
    - _Requirements: All_

  - [ ] 15.4 Ensure all property-based tests pass
    - Run all property tests with 100+ iterations
    - Fix any failing properties
    - _Requirements: All_

  - [ ]* 15.5 Ensure all unit tests pass
    - Run complete test suite
    - Verify code coverage meets 80% target
    - _Requirements: All_

- [ ] 16. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise
