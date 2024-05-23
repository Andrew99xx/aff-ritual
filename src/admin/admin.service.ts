import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { CourseDto } from 'src/dto/course.dto';
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
        message: 'Something went wrong',
        data: error,
      });
    }
  }

  async createCourse(course: CourseDto, res: Response) {
    try {
      const courseEntity = await this.prismaService.$transaction(async (prisma) => {
        // Create the course
        const createdCourse = await prisma.course.create({
          data: {
            courseImg: course.courseImg,
            courseName: course.courseName,
            price: course.price,
            startDate: course.startDate,
            endDate: course.endDate,
            upfrontFees: course.upfrontFees,
            trainerID: course.trainerID,
          },
        });

        // Create installments
        const installmentPromises = course.installments.map(installment => prisma.installment.create({
          data: {
            CourseID: createdCourse.Id,
            InstallmentAmount: installment.installmentPrice,
            InstallmentNumber: installment.installmentNumber,
            dueDate: installment.installmentDate,
          },
        }));

        // Create modules
        const modulePromises = course.modules.map(module => prisma.module.create({
          data: {
            courseId: createdCourse.Id,
            Modulename: module.moduleName,
            moduleContent: module.moduleContent,
            moduleDate: module.moduleDate,
          },
        }));

        // Await all promises in parallel
        await Promise.all([...installmentPromises, ...modulePromises]);

        return createdCourse;
      });

      return res.status(201).json({ course: courseEntity });
    } catch (error) {
      console.error('Error creating course:', error);
      return res.status(500).json({ message: 'Internal Server Error', error });
    }
  }
}
