import { DatabaseManager } from '../../../utils/database';
import { CURRENCY_NAME, COIN_EMOTE } from '../../../utils/constants';

export interface BalanceResult {
    success: boolean;
    message: string;
    user?: any;
    targetUsername?: string;
}

export async function balanceBehavior(discordId: string, targetDiscordId?: string, targetUsername?: string): Promise<BalanceResult> {
    try {
        const targetUser = targetDiscordId || discordId;
        const user = await DatabaseManager.getUser(targetUser);
        
        if (!user) {
            return {
                success: false,
                message: `❌ Cet utilisateur n'a pas encore de compte. Utilisez \`/signin\` pour créer un compte.`
            };
        }
        
        const displayUsername = targetUsername || user.username;
        
        return {
            success: true,
            message: `${COIN_EMOTE} **Solde de ${displayUsername} :** ${user.token} ${CURRENCY_NAME}`,
            user,
            targetUsername: displayUsername
        };
    } catch (error) {
        return {
            success: false,
            message: '❌ Erreur lors de la récupération du solde.'
        };
    }
} 