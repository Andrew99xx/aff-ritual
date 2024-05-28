import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UserDto } from 'src/dto/user.dto';
import { UserType } from 'src/enums/user.types.enum';
import { Response } from 'express';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TeamLeaderService {
    async getTeamStructure(id: number) {
        
    }
    
}
