import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { LoginOTPDTO, OTPDto, verifyOtpDTO } from 'src/dto/auth.dto';
import { UserDto } from 'src/dto/user.dto';
import { OTPSOURCE } from 'src/enums/otp.types.enums';
import { UserType } from 'src/enums/user.types.enum';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(source: string) {
    return await this.prisma.personalInfo.findFirst({
      where: {
        OR: [{ email: source }, { mobile: source }],
      },
    });
  }
  async register(user: UserDto, usertype: UserType, @Res() res: Response) {
    if (!user.email && !user.mobile) {
      res.status(HttpStatus.BAD_REQUEST).send({
        message: 'You should provide at least email or mobile',
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
        message: 'Please provide all details',
        data: null,
      });
      return null;
    }

    const isUserPresent = await this.checkUserExistence(
      user.aadhaarNumber,
      user.panNumber,
      user.email,
      user.mobile,
    );

    if (isUserPresent) {
      res.status(HttpStatus.CONFLICT).send({
        message: 'User already exists',
        data: null,
      });
      return null;
    }

    if (!user.isOTPVerified) {
      res.status(HttpStatus.FORBIDDEN).send({
        message: 'User is not verified',
        data: null,
      });
      return null;
    }

    const userProfile = await this.createUserProfile(user);
    return userProfile;
  }

  async login(body: LoginOTPDTO, res: Response) {
    const personalInfo = await this.findUser(body.source, res);
    const verifyOTP: verifyOtpDTO = {
      otp: body.otp,
      source: body.source,
    };
    let user;
    user = await this.prisma.student.findFirst({
      where: {
        personalInfoId: personalInfo.id,
      },
    });
    let userType = UserType.STUDENT;
    if (!user) {
      user = await this.prisma.clubLeader.findFirst({
        where: {
          personalInfoId: personalInfo.id,
        },
      });
      userType = UserType.TEAM_LEADER;
    }

    if (!user) {
      user = await this.prisma.clubMember.findFirst({
        where: {
          personalInfoId: personalInfo.id,
        },
      });
      userType = UserType.TEAM_MEMBER;
    }

    if (!user) {
      user = await this.prisma.trainer.findFirst({
        where: {
          personalInfoId: personalInfo.id,
        },
      });
      userType = UserType.TRAINER;
    }

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).send({
        message: 'No User Found',
        data: null,
      });
    }
    const isOTPValid = await this.verifyOtp(body);
    console.log('isOTPValid', isOTPValid);
    if (!isOTPValid.verified) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        message: 'Please provide valid OTP',
        data: null,
      });
    }
    // this.createAccessToken(user.id,userType)
    return res.status(HttpStatus.OK).send({
      message:"Logged in successfully",
      data:this.createAccessToken(user.id,userType)
    })
  }

  //-----------------------------xx-------------------------------

  async createAccessToken(userid: number, userType: UserType) {
    return this.jwtService.sign({ userid, userType });
  }
  async checkUserExistence(
    adhaar: string,
    pan: string,
    email?: string,
    mobile?: string,
  ) {
    if (!email) email = '';
    if (!mobile) mobile = '';

    const userExists = await this.prisma.personalInfo.findMany({
      where: {
        OR: [
          { email: email },
          { mobile: mobile },
          { Aadhaarnumber: adhaar },
          { pannumber: pan },
        ],
      },
    });

    return userExists.length > 0;
  }

  async findUser(source: string, res: Response) {
    const user = await this.prisma.personalInfo.findFirst({
      where: {
        OR: [{ email: source }, { mobile: source }],
      },
    });

    if (!user) {
      res.status(HttpStatus.NOT_FOUND).json({
        message: 'User not found',
        data: null,
      });
      return null;
    }
    return user;
  }

  async createUserProfile(user: UserDto) {
    const personalInfo = await this.prisma.personalInfo.create({
      data: {
        Aadhaarnumber: user.aadhaarNumber,
        firstname: user.firstName,
        lastname: user.lastName,
        email: user.email || '',
        mobile: user.mobile || '',
        address: user.address || '',
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

  async getOtp(otp: OTPDto) {
    if (!otp.email && !otp.mobile) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Please provide email or mobile to get otp',
      };
    }
    let generatedOTP;
    if (otp.email) {
      generatedOTP = await this.generateOtp(otp.email, OTPSOURCE.EMAIL);
      await this.sendOtpToEmail(otp.email, generatedOTP);
    }
    if (otp.mobile) {
      generatedOTP = await this.generateOtp(otp.mobile, OTPSOURCE.MOBILE);

      await this.sendOtpToMobile(otp.mobile, generatedOTP);
    }
    return {
      status: HttpStatus.OK,
      message: 'OTP has been generated',
      data: generatedOTP,
    };
  }

  async generateOtp(source: string, sourceType: OTPSOURCE): Promise<number> {
    console.log('source', source);
    const otp = Math.floor(1000 + Math.random() * 9000);
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 20);
    await this.prisma.otp.create({
      data: {
        otp: otp,
        isVerified: false,
        source: source,
        souretype: sourceType,
        expiredAt: expiredAt,
      },
    });

    return otp;
  }

  async verifyOtp(otp: verifyOtpDTO) {
    if (!otp.source) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Please provide valid source',
      };
    }
    if (!otp.otp) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Please provide OTP',
      };
    }
    const unverifiedOtps = await this.prisma.otp.findMany({
      where: {
        otp: +otp.otp,
        source: otp.source,
        isVerified: false,
        expiredAt: {
          gte: new Date(), // Select OTPs where expiredAt is greater than or equal to the current time
        },
      },
    });
    // console.log("unverifiedOtps", unverifiedOtps);

    if (unverifiedOtps.length > 0) {
      await this.prisma.otp.update({
        where: { uid: unverifiedOtps[0].uid }, // Use appropriate unique identifier
        data: { isVerified: true },
      });
      console.log('true');
      return { verified: true };
    }
    console.log('false');

    return { verified: false };
  }

  async sendOtpToEmail(email, otp) {}

  async sendOtpToMobile(mobile, otp) {}
}
