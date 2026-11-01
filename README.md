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
- Docker with the Compose plugin

## Setup

```bash
npm ci
cp -n .env.example .env
docker compose up -d --wait
npm run db:generate
npm run db:migrate -- --name init
```

`cp -n` preserves an existing local `.env`; if you already have one, add or
update only the settings needed for this local Compose database.

The Compose setup starts PostgreSQL 17 with separate `task_board` and
`task_board_test` databases. The credentials in `.env.example` are local
development credentials; do not use them outside a local environment. Edit
`.env` if you change the Compose credentials or ports.

`DATABASE_URL_TEST` can point to a separate PostgreSQL database whose name ends
in `_test`. If omitted, the e2e command derives it from `DATABASE_URL` by
appending `_test` to the database name. The command applies committed migrations
to that database before running and truncates application tables around each
test. It refuses to run if the test URL is not PostgreSQL, does not end in
`_test`, or points to the same database as `DATABASE_URL`.

`SESSION_SECRET` must be at least 32 characters. The example value is for local
development only; replace it with a securely generated value before deploying.

## Run

```bash
npm run start:dev
```

- `GET /` returns a starter response.
- `GET /health` reports process liveness; it does not query PostgreSQL.
- `GET /health/ready` checks database readiness and returns `503` if PostgreSQL
  cannot be queried.
- `GET /api` serves the OpenAPI document.

## Checks

```bash
npm run build
npm test
npm run test:e2e
npm run lint
npm run db:validate
npm run db:deploy
```

## Database scripts

- `npm run db:generate` generates the Prisma client.
- `npm run db:validate` validates the Prisma schema.
- `npm run db:migrate -- --name <migration>` creates/applies a development migration.
- `npm run db:deploy` applies committed migrations in deployment environments.
- `npm run db:studio` opens Prisma Studio.

The e2e suite always targets `DATABASE_URL_TEST`, never the development URL.
If an e2e run is interrupted, its next run clears application tables before
each test.
