// user.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  mobile: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  dob: Date;

  @ApiProperty()
  aadhaarNumber: string;

  @ApiProperty()
  panNumber: string;

  @ApiProperty()
  bankName: string;

  @ApiProperty()
  accNum: string;

  @ApiProperty()
  accType: string; // saving or current

  @ApiProperty()
  ifscCode: string;

  @ApiProperty()
  transactionProof?: string; // Assuming it's a string for file path or URL

  @ApiProperty()
  referID?: string;

  @ApiProperty()
  courseID?: string;

  @ApiProperty()
  isOTPVerified:boolean;
}
