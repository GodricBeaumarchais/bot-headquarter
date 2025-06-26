import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export interface CommandLogData {
    userId: string;
    commandName: string;
    commandType: 'slash' | 'prefix';
    channelId: string;
    guildId?: string;
    args?: any;
    success: boolean;
    error?: string;
    executionTime?: number;
}

export interface ReactionLogData {
    userId: string;
    messageId: string;
    channelId: string;
    guildId?: string;
    emoji: string;
    action: 'add' | 'remove';
    isOOTD?: boolean;
    ootdAuthorId?: string;
    tokensEarned?: number;
}

export class Logger {
    /**
     * Enregistre une commande exécutée
     */
    static async logCommand(data: CommandLogData): Promise<void> {
        try {
            await prisma.commandLog.create({
                data: {
                    userId: data.userId,
                    commandName: data.commandName,
                    commandType: data.commandType,
                    channelId: data.channelId,
                    guildId: data.guildId,
                    args: data.args ? JSON.stringify(data.args) : null,
                    success: data.success,
                    error: data.error,
                    executionTime: data.executionTime
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du log de commande:', error);
        }
    }

    /**
     * Enregistre une réaction ajoutée ou retirée
     */
    static async logReaction(data: ReactionLogData): Promise<void> {
        try {
            await prisma.reactionLog.create({
                data: {
                    userId: data.userId,
                    messageId: data.messageId,
                    channelId: data.channelId,
                    guildId: data.guildId,
                    emoji: data.emoji,
                    action: data.action,
                    isOOTD: data.isOOTD || false,
                    ootdAuthorId: data.ootdAuthorId,
                    tokensEarned: data.tokensEarned
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du log de réaction:', error);
        }
    }

    /**
     * Récupère les logs de commandes d'un utilisateur
     */
    static async getUserCommandLogs(userId: string, limit: number = 50): Promise<any[]> {
        try {
            return await prisma.commandLog.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                include: {
                    user: {
                        select: {
                            username: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des logs de commandes:', error);
            return [];
        }
    }

    /**
     * Récupère les logs de réactions d'un utilisateur
     */
    static async getUserReactionLogs(userId: string, limit: number = 50): Promise<any[]> {
        try {
            return await prisma.reactionLog.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                include: {
                    user: {
                        select: {
                            username: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des logs de réactions:', error);
            return [];
        }
    }

    /**
     * Récupère les statistiques de logs
     */
    static async getLogStats(): Promise<any> {
        try {
            const [totalCommands, totalReactions, todayCommands, todayReactions] = await Promise.all([
                prisma.commandLog.count(),
                prisma.reactionLog.count(),
                prisma.commandLog.count({
                    where: {
                        createdAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0))
                        }
                    }
                }),
                prisma.reactionLog.count({
                    where: {
                        createdAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0))
                        }
                    }
                })
            ]);

            return {
                totalCommands,
                totalReactions,
                todayCommands,
                todayReactions
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques de logs:', error);
            return {
                totalCommands: 0,
                totalReactions: 0,
                todayCommands: 0,
                todayReactions: 0
            };
        }
    }

    /**
     * Récupère les commandes les plus utilisées
     */
    static async getMostUsedCommands(limit: number = 10): Promise<any[]> {
        try {
            const result = await prisma.commandLog.groupBy({
                by: ['commandName'],
                _count: {
                    commandName: true
                },
                orderBy: {
                    _count: {
                        commandName: 'desc'
                    }
                },
                take: limit
            });

            return result.map((item: any) => ({
                commandName: item.commandName,
                _count: { commandName: item._count.commandName }
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des commandes les plus utilisées:', error);
            return [];
        }
    }

    /**
     * Récupère les utilisateurs les plus actifs
     */
    static async getMostActiveUsers(limit: number = 10): Promise<any[]> {
        try {
            const result = await prisma.commandLog.groupBy({
                by: ['userId'],
                _count: {
                    userId: true
                },
                orderBy: {
                    _count: {
                        userId: 'desc'
                    }
                },
                take: limit
            });

            return result.map((item: any) => ({
                userId: item.userId,
                _count: { userId: item._count.userId }
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs les plus actifs:', error);
            return [];
        }
    }
} 