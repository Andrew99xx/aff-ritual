import { Module } from '@nestjs/common';
import { TeamLeaderService } from './team-leader.service';
import { TeamLeaderController } from './team-leader.controller';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [TeamLeaderService, AuthService, PrismaService, JwtService],
  controllers: [TeamLeaderController]
})
export class TeamLeaderModule {}
