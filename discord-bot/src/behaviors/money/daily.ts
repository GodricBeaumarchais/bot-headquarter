import { DatabaseManager } from '../../../utils/database';
import { CURRENCY_NAME, DAILY_REWARD } from '../../../utils/constants';

export interface DailyResult {
    success: boolean;
    message: string;
    user?: any;
}

export async function dailyBehavior(discordId: string): Promise<DailyResult> {
    try {
        const user = await DatabaseManager.getUser(discordId);
        
        if (!user) {
            return {
                success: false,
                message: `❌ Vous devez d'abord créer un compte avec \`/signin\``
            };
        }
        
        const result = await DatabaseManager.handleDailyReward(discordId, DAILY_REWARD);
        
        let replyMessage = `🎁 **Récompense quotidienne !**\nVous avez reçu **${result.totalReward}** ${CURRENCY_NAME} !${result.bonusMessage}\n💳 **Nouveau solde :** ${result.token} ${CURRENCY_NAME}\n🔥 **Streak :** ${result.streak} jours consécutifs`;
        
        if (result.bonusMessage) {
            replyMessage += `\n🎉 **Bonus de streak !**\nStreak: ${result.streak} jours\nCalcul: ${result.streak} ÷ 5 = ${Math.floor(result.streak / 5)} ${CURRENCY_NAME}\nBonus: ${result.bonusAmount} ${CURRENCY_NAME}`;
        }
        
        return {
            success: true,
            message: replyMessage,
            user: result
        };
    } catch (error) {
        let errorMessage = '❌ Erreur lors de la récupération de la récompense';
        if (error instanceof Error) {
            if (error.message === 'Récompense quotidienne déjà récupérée aujourd\'hui') {
                errorMessage = '❌ Vous avez déjà récupéré votre récompense quotidienne aujourd\'hui !';
            } else if (error.message === 'Utilisateur non trouvé') {
                errorMessage = '❌ Utilisateur non trouvé';
            }
        }
        
        return {
            success: false,
            message: errorMessage
        };
    }
} 