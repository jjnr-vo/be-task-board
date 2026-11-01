const databaseUrl = process.env.DATABASE_URL;
const testDatabaseUrl = process.env.DATABASE_URL_TEST;

if (!databaseUrl || databaseUrl !== testDatabaseUrl) {
  throw new Error(
    'E2E tests must run through npm run test:e2e to select the dedicated test database.',
  );
}

const databaseName = decodeURIComponent(new URL(databaseUrl).pathname.slice(1));
if (!databaseName.endsWith('_test')) {
  throw new Error('E2E tests require a database name ending in "_test".');
}
