import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserDto } from 'src/dto/user.dto';
import { AdminService } from './admin.service';
import { CourseDto } from 'src/dto/course.dto';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminservice: AdminService,
    ){}

    @Post('create-team-leader')
    async createTeamLeader(@Body() user: UserDto, @Res() res: Response){
        return await this.adminservice.createTeamLeader(user, res)
    }

    @Post('create-course')
    async createCourse(@Body()course:CourseDto, @Res() res:Response){
        return await this.adminservice.createCourse(course, res)
    }
}
