import { Events, MessageReaction, User, PartialMessageReaction, PartialUser } from 'discord.js';
import { Event } from '../types/Event';
import { DatabaseManager } from '../utils/database';
import { Logger } from '../utils/logger';
import { OOTD_CHANNEL_ID, OOTD_REACTION_EMOJI, CURRENCY_NAME } from '../utils/constants';

export const name = Events.MessageReactionRemove;
export const once = false;

export const execute: Event<typeof name>['execute'] = async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, ...args: any[]) => {
    // Gérer les réactions partielles
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Erreur lors de la récupération de la réaction:', error);
            return;
        }
    }

    // Vérifier que l'utilisateur n'est pas partiel
    if (user.partial) {
        try {
            await user.fetch();
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            return;
        }
    }

    // Ignorer les réactions du bot
    if (user.bot) return;

    // Vérifier si c'est dans le salon OOTD
    if (reaction.message.channelId !== OOTD_CHANNEL_ID) {
        return;
    }

    // Vérifier si c'est l'émoji OOTD
    if (reaction.emoji.name !== OOTD_REACTION_EMOJI) {
        return;
    }

    try {
        const messageAuthor = reaction.message.author;
        if (!messageAuthor) return;

        // Supprimer la réaction de la base de données
        await DatabaseManager.removeOOTDReaction(
            reaction.message.id,
            messageAuthor.id,
            user.id
        );

        // Retirer 1 token à l'auteur
        const updatedAuthor = await DatabaseManager.removeTokens(messageAuthor.id, 1);

        // Logger la suppression de réaction OOTD
        await Logger.logReaction({
            userId: user.id,
            messageId: reaction.message.id,
            channelId: reaction.message.channelId,
            guildId: reaction.message.guildId || undefined,
            emoji: OOTD_REACTION_EMOJI,
            action: 'remove',
            isOOTD: true,
            ootdAuthorId: messageAuthor.id,
            tokensEarned: -1 // L'auteur perd 1 token
        });

        // Ne plus envoyer de message de confirmation
        console.log(`👗 OOTD réaction retirée: ${user.username} → ${messageAuthor.username} (-1 ${CURRENCY_NAME})`);

    } catch (error) {
        console.error('Erreur lors du retrait de la réaction OOTD:', error);
        
        // Logger la suppression échouée
        try {
            const messageAuthor = reaction.message.author;
            if (messageAuthor) {
                await Logger.logReaction({
                    userId: user.id,
                    messageId: reaction.message.id,
                    channelId: reaction.message.channelId,
                    guildId: reaction.message.guildId || undefined,
                    emoji: OOTD_REACTION_EMOJI,
                    action: 'remove',
                    isOOTD: true,
                    ootdAuthorId: messageAuthor.id,
                    tokensEarned: 0 // Pas de changement car échec
                });
            }
        } catch (logError) {
            console.error('Erreur lors du logging de la suppression échouée:', logError);
        }
        
        let errorMessage = '❌ Erreur lors du retrait de la réaction';
        if (error instanceof Error) {
            if (error.message === 'Solde insuffisant') {
                errorMessage = '❌ Solde insuffisant pour retirer des tokens';
            } else if (error.message.includes('non trouvé')) {
                errorMessage = '❌ Un des utilisateurs n\'a pas de compte. Utilisez `!hq signin` pour créer un compte.';
            }
        }
        
        // Envoyer un message d'erreur temporaire
        const errorReply = await reaction.message.reply({
            content: errorMessage
        });
        
        // Supprimer le message d'erreur après 5 secondes
        setTimeout(async () => {
            try {
                await errorReply.delete();
            } catch (e) {
                // Ignorer les erreurs de suppression
            }
        }, 5000);
    }
}; 