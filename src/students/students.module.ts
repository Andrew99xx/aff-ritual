import { Module } from '@nestjs/common';
import { StudentService } from './students.service';
import { StudentsController } from './students.controller';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [StudentService, AuthService, PrismaService, JwtService],
  controllers: [StudentsController]
})
export class StudentsModule {}
