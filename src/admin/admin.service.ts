import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { UserDto } from 'src/dto/user.dto';
import { UserType } from 'src/enums/user.types.enum';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
  ) {}
  async createTeamLeader(user: UserDto, res: Response) {
    try {
      const bankAndPersonalInfo = await this.authService.register(
        user,
        UserType.TEAM_LEADER,
        res,
      );
      const clubLeaderDetails = await this.prismaService.clubLeader.create({
        data: {
          bankInfoId: bankAndPersonalInfo.bankInfo,
          personalInfoId: bankAndPersonalInfo.personalInfo,
        },
      });
    } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
            message:"Something went wrong",
            data:error
        })
    }
  }
}
