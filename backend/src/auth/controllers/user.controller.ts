import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return {
      message: 'Profil utilisateur récupéré avec succès',
      user: {
        discordId: user.discordId,
        username: user.username,
        avatar: user.avatar,
        discriminator: user.discriminator,
        role: user.role,
      },
    };
  }

  @Get('me')
  getCurrentUser(@CurrentUser() user: any) {
    return user;
  }
} 