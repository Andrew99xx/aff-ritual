import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserDto } from 'src/dto/user.dto';
import { TeamLeaderService } from 'src/team-leader/team-leader.service';
import { Response } from 'express';
import { TeamMemberService } from './team-member.service';

@Controller('team-member')
export class TeamMemberController {
constructor(private readonly teammemberService:TeamMemberService){

}
    @Post('register')
    async register(@Body() user: UserDto, @Res() res: Response) {
      return await this.teammemberService.register(user, res);
    }
}
