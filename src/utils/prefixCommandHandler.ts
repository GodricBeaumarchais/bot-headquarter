import { Message, Client } from 'discord.js';
import { DatabaseManager } from './database';
import { Logger } from './logger';
import { 
    BOT_PREFIX, 
    CURRENCY_NAME, 
    COIN_EMOTE, 
    DAILY_REWARD,
    OOTD_CHANNEL_ID,
    OOTD_REACTIONS_NEEDED,
    OOTD_REWARD,
    OOTD_REACTION_EMOJI
} from './constants';

export class PrefixCommandHandler {
    private prefix = BOT_PREFIX;
    
    constructor(private client: Client) {}
    
    public async handleMessage(message: Message): Promise<void> {
        const startTime = Date.now();
        let commandName = '';
        let success = false;
        let error = '';

        try {
            // Gestion OOTD avec image (doit être en premier)
            const hasImage = message.attachments.some(attachment => 
                attachment.contentType?.startsWith('image/')
            ) || message.embeds.some(embed => 
                embed.image || embed.thumbnail
            );

            const hasOOTDCommand = message.content.toLowerCase().includes(`${this.prefix} ootd`);

            // Si c'est un post OOTD avec image, traiter et arrêter là
            // if (message.channelId === OOTD_CHANNEL_ID && hasImage && hasOOTDCommand) {
            //     commandName = 'ootd_post';
            //     await this.handleOOTDPost(message);
            //     success = true;
            //     return; // Arrêter le traitement ici
            // }
            
            // Ignorer les messages du bot et ceux qui ne commencent pas par le préfixe
            if (message.author.bot || !message.content.startsWith(this.prefix)) {
                return;
            }
            
            // Extraire la commande et les arguments
            const args = message.content.slice(this.prefix.length).trim().split(/ +/);
            commandName = args.shift()?.toLowerCase() || '';
            
            if (!commandName) {
                return;
            }
            
            // Traiter les commandes
            switch (commandName) {
                case 'signin':
                    await this.handleSignIn(message);
                    success = true;
                    break;
                case 'balance':
                    await this.handleBalance(message, args);
                    success = true;
                    break;
                case 'daily':
                    await this.handleDaily(message);
                    success = true;
                    break;
                case 'transfer':
                    await this.handleTransfer(message, args);
                    success = true;
                    break;
                case 'leaderboard':
                    await this.handleLeaderboard(message, args);
                    success = true;
                    break;
                case 'streak':
                    await this.handleStreak(message, args);
                    success = true;
                    break;
                case 'generate':
                    await this.handleGenerate(message, args);
                    success = true;
                    break;
                case 'remove':
                    await this.handleRemove(message, args);
                    success = true;
                    break;
                case 'exchange':
                    await this.handleExchange(message, args);
                    success = true;
                    break;
                case 'help':
                    await this.handleHelp(message);
                    success = true;
                    break;
                case 'logs':
                    await this.handleLogs(message, args);
                    success = true;
                    break;
                default:
                    await message.reply(`❌ Commande inconnue. Utilisez \`${this.prefix} help\` pour voir les commandes disponibles.`);
                    success = false;
                    error = 'Commande inconnue';
            }
        } catch (err) {
            success = false;
            error = err instanceof Error ? err.message : 'Erreur inconnue';
            console.error(`Erreur dans la commande ${commandName}:`, err);
        } finally {
            // Logger la commande
            if (commandName) {
                const executionTime = Date.now() - startTime;
                await Logger.logCommand({
                    userId: message.author.id,
                    commandName,
                    commandType: 'prefix',
                    channelId: message.channelId,
                    guildId: message.guildId || undefined,
                    args: message.content.slice(this.prefix.length).trim().split(/ +/).slice(1),
                    success,
                    error: error || undefined,
                    executionTime
                });
            }
        }
    }
    
    // Gestion OOTD avec image
    private async handleOOTDPost(message: Message): Promise<void> {
        try {
            // Vérifier si l'utilisateur a un compte
            const user = await DatabaseManager.getUser(message.author.id);
            if (!user) {
                await message.reply(`❌ Vous devez d'abord créer un compte avec \`${this.prefix} signin\``);
                return;
            }

            console.log(`👗 Traitement OOTD pour ${message.author.username}...`);

            // Ajouter la réaction automatiquement
            const reaction = await message.react(OOTD_REACTION_EMOJI);
            console.log(`✅ Réaction ajoutée: ${reaction.emoji.name}`);
            
            // Logger la réaction automatique
            await Logger.logReaction({
                userId: message.author.id,
                messageId: message.id,
                channelId: message.channelId,
                guildId: message.guildId || undefined,
                emoji: OOTD_REACTION_EMOJI,
                action: 'add',
                isOOTD: true,
                ootdAuthorId: message.author.id,
                tokensEarned: 0 // Pas de tokens pour la réaction automatique
            });
            
            // Ne pas supprimer le message pour éviter les conflits
            // Le message restera visible avec la réaction
            console.log(`👗 OOTD posté par ${message.author.username} dans le salon OOTD (message conservé)`);
            
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la réaction OOTD:', error);
        }
    }
    
    // Gestion OOTD (ancienne méthode - maintenant vide)
    private async handleOOTD(message: Message): Promise<void> {
        // Cette méthode n'est plus utilisée, gardée pour compatibilité
        return;
    }
    
    private async handleSignIn(message: Message): Promise<void> {
        try {
            const user = await DatabaseManager.createUser(
                message.author.id,
                message.author.username
            );
            
            await message.reply(`🎉 **Compte créé avec succès !**\nBienvenue **${message.author.username}** !\n${COIN_EMOTE} **${CURRENCY_NAME} de départ :** 0 ${CURRENCY_NAME}\n📅 **Date de création :** ${user.createdAt.toLocaleDateString('fr-FR')}`);
        } catch (error) {
            if (error instanceof Error && error.message === 'Utilisateur déjà existant') {
                await message.reply(`❌ Vous avez déjà un compte ! Utilisez \`${this.prefix} balance\` pour voir votre solde.`);
            } else {
                await message.reply('❌ Erreur lors de la création du compte.');
            }
        }
    }
    
    private async handleBalance(message: Message, args: string[]): Promise<void> {
        try {
            const targetUser = args[0] ? message.mentions.users.first() || message.author : message.author;
            
            const user = await DatabaseManager.getUser(targetUser.id);
            
            if (!user) {
                await message.reply(`❌ Cet utilisateur n'a pas encore de compte. Utilisez \`${this.prefix} signin\` pour créer un compte.`);
                return;
            }
            
            await message.reply(`${COIN_EMOTE} **Solde de ${targetUser.username} :** ${user.token} ${CURRENCY_NAME}`);
        } catch (error) {
            await message.reply('❌ Erreur lors de la récupération du solde.');
        }
    }
    
    private async handleDaily(message: Message): Promise<void> {
        try {
            const user = await DatabaseManager.getUser(message.author.id);
            
            if (!user) {
                await message.reply(`❌ Vous devez d'abord créer un compte avec \`${this.prefix} signin\``);
                return;
            }
            
            const result = await DatabaseManager.handleDailyReward(message.author.id, DAILY_REWARD);
            
            let replyMessage = `🎁 **Récompense quotidienne !**\nVous avez reçu **${result.totalReward}** ${CURRENCY_NAME} !${result.bonusMessage}\n💳 **Nouveau solde :** ${result.token} ${CURRENCY_NAME}\n🔥 **Streak :** ${result.streak} jours consécutifs`;
            
            if (result.bonusMessage) {
                replyMessage += `\n🎉 **Bonus de streak !**\nStreak: ${result.streak} jours\nCalcul: ${result.streak} ÷ 5 = ${Math.floor(result.streak / 5)} ${CURRENCY_NAME}\nBonus: ${result.bonusAmount} ${CURRENCY_NAME}`;
            }
            
            await message.reply(replyMessage);
        } catch (error) {
            let errorMessage = '❌ Erreur lors de la récupération de la récompense';
            if (error instanceof Error) {
                if (error.message === 'Récompense quotidienne déjà récupérée aujourd\'hui') {
                    errorMessage = '❌ Vous avez déjà récupéré votre récompense quotidienne aujourd\'hui !';
                } else if (error.message === 'Utilisateur non trouvé') {
                    errorMessage = '❌ Utilisateur non trouvé';
                }
            }
            await message.reply(errorMessage);
        }
    }
    
    private async handleTransfer(message: Message, args: string[]): Promise<void> {
        try {
            const recipient = message.mentions.users.first();
            const amount = parseInt(args[1]);
            
            if (!recipient || !amount || amount <= 0) {
                await message.reply(`❌ Usage : \`${this.prefix} transfer @utilisateur montant\``);
                return;
            }
            
            if (recipient.id === message.author.id) {
                await message.reply(`❌ Vous ne pouvez pas vous transférer des ${CURRENCY_NAME} à vous-même !`);
                return;
            }
            
            const fromUser = await DatabaseManager.getUser(message.author.id);
            const toUser = await DatabaseManager.getUser(recipient.id);
            
            if (!fromUser) {
                await message.reply(`❌ Vous devez d'abord créer un compte avec \`${this.prefix} signin\``);
                return;
            }
            
            if (!toUser) {
                await message.reply(`❌ Le destinataire doit d'abord créer un compte avec \`${this.prefix} signin\``);
                return;
            }
            
            const result = await DatabaseManager.transferTokens(message.author.id, recipient.id, amount);
            
            await message.reply(`💸 **Transfert effectué !**\nVous avez transféré **${amount}** ${CURRENCY_NAME} à ${recipient.username}\n💳 **Votre nouveau solde :** ${result.from.token} ${CURRENCY_NAME}`);
        } catch (error) {
            if (error instanceof Error && error.message === 'Solde insuffisant') {
                await message.reply('❌ Solde insuffisant pour effectuer ce transfert.');
            } else {
                await message.reply('❌ Erreur lors du transfert.');
            }
        }
    }
    
    private async handleLeaderboard(message: Message, args: string[]): Promise<void> {
        try {
            const limit = parseInt(args[0]) || 10;
            const leaderboard = await DatabaseManager.getLeaderboard(limit);
            
            if (leaderboard.length === 0) {
                await message.reply('📊 Aucun joueur trouvé dans le classement.');
                return;
            }
            
            const leaderboardText = leaderboard.map((user: { username: string; token: number }, index: number) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                return `${medal} **${user.username}** - ${user.token} ${CURRENCY_NAME}`;
            }).join('\n');
            
            await message.reply(`🏆 **Classement des joueurs les plus riches :**\n\n${leaderboardText}`);
        } catch (error) {
            await message.reply('❌ Erreur lors de la récupération du classement.');
        }
    }
    
    private async handleStreak(message: Message, args: string[]): Promise<void> {
        try {
            const targetUser = args[0] ? message.mentions.users.first() || message.author : message.author;
            const user = await DatabaseManager.getUser(targetUser.id);
            
            if (!user) {
                await message.reply(`❌ Cet utilisateur n'a pas encore de compte. Utilisez \`${this.prefix} signin\` pour créer un compte.`);
                return;
            }
            
            await message.reply(`🔥 **Streak de ${targetUser.username} :** ${user.streak} jours consécutifs`);
        } catch (error) {
            await message.reply('❌ Erreur lors de la récupération du streak.');
        }
    }
    
    private async handleOOTDStats(message: Message, args: string[]): Promise<void> {
        try {
            const targetUser = args[0] ? message.mentions.users.first() || message.author : message.author;
            
            // Vérifier si l'utilisateur a un compte
            const user = await DatabaseManager.getUser(targetUser.id);
            if (!user) {
                if (message.channel.isTextBased()) {
                    await (message.channel as any).send(`❌ ${targetUser.username} n'a pas encore de compte. Utilisez \`${this.prefix} signin\` pour créer un compte.`);
                }
                return;
            }

            // Récupérer les statistiques OOTD
            const stats = await DatabaseManager.getOOTDStats(targetUser.id);

            const statsMessage = `👗 **Statistiques OOTD de ${targetUser.username} :**\n` +
                `📸 **Messages OOTD créés :** ${stats.messagesCreated}\n` +
                `👍 **Réactions données :** ${stats.reactionsGiven}\n` +
                `💰 **${CURRENCY_NAME} gagnés via OOTD :** ${stats.totalEarned}`;

            if (message.channel.isTextBased()) {
                await (message.channel as any).send(statsMessage);
            }

        } catch (error) {
            console.error('Erreur lors de la récupération des stats OOTD:', error);
            if (message.channel.isTextBased()) {
                await (message.channel as any).send('❌ Une erreur s\'est produite lors de la récupération des statistiques OOTD.');
            }
        }
    }
    
    private async handleExchange(message: Message, args: string[]): Promise<void> {
        try {
            // Vérifier si l'utilisateur est admin
            const isAdmin = await DatabaseManager.isAdmin(message.author.id);
            if (!isAdmin) {
                await message.reply('❌ Vous n\'avez pas les permissions pour utiliser cette commande.');
                return;
            }

            const fromUser = message.mentions.users.first();
            const toUser = message.mentions.users.at(1); // Deuxième mention
            const amount = parseInt(args[2]);

            if (!fromUser || !toUser || !amount || amount <= 0) {
                await message.reply(`❌ Usage : \`${this.prefix} exchange @depuis @vers montant\``);
                return;
            }

            // Vérifier que ce ne sont pas les mêmes utilisateurs
            if (fromUser.id === toUser.id) {
                await message.reply('❌ Impossible d\'échanger des tokens avec soi-même.');
                return;
            }

            // Vérifier si les utilisateurs ont des comptes
            const fromUserData = await DatabaseManager.getUser(fromUser.id);
            const toUserData = await DatabaseManager.getUser(toUser.id);

            if (!fromUserData) {
                await message.reply(`❌ ${fromUser.username} n'a pas encore de compte. Utilisez \`${this.prefix} signin\` pour créer un compte.`);
                return;
            }

            if (!toUserData) {
                await message.reply(`❌ ${toUser.username} n'a pas encore de compte. Utilisez \`${this.prefix} signin\` pour créer un compte.`);
                return;
            }

            // Vérifier si l'utilisateur source a assez de tokens
            if (fromUserData.token < amount) {
                await message.reply(`❌ ${fromUser.username} n'a que ${fromUserData.token} ${CURRENCY_NAME}. Impossible d'échanger ${amount} ${CURRENCY_NAME}.`);
                return;
            }

            // Échanger les tokens
            const result = await DatabaseManager.exchangeTokens(fromUser.id, toUser.id, amount);

            const embed = {
                color: 0x0099FF,
                title: '💰 Échange de tokens réussi',
                fields: [
                    { 
                        name: '👤 De', 
                        value: `${fromUser.username} (${result.fromUser.token} ${CURRENCY_NAME})`, 
                        inline: true 
                    },
                    { 
                        name: '👤 Vers', 
                        value: `${toUser.username} (${result.toUser.token} ${CURRENCY_NAME})`, 
                        inline: true 
                    },
                    { 
                        name: '💰 Montant échangé', 
                        value: `${amount} ${CURRENCY_NAME}`, 
                        inline: true 
                    }
                ],
                footer: { 
                    text: `Échangé par ${message.author.username}` 
                },
                timestamp: new Date().toISOString()
            };

            await message.reply({ embeds: [embed] });

            // Notifier les utilisateurs
            try {
                await fromUser.send(`💰 **${amount} ${CURRENCY_NAME}** ont été transférés de votre compte vers ${toUser.username} par un administrateur !`);
            } catch (error) {
                // Ignorer si l'utilisateur a les DMs fermés
            }

            try {
                await toUser.send(`💰 **${amount} ${CURRENCY_NAME}** ont été transférés de ${fromUser.username} vers votre compte par un administrateur !`);
            } catch (error) {
                // Ignorer si l'utilisateur a les DMs fermés
            }

        } catch (error) {
            console.error('Erreur lors de l\'échange de tokens:', error);
            await message.reply('❌ Une erreur s\'est produite lors de l\'échange des tokens.');
        }
    }

    private async handleGenerate(message: Message, args: string[]): Promise<void> {
        try {
            // Vérifier si l'utilisateur est admin
            const isAdmin = await DatabaseManager.isAdmin(message.author.id);
            if (!isAdmin) {
                await message.reply('❌ Vous n\'avez pas les permissions pour utiliser cette commande.');
                return;
            }

            const targetUser = message.mentions.users.first();
            const amount = parseInt(args[1]);

            if (!targetUser || !amount || amount <= 0) {
                await message.reply(`❌ Usage : \`${this.prefix} generate @utilisateur montant\``);
                return;
            }

            // Vérifier si l'utilisateur cible a un compte
            const user = await DatabaseManager.getUser(targetUser.id);
            if (!user) {
                await message.reply(`❌ ${targetUser.username} n'a pas encore de compte. Utilisez \`${this.prefix} signin\` pour créer un compte.`);
                return;
            }

            // Générer les tokens
            const updatedUser = await DatabaseManager.generateTokens(targetUser.id, amount);

            const embed = {
                color: 0x00FF00,
                title: '💰 Génération de tokens réussie',
                fields: [
                    { 
                        name: '👤 Utilisateur', 
                        value: targetUser.username, 
                        inline: true 
                    },
                    { 
                        name: '➕ Tokens générés', 
                        value: `${amount}`, 
                        inline: true 
                    },
                    { 
                        name: '💳 Nouveau solde', 
                        value: `${updatedUser.token} ${CURRENCY_NAME}`, 
                        inline: true 
                    }
                ],
                footer: { 
                    text: `Généré par ${message.author.username}` 
                },
                timestamp: new Date().toISOString()
            };

            await message.reply({ embeds: [embed] });

            // Notifier l'utilisateur cible
            try {
                await targetUser.send(`💰 **${amount} ${CURRENCY_NAME}** ont été générés dans votre compte par un administrateur !`);
            } catch (error) {
                // Ignorer si l'utilisateur a les DMs fermés
            }

        } catch (error) {
            console.error('Erreur lors de la génération de tokens:', error);
            await message.reply('❌ Une erreur s\'est produite lors de la génération des tokens.');
        }
    }

    private async handleRemove(message: Message, args: string[]): Promise<void> {
        try {
            // Vérifier si l'utilisateur est admin
            const isAdmin = await DatabaseManager.isAdmin(message.author.id);
            if (!isAdmin) {
                await message.reply('❌ Vous n\'avez pas les permissions pour utiliser cette commande.');
                return;
            }

            const targetUser = message.mentions.users.first();
            const amount = parseInt(args[1]);

            if (!targetUser || !amount || amount <= 0) {
                await message.reply(`❌ Usage : \`${this.prefix} remove @utilisateur montant\``);
                return;
            }

            // Vérifier si l'utilisateur cible a un compte
            const user = await DatabaseManager.getUser(targetUser.id);
            if (!user) {
                await message.reply(`❌ ${targetUser.username} n'a pas encore de compte. Utilisez \`${this.prefix} signin\` pour créer un compte.`);
                return;
            }

            // Vérifier si l'utilisateur a assez de tokens
            if (user.token < amount) {
                await message.reply(`❌ ${targetUser.username} n'a que ${user.token} ${CURRENCY_NAME}. Impossible de retirer ${amount} ${CURRENCY_NAME}.`);
                return;
            }

            // Retirer les tokens
            const updatedUser = await DatabaseManager.removeTokens(targetUser.id, amount);

            const embed = {
                color: 0xFF0000,
                title: '💰 Retrait de tokens réussi',
                fields: [
                    { 
                        name: '👤 Utilisateur', 
                        value: targetUser.username, 
                        inline: true 
                    },
                    { 
                        name: '➖ Tokens retirés', 
                        value: `${amount}`, 
                        inline: true 
                    },
                    { 
                        name: '💳 Nouveau solde', 
                        value: `${updatedUser.token} ${CURRENCY_NAME}`, 
                        inline: true 
                    }
                ],
                footer: { 
                    text: `Retiré par ${message.author.username}` 
                },
                timestamp: new Date().toISOString()
            };

            await message.reply({ embeds: [embed] });

            // Notifier l'utilisateur cible
            try {
                await targetUser.send(`💰 **${amount} ${CURRENCY_NAME}** ont été retirés de votre compte par un administrateur !`);
            } catch (error) {
                // Ignorer si l'utilisateur a les DMs fermés
            }

        } catch (error) {
            console.error('Erreur lors du retrait de tokens:', error);
            await message.reply('❌ Une erreur s\'est produite lors du retrait des tokens.');
        }
    }
    
    private async handleHelp(message: Message): Promise<void> {
        const helpText = `🤖 **Commandes disponibles :**\n\n**💰 Système de ${CURRENCY_NAME} :**\n\`${this.prefix} signin\` - Créer votre compte (0 ${CURRENCY_NAME} de départ)\n\`${this.prefix} balance [@utilisateur]\` - Voir votre solde de ${CURRENCY_NAME}\n\`${this.prefix} daily\` - Récupérer votre récompense quotidienne (${DAILY_REWARD} ${CURRENCY_NAME})\n\`${this.prefix} transfer @utilisateur montant\` - Transférer des ${CURRENCY_NAME}\n\`${this.prefix} leaderboard [limite]\` - Voir le classement des joueurs\n\`${this.prefix} streak\` - Voir votre streak\n\n**👑 Commandes Admin :**\n\`${this.prefix} generate @utilisateur montant\` - Générer des ${CURRENCY_NAME}\n\`${this.prefix} remove @utilisateur montant\` - Retirer des ${CURRENCY_NAME}\n\`${this.prefix} exchange @depuis @vers montant\` - Échanger des ${CURRENCY_NAME}\n\`${this.prefix} logs [stats|commands|reactions|top] [@utilisateur] [limite]\` - Gestion des logs\n\n**📝 Exemples :**\n\`${this.prefix} signin\`\n\`${this.prefix} balance @utilisateur\`\n\`${this.prefix} transfer @utilisateur 50\`\n\`${this.prefix} leaderboard 5\`\n\`${this.prefix} generate @utilisateur 100\`\n\`${this.prefix} remove @utilisateur 50\`\n\`${this.prefix} exchange @user1 @user2 25\`\n\`${this.prefix} logs stats\`\n\`${this.prefix} logs commands @utilisateur 20\`\n\`${this.prefix} logs top commands 5\``;
        await message.reply(helpText);
    }

    private async handleLogs(message: Message, args: string[]): Promise<void> {
        try {
            // Vérifier si l'utilisateur est admin
            const isAdmin = await DatabaseManager.isAdmin(message.author.id);
            if (!isAdmin) {
                await message.reply('❌ Vous n\'avez pas les permissions pour utiliser cette commande.');
                return;
            }

            const subCommand = args[0]?.toLowerCase();
            const targetUser = args[1] ? message.mentions.users.first() : null;
            const limit = parseInt(args[2]) || 10;

            switch (subCommand) {
                case 'stats':
                    await this.handleLogStats(message);
                    break;
                case 'commands':
                    await this.handleCommandLogs(message, targetUser, limit);
                    break;
                case 'reactions':
                    await this.handleReactionLogs(message, targetUser, limit);
                    break;
                case 'top':
                    await this.handleTopLogs(message, args[1], limit);
                    break;
                default:
                    await message.reply(`📊 **Commandes de logs disponibles :**\n\n` +
                        `\`${this.prefix} logs stats\` - Statistiques générales des logs\n` +
                        `\`${this.prefix} logs commands [@utilisateur] [limite]\` - Logs de commandes\n` +
                        `\`${this.prefix} logs reactions [@utilisateur] [limite]\` - Logs de réactions\n` +
                        `\`${this.prefix} logs top [commands|users] [limite]\` - Top des commandes/utilisateurs\n\n` +
                        `**Exemples :**\n` +
                        `\`${this.prefix} logs stats\`\n` +
                        `\`${this.prefix} logs commands @utilisateur 20\`\n` +
                        `\`${this.prefix} logs top commands 5\``);
            }
        } catch (error) {
            console.error('Erreur lors de la gestion des logs:', error);
            await message.reply('❌ Une erreur s\'est produite lors de la récupération des logs.');
        }
    }

    private async handleLogStats(message: Message): Promise<void> {
        const stats = await Logger.getLogStats();
        
        const embed = {
            color: 0x0099FF,
            title: '📊 Statistiques des logs',
            fields: [
                { 
                    name: '📈 Total', 
                    value: `**Commandes :** ${stats.totalCommands}\n**Réactions :** ${stats.totalReactions}`, 
                    inline: true 
                },
                { 
                    name: '📅 Aujourd\'hui', 
                    value: `**Commandes :** ${stats.todayCommands}\n**Réactions :** ${stats.todayReactions}`, 
                    inline: true 
                }
            ],
            timestamp: new Date().toISOString()
        };

        await message.reply({ embeds: [embed] });
    }

    private async handleCommandLogs(message: Message, targetUser: any, limit: number): Promise<void> {
        const userId = targetUser ? targetUser.id : message.author.id;
        const logs = await Logger.getUserCommandLogs(userId, limit);
        
        if (logs.length === 0) {
            await message.reply('📝 Aucun log de commande trouvé.');
            return;
        }

        const logsText = logs.map((log: any, index: number) => {
            const status = log.success ? '✅' : '❌';
            const time = new Date(log.createdAt).toLocaleString('fr-FR');
            const args = log.args ? ` (${log.args})` : '';
            return `${index + 1}. ${status} **${log.commandName}**${args} - ${time}`;
        }).join('\n');

        const embed = {
            color: 0x0099FF,
            title: `📝 Logs de commandes de ${targetUser ? targetUser.username : message.author.username}`,
            description: logsText,
            footer: { text: `${logs.length} commandes affichées` },
            timestamp: new Date().toISOString()
        };

        await message.reply({ embeds: [embed] });
    }

    private async handleReactionLogs(message: Message, targetUser: any, limit: number): Promise<void> {
        const userId = targetUser ? targetUser.id : message.author.id;
        const logs = await Logger.getUserReactionLogs(userId, limit);
        
        if (logs.length === 0) {
            await message.reply('👍 Aucun log de réaction trouvé.');
            return;
        }

        const logsText = logs.map((log: any, index: number) => {
            const action = log.action === 'add' ? '➕' : '➖';
            const time = new Date(log.createdAt).toLocaleString('fr-FR');
            const ootd = log.isOOTD ? ' (OOTD)' : '';
            const tokens = log.tokensEarned ? ` (+${log.tokensEarned} ${CURRENCY_NAME})` : '';
            return `${index + 1}. ${action} ${log.emoji}${ootd}${tokens} - ${time}`;
        }).join('\n');

        const embed = {
            color: 0x00FF00,
            title: `👍 Logs de réactions de ${targetUser ? targetUser.username : message.author.username}`,
            description: logsText,
            footer: { text: `${logs.length} réactions affichées` },
            timestamp: new Date().toISOString()
        };

        await message.reply({ embeds: [embed] });
    }

    private async handleTopLogs(message: Message, type: string, limit: number): Promise<void> {
        switch (type) {
            case 'commands':
                const topCommands = await Logger.getMostUsedCommands(limit);
                const commandsText = topCommands.map((cmd: any, index: number) => {
                    return `${index + 1}. **${cmd.commandName}** - ${cmd._count.commandName} utilisations`;
                }).join('\n');

                const commandsEmbed = {
                    color: 0xFFD700,
                    title: '🏆 Commandes les plus utilisées',
                    description: commandsText,
                    footer: { text: `Top ${limit} commandes` },
                    timestamp: new Date().toISOString()
                };
                await message.reply({ embeds: [commandsEmbed] });
                break;

            case 'users':
                const topUsers = await Logger.getMostActiveUsers(limit);
                const usersText = topUsers.map((user: any, index: number) => {
                    return `${index + 1}. <@${user.userId}> - ${user._count.userId} commandes`;
                }).join('\n');

                const usersEmbed = {
                    color: 0xFFD700,
                    title: '🏆 Utilisateurs les plus actifs',
                    description: usersText,
                    footer: { text: `Top ${limit} utilisateurs` },
                    timestamp: new Date().toISOString()
                };
                await message.reply({ embeds: [usersEmbed] });
                break;

            default:
                await message.reply('❌ Type invalide. Utilisez `commands` ou `users`.');
        }
    }
} 