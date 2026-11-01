const MIN_SESSION_SECRET_LENGTH = 32;

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const nodeEnv = config.NODE_ENV ?? 'development';
  if (
    typeof nodeEnv !== 'string' ||
    !['development', 'test', 'production'].includes(nodeEnv)
  ) {
    throw new Error('NODE_ENV must be development, test, or production.');
  }

  const port = Number(config.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  const databaseUrl = config.DATABASE_URL;
  if (typeof databaseUrl !== 'string' || databaseUrl.length === 0) {
    throw new Error('DATABASE_URL is required.');
  }

  let parsedDatabaseUrl: URL;
  try {
    parsedDatabaseUrl = new URL(databaseUrl);
  } catch (error) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.', {
      cause: error,
    });
  }

  if (
    !['postgres:', 'postgresql:'].includes(parsedDatabaseUrl.protocol) ||
    parsedDatabaseUrl.hostname.length === 0 ||
    parsedDatabaseUrl.pathname.length <= 1
  ) {
    throw new Error(
      'DATABASE_URL must include a PostgreSQL protocol, host, and database name.',
    );
  }

  const sessionSecret = config.SESSION_SECRET;
  if (
    typeof sessionSecret !== 'string' ||
    sessionSecret.length < MIN_SESSION_SECRET_LENGTH
  ) {
    throw new Error(
      `SESSION_SECRET must be at least ${MIN_SESSION_SECRET_LENGTH} characters.`,
    );
  }

  return {
    ...config,
    NODE_ENV: nodeEnv,
    PORT: port,
    DATABASE_URL: databaseUrl,
    SESSION_SECRET: sessionSecret,
  };
}
