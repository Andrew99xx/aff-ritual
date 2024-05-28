import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { LoginOTPDTO, verifyOtpDTO } from 'src/dto/auth.dto';
import { OtpService } from 'src/otp/otp.service';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService:AuthService,
        private readonly otpService:OtpService
        ){

    }

    @Post("/login")
    async login(@Body() body: LoginOTPDTO, @Res() res:Response) {
        return this.authService.login(body, res);
      }
}
