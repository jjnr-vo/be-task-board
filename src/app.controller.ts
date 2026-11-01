import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

@ApiTags('status')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Starter endpoint' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Check process health' })
  getHealth(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('health/ready')
  @ApiOperation({ summary: 'Check database readiness' })
  async getReadiness(): Promise<{ status: 'ready' }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch (error) {
      throw new ServiceUnavailableException('Database is not ready.', {
        cause: error,
      });
    }
  }

  @Get('db/groups')
  @ApiOperation({ summary: 'Check all groups data' })
  async getGroups(): Promise<any> {
    try {
      const res = await this.prisma.$queryRaw`SELECT * FROM Group`;
      return { data: res };
    } catch (error) {
      throw new ServiceUnavailableException('Could not get groups', {
        cause: error,
      });
    }
  }
}
