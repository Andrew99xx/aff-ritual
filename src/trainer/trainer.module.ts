import { Module } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { TrainerController } from './trainer.controller';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [TrainerService, AuthService, PrismaService, JwtService],
  controllers: [TrainerController]
})
export class TrainerModule {}
