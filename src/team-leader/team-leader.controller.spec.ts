import { Test, TestingModule } from '@nestjs/testing';
import { TeamLeaderController } from './team-leader.controller';

describe('TeamLeaderController', () => {
  let controller: TeamLeaderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamLeaderController],
    }).compile();

    controller = module.get<TeamLeaderController>(TeamLeaderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
