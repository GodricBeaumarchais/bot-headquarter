import { Message, Client } from 'discord.js';
import { DatabaseManager } from './database';
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
        // Gestion OOTD
        await this.handleOOTD(message);
        
        // Ignorer les messages du bot et ceux qui ne commencent pas par le préfixe
        if (message.author.bot || !message.content.startsWith(this.prefix)) {
            return;
        }
        
        // Extraire la commande et les arguments
        const args = message.content.slice(this.prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        
        if (!commandName) {
            return;
        }
        
        // Traiter les commandes
        switch (commandName) {
            case 'signin':
                await this.handleSignIn(message);
                break;
            case 'balance':
                await this.handleBalance(message, args);
                break;
            case 'daily':
                await this.handleDaily(message);
                break;
            case 'transfer':
                await this.handleTransfer(message, args);
                break;
            case 'leaderboard':
                await this.handleLeaderboard(message, args);
                break;
            case 'streak':
                await this.handleStreak(message, args);
                break;
            case 'help':
                await this.handleHelp(message);
                break;
            default:
                await message.reply(`❌ Commande inconnue. Utilisez \`${this.prefix} help\` pour voir les commandes disponibles.`);
        }
    }
    
    // Gestion OOTD
    private async handleOOTD(message: Message): Promise<void> {
        // Vérifier si c'est dans le salon OOTD
        if (message.channelId !== OOTD_CHANNEL_ID) {
            return;
        }

        // Vérifier si le message contient une image
        const hasImage = message.attachments.some(attachment => 
            attachment.contentType?.startsWith('image/')
        ) || message.embeds.some(embed => 
            embed.image || embed.thumbnail
        );

        if (!hasImage) {
            return;
        }

        // Vérifier si le message contient la commande !hq ootd
        if (!message.content.toLowerCase().includes(`${this.prefix} ootd`)) {
            return;
        }

        try {
            // Ajouter la réaction automatiquement
            await message.react(OOTD_REACTION_EMOJI);
            
            // Vérifier si l'utilisateur a un compte
            const user = await DatabaseManager.getUser(message.author.id);
            if (!user) {
                await message.reply(`❌ Vous devez d'abord créer un compte avec \`${this.prefix} signin\``);
                return;
            }

            console.log(`👗 OOTD posté par ${message.author.username} dans le salon OOTD`);
            
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la réaction OOTD:', error);
        }
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
    
    private async handleHelp(message: Message): Promise<void> {
        const helpText = `🤖 **Commandes disponibles :**\n\n**💰 Système de ${CURRENCY_NAME} :**\n\`${this.prefix} signin\` - Créer votre compte (0 ${CURRENCY_NAME} de départ)\n\`${this.prefix} balance [@utilisateur]\` - Voir votre solde de ${CURRENCY_NAME}\n\`${this.prefix} daily\` - Récupérer votre récompense quotidienne (${DAILY_REWARD} ${CURRENCY_NAME})\n\`${this.prefix} transfer @utilisateur montant\` - Transférer des ${CURRENCY_NAME}\n\`${this.prefix} leaderboard [limite]\` - Voir le classement des joueurs\n\`${this.prefix} streak\` - Voir votre streak\n\n**📝 Exemples :**\n\`${this.prefix} signin\`\n\`${this.prefix} balance @utilisateur\`\n\`${this.prefix} transfer @utilisateur 50\`\n\`${this.prefix} leaderboard 5\``;
        await message.reply(helpText);
    }
} 