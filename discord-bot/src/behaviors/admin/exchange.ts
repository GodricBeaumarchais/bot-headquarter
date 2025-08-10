import { DatabaseManager } from '../../../utils/database';
import { CURRENCY_NAME } from '../../../utils/constants';

export interface ExchangeResult {
    success: boolean;
    message: string;
    embed?: any;
    result?: any;
}

export async function exchangeBehavior(adminDiscordId: string, fromDiscordId: string, toDiscordId: string, amount: number, adminUsername: string, fromUsername: string, toUsername: string): Promise<ExchangeResult> {
    try {
        // Vérifier si l'utilisateur est admin
        const isAdmin = await DatabaseManager.isAdmin(adminDiscordId);
        if (!isAdmin) {
            return {
                success: false,
                message: '❌ Vous n\'avez pas les permissions pour utiliser cette commande.'
            };
        }

        // Vérifier que ce ne sont pas les mêmes utilisateurs
        if (fromDiscordId === toDiscordId) {
            return {
                success: false,
                message: '❌ Impossible d\'échanger des tokens avec soi-même.'
            };
        }

        // Vérifier si les utilisateurs ont des comptes
        const fromUserData = await DatabaseManager.getUser(fromDiscordId);
        const toUserData = await DatabaseManager.getUser(toDiscordId);

        if (!fromUserData) {
            return {
                success: false,
                message: `❌ ${fromUsername} n'a pas encore de compte. Utilisez \`/signin\` pour créer un compte.`
            };
        }

        if (!toUserData) {
            return {
                success: false,
                message: `❌ ${toUsername} n'a pas encore de compte. Utilisez \`/signin\` pour créer un compte.`
            };
        }

        // Vérifier si l'utilisateur source a assez de tokens
        if (fromUserData.token < amount) {
            return {
                success: false,
                message: `❌ ${fromUsername} n'a que ${fromUserData.token} ${CURRENCY_NAME}. Impossible d'échanger ${amount} ${CURRENCY_NAME}.`
            };
        }

        // Échanger les tokens
        const result = await DatabaseManager.exchangeTokens(fromDiscordId, toDiscordId, amount);

        const embed = {
            color: 0x0099FF,
            title: '💰 Échange de tokens réussi',
            fields: [
                { 
                    name: '👤 De', 
                    value: `${fromUsername} (${result.fromUser.token} ${CURRENCY_NAME})`, 
                    inline: true 
                },
                { 
                    name: '👤 Vers', 
                    value: `${toUsername} (${result.toUser.token} ${CURRENCY_NAME})`, 
                    inline: true 
                },
                { 
                    name: '💰 Montant échangé', 
                    value: `${amount} ${CURRENCY_NAME}`, 
                    inline: true 
                }
            ],
            footer: { 
                text: `Échangé par ${adminUsername}` 
            },
            timestamp: new Date().toISOString()
        };

        return {
            success: true,
            message: '💰 Échange de tokens réussi',
            embed,
            result
        };

    } catch (error) {
        console.error('Erreur lors de l\'échange de tokens:', error);
        return {
            success: false,
            message: '❌ Une erreur s\'est produite lors de l\'échange des tokens.'
        };
    }
} 