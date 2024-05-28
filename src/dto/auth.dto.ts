import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator";
// import { IsNumber, IsString } from "class-validator";

export class LoginOTPDTO {
    @ApiProperty({ example: '123456' })
    otp: string;
  
    @ApiProperty({ example: 'email@email.mail' })
    source: string;
  }

  export class verifyOtpDTO {
    @ApiProperty({ example: 'email@email.com' })
    // @IsString()
    source: string;

    @ApiProperty({ example: 123456 })
    // @IsString()
    otp: string;
}

export class OTPDto {
    @ApiProperty({ example: 'example@example.com' })
    // @IsString()
    email?: string;

    @ApiProperty({ example: '1234567890' })
    // @IsString()
    mobile?: string;
}

