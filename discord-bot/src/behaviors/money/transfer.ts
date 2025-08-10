import { DatabaseManager } from '../../../utils/database';
import { CURRENCY_NAME } from '../../../utils/constants';

export interface TransferResult {
    success: boolean;
    message: string;
    result?: any;
}

export async function transferBehavior(fromDiscordId: string, toDiscordId: string, amount: number, fromUsername: string, toUsername: string): Promise<TransferResult> {
    try {
        if (fromDiscordId === toDiscordId) {
            return {
                success: false,
                message: `❌ Vous ne pouvez pas vous transférer des ${CURRENCY_NAME} à vous-même !`
            };
        }
        
        const fromUser = await DatabaseManager.getUser(fromDiscordId);
        const toUser = await DatabaseManager.getUser(toDiscordId);
        
        if (!fromUser) {
            return {
                success: false,
                message: `❌ Vous devez d'abord créer un compte avec \`/signin\``
            };
        }
        
        if (!toUser) {
            return {
                success: false,
                message: `❌ Le destinataire doit d'abord créer un compte avec \`/signin\``
            };
        }
        
        const result = await DatabaseManager.transferTokens(fromDiscordId, toDiscordId, amount);
        
        return {
            success: true,
            message: `💸 **Transfert effectué !**\nVous avez transféré **${amount}** ${CURRENCY_NAME} à ${toUsername}\n💳 **Votre nouveau solde :** ${result.from.token} ${CURRENCY_NAME}`,
            result
        };
    } catch (error) {
        if (error instanceof Error && error.message === 'Solde insuffisant') {
            return {
                success: false,
                message: '❌ Solde insuffisant pour effectuer ce transfert.'
            };
        } else {
            return {
                success: false,
                message: '❌ Erreur lors du transfert.'
            };
        }
    }
} 