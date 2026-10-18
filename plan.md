# Backend task-board assignment plan

## Problem and proposed approach

Design a secure backend for users, groups, group membership requests, boards, and tasks. A group can own multiple boards; users belong to groups through approved memberships. A user who creates a group becomes its admin. Admins can manage group membership requests and delete their groups. Authenticated users can create boards and manage tasks on boards their group owns, subject to membership and authorization checks.

Recommend a modular TypeScript API using NestJS, PostgreSQL, and Prisma. Use PostgreSQL's relational constraints and transactions to enforce ownership and membership invariants; use NestJS guards and service-level authorization checks to make role boundaries explicit. Provide a REST API documented with OpenAPI, and validate behavior with unit and integration tests.

## Technology choices

- **TypeScript + NestJS:** Type safety and a conventional module/guard structure suit an assignment with several resource types and role checks. Fastify with TypeScript would be a lighter alternative, but requires more application structure to be assembled by hand.
- **PostgreSQL + Prisma:** Relational constraints fit the user/group/board/task relationships, and transactions support atomic membership and idempotency operations. Prisma provides typed queries and migrations; raw SQL remains available for constraints or queries that need it.
- **Authentication:** Password sign-in with Argon2 password hashing and opaque server-side sessions in PostgreSQL, delivered as `HttpOnly`, `Secure`, `SameSite` cookies. This supports explicit sign-out and session revocation without introducing a separate token-refresh system. Add CSRF protection for cookie-authenticated state-changing requests.
- **Testing and API contract:** Jest with HTTP-level integration tests against PostgreSQL; OpenAPI documentation generated from DTOs and route metadata.
- **Operational basics:** Environment-based configuration, structured logs, migration/seeding scripts, and health checks. Keep deployment/containerization optional unless required by the assignment rubric.

## Core data and authorization model

- `User` owns credentials and profile data.
- `Group` has a creator/admin and can own multiple `Board` records.
- `GroupMembership` joins users to groups and records `PENDING`, `ACTIVE`, or `DENIED` status plus the decision-making admin and timestamps. Enforce one membership/request per user-group pair.
- `Board` belongs to exactly one group.
- `Task` belongs to one board and records title, description, status, creator, and timestamps.
- The group creator is an admin. For the initial assignment scope, model one admin per group; add multiple admins only if required.
- Group deletion is admin-only and uses database cascade behavior for its boards and tasks; explicitly document this destructive effect.
- Require active membership for board/task access. Only group admins can accept or deny pending membership requests and delete the group. An active member can create boards and create/update/delete tasks on their group's boards. Re-check authorization at the service layer on every mutation and resource read to prevent ID-based access leaks.

## API scope

- Authentication: `POST /auth/sign-in`, `POST /auth/sign-out`, and `GET /auth/me`.
- Groups: create, list groups available to the signed-in user, request membership, admin decision on a pending request, and admin-only deletion.
- Boards: create under an authorized group and list/retrieve boards the user is permitted to access.
- Tasks: create, update, delete, and list/retrieve tasks within authorized boards.
- Use DTO validation, consistent error response shapes, pagination for lists, and appropriate HTTP status codes. Do not expose password hashes or session secrets.

## Retry strategy

### Clients retrying requests to this API

The server should document that clients may retry transient network failures, timeouts, `408`, `429`, and selected `5xx` responses, using a small bounded attempt count (for example, three total attempts) with exponential backoff and jitter. Honor `Retry-After` for `429` and `503`; do not retry ordinary `4xx` validation or authorization errors.

Do not blindly retry mutations: clients send an `Idempotency-Key` when retrying `POST` operations (and may use it for other non-idempotent operations). Persist the key, authenticated user, request fingerprint, and completed response transactionally with the operation. Replaying the same key and same request returns the original result; reusing a key with a different request is rejected. Use idempotent HTTP methods and optimistic concurrency where appropriate for updates. Tests should prove that replaying a create request does not create duplicate groups, boards, membership requests, or tasks.

### Backend calls to downstream services

Retry selectively at the service boundary rather than applying a blanket policy. Retry transient connection/network failures and timeouts, plus downstream `429` and selected `5xx` responses. Do not retry ordinary `4xx` errors, validation failures, or authentication/authorization failures. Start with at most three total attempts, exponential backoff with jitter, and a per-dependency timeout; honor `Retry-After` when supplied.

Bound the total retry duration by the incoming request's deadline so a request cannot wait indefinitely. Only retry writes when the operation is naturally idempotent or the downstream supports an idempotency key or another reliable deduplication mechanism; a timeout may mean the write succeeded even if its response was lost. Avoid retry multiplication by choosing one layer to own retries. Add circuit breakers and concurrency limits to prevent retry storms against unhealthy dependencies. For longer-running work, use a queue with bounded retries and a dead-letter path instead of holding an HTTP request open.

Record retry attempts and exhausted retries in structured logs and metrics. Tune attempt limits, timeouts, and backoff per dependency based on its latency, rate limits, and idempotency guarantees.

## Todos

1. Recommend and justify the backend stack and core data model.
2. Specify API routes, authorization rules, and membership state transitions.
3. Define bounded client-to-API and backend-to-downstream retry behavior, including idempotency safeguards, timeouts, and outage protection.
4. Define focused validation scenarios for authentication, authorization, lifecycle, and both retry paths.

## Notes and assumptions

- This deliverable is a technology recommendation and implementation plan, not code changes.
- A group may own multiple boards, and each board belongs to exactly one group.
- A group has one admin initially: its creator. Multi-admin support is outside the initial scope.
- The creator is an admin and does not need to submit a membership request to their own group.
- Client-to-API and backend-to-downstream retries are separate policies; downstream retries must be bounded by the incoming request deadline.
- Retry limits are starting guidelines. A production API should also apply rate limits, request timeouts, dependency-specific circuit breakers, and observability.
