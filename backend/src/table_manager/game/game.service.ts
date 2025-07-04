import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingGames(discordId: string) {
    return this.prisma.chifumiGame.findMany({
      where: {
        OR: [
          { challengerId: discordId },
          { opponentId: discordId }
        ],
        status: 'PENDING',
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        challenger: true,
        opponent: true,
        rounds: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getGame(gameId: string) {
    const game = await this.prisma.chifumiGame.findUnique({
      where: { gameId },
      include: {
        challenger: true,
        opponent: true,
        winner: true,
        rounds: {
          orderBy: { roundNumber: 'asc' }
        }
      }
    });

    if (!game) {
      throw new NotFoundException('Jeu non trouvé');
    }

    return game;
  }

  async makeChoice(gameId: string, discordId: string, choice: 'ROCK' | 'PAPER' | 'SCISSORS') {
    const game = await this.getGame(gameId);

    if (game.status !== 'ACTIVE') {
      throw new BadRequestException('Jeu non actif');
    }

    // Déterminer la manche actuelle
    const currentRound = game.rounds.find(round => 
      !round.challengerChoice || !round.opponentChoice
    );

    if (!currentRound) {
      throw new BadRequestException('Aucune manche en cours');
    }

    // Vérifier que l'utilisateur participe au jeu
    if (game.challengerId !== discordId && game.opponentId !== discordId) {
      throw new BadRequestException('Vous ne participez pas à ce jeu');
    }

    // Vérifier que l'utilisateur n'a pas déjà fait son choix
    const isChallenger = game.challengerId === discordId;
    if (isChallenger && currentRound.challengerChoice) {
      throw new BadRequestException('Vous avez déjà fait votre choix');
    }
    if (!isChallenger && currentRound.opponentChoice) {
      throw new BadRequestException('Vous avez déjà fait votre choix');
    }

    // Mettre à jour le choix
    const updateData = isChallenger 
      ? { challengerChoice: choice }
      : { opponentChoice: choice };

    const updatedRound = await this.prisma.chifumiRound.update({
      where: { id: currentRound.id },
      data: updateData,
      include: {
        game: {
          include: {
            challenger: true,
            opponent: true,
            rounds: true
          }
        }
      }
    });

    // Vérifier si les deux joueurs ont fait leur choix
    if (updatedRound.challengerChoice && updatedRound.opponentChoice) {
      // Déterminer le gagnant de la manche
      const winner = this.determineRoundWinner(
        updatedRound.challengerChoice,
        updatedRound.opponentChoice
      );

      // Mettre à jour le gagnant de la manche
      await this.prisma.chifumiRound.update({
        where: { id: updatedRound.id },
        data: { winnerId: winner }
      });

      // Vérifier si le jeu est terminé
      await this.checkGameCompletion(gameId);
    }

    return updatedRound;
  }

  async acceptGame(gameId: string, discordId: string) {
    const game = await this.getGame(gameId);

    if (game.opponentId !== discordId) {
      throw new BadRequestException('Seul l\'utilisateur défié peut accepter');
    }

    if (game.status !== 'PENDING') {
      throw new BadRequestException('Jeu déjà traité');
    }

    if (new Date() > game.expiresAt) {
      throw new BadRequestException('Jeu expiré');
    }

    return this.prisma.chifumiGame.update({
      where: { gameId },
      data: { status: 'ACTIVE' },
      include: {
        challenger: true,
        opponent: true,
        rounds: true
      }
    });
  }

  async declineGame(gameId: string, discordId: string) {
    const game = await this.getGame(gameId);

    if (game.opponentId !== discordId) {
      throw new BadRequestException('Seul l\'utilisateur défié peut refuser');
    }

    if (game.status !== 'PENDING') {
      throw new BadRequestException('Jeu déjà traité');
    }

    return this.prisma.chifumiGame.update({
      where: { gameId },
      data: { status: 'CANCELLED' },
      include: {
        challenger: true,
        opponent: true
      }
    });
  }

  private determineRoundWinner(challengerChoice: string, opponentChoice: string): string | null {
    if (challengerChoice === opponentChoice) {
      return null; // Égalité
    }

    const winningCombinations = {
      'ROCK': 'SCISSORS',
      'PAPER': 'ROCK',
      'SCISSORS': 'PAPER'
    };

    if (winningCombinations[challengerChoice as keyof typeof winningCombinations] === opponentChoice) {
      return 'challenger';
    } else {
      return 'opponent';
    }
  }

  private async checkGameCompletion(gameId: string) {
    const game = await this.getGame(gameId);

    // Compter les manches gagnées par chaque joueur
    let challengerWins = 0;
    let opponentWins = 0;

    for (const round of game.rounds) {
      if (round.winnerId === game.challengerId) {
        challengerWins++;
      } else if (round.winnerId === game.opponentId) {
        opponentWins++;
      }
    }

    // Vérifier si un joueur a gagné 2 manches
    if (challengerWins >= 2 || opponentWins >= 2) {
      const winnerId = challengerWins >= 2 ? game.challengerId : game.opponentId;
      await this.finishGame(gameId, winnerId);
    }
  }

  private async finishGame(gameId: string, winnerId: string) {
    const game = await this.getGame(gameId);

    // Mettre à jour le statut du jeu
    await this.prisma.chifumiGame.update({
      where: { gameId },
      data: {
        status: 'FINISHED',
        winnerId
      }
    });

    // Transférer les tokens au gagnant
    const totalPot = game.betAmount * 2;
    await this.prisma.user.update({
      where: { discordId: winnerId },
      data: {
        token: {
          increment: totalPot
        }
      }
    });

    // Retirer les tokens du perdant
    const loserId = winnerId === game.challengerId ? game.opponentId : game.challengerId;
    await this.prisma.user.update({
      where: { discordId: loserId },
      data: {
        token: {
          decrement: game.betAmount
        }
      }
    });

    return game;
  }
} 