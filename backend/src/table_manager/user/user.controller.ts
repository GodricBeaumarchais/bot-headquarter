import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { UserListResponseDto, UserProfileDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('leaderboard')
  async getUsersByTokens(): Promise<UserListResponseDto> {
    return this.userService.getUsersByTokens();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUserProfile(@Request() req): Promise<UserProfileDto> {
    const discordId = req.user.discordId;
    return this.userService.getUserProfile(discordId);
  }
} 