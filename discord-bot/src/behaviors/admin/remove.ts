import { DatabaseManager } from '../../../utils/database';
import { CURRENCY_NAME } from '../../../utils/constants';

export interface RemoveResult {
    success: boolean;
    message: string;
    embed?: any;
    user?: any;
}

export async function removeBehavior(adminDiscordId: string, targetDiscordId: string, amount: number, adminUsername: string, targetUsername: string): Promise<RemoveResult> {
    try {
        // Vérifier si l'utilisateur est admin
        const isAdmin = await DatabaseManager.isAdmin(adminDiscordId);
        if (!isAdmin) {
            return {
                success: false,
                message: '❌ Vous n\'avez pas les permissions pour utiliser cette commande.'
            };
        }

        // Vérifier si l'utilisateur cible a un compte
        const user = await DatabaseManager.getUser(targetDiscordId);
        if (!user) {
            return {
                success: false,
                message: `❌ ${targetUsername} n'a pas encore de compte. Utilisez \`/signin\` pour créer un compte.`
            };
        }

        // Vérifier si l'utilisateur a assez de tokens
        if (user.token < amount) {
            return {
                success: false,
                message: `❌ ${targetUsername} n'a que ${user.token} ${CURRENCY_NAME}. Impossible de retirer ${amount} ${CURRENCY_NAME}.`
            };
        }

        // Retirer les tokens
        const updatedUser = await DatabaseManager.removeTokens(targetDiscordId, amount);

        const embed = {
            color: 0xFF0000,
            title: '💰 Retrait de tokens réussi',
            fields: [
                { 
                    name: '👤 Utilisateur', 
                    value: targetUsername, 
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
                text: `Retiré par ${adminUsername}` 
            },
            timestamp: new Date().toISOString()
        };

        return {
            success: true,
            message: '💰 Retrait de tokens réussi',
            embed,
            user: updatedUser
        };

    } catch (error) {
        console.error('Erreur lors du retrait de tokens:', error);
        return {
            success: false,
            message: '❌ Une erreur s\'est produite lors du retrait des tokens.'
        };
    }
} 