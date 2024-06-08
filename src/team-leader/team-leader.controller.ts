import { Controller, Get, Param, Res } from '@nestjs/common';
import { TeamLeaderService } from './team-leader.service';
import { Response } from 'express';

@Controller('team-leader')
export class TeamLeaderController {
    constructor(
        private readonly teamleaderService:TeamLeaderService
    ){}
    @Get('team-structure/:id')
    async getTeamStructure(@Param('id')id:number, @Res() res:Response){
        return await this.teamleaderService.getTeamStructure(id,res)
    }

    @Get('team-details/:id')
    async getTeamDetails(@Param("id")id:number, @Res() res: Response){
        return await this.teamleaderService.getAllTeamDetails(id,res)
    }

}
