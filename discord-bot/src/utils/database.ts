import { PrismaClient } from '../../../generated/prisma';
import { CURRENCY_NAME, STARTING_BALANCE} from './constants';

const prisma = new PrismaClient();

export class DatabaseManager {
    // Créer ou récupérer un utilisateur
    static async getOrCreateUser(discordId: string, username: string) {
        try {
            // Récupérer le rôle par défaut depuis la base de données
            const defaultRole = await prisma.role.findFirst({
                where: { name: 'default' }
            });

            if (!defaultRole) {
                throw new Error('Rôle par défaut non trouvé dans la base de données');
            }

            const user = await prisma.user.upsert({
                where: { discordId },
                update: { username }, // Met à jour le username si l'utilisateur existe
                create: {
                    discordId,
                    username,
                    token: STARTING_BALANCE,
                    streak: 0,
                    role: {
                        connect: {
                            id: defaultRole.id
                        }
                    }
                }
            });
            return user;
        } catch (error) {
            console.error('Erreur lors de la création/récupération de l\'utilisateur:', error);
            throw error;
        }
    }

    // Récupérer un utilisateur par son Discord ID
    static async getUser(discordId: string) {
        try {
            return await prisma.user.findUnique({
                where: { discordId }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            throw error;
        }
    }

    // Mettre à jour le solde de tokens d'un utilisateur
    static async updateTokens(discordId: string, amount: number) {
        try {
            return await prisma.user.update({
                where: { discordId },
                data: { token: amount }
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour des tokens:', error);
            throw error;
        }
    }

    // Ajouter des tokens à un utilisateur
    static async addTokens(discordId: string, amount: number) {
        try {
            const user = await this.getUser(discordId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            
            return await this.updateTokens(discordId, user.token + amount);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de tokens:', error);
            throw error;
        }
    }

    // Retirer des tokens à un utilisateur
    static async removeTokens(discordId: string, amount: number) {
        try {
            const user = await this.getUser(discordId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            
            if (user.token < amount) {
                throw new Error('Solde insuffisant');
            }
            
            return await this.updateTokens(discordId, user.token - amount);
        } catch (error) {
            console.error('Erreur lors du retrait de tokens:', error);
            throw error;
        }
    }

    // Transférer des tokens entre deux utilisateurs
    static async transferTokens(fromDiscordId: string, toDiscordId: string, amount: number) {
        try {
            // Vérifier que les deux utilisateurs existent
            const fromUser = await this.getUser(fromDiscordId);
            const toUser = await this.getUser(toDiscordId);
            
            if (!fromUser || !toUser) {
                throw new Error('Un des utilisateurs n\'existe pas');
            }
            
            if (fromUser.token < amount) {
                throw new Error('Solde insuffisant');
            }
            
            // Transaction pour s'assurer que les deux opérations réussissent
            return await prisma.$transaction(async (tx: any) => {
                const updatedFrom = await tx.user.update({
                    where: { discordId: fromDiscordId },
                    data: { token: fromUser.token - amount }
                });
                
                const updatedTo = await tx.user.update({
                    where: { discordId: toDiscordId },
                    data: { token: toUser.token + amount }
                });
                
                return { from: updatedFrom, to: updatedTo };
            });
        } catch (error) {
            console.error('Erreur lors du transfert:', error);
            throw error;
        }
    }

    // Récupérer le classement des utilisateurs par tokens
    static async getLeaderboard(limit: number = 10) {
        try {
            return await prisma.user.findMany({
                orderBy: { token: 'desc' },
                take: limit,
                select: {
                    discordId: true,
                    username: true,
                    token: true
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du classement:', error);
            throw error;
        }
    }

    // Créer un nouvel utilisateur
    static async createUser(discordId: string, username: string) {
        try {
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await this.getUser(discordId);
            if (existingUser) {
                throw new Error('Utilisateur déjà existant');
            }

            // Récupérer le rôle par défaut depuis la base de données
            const defaultRole = await prisma.role.findFirst({
                where: { name: 'default' }
            });

            if (!defaultRole) {
                throw new Error('Rôle par défaut non trouvé dans la base de données');
            }

            // Créer l'utilisateur avec le rôle par défaut
            const newUser = await prisma.user.create({
                data: {
                    discordId,
                    username,
                    token: STARTING_BALANCE,
                    streak: 0,
                    role: {
                        connect: {
                            id: defaultRole.id
                        }
                    }
                }
            });

            console.log(`✅ Nouvel utilisateur créé: ${username} (${discordId}) avec le rôle ${defaultRole.name}`);
            return newUser;

        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            throw error;
        }
    }

    // Gérer la récompense quotidienne avec streak
    static async handleDailyReward(discordId: string, reward: number) {
        try {
            const user = await this.getUser(discordId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            // Si pas de dernière date, c'est le premier daily
            if (!user.lastDailyDate) {
                const updatedUser = await prisma.user.update({
                    where: { discordId },
                    data: {
                        token: user.token + reward,
                        streak: 1,
                        lastDailyDate: now
                    }
                });

                return {
                    ...updatedUser,
                    bonusMessage: '',
                    totalReward: reward,
                    bonusAmount: 0
                };
            }

            const lastDaily = new Date(user.lastDailyDate);
            const lastDailyDate = new Date(lastDaily.getFullYear(), lastDaily.getMonth(), lastDaily.getDate());
            
            // Si c'est aujourd'hui, déjà récupéré
            if (lastDailyDate.getTime() === today.getTime()) {
                throw new Error('Récompense quotidienne déjà récupérée aujourd\'hui');
            }

            // Calculer la différence en jours
            const diffTime = today.getTime() - lastDailyDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let newStreak: number;
            
            if (diffDays === 1) {
                // Hier : continuer le streak
                newStreak = user.streak + 1;
            } else {
                // Plus d'un jour : reset le streak
                newStreak = 1;
            }

            // Calculer le bonus de streak (streak divisé par 5, seulement les jours multiples de 5)
            let totalReward = reward;
            let bonusMessage = '';
            let bonusAmount = 0;
            
            if (newStreak % 5 === 0) {
                bonusAmount = Math.floor(newStreak / 5); // 1 token par palier de 5
                totalReward += bonusAmount;
                bonusMessage = ` + ${bonusAmount} ${CURRENCY_NAME} de bonus streak !`;
            }

            // Mettre à jour l'utilisateur
            const updatedUser = await prisma.user.update({
                where: { discordId },
                data: {
                    token: user.token + totalReward,
                    streak: newStreak,
                    lastDailyDate: now
                }
            });

            // Ajouter le message de bonus à l'objet retourné
            return {
                ...updatedUser,
                bonusMessage,
                totalReward,
                bonusAmount
            };

        } catch (error) {
            console.error('Erreur lors du traitement de la récompense quotidienne:', error);
            throw error;
        }
    }

    // Gérer les réactions OOTD
    static async handleOOTDReaction(messageId: string, authorId: string, reactorId: string) {
        try {
            // Vérifier que l'auteur et le réacteur ont des comptes
            const author = await this.getUser(authorId);
            const reactor = await this.getUser(reactorId);
            
            if (!author) {
                throw new Error('Auteur du message OOTD non trouvé');
            }
            
            if (!reactor) {
                throw new Error('Utilisateur qui réagit non trouvé');
            }

            // Empêcher l'auteur de réagir à son propre message
            if (authorId === reactorId) {
                throw new Error('Vous ne pouvez pas réagir à votre propre message OOTD');
            }

            // Vérifier si cette réaction existe déjà
            const existingReaction = await prisma.oOTDReaction.findUnique({
                where: {
                    messageId_reactorId: {
                        messageId,
                        reactorId
                    }
                }
            });

            if (existingReaction) {
                throw new Error('Vous avez déjà réagi à ce message OOTD');
            }

            // Créer la réaction
            await prisma.oOTDReaction.create({
                data: {
                    messageId,
                    authorId,
                    reactorId
                }
            });

            // Compter le nombre total de réactions uniques pour ce message
            const reactionCount = await prisma.oOTDReaction.count({
                where: { messageId }
            });

            // Donner 1 token par réaction à l'auteur
            const updatedAuthor = await this.addTokens(authorId, 1);

            return {
                reactionCount,
                authorTokens: updatedAuthor.token,
                authorUsername: author.username,
                reactorUsername: reactor.username
            };

        } catch (error) {
            console.error('Erreur lors du traitement de la réaction OOTD:', error);
            throw error;
        }
    }

    // Supprimer une réaction OOTD
    static async removeOOTDReaction(messageId: string, authorId: string, reactorId: string) {
        try {
            // Vérifier que l'auteur et le réacteur ont des comptes
            const author = await this.getUser(authorId);
            const reactor = await this.getUser(reactorId);
            
            if (!author) {
                throw new Error('Auteur du message OOTD non trouvé');
            }
            
            if (!reactor) {
                throw new Error('Utilisateur qui retire sa réaction non trouvé');
            }

            // Vérifier si cette réaction existe
            const existingReaction = await prisma.oOTDReaction.findUnique({
                where: {
                    messageId_reactorId: {
                        messageId,
                        reactorId
                    }
                }
            });

            if (!existingReaction) {
                throw new Error('Cette réaction n\'existe pas');
            }

            // Supprimer la réaction
            await prisma.oOTDReaction.delete({
                where: {
                    messageId_reactorId: {
                        messageId,
                        reactorId
                    }
                }
            });

            // Compter le nombre total de réactions uniques pour ce message
            const reactionCount = await prisma.oOTDReaction.count({
                where: { messageId }
            });

            return {
                reactionCount,
                authorUsername: author.username,
                reactorUsername: reactor.username
            };

        } catch (error) {
            console.error('Erreur lors de la suppression de la réaction OOTD:', error);
            throw error;
        }
    }

    // Récupérer les statistiques OOTD d'un utilisateur
    static async getOOTDStats(discordId: string) {
        try {
            const user = await this.getUser(discordId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            // Compter les messages OOTD créés
            const messagesCreated = await prisma.oOTDReaction.count({
                where: { authorId: discordId }
            });

            // Compter les réactions données
            const reactionsGiven = await prisma.oOTDReaction.count({
                where: { reactorId: discordId }
            });

            return {
                messagesCreated,
                reactionsGiven,
                totalEarned: messagesCreated // 1 token par réaction reçue
            };

        } catch (error) {
            console.error('Erreur lors de la récupération des stats OOTD:', error);
            throw error;
        }
    }

    // Vérifier si un utilisateur est admin
    static async isAdmin(discordId: string): Promise<boolean> {
        try {
            const user = await prisma.user.findUnique({
                where: { discordId },
                include: { role: true }
            });

            return user?.role.name === 'admin';
        } catch (error) {
            console.error('Erreur lors de la vérification du rôle admin:', error);
            return false;
        }
    }

    // Générer des tokens pour un utilisateur (admin seulement)
    static async generateTokens(discordId: string, amount: number) {
        try {
            const user = await this.getUser(discordId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            const updatedUser = await prisma.user.update({
                where: { discordId },
                data: {
                    token: user.token + amount
                }
            });

            return updatedUser;
        } catch (error) {
            console.error('Erreur lors de la génération de tokens:', error);
            throw error;
        }
    }

    // Échanger des tokens entre deux utilisateurs (admin seulement)
    static async exchangeTokens(fromDiscordId: string, toDiscordId: string, amount: number) {
        try {
            const fromUser = await this.getUser(fromDiscordId);
            const toUser = await this.getUser(toDiscordId);

            if (!fromUser) {
                throw new Error('Utilisateur source non trouvé');
            }

            if (!toUser) {
                throw new Error('Utilisateur destination non trouvé');
            }

            if (fromUser.token < amount) {
                throw new Error('Solde insuffisant pour l\'utilisateur source');
            }

            // Transaction pour s'assurer que les deux opérations réussissent
            const result = await prisma.$transaction([
                prisma.user.update({
                    where: { discordId: fromDiscordId },
                    data: { token: fromUser.token - amount }
                }),
                prisma.user.update({
                    where: { discordId: toDiscordId },
                    data: { token: toUser.token + amount }
                })
            ]);

            return {
                fromUser: result[0],
                toUser: result[1]
            };
        } catch (error) {
            console.error('Erreur lors de l\'échange de tokens:', error);
            throw error;
        }
    }

    // Initialiser les rôles dans la base de données
    static async initializeRoles() {
        try {
            // Vérifier si les rôles existent déjà
            const existingDefaultRole = await prisma.role.findFirst({
                where: { name: 'default' }
            });

            const existingAdminRole = await prisma.role.findFirst({
                where: { name: 'admin' }
            });

            // Créer le rôle par défaut s'il n'existe pas
            if (!existingDefaultRole) {
                const defaultRoleId = process.env.DEFAULT_ROLE_ID || 'default-role-id';
                await prisma.role.create({
                    data: {
                        name: 'default',
                        discordId: defaultRoleId
                    }
                });
                console.log('✅ Rôle par défaut créé');
            }

            // Créer le rôle admin s'il n'existe pas
            if (!existingAdminRole) {
                const adminRoleId = process.env.ADMIN_ROLE_ID || 'admin-role-id';
                await prisma.role.create({
                    data: {
                        name: 'admin',
                        discordId: adminRoleId
                    }
                });
                console.log('✅ Rôle admin créé');
            }

            console.log('✅ Rôles initialisés avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des rôles:', error);
            throw error;
        }
    }

    // Méthodes pour le système de chifumi
    static async createChifumiGame(challengerId: string, opponentId: string, betAmount: number, totalRounds: number = 3) {
        try {
            // Générer un ID court unique pour le jeu
            const gameId = this.generateGameId();
            
            // Créer la date d'expiration (24h)
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            // Créer les manches dynamiquement
            const rounds = [];
            for (let i = 1; i <= totalRounds; i++) {
                rounds.push({ roundNumber: i });
            }

            const game = await prisma.chifumiGame.create({
                data: {
                    gameId,
                    challengerId,
                    opponentId,
                    betAmount,
                    totalRounds,
                    expiresAt,
                    rounds: {
                        create: rounds
                    }
                },
                include: {
                    challenger: true,
                    opponent: true,
                    rounds: true
                }
            });

            console.log(`✅ Nouveau jeu chifumi créé: ${gameId} entre ${game.challenger.username} et ${game.opponent.username}`);
            return game;

        } catch (error) {
            console.error('Erreur lors de la création du jeu chifumi:', error);
            throw error;
        }
    }

    static generateGameId(): string {
        // Générer un ID court de 6 caractères
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Récupérer un jeu de chifumi par son ID
    static async getChifumiGame(gameId: string) {
        try {
            return await prisma.chifumiGame.findUnique({
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
        } catch (error) {
            console.error('Erreur lors de la récupération du jeu chifumi:', error);
            throw error;
        }
    }

    // Activer un jeu de chifumi
    static async activateChifumiGame(gameId: string) {
        try {
            return await prisma.chifumiGame.update({
                where: { gameId },
                data: { status: 'ACTIVE' },
                include: {
                    challenger: true,
                    opponent: true,
                    rounds: true
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'activation du jeu chifumi:', error);
            throw error;
        }
    }

    // Annuler un jeu de chifumi
    static async cancelChifumiGame(gameId: string) {
        try {
            return await prisma.chifumiGame.update({
                where: { gameId },
                data: { status: 'CANCELLED' },
                include: {
                    challenger: true,
                    opponent: true
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'annulation du jeu chifumi:', error);
            throw error;
        }
    }

    // Faire un choix dans une manche
    static async makeChifumiChoice(gameId: string, userId: string, choice: 'ROCK' | 'PAPER' | 'SCISSORS', roundNumber: number) {
        try {
            const game = await this.getChifumiGame(gameId);
            if (!game) {
                throw new Error('Jeu non trouvé');
            }

            if (game.status !== 'ACTIVE') {
                throw new Error('Jeu non actif');
            }

            // Déterminer si c'est le challenger ou l'opposant
            const isChallenger = game.challengerId === userId;
            const isOpponent = game.opponentId === userId;

            if (!isChallenger && !isOpponent) {
                throw new Error('Vous ne participez pas à ce jeu');
            }

            // Mettre à jour le choix dans la manche
            const updateData = isChallenger 
                ? { challengerChoice: choice }
                : { opponentChoice: choice };

            const updatedRound = await prisma.chifumiRound.update({
                where: {
                    gameId_roundNumber: {
                        gameId: game.id,
                        roundNumber
                    }
                },
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
                    updatedRound.opponentChoice,
                    game.challengerId,
                    game.opponentId
                );

                // Mettre à jour le gagnant de la manche
                await prisma.chifumiRound.update({
                    where: { id: updatedRound.id },
                    data: { winnerId: winner }
                });

                // Annoncer le résultat de la manche
                await this.announceRoundResult(gameId, updatedRound.roundNumber, winner);

                // Si c'est une égalité, créer une nouvelle manche
                if (winner === null) {
                    await this.createTiebreakerRound(gameId);
                } else {
                    // Vérifier si le jeu est terminé
                    await this.checkGameCompletion(gameId);
                }
            }

            return updatedRound;
        } catch (error) {
            console.error('Erreur lors du choix chifumi:', error);
            throw error;
        }
    }

    // Déterminer le gagnant d'une manche
    private static determineRoundWinner(challengerChoice: string, opponentChoice: string, challengerId: string, opponentId: string): string | null {
        if (challengerChoice === opponentChoice) {
            return null; // Égalité
        }

        const winningCombinations = {
            'ROCK': 'SCISSORS',
            'PAPER': 'ROCK',
            'SCISSORS': 'PAPER'
        };

        if (winningCombinations[challengerChoice as keyof typeof winningCombinations] === opponentChoice) {
            return challengerId;
        } else {
            return opponentId;
        }
    }

    // Vérifier si le jeu est terminé
    private static async checkGameCompletion(gameId: string) {
        try {
            const game = await this.getChifumiGame(gameId);
            if (!game) return;

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

            // Calculer le nombre de victoires nécessaires (majorité)
            const requiredWins = Math.ceil(game.totalRounds / 2);

            // Vérifier si un joueur a gagné suffisamment de manches
            if (challengerWins >= requiredWins || opponentWins >= requiredWins) {
                const winnerId = challengerWins >= requiredWins ? game.challengerId : game.opponentId;
                await this.finishChifumiGame(gameId, winnerId);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de fin de jeu:', error);
        }
    }

    // Terminer un jeu de chifumi
    static async finishChifumiGame(gameId: string, winnerId: string) {
        try {
            const game = await this.getChifumiGame(gameId);
            if (!game) return;

            // Mettre à jour le statut du jeu
            await prisma.chifumiGame.update({
                where: { gameId },
                data: {
                    status: 'FINISHED',
                    winnerId
                }
            });

            // Transférer les tokens au gagnant
            const totalPot = game.betAmount * 2; // Mise de chaque joueur
            await this.addTokens(winnerId, totalPot);

            // Retirer les tokens des perdants
            const loserId = winnerId === game.challengerId ? game.opponentId : game.challengerId;
            await this.removeTokens(loserId, game.betAmount);

            // Envoyer un message dans le canal principal
            await this.announceGameResult(game, winnerId);

            return game;
        } catch (error) {
            console.error('Erreur lors de la fin du jeu chifumi:', error);
            throw error;
        }
    }

    // Annoncer le résultat d'une manche
    private static async announceRoundResult(gameId: string, roundNumber: number, winnerId: string | null) {
        try {
            const game = await this.getChifumiGame(gameId);
            if (!game) return;

            const challengerChoice = game.rounds.find(r => r.roundNumber === roundNumber)?.challengerChoice;
            const opponentChoice = game.rounds.find(r => r.roundNumber === roundNumber)?.opponentChoice;

            if (!challengerChoice || !opponentChoice) return;

            const choiceEmojis = {
                'ROCK': '🪨',
                'PAPER': '📄',
                'SCISSORS': '✂️'
            };

            const challengerName = game.challenger.username;
            const opponentName = game.opponent.username;

            let resultMessage = '';
            let isTie = false;
            
            if (winnerId === null) {
                isTie = true;
                resultMessage = `🤝 **Manche ${roundNumber} - Égalité !**\n${challengerName} ${choiceEmojis[challengerChoice]} vs ${choiceEmojis[opponentChoice]} ${opponentName}`;
            } else {
                const winner = winnerId === game.challengerId ? challengerName : opponentName;
                const loser = winnerId === game.challengerId ? opponentName : challengerName;
                const winnerChoice = winnerId === game.challengerId ? challengerChoice : opponentChoice;
                const loserChoice = winnerId === game.challengerId ? opponentChoice : challengerChoice;
                
                resultMessage = `🎯 **Manche ${roundNumber} - ${winner} gagne !**\n${winner} ${choiceEmojis[winnerChoice]} bat ${choiceEmojis[loserChoice]} ${loser}`;
            }

            // Calculer le score actuel
            let challengerWins = 0;
            let opponentWins = 0;
            
            game.rounds.forEach(round => {
                if (round.winnerId === game.challengerId) {
                    challengerWins++;
                } else if (round.winnerId === game.opponentId) {
                    opponentWins++;
                }
            });

            resultMessage += `\n\n📊 **Score actuel :** ${challengerName} ${challengerWins} - ${opponentWins} ${opponentName}`;

            // Ajouter un message spécial pour les égalités
            if (isTie) {
                resultMessage += `\n\n🔄 **Une manche de départage va être créée !**`;
            }

            // Envoyer le message dans le canal principal
            await this.sendGameMessage(gameId, resultMessage);

        } catch (error) {
            console.error('Erreur lors de l\'annonce du résultat de manche:', error);
        }
    }

    // Créer une manche de départage en cas d'égalité
    private static async createTiebreakerRound(gameId: string) {
        try {
            const game = await this.getChifumiGame(gameId);
            if (!game) return;

            // Trouver le numéro de manche le plus élevé
            const maxRoundNumber = Math.max(...game.rounds.map(round => round.roundNumber));
            const newRoundNumber = maxRoundNumber + 1;

            // Créer une nouvelle manche
            await prisma.chifumiRound.create({
                data: {
                    gameId: game.id,
                    roundNumber: newRoundNumber
                }
            });

            // Envoyer un message d'annonce de la manche de départage
            const tiebreakerMessage = `🤝 **Égalité ! Manche de départage ${newRoundNumber}**\n\nLes joueurs doivent rejouer pour départager cette manche.`;
            await this.sendGameMessage(gameId, tiebreakerMessage);

        } catch (error) {
            console.error('Erreur lors de la création de la manche de départage:', error);
        }
    }

    // Envoyer un message de jeu dans le canal principal
    private static async sendGameMessage(gameId: string, message: string) {
        try {
            const mainChannelId = process.env.BOT_MAIN_CHANNEL;
            if (!mainChannelId) {
                console.log('❌ BOT_MAIN_CHANNEL non configuré');
                return;
            }

            // Note: Cette fonction nécessiterait l'accès au client Discord
            // Pour l'instant, on log le message avec un formatage amélioré
            console.log(`\n🎮 [Jeu ${gameId}] ${message}\n`);

        } catch (error) {
            console.error('Erreur lors de l\'envoi du message de jeu:', error);
        }
    }

    // Annoncer le résultat du jeu
    private static async announceGameResult(game: any, winnerId: string) {
        try {
            const winner = winnerId === game.challengerId ? game.challenger : game.opponent;
            const loser = winnerId === game.challengerId ? game.opponent : game.challenger;
            const totalWinnings = game.betAmount * 2;

            const resultMessage = `🏆 **Victoire au Chifumi !**\n\n🎉 ${winner.username} a remporté la partie contre ${loser.username} !\n\n💰 **Gains :** ${winner.username} remporte **${totalWinnings} ${CURRENCY_NAME}** !\n🎮 **Manches jouées :** ${game.totalRounds} manches\n\n📊 **Score final :** ${winner.username} vs ${loser.username}`;

            // Envoyer le message dans le canal principal
            await this.sendGameMessage(game.gameId, resultMessage);

        } catch (error) {
            console.error('Erreur lors de l\'annonce du résultat:', error);
        }
    }
}

export default prisma; 
