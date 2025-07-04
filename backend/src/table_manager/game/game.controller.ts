import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtAuthGuard)
  @Get('pending')
  async getPendingGames(@Request() req) {
    const discordId = req.user.discordId;
    return this.gameService.getPendingGames(discordId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':gameId')
  async getGame(@Param('gameId') gameId: string) {
    return this.gameService.getGame(gameId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':gameId/choice')
  async makeChoice(
    @Param('gameId') gameId: string,
    @Body() choice: { choice: 'ROCK' | 'PAPER' | 'SCISSORS' },
    @Request() req
  ) {
    const discordId = req.user.discordId;
    return this.gameService.makeChoice(gameId, discordId, choice.choice);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':gameId/accept')
  async acceptGame(@Param('gameId') gameId: string, @Request() req) {
    const discordId = req.user.discordId;
    return this.gameService.acceptGame(gameId, discordId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':gameId/decline')
  async declineGame(@Param('gameId') gameId: string, @Request() req) {
    const discordId = req.user.discordId;
    return this.gameService.declineGame(gameId, discordId);
  }
} 