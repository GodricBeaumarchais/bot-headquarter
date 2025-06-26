import { Events, MessageReaction, User, PartialMessageReaction, PartialUser } from 'discord.js';
import { Event } from '../types/Event';
import { DatabaseManager } from '../utils/database';
import { Logger } from '../utils/logger';
import { OOTD_CHANNEL_ID, OOTD_REACTION_EMOJI, CURRENCY_NAME } from '../utils/constants';

export const name = Events.MessageReactionAdd;
export const once = false;

export const execute: Event<typeof name>['execute'] = async (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, ...args: any[]) => {
    console.log(`🔍 Événement réaction détecté: ${user.username} a réagi avec ${reaction.emoji.name}`);
    
    // Gérer les réactions partielles
    if (reaction.partial) {
        try {
            await reaction.fetch();
            console.log('✅ Réaction partielle récupérée');
        } catch (error) {
            console.error('Erreur lors de la récupération de la réaction:', error);
            return;
        }
    }

    // Vérifier que l'utilisateur n'est pas partiel
    if (user.partial) {
        try {
            await user.fetch();
            console.log('✅ Utilisateur partiel récupéré');
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            return;
        }
    }

    // Ignorer les réactions du bot
    if (user.bot) {
        console.log('❌ Réaction du bot ignorée');
        return;
    }

    console.log(`📍 Canal: ${reaction.message.channelId}, Canal OOTD: ${OOTD_CHANNEL_ID}`);

    // Vérifier si c'est dans le salon OOTD
    if (reaction.message.channelId !== OOTD_CHANNEL_ID) {
        console.log('❌ Pas dans le salon OOTD');
        return;
    }

    console.log(`🎯 Émoji reçu: ${reaction.emoji.name}, Émoji attendu: ${OOTD_REACTION_EMOJI}`);

    // Vérifier si c'est l'émoji OOTD
    if (reaction.emoji.name !== OOTD_REACTION_EMOJI) {
        console.log('❌ Mauvais émoji');
        return;
    }

    console.log('✅ Conditions OOTD remplies, traitement de la réaction...');

    try {
        const messageAuthor = reaction.message.author;
        if (!messageAuthor) {
            console.log('❌ Auteur du message non trouvé');
            return;
        }

        console.log(`👤 Auteur: ${messageAuthor.username}, Réacteur: ${user.username}`);

        // Traiter la réaction OOTD
        const result = await DatabaseManager.handleOOTDReaction(
            reaction.message.id,
            messageAuthor.id,
            user.id
        );

        console.log(`✅ Réaction OOTD traitée: ${result.reactionCount} réactions total`);

        // Logger la réaction OOTD
        await Logger.logReaction({
            userId: user.id,
            messageId: reaction.message.id,
            channelId: reaction.message.channelId,
            guildId: reaction.message.guildId || undefined,
            emoji: OOTD_REACTION_EMOJI,
            action: 'add',
            isOOTD: true,
            ootdAuthorId: messageAuthor.id,
            tokensEarned: 1 // L'auteur gagne 1 token
        });

        // Ne plus envoyer de message de confirmation
        console.log(`👗 OOTD réaction: ${user.username} → ${result.authorUsername} (${result.reactionCount} réactions total)`);

    } catch (error) {
        console.error('Erreur lors du traitement de la réaction OOTD:', error);
        
        // Logger la réaction échouée
        try {
            const messageAuthor = reaction.message.author;
            if (messageAuthor) {
                await Logger.logReaction({
                    userId: user.id,
                    messageId: reaction.message.id,
                    channelId: reaction.message.channelId,
                    guildId: reaction.message.guildId || undefined,
                    emoji: OOTD_REACTION_EMOJI,
                    action: 'add',
                    isOOTD: true,
                    ootdAuthorId: messageAuthor.id,
                    tokensEarned: 0 // Pas de tokens car échec
                });
            }
        } catch (logError) {
            console.error('Erreur lors du logging de la réaction échouée:', logError);
        }
        
        let errorMessage = '❌ Erreur lors du traitement de la réaction';
        if (error instanceof Error) {
            if (error.message === 'Vous ne pouvez pas réagir à votre propre message OOTD') {
                errorMessage = '❌ Vous ne pouvez pas réagir à votre propre message OOTD';
            } else if (error.message === 'Vous avez déjà réagi à ce message OOTD') {
                errorMessage = '❌ Vous avez déjà réagi à ce message OOTD';
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