import { Test, TestingModule } from '@nestjs/testing';
import { TeamLeaderService } from './team-leader.service';

describe('TeamLeaderService', () => {
  let service: TeamLeaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamLeaderService],
    }).compile();

    service = module.get<TeamLeaderService>(TeamLeaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
