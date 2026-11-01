import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetTestDatabase(prisma);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/health/ready (GET)', () => {
    return request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect({ status: 'ready' });
  });

  it('connects to the dedicated test database', async () => {
    const [result] = await prisma.$queryRaw<
      Array<{ databaseName: string }>
    >`SELECT current_database() AS "databaseName"`;

    expect(result.databaseName).toMatch(/_test$/);
  });

  afterEach(async () => {
    await resetTestDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });
});

async function resetTestDatabase(prisma: PrismaService): Promise<void> {
  await prisma.$executeRaw`
    TRUNCATE TABLE
      "IdempotencyRecord",
      "Task",
      "Board",
      "GroupMembership",
      "Group",
      "User"
    RESTART IDENTITY CASCADE
  `;
}
