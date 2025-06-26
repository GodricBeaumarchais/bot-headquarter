import { Events, MessageReaction, User, PartialMessageReaction, PartialUser } from 'discord.js';
import { Event } from '../types/Event';
import { DatabaseManager } from '../utils/database';
import { OOTD_CHANNEL_ID, OOTD_REACTION_EMOJI, CURRENCY_NAME } from '../utils/constants';

export const name = Events.MessageReactionAdd;
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
    if (reaction.emoji.name !== OOTD_REACTION_EMOJI.replace(/[^\w]/g, '')) {
        return;
    }

    try {
        const messageAuthor = reaction.message.author;
        if (!messageAuthor) return;

        // Traiter la réaction OOTD
        const result = await DatabaseManager.handleOOTDReaction(
            reaction.message.id,
            messageAuthor.id,
            user.id
        );

        // Envoyer un message de confirmation
        await reaction.message.reply(
            `👗 **Nouvelle réaction OOTD !**\n` +
            `${user.username} a réagi à l'OOTD de ${result.authorUsername}\n` +
            `📊 **Total de réactions :** ${result.reactionCount}\n` +
            `💰 **${result.authorUsername} gagne 1 ${CURRENCY_NAME} !**\n` +
            `💳 **Nouveau solde :** ${result.authorTokens} ${CURRENCY_NAME}`
        );

        console.log(`👗 OOTD réaction: ${user.username} → ${result.authorUsername} (${result.reactionCount} réactions total)`);

    } catch (error) {
        console.error('Erreur lors du traitement de la réaction OOTD:', error);
        
        let errorMessage = '❌ Erreur lors du traitement de la réaction';
        if (error instanceof Error) {
            if (error.message === 'Vous ne pouvez pas réagir à votre propre message OOTD') {
                errorMessage = '❌ Vous ne pouvez pas réagir à votre propre message OOTD';
            } else if (error.message === 'Vous avez déjà réagi à ce message OOTD') {
                errorMessage = '❌ Vous avez déjà réagi à ce message OOTD';
            } else if (error.message.includes('non trouvé')) {
                errorMessage = '❌ Un des utilisateurs n\'a pas de compte. Utilisez `/signin` pour créer un compte.';
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