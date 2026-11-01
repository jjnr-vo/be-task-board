import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set before running Prisma commands.');
}

const parsedDatabaseUrl = new URL(databaseUrl);

if (!['postgres:', 'postgresql:'].includes(parsedDatabaseUrl.protocol)) {
  throw new Error('DATABASE_URL must use the PostgreSQL protocol.');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
