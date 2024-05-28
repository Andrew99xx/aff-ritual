import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { UserDto } from 'src/dto/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { UserType } from 'src/enums/user.types.enum';
import { PrismaService } from 'src/prisma.service';
import { Response } from 'express';
import { Installment, StudentInstallmentTable } from '@prisma/client';

@Injectable()
export class StudentService {
  constructor(
    private readonly authservice: AuthService,
    private readonly prismaservice: PrismaService,
  ) {}
  
  async register(user: UserDto, @Res() res: Response) {
    try {
      const bankAndPersonalInfo = await this.authservice.register(
        user,
        UserType.STUDENT,
        res,
      );
      if (!bankAndPersonalInfo) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          message: 'Registration failed',
          data: null,
        });
        return;
      }

      const studentDetails = await this.prismaservice.student.create({
        data: {
          bankInfoId: bankAndPersonalInfo.bankInfo,
          personalInfoId: bankAndPersonalInfo.personalInfo,
        },
      });

      const clubLeaderDetails = await this.prismaservice.clubLeader.create({
        data: {
          studentId: studentDetails.id,
          bankInfoId: bankAndPersonalInfo.bankInfo,
          personalInfoId: bankAndPersonalInfo.personalInfo,
        },
      });

      await this.prismaservice.courseStudentAssoc.create({
        data: {
          courseId: +user.courseID,
          studentID: studentDetails.id,
        },
      });
      
      const installments = await this.prismaservice.installment.findMany({
        where: {
          CourseID: +user.courseID,
        },
      });

      await this.createStudentInstallmentTables(
        installments,
        studentDetails.id,
      );
      const course = await this.prismaservice.course.findUnique({
        where: {
          Id: +user.courseID,
        },
      });

      if (!course) {
        return res.status(HttpStatus.NOT_FOUND).send({
          message: 'Course not found',
          data: null,
        });
      }

      const teamLeaderOrMember = await this.checkIfReferIDisTeamLeader(
        +user.referID,
      );

      if (teamLeaderOrMember.leader) {
        await this.createDirectSale(
          +user.referID,
          studentDetails.id,
          course.upfrontFees * 0.4,
        );
        await this.updateCoin(
          +user.referID,
          (course.upfrontFees * 20) / 100,
          UserType.TEAM_LEADER,
          res,
        );
      } else if (teamLeaderOrMember.member) {
        const teamMember = await this.prismaservice.clubMember.findUnique({
          where: {
            id: +user.referID,
          },
        });
        await this.createDirectSale(
          +user.referID,
          studentDetails.id,
          course.upfrontFees * 0.2,
        );
        await this.createPassiveSale(
          teamMember.leaderId,
          studentDetails.id,
          course.upfrontFees * 0.2,
        );
        await this.updateCoin(
          +user.referID,
          (course.upfrontFees * 20) / 100,
          UserType.TEAM_MEMBER,
          res,
        );
      } else {
        return res.status(HttpStatus.NOT_FOUND).send({
          message: 'Refer ID not found',
          data: null,
        });
      }
      return res.status(HttpStatus.CREATED).send({
        message: 'User registered successfully',
        // data: { studentDetails, clubLeaderDetails },
        data: this.authservice.createAccessToken(studentDetails.id,UserType.STUDENT)
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Something went wrong',
        data: error,
      });
    }
  }

  async createDirectSale(entityId: number, studenId: number, amount) {
    await this.prismaservice.directSale.create({
      data: {
        Amount: amount,
        studentID: studenId,
        teamEntityID: entityId,
      },
    });
  }

  async createPassiveSale(entityId: number, studenId: number, amount) {
    await this.prismaservice.passiveSale.create({
      data: {
        Amount: amount,
        studentID: studenId,
        teamLeaderID: entityId,
      },
    });
  }

  async updateCoin(
    entityId: number,
    additionalCoins,
    entityType: UserType,
    res: Response,
  ) {
    if (entityType === UserType.TEAM_LEADER) {
      const clubLeader = await this.prismaservice.clubLeader.findUnique({
        where: { id: entityId },
        select: { coins: true },
      });

      if (!clubLeader) {
        throw new Error(`ClubLeader with ID ${entityId} not found`);
      }

      const newCoins = (clubLeader.coins ?? 0) + additionalCoins;

      // Update the coins field
      await this.prismaservice.clubLeader.update({
        where: { id: entityId },
        data: { coins: newCoins },
      });
    } else if (entityType === UserType.TEAM_MEMBER) {
      const clubMember = await this.prismaservice.clubMember.findUnique({
        where: { id: entityId },
        select: { coins: true },
      });

      if (!clubMember) {
        throw new Error(`ClubMember with ID ${entityId} not found`);
      }

      const newCoins = (clubMember.coins ?? 0) + additionalCoins;

      // Update the coins field
      await this.prismaservice.clubMember.update({
        where: { id: entityId },
        data: { coins: newCoins },
      });
    } else {
      res.status(HttpStatus.NOT_FOUND).send({
        message: 'No valid user type is given',
        data: null,
      });
    }
  }
  async checkIfReferIDisTeamLeader(referID: number) {
    const isLeader = await this.prismaservice.clubLeader.findUnique({
      where: { id: referID },
    });

    const isMember = await this.prismaservice.clubMember.findUnique({
      where: { id: referID },
    });

    return {
      leader: !!isLeader,
      member: !!isMember,
    };
  }

  async createStudentInstallmentTables(
    installments: Installment[],
    studentID: number,
  ): Promise<StudentInstallmentTable[]> {
    const studentInstallmentTables: StudentInstallmentTable[] = [];

    for (const installment of installments) {
      const studentInstallmentTable =
        await this.prismaservice.studentInstallmentTable.create({
          data: {
            // studentID,
            studentID:studentID,
            installmentId: installment.InstallmentID,
            paymentAmt: installment.InstallmentAmount,
            dueDate: installment.dueDate,
          },
        });
      studentInstallmentTables.push(studentInstallmentTable);
    }

    return studentInstallmentTables;
  }
}
