import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserDto } from 'src/dto/user.dto';
import { TrainerService } from './trainer.service';
import { Response } from 'express';

@Controller('trainer')
export class TrainerController {
    constructor(private readonly trainerService:TrainerService){

    }
    @Post('register')
  async register(@Body() user: UserDto, @Res() res: Response) {
    return await this.trainerService.register(user, res);
  }
}
