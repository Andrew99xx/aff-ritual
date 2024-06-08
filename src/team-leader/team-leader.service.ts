import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UserDto } from 'src/dto/user.dto';
import { UserType } from 'src/enums/user.types.enum';
import { Response } from 'express';
import { PrismaService } from 'src/prisma.service';
import { format, subMonths } from 'date-fns';

@Injectable()
export class TeamLeaderService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeamStructure(id: number, res: Response) {
    try {
      const teamMembers = await this.prisma.clubMember.findMany({
        where: {
          leaderId: id,
        },
      });
      const teamLeader = await this.prisma.clubLeader.findUnique({
        where: {
          id: id,
        },
      });

      // Extract personalInfoId for the team leader and team members
      const personalInfoIds = [
        teamLeader.personalInfoId,
        ...teamMembers.map((member) => member.personalInfoId),
      ];

      // Fetch personal information details
      const personalInfos = await this.prisma.personalInfo.findMany({
        where: {
          id: {
            in: personalInfoIds,
          },
        },
      });

      // Create a map of personalInfoId to name for easy lookup
      const personalInfoMap = personalInfos.reduce((map, info) => {
        map[info.id] = `${info.firstname} ${info.lastname}`;
        return map;
      }, {});

      // Construct the result object
      const result = {
        name: personalInfoMap[teamLeader.personalInfoId],
        teamMembers: teamMembers.map((member) => ({
          id: member.id,
          name: personalInfoMap[member.personalInfoId],
        })),
      };
      res.status(HttpStatus.OK).send({
        message: 'Team structure fetched successfully',
        data: result,
      });
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Something went wrong',
        data: e,
      });
    }
  }

  async getAllTeamDetails(clubLeaderId: number, res: Response) {
    try {
      // Step 1: Fetch the club members associated with the given club leader ID
      // Get the date six months ago
      const clubMember = await this.prisma.clubMember.findMany({
        where: {
          leaderId: clubLeaderId,
        },
        include: {
          PersonalInfo: true,
        },
      });
    } catch (e) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Something went wrong',
        data: e,
      });
    }
  }
}
