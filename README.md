# Task Board API

Backend starter for a task-board application. A group can own multiple boards; approved group members can work with its boards and tasks, while group admins manage membership requests.

## Stack

- NestJS 12 and TypeScript
- PostgreSQL with Prisma 7 and the `pg` driver adapter
- Argon2 password hashing and PostgreSQL-backed Express sessions
- DTO validation, Swagger/OpenAPI, and request throttling
- Vitest and Supertest

Authentication and product endpoints are not implemented yet. This bootstrap provides the framework, configuration, database schema, and dependencies to build them.

## Requirements

- Node.js 24 LTS
- npm 11
- PostgreSQL 14 or newer for database operations

## Setup

```bash
npm ci
cp .env.example .env
npm run db:generate
```

Set `DATABASE_URL` in `.env` to a PostgreSQL database before running migrations:

```bash
npm run db:migrate -- --name init
```

The example session secret is for local development only. Replace it with a securely generated value before deploying.

## Run

```bash
npm run start:dev
```

- `GET /` returns a starter response.
- `GET /health` returns process health.
- `GET /api` serves the OpenAPI document.

## Checks

```bash
npm run build
npm test
npm run test:e2e
npm run lint
npm run db:validate
```

## Database scripts

- `npm run db:generate` generates the Prisma client.
- `npm run db:validate` validates the Prisma schema.
- `npm run db:migrate -- --name <migration>` creates/applies a development migration.
- `npm run db:deploy` applies committed migrations in deployment environments.
- `npm run db:studio` opens Prisma Studio.
