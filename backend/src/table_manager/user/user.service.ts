import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserTokenDto, UserListResponseDto, UserProfileDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUsersByTokens(): Promise<UserListResponseDto> {
    const users = await this.prismaService.user.findMany({
      select: {
        username: true,
        token: true,
      },
      orderBy: {
        token: 'desc',
      },
    });

    return {
      users: users.map(user => ({
        username: user.username,
        token: user.token,
      })),
      total: users.length,
    };
  }

  async getUserProfile(discordId: string): Promise<UserProfileDto> {
    const user = await this.prismaService.user.findUnique({
      where: { discordId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            discordId: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return {
      id: user.id,
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
      discriminator: user.discriminator,
      token: user.token,
      streak: user.streak,
      lastDailyDate: user.lastDailyDate,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
} 