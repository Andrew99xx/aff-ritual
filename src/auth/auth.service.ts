import { HttpStatus, Injectable, Res } from "@nestjs/common";
import { Response } from "express";
import { UserDto } from "src/dto/user.dto";
import { UserType } from "src/enums/user.types.enum";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(user: UserDto, usertype: UserType, @Res() res: Response) {
    if (!user.email && !user.mobile) {
      res.status(HttpStatus.BAD_REQUEST).send({
        message: "You should provide at least email or mobile",
        data: null,
      });
      return null;
    }

    if (
      (!user.firstName && !user.lastName) ||
      !user.dob ||
      !user.aadhaarNumber ||
      !user.accNum ||
      !user.accType ||
      !user.address ||
      !user.bankName ||
      !user.ifscCode ||
      !user.panNumber
    ) {
      res.status(HttpStatus.BAD_REQUEST).send({
        message: "Please provide all details",
        data: null,
      });
      return null;
    }

    const isUserPresent = await this.checkUserExistence(
      user.aadhaarNumber,
      user.panNumber,
      user.email,
      user.mobile
    );

    if (isUserPresent) {
      res.status(HttpStatus.CONFLICT).send({
        message: "User already exists",
        data: null,
      });
      return null;
    }

    if (!user.isOTPVerified) {
      res.status(HttpStatus.FORBIDDEN).send({
        message: "User is not verified",
        data: null,
      });
      return null;
    }

    const userProfile = await this.createUserProfile(user);
    return userProfile;
  }

  async checkUserExistence(
    adhaar: string,
    pan: string,
    email?: string,
    mobile?: string
  ) {
    if (!email) email = "";
    if (!mobile) mobile = "";

    const userExists = await this.prisma.personalInfo.findMany({
      where: {
        OR: [
          { email },
          { mobile },
          { Aadhaarnumber: adhaar },
          { pannumber: pan },
        ],
      },
    });

    return userExists.length > 0;
  }

  async createUserProfile(user: UserDto) {
    const personalInfo = await this.prisma.personalInfo.create({
      data: {
        Aadhaarnumber: user.aadhaarNumber,
        firstname: user.firstName,
        lastname: user.lastName,
        email: user.email || "",
        mobile: user.mobile || "",
        address: user.address || "",
        pannumber: user.panNumber,
        dob: user.dob,
      },
    });

    const bankInfo = await this.prisma.bankInfo.create({
      data: {
        accNum: user.accNum,
        bankName: user.bankName,
        ifscCode: user.ifscCode,
        accType: user.accType,
      },
    });

    return {
      personalInfo: personalInfo.id,
      bankInfo: bankInfo.id,
    };
  }
}
