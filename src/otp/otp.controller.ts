import { Body, Controller, Post } from '@nestjs/common';
import { OTPDto, verifyOtpDTO } from 'src/dto/auth.dto';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
    constructor(private otpService: OtpService){

    }

    @Post("get-otp")
    async getOtp(@Body()otp:OTPDto){
        // console.log("da fak")
        return this.otpService.getOtp(otp)
    }
    
    @Post("verify-otp")
    async verifyOtp(@Body() otp:verifyOtpDTO){
        return this.otpService.verifyOtp(otp)
    }
}
