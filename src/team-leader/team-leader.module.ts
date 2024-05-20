import { Module } from '@nestjs/common';
import { TeamLeaderService } from './team-leader.service';
import { TeamLeaderController } from './team-leader.controller';

@Module({
  providers: [TeamLeaderService],
  controllers: [TeamLeaderController]
})
export class TeamLeaderModule {}
