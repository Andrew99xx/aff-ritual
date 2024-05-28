import { Module } from '@nestjs/common';
import { TeamMemberService } from './team-member.service';
import { TeamMemberController } from './team-member.controller';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [TeamMemberService, AuthService, PrismaService, JwtService],
  controllers: [TeamMemberController]
})
export class TeamMemberModule {}
