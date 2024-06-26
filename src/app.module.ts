import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { AdminModule } from './admin/admin.module';
import { TrainerModule } from './trainer/trainer.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { TeamMemberModule } from './team-member/team-member.module';
import { TeamLeaderModule } from './team-leader/team-leader.module';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OtpModule } from './otp/otp.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [StudentsModule, AdminModule, TrainerModule, SuperAdminModule, TeamMemberModule, TeamLeaderModule, OtpModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, AuthService, PrismaService, JwtService],
  exports:[JwtService]
})
export class AppModule {}
