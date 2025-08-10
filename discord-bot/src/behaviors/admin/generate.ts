import { DatabaseManager } from '../../utils/database';
import { CURRENCY_NAME } from '../../utils/constants';

export interface GenerateResult {
    success: boolean;
    message: string;
    embed?: any;
    user?: any;
}

export async function generateBehavior(adminDiscordId: string, targetDiscordId: string, amount: number, adminUsername: string, targetUsername: string): Promise<GenerateResult> {
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

        // Générer les tokens
        const updatedUser = await DatabaseManager.generateTokens(targetDiscordId, amount);

        const embed = {
            color: 0x00FF00,
            title: '💰 Génération de tokens réussie',
            fields: [
                { 
                    name: '👤 Utilisateur', 
                    value: targetUsername, 
                    inline: true 
                },
                { 
                    name: '➕ Tokens générés', 
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
                text: `Généré par ${adminUsername}` 
            },
            timestamp: new Date().toISOString()
        };

        return {
            success: true,
            message: '💰 Génération de tokens réussie',
            embed,
            user: updatedUser
        };

    } catch (error) {
        console.error('Erreur lors de la génération de tokens:', error);
        return {
            success: false,
            message: '❌ Une erreur s\'est produite lors de la génération des tokens.'
        };
    }
} 