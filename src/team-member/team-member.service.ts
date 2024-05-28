import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { UserDto } from 'src/dto/user.dto';
import { UserType } from 'src/enums/user.types.enum';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TeamMemberService {
    constructor(private readonly authService:AuthService, 
        private readonly prismaservice:PrismaService){

    }
    
    async register(user: UserDto, res: Response) {
        try{
            const bankAndPersonalInfo= await this.authService.register(
                user,
                UserType.TRAINER,
                res
            )
            if (!bankAndPersonalInfo) {
                 res.status(HttpStatus.BAD_REQUEST).send({
                  message: 'Registration failed',
                  data: null,
                });
                return null;
            }

            const clubMember = await this.prismaservice.clubMember.create({
                data:{
                    bankInfoId:bankAndPersonalInfo.bankInfo,
                    personalInfoId:bankAndPersonalInfo.personalInfo
                }
            })

            return res.send(HttpStatus.CREATED).send({
                message: "User registered successfully",
                data: this.authService.createAccessToken(clubMember.id, UserType.TEAM_MEMBER)
            })


        }catch(e){
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                message:"Something went wrong",
                data:e
            })
        }
    }
}
