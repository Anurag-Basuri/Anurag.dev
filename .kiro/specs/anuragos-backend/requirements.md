# Requirements Document

## Introduction

AnuragOS Backend is a modular, secure REST API backend for a developer portfolio system. The system provides content management for projects, journey timeline, blog posts, and contact forms, with comprehensive admin controls. The backend serves as the data layer for a Next.js frontend that presents a terminal-style interface with folder navigation and CLI commands.

## Glossary

- **Backend System**: The Node.js/TypeScript server application providing REST API endpoints
- **Admin User**: Authenticated user with elevated privileges to manage content
- **Content Module**: A logical grouping of related functionality (projects, journey, media, etc.)
- **JWT**: JSON Web Token used for stateless authentication
- **Refresh Token**: Long-lived token stored in database for session management
- **Presigned URL**: Time-limited URL for direct file uploads to cloud storage
- **Rate Limiter**: Middleware that restricts request frequency per client
- **Audit Log**: Immutable record of administrative actions
- **Content Version**: Snapshot of content state for rollback capability

## Requirements

### Requirement 1

**User Story:** As an admin user, I want to securely authenticate and manage my session, so that I can access protected administrative functions.

#### Acceptance Criteria

1. WHEN an admin provides valid credentials THEN the Backend System SHALL generate a JWT access token and refresh token pair
2. WHEN an access token expires THEN the Backend System SHALL accept a valid refresh token to issue a new access token without re-authentication
3. WHEN a refresh token is used THEN the Backend System SHALL rotate the refresh token and invalidate the previous one
4. WHEN an admin logs out THEN the Backend System SHALL invalidate all associated refresh tokens
5. WHEN authentication fails three times within 15 minutes THEN the Backend System SHALL temporarily lock the account for 30 minutes

### Requirement 2

**User Story:** As an admin user, I want to create and manage project entries, so that I can showcase my work on the portfolio.

#### Acceptance Criteria

1. WHEN an admin creates a project THEN the Backend System SHALL store the project with title, description, tech stack, GitHub URL, live URL, and status fields
2. WHEN an admin updates a project THEN the Backend System SHALL create a version snapshot before applying changes
3. WHEN an admin publishes a project THEN the Backend System SHALL change the status from draft to published and make it visible via public API
4. WHEN an admin deletes a project THEN the Backend System SHALL soft-delete the record and retain it for audit purposes
5. WHEN a public user requests projects THEN the Backend System SHALL return only published projects with cached responses

### Requirement 3

**User Story:** As an admin user, I want to manage journey timeline entries, so that I can present my professional growth story.

#### Acceptance Criteria

1. WHEN an admin creates a journey entry THEN the Backend System SHALL store the entry with year, title, description, category, and order fields
2. WHEN an admin reorders journey entries THEN the Backend System SHALL update the order field and maintain chronological consistency
3. WHEN a public user requests the journey timeline THEN the Backend System SHALL return entries sorted by year and order
4. WHEN an admin tags a journey entry with a category THEN the Backend System SHALL validate the category against predefined values

### Requirement 4

**User Story:** As an admin user, I want to upload and manage media files, so that I can include images and assets in my content.

#### Acceptance Criteria

1. WHEN an admin requests a file upload THEN the Backend System SHALL generate a presigned URL for direct cloud storage upload
2. WHEN a file upload completes THEN the Backend System SHALL store metadata including filename, size, MIME type, and storage URL
3. WHEN an admin deletes a media file THEN the Backend System SHALL remove the file from cloud storage and delete the metadata record
4. WHEN a media file is uploaded THEN the Backend System SHALL validate the MIME type against allowed image and document formats
5. WHEN an image is uploaded THEN the Backend System SHALL enqueue a background job to generate optimized thumbnails

### Requirement 5

**User Story:** As a public user, I want to submit contact messages, so that I can reach out to the portfolio owner.

#### Acceptance Criteria

1. WHEN a user submits a contact form THEN the Backend System SHALL validate name, email, subject, and message fields
2. WHEN a valid contact form is submitted THEN the Backend System SHALL store the message and send an email notification
3. WHEN a contact form is submitted from the same IP within 5 minutes THEN the Backend System SHALL reject the submission with a rate limit error
4. WHEN an admin views contact messages THEN the Backend System SHALL return all messages sorted by submission date
5. WHEN a contact message contains malicious content THEN the Backend System SHALL sanitize HTML and script tags before storage

### Requirement 6

**User Story:** As an admin user, I want to view audit logs of all administrative actions, so that I can track changes and maintain accountability.

#### Acceptance Criteria

1. WHEN an admin performs a create, update, or delete action THEN the Backend System SHALL record an audit log entry with user, action, resource, timestamp, and changes
2. WHEN an admin views audit logs THEN the Backend System SHALL return paginated logs with filtering by date range, user, and action type
3. WHEN an audit log is created THEN the Backend System SHALL ensure the log is immutable and cannot be modified or deleted
4. WHEN a content rollback occurs THEN the Backend System SHALL create an audit log entry referencing the restored version

### Requirement 7

**User Story:** As an admin user, I want to rollback content to previous versions, so that I can recover from mistakes or unwanted changes.

#### Acceptance Criteria

1. WHEN an admin updates content THEN the Backend System SHALL automatically create a version snapshot with timestamp and change summary
2. WHEN an admin requests version history THEN the Backend System SHALL return all versions for the specified content with metadata
3. WHEN an admin initiates a rollback THEN the Backend System SHALL restore the content to the selected version and create a new version entry
4. WHEN content is rolled back THEN the Backend System SHALL preserve the current state as a version before applying the rollback

### Requirement 8

**User Story:** As an admin user, I want to trigger background jobs for data synchronization, so that external data like GitHub stats remain current.

#### Acceptance Criteria

1. WHEN an admin triggers a GitHub sync job THEN the Backend System SHALL enqueue a background task to fetch repository statistics
2. WHEN a GitHub sync job executes THEN the Backend System SHALL update project records with current star counts, fork counts, and commit counts
3. WHEN a background job fails THEN the Backend System SHALL log the error and schedule a retry with exponential backoff
4. WHEN a background job completes THEN the Backend System SHALL update the job status and store completion timestamp

### Requirement 9

**User Story:** As a system administrator, I want the backend to implement security best practices, so that the application and data remain protected.

#### Acceptance Criteria

1. WHEN any API request is received THEN the Backend System SHALL apply rate limiting based on IP address and endpoint sensitivity
2. WHEN user input is processed THEN the Backend System SHALL validate all inputs against defined schemas using Zod
3. WHEN sensitive data is logged THEN the Backend System SHALL redact passwords, tokens, and personal information
4. WHEN an error occurs THEN the Backend System SHALL return generic error messages to clients while logging detailed errors internally
5. WHEN the application starts THEN the Backend System SHALL validate all required environment variables are present and correctly formatted

### Requirement 10

**User Story:** As a developer, I want the backend to provide comprehensive API documentation, so that frontend integration is straightforward.

#### Acceptance Criteria

1. WHEN the backend starts in development mode THEN the Backend System SHALL serve interactive API documentation at the /api-docs endpoint
2. WHEN an API endpoint is defined THEN the Backend System SHALL include request/response schemas and example payloads in documentation
3. WHEN an API error occurs THEN the Backend System SHALL return structured error responses with error codes and messages
4. WHEN API responses are sent THEN the Backend System SHALL include consistent metadata fields for pagination, timestamps, and status

### Requirement 11

**User Story:** As an admin user, I want to manage blog posts with draft and published states, so that I can prepare content before making it public.

#### Acceptance Criteria

1. WHEN an admin creates a blog post THEN the Backend System SHALL store the post with title, slug, content, tags, and status fields
2. WHEN an admin publishes a blog post THEN the Backend System SHALL validate the slug is unique and change status to published
3. WHEN a public user requests blog posts THEN the Backend System SHALL return only published posts with pagination support
4. WHEN an admin searches blog posts THEN the Backend System SHALL support filtering by tags, status, and date range

### Requirement 12

**User Story:** As a system operator, I want the backend to cache frequently accessed data, so that response times are optimized and database load is reduced.

#### Acceptance Criteria

1. WHEN a public API endpoint is called THEN the Backend System SHALL check Redis cache before querying the database
2. WHEN cached data is found THEN the Backend System SHALL return the cached response and skip database queries
3. WHEN content is updated by an admin THEN the Backend System SHALL invalidate related cache entries
4. WHEN cache entries are created THEN the Backend System SHALL set appropriate TTL values based on content type and update frequency
