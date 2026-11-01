import { validateEnvironment } from './environment.js';

describe('validateEnvironment', () => {
  const validEnvironment = {
    DATABASE_URL:
      'postgresql://task_board:task_board_local@localhost:5432/task_board?schema=public',
    SESSION_SECRET: 'a-valid-session-secret-that-is-at-least-32-characters',
  };

  it('applies development defaults and returns normalized values', () => {
    expect(validateEnvironment(validEnvironment)).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL: validEnvironment.DATABASE_URL,
      SESSION_SECRET: validEnvironment.SESSION_SECRET,
    });
  });

  it('rejects a missing database URL', () => {
    expect(() =>
      validateEnvironment({
        SESSION_SECRET: validEnvironment.SESSION_SECRET,
      }),
    ).toThrow('DATABASE_URL is required.');
  });

  it('rejects non-PostgreSQL URLs', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        DATABASE_URL: 'https://localhost/task_board',
      }),
    ).toThrow(
      'DATABASE_URL must include a PostgreSQL protocol, host, and database name.',
    );
  });

  it('rejects invalid ports', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        PORT: '70000',
      }),
    ).toThrow('PORT must be an integer between 1 and 65535.');
  });

  it('rejects short session secrets', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        SESSION_SECRET: 'too-short',
      }),
    ).toThrow('SESSION_SECRET must be at least 32 characters.');
  });
});
