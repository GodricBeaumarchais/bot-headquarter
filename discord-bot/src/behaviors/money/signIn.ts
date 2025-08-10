import { DatabaseManager } from '../../utils/database';
import { CURRENCY_NAME, STARTING_BALANCE, COIN_EMOTE } from '../../utils/constants';

export interface SignInResult {
    success: boolean;
    message: string;
    user?: any;
}

export async function signInBehavior(discordId: string, username: string): Promise<SignInResult> {
    try {
        const user = await DatabaseManager.createUser(discordId, username);
        
        return {
            success: true,
            message: `🎉 **Compte créé avec succès !**\nBienvenue **${username}** !\n${COIN_EMOTE} **${CURRENCY_NAME} de départ :** ${STARTING_BALANCE} ${CURRENCY_NAME}\n📅 **Date de création :** ${user.createdAt.toLocaleDateString('fr-FR')}`,
            user
        };
    } catch (error) {
        if (error instanceof Error && error.message === 'Utilisateur déjà existant') {
            return {
                success: false,
                message: `❌ Vous avez déjà un compte ! Utilisez \`/balance\` pour voir votre solde.`
            };
        } else {
            return {
                success: false,
                message: '❌ Erreur lors de la création du compte.'
            };
        }
    }
} 