import { Controller, Get, Param } from '@nestjs/common';
import { TeamLeaderService } from './team-leader.service';

@Controller('team-leader')
export class TeamLeaderController {
    constructor(
        private readonly teamleaderService:TeamLeaderService
    ){}
    @Get('team-structure/:id')
    async getTeamStructure(@Param('id')id:number){
        return await this.teamleaderService.getTeamStructure(id)
    }

}
