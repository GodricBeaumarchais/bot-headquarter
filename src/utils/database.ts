import { PrismaClient } from '../../generated/prisma';
import { CURRENCY_NAME } from './constants';

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
                    token: 0,
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
                    token: 0,
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
}

export default prisma; 