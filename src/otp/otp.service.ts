import { HttpStatus, Injectable } from '@nestjs/common';
import { OTPDto, verifyOtpDTO } from 'src/dto/auth.dto';
import { OTPSOURCE } from 'src/enums/otp.types.enums';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class OtpService {
constructor(
    private readonly prisma:PrismaService
    ){
    
}
    async getOtp(otp:OTPDto){
        if(!otp.email && !otp.mobile){
            return { status:HttpStatus.BAD_REQUEST, message:"Please provide email or mobile to get otp"}
        }
        let generatedOTP
        if(otp.email){
            generatedOTP=await this.generateOtp(otp.email, OTPSOURCE.EMAIL)
            await this.sendOtpToEmail(otp.email,generatedOTP)
        }
        if(otp.mobile){
            generatedOTP=await this.generateOtp(otp.mobile, OTPSOURCE.MOBILE)

            await this.sendOtpToMobile(otp.mobile, generatedOTP)
        }
        return { status:HttpStatus.OK, message:"OTP has been generated", data:generatedOTP}
    }

    async generateOtp(source:string, sourceType:OTPSOURCE):Promise<number>{
        console.log("source", source)
        const otp= Math.floor(1000 + Math.random() * 9000);
        const expiredAt = new Date();
        expiredAt.setMinutes(expiredAt.getMinutes() + 20);
        await this.prisma.otp.create({data:{
            otp:otp,
            isVerified:false,
            source:source,
            souretype:sourceType,
            expiredAt:expiredAt
        }})
        
        return otp
    }

    async verifyOtp(otp:verifyOtpDTO){
        if(!otp.source){
            return{
                status:HttpStatus.BAD_REQUEST,
                message:"Please provide valid source"
            }
        }
        if(!otp.otp){
            return{
                status:HttpStatus.BAD_REQUEST,
                message:"Please provide OTP"
            }
        }
        const unverifiedOtps = await this.prisma.otp.findMany({
            where: {
                otp: +otp.otp,
                source:otp.source,
                isVerified: false,
                expiredAt: {
                    gte: new Date() // Select OTPs where expiredAt is greater than or equal to the current time
                }
            }
        });
    // console.log("unverifiedOtps", unverifiedOtps);
    
        if (unverifiedOtps.length > 0) {
            await this.prisma.otp.update({
                where: { uid: unverifiedOtps[0].uid }, // Use appropriate unique identifier
                data: { isVerified: true }
            });
            console.log("true")
            return {verified:true}; 
        }
        console.log("false")

        return  {verified:false} 
    }

    async sendOtpToEmail(email,otp){

    }

    async sendOtpToMobile(mobile, otp){

    }
}
