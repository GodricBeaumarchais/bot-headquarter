import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { DiscordOAuthService } from './services/discord-oauth.service';
import { JwtAuthService } from './services/jwt.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [
    DiscordOAuthService,
    JwtAuthService,
    JwtStrategy,
  ],
  exports: [
    DiscordOAuthService,
    JwtAuthService,
    JwtStrategy,
  ],
})
export class AuthModule {} 