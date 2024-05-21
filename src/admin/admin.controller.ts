import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserDto } from 'src/dto/user.dto';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminservice: AdminService,
    ){}

    @Post('create-team-leader')
    async createTeamLeader(@Body() user: UserDto, @Res() res: Response){
        return await this.adminservice.createTeamLeader(user, res)
    }
}
