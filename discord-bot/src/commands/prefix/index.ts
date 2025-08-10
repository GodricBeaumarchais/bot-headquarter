import { Message, Client } from 'discord.js';
import { DatabaseManager } from '../../utils/database';
import { Logger } from '../../utils/logger';
import { BOT_PREFIX } from '../../utils/constants';
import { signInBehavior } from '../../behaviors/money/signIn';
import { balanceBehavior } from '../../behaviors/money/balance';
import { dailyBehavior } from '../../behaviors/money/daily';
import { transferBehavior } from '../../behaviors/money/transfer';
import { leaderboardBehavior } from '../../behaviors/money/leaderboard';
import { streakBehavior } from '../../behaviors/money/streak';
import { ootdBehavior } from '../../behaviors/fun/ootd';
import { generateBehavior } from '../../behaviors/admin/generate';
import { removeBehavior } from '../../behaviors/admin/remove';
import { exchangeBehavior } from '../../behaviors/admin/exchange';

export class PrefixCommandHandler {
    private prefix = BOT_PREFIX;
    
    constructor(private client: Client) {}
    
    public async handleMessage(message: Message): Promise<void> {
        const startTime = Date.now();
        let commandName = '';
        let success = false;
        let error = '';

        try {
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
                case 'ootd':
                    await this.handleOOTD(message, args);
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
                case 'chifumi':
                    await this.handleChifumi(message, args);
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
    
    private async handleSignIn(message: Message): Promise<void> {
        const result = await signInBehavior(message.author.id, message.author.username);
        await message.reply(result.message);
    }
    
    private async handleBalance(message: Message, args: string[]): Promise<void> {
        const targetUser = args[0] ? message.mentions.users.first() || message.author : message.author;
        const result = await balanceBehavior(message.author.id, targetUser.id, targetUser.username);
        await message.reply(result.message);
    }
    
    private async handleDaily(message: Message): Promise<void> {
        const result = await dailyBehavior(message.author.id);
        await message.reply(result.message);
    }
    
    private async handleTransfer(message: Message, args: string[]): Promise<void> {
        const recipient = message.mentions.users.first();
        const amount = parseInt(args[1]);
        
        if (!recipient || !amount || amount <= 0) {
            await message.reply(`❌ Usage : \`${this.prefix} transfer @utilisateur montant\``);
            return;
        }
        
        const result = await transferBehavior(
            message.author.id,
            recipient.id,
            amount,
            message.author.username,
            recipient.username
        );
        
        await message.reply(result.message);
    }
    
    private async handleLeaderboard(message: Message, args: string[]): Promise<void> {
        const limit = parseInt(args[0]) || 10;
        const result = await leaderboardBehavior(limit);
        await message.reply(result.message);
    }
    
    private async handleStreak(message: Message, args: string[]): Promise<void> {
        const targetUser = args[0] ? message.mentions.users.first() || message.author : message.author;
        const result = await streakBehavior(message.author.id, targetUser.id, targetUser.username);
        await message.reply(result.message);
    }
    
    private async handleOOTD(message: Message, args: string[]): Promise<void> {
        const targetUser = args[0] ? message.mentions.users.first() || message.author : message.author;
        const result = await ootdBehavior(message.author.id, targetUser.id, targetUser.username);
        await message.reply(result.message);
    }
    
    private async handleGenerate(message: Message, args: string[]): Promise<void> {
        const targetUser = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!targetUser || !amount || amount <= 0) {
            await message.reply(`❌ Usage : \`${this.prefix} generate @utilisateur montant\``);
            return;
        }

        const result = await generateBehavior(
            message.author.id,
            targetUser.id,
            amount,
            message.author.username,
            targetUser.username
        );

        if (result.success && result.embed) {
            await message.reply({ embeds: [result.embed] });
            
            // Notifier l'utilisateur cible
            try {
                await targetUser.send(`💰 **${amount} tokens** ont été générés dans votre compte par un administrateur !`);
            } catch (error) {
                // Ignorer si l'utilisateur a les DMs fermés
            }
        } else {
            await message.reply(result.message);
        }
    }

    private async handleRemove(message: Message, args: string[]): Promise<void> {
        const targetUser = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!targetUser || !amount || amount <= 0) {
            await message.reply(`❌ Usage : \`${this.prefix} remove @utilisateur montant\``);
            return;
        }

        const result = await removeBehavior(
            message.author.id,
            targetUser.id,
            amount,
            message.author.username,
            targetUser.username
        );

        if (result.success && result.embed) {
            await message.reply({ embeds: [result.embed] });
            
            // Notifier l'utilisateur cible
            try {
                await targetUser.send(`💰 **${amount} tokens** ont été retirés de votre compte par un administrateur !`);
            } catch (error) {
                // Ignorer si l'utilisateur a les DMs fermés
            }
        } else {
            await message.reply(result.message);
        }
    }

    private async handleExchange(message: Message, args: string[]): Promise<void> {
        const fromUser = message.mentions.users.first();
        const toUser = message.mentions.users.at(1); // Deuxième mention
        const amount = parseInt(args[2]);

        if (!fromUser || !toUser || !amount || amount <= 0) {
            await message.reply(`❌ Usage : \`${this.prefix} exchange @depuis @vers montant\``);
            return;
        }

        const result = await exchangeBehavior(
            message.author.id,
            fromUser.id,
            toUser.id,
            amount,
            message.author.username,
            fromUser.username,
            toUser.username
        );

        if (result.success && result.embed) {
            await message.reply({ embeds: [result.embed] });
            
            // Notifier les utilisateurs
            try {
                await fromUser.send(`💰 **${amount} tokens** ont été transférés de votre compte vers ${toUser.username} par un administrateur !`);
            } catch (error) {
                // Ignorer si l'utilisateur a les DMs fermés
            }

            try {
                await toUser.send(`💰 **${amount} tokens** ont été transférés de ${fromUser.username} vers votre compte par un administrateur !`);
            } catch (error) {
                // Ignorer si l'utilisateur a les DMs fermés
            }
        } else {
            await message.reply(result.message);
        }
    }
    
    private async handleHelp(message: Message): Promise<void> {
        const helpText = `🤖 **Commandes disponibles :**\n\n**💰 Système de tokens :**\n\`${this.prefix} signin\` - Créer votre compte (0 tokens de départ)\n\`${this.prefix} balance [@utilisateur]\` - Voir votre solde de tokens\n\`${this.prefix} daily\` - Récupérer votre récompense quotidienne (5 tokens)\n\`${this.prefix} transfer @utilisateur montant\` - Transférer des tokens\n\`${this.prefix} leaderboard [limite]\` - Voir le classement des joueurs\n\`${this.prefix} streak\` - Voir votre streak\n\`${this.prefix} ootd [@utilisateur]\` - Voir vos statistiques OOTD\n\n**🎮 Jeux :**\n\`${this.prefix} chifumi @joueur nombre_token_mise [nombre_manches]\` - Défier un joueur au Pierre-Papier-Ciseaux (3, 5, 7, 9, 11 manches)\n\n**👑 Commandes Admin :**\n\`${this.prefix} generate @utilisateur montant\` - Générer des tokens\n\`${this.prefix} remove @utilisateur montant\` - Retirer des tokens\n\`${this.prefix} exchange @depuis @vers montant\` - Échanger des tokens\n\n**📝 Exemples :**\n\`${this.prefix} signin\`\n\`${this.prefix} balance @utilisateur\`\n\`${this.prefix} transfer @utilisateur 50\`\n\`${this.prefix} chifumi @utilisateur 25\`\n\`${this.prefix} chifumi @utilisateur 25 5\`\n\`${this.prefix} leaderboard 5\`\n\`${this.prefix} generate @utilisateur 100\`\n\`${this.prefix} remove @utilisateur 50\`\n\`${this.prefix} exchange @user1 @user2 25\``;
        await message.reply(helpText);
    }

    private async handleChifumi(message: Message, args: string[]): Promise<void> {
        try {
            // Vérifier les arguments : !hq chifumi @joueur nombre_token_mise [nombre_manches]
            const targetUser = message.mentions.users.first();
            const betAmount = parseInt(args[1]);
            const totalRounds = parseInt(args[2]) || 3; // Par défaut 3 manches

            if (!targetUser || !betAmount || betAmount <= 0) {
                await message.reply(`❌ Usage : \`${this.prefix} chifumi @joueur nombre_token_mise [nombre_manches]\`\n\n**Exemples :**\n\`${this.prefix} chifumi @joueur 100\` - 3 manches par défaut\n\`${this.prefix} chifumi @joueur 100 5\` - 5 manches\n\`${this.prefix} chifumi @joueur 100 7\` - 7 manches`);
                return;
            }

            // Vérifier que le nombre de manches est impair et valide
            if (totalRounds < 3 || totalRounds > 11 || totalRounds % 2 === 0) {
                await message.reply(`❌ Le nombre de manches doit être impair entre 3 et 11. Valeurs acceptées : 3, 5, 7, 9, 11`);
                return;
            }

            // Vérifier que ce n'est pas le même utilisateur
            if (targetUser.id === message.author.id) {
                await message.reply('❌ Impossible de se défier soi-même !');
                return;
            }

            // Vérifier si les utilisateurs ont des comptes
            const challenger = await DatabaseManager.getUser(message.author.id);
            const opponent = await DatabaseManager.getUser(targetUser.id);

            if (!challenger) {
                await message.reply(`❌ Vous devez d'abord créer un compte avec \`${this.prefix} signin\``);
                return;
            }

            if (!opponent) {
                await message.reply(`❌ ${targetUser.username} n'a pas encore de compte. Utilisez \`${this.prefix} signin\` pour créer un compte.`);
                return;
            }

            // Vérifier si le challenger a assez de tokens
            if (challenger.token < betAmount) {
                await message.reply(`❌ Vous n'avez que ${challenger.token} tokens. Impossible de miser ${betAmount} tokens.`);
                return;
            }

            // Vérifier si l'opposant a assez de tokens
            if (opponent.token < betAmount) {
                await message.reply(`❌ ${targetUser.username} n'a que ${opponent.token} tokens. Impossible de miser ${betAmount} tokens.`);
                return;
            }

            // Créer la proposition de jeu
            const game = await DatabaseManager.createChifumiGame(
                message.author.id,
                targetUser.id,
                betAmount,
                totalRounds
            );

            // Créer l'embed de proposition
            const embed = {
                color: 0x00FF00,
                title: '🎮 Défi Chifumi !',
                description: `${message.author} défie ${targetUser} à une partie de Pierre-Papier-Ciseaux !`,
                fields: [
                    {
                        name: '💰 Mise',
                        value: `${betAmount} tokens`,
                        inline: true
                    },
                    {
                        name: '🎯 Manches',
                        value: `${totalRounds} manches (premier à ${Math.ceil(totalRounds/2)} victoires)`,
                        inline: true
                    },
                    {
                        name: '⏰ Expiration',
                        value: '24 heures',
                        inline: true
                    }
                ],
                footer: {
                    text: `ID de jeu: ${game.gameId}`
                },
                timestamp: new Date().toISOString()
            };

            // Ajouter les boutons d'action
            const row = {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 3, // Green button
                        label: '✅ Accepter',
                        custom_id: `chifumi_accept_${game.gameId}`
                    },
                    {
                        type: 2,
                        style: 4, // Red button
                        label: '❌ Refuser',
                        custom_id: `chifumi_decline_${game.gameId}`
                    }
                ]
            };

            await message.reply({
                content: `${targetUser}`,
                embeds: [embed],
                components: [row]
            });

        } catch (error) {
            console.error('Erreur lors de la création du défi chifumi:', error);
            await message.reply('❌ Une erreur s\'est produite lors de la création du défi.');
        }
    }
} 