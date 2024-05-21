import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { StudentService } from './students.service';
import { UserDto } from 'src/dto/user.dto';
import { Response } from 'express';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentService: StudentService) {}

  @Post('register')
  async register(@Body() user: UserDto, @Res() res: Response) {
    return await this.studentService.register(user, res);
  }


}
