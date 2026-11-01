import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { config } from 'dotenv';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(projectRoot, '.env') });

const configuredTestDatabaseUrl = process.env.DATABASE_URL_TEST;
const developmentDatabaseUrl = process.env.DATABASE_URL;
if (!configuredTestDatabaseUrl && !developmentDatabaseUrl) {
  throw new Error(
    'DATABASE_URL is required to derive the test database URL.',
  );
}

let testDatabaseUrl = configuredTestDatabaseUrl;
if (!testDatabaseUrl && developmentDatabaseUrl) {
  const parsedDevelopmentUrl = new URL(developmentDatabaseUrl);
  const developmentDatabaseName = decodeURIComponent(
    parsedDevelopmentUrl.pathname.slice(1),
  );
  parsedDevelopmentUrl.pathname = `/${developmentDatabaseName}_test`;
  testDatabaseUrl = parsedDevelopmentUrl.toString();
}

let parsedTestDatabaseUrl;
try {
  parsedTestDatabaseUrl = new URL(testDatabaseUrl);
} catch (error) {
  throw new Error('DATABASE_URL_TEST must be a valid PostgreSQL URL.', {
    cause: error,
  });
}

const testDatabaseName = decodeURIComponent(
  parsedTestDatabaseUrl.pathname.slice(1),
);
if (
  !['postgres:', 'postgresql:'].includes(parsedTestDatabaseUrl.protocol) ||
  !testDatabaseName.endsWith('_test')
) {
  throw new Error(
    'DATABASE_URL_TEST must use PostgreSQL and a database name ending in "_test".',
  );
}

if (developmentDatabaseUrl) {
  const parsedDevelopmentUrl = new URL(developmentDatabaseUrl);
  const sameDatabase =
    parsedDevelopmentUrl.hostname === parsedTestDatabaseUrl.hostname &&
    parsedDevelopmentUrl.port === parsedTestDatabaseUrl.port &&
    parsedDevelopmentUrl.pathname === parsedTestDatabaseUrl.pathname;
  if (sameDatabase) {
    throw new Error(
      'DATABASE_URL_TEST must point to a different database than DATABASE_URL.',
    );
  }
}

const testEnvironment = {
  ...process.env,
  DATABASE_URL: testDatabaseUrl,
  DATABASE_URL_TEST: testDatabaseUrl,
  NODE_ENV: 'test',
  SESSION_SECRET: 'test-only-session-secret-not-for-deployment',
};

const prismaCli = resolve(projectRoot, 'node_modules/prisma/build/index.js');
const vitestCli = resolve(projectRoot, 'node_modules/vitest/vitest.mjs');

function runNodeScript(scriptPath, args) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: projectRoot,
    env: testEnvironment,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

runNodeScript(prismaCli, ['migrate', 'deploy']);
runNodeScript(vitestCli, ['run', '--config', './vitest.config.e2e.ts']);
