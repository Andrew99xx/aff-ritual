import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';
import { OtpService } from 'src/otp/otp.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers:[AuthService, PrismaService, OtpService, JwtService]
})
export class AuthModule {}
