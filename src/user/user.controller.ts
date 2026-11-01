import {
  Controller,
  Get,
  Param,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('get-all')
  @ApiOperation({ summary: 'Check all users data' })
  async getAllUsers() {
    try {
      const queryResponse = await this.prisma.$queryRaw`SELECT * FROM User`;
      return { data: queryResponse };
    } catch (err) {
      throw new ServiceUnavailableException('Could not get users', {
        cause: err,
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Check user data by id' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async getUserById(@Param('id') id: string) {
    try {
      const queryResponse = await this.prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, createdAt: true },
      });
      return { data: queryResponse };
    } catch (error) {
      throw new ServiceUnavailableException('Could not find user', {
        cause: error,
      });
    }
  }
}
