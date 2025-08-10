import { DatabaseManager } from '../../utils/database';
import { CURRENCY_NAME } from '../../utils/constants';

export interface OOTDResult {
    success: boolean;
    message: string;
    embed?: any;
    stats?: any;
}

export async function ootdBehavior(discordId: string, targetDiscordId?: string, targetUsername?: string): Promise<OOTDResult> {
    try {
        const targetUser = targetDiscordId || discordId;
        
        // Vérifier si l'utilisateur a un compte
        const user = await DatabaseManager.getUser(targetUser);
        if (!user) {
            return {
                success: false,
                message: `❌ ${targetUsername || 'Cet utilisateur'} n'a pas encore de compte. Utilisez \`/signin\` pour créer un compte.`
            };
        }

        // Récupérer les statistiques OOTD
        const stats = await DatabaseManager.getOOTDStats(targetUser);
        const displayUsername = targetUsername || user.username;

        const embed = {
            color: 0xFF69B4,
            title: `👗 Statistiques OOTD de ${displayUsername}`,
            fields: [
                { 
                    name: '📸 Messages OOTD créés', 
                    value: `${stats.messagesCreated}`, 
                    inline: true 
                },
                { 
                    name: '👍 Réactions données', 
                    value: `${stats.reactionsGiven}`, 
                    inline: true 
                },
                { 
                    name: `💰 ${CURRENCY_NAME} gagnés via OOTD`, 
                    value: `${stats.totalEarned}`, 
                    inline: true 
                }
            ],
            footer: { 
                text: 'Postez vos tenues dans le salon OOTD et réagissez aux autres !' 
            },
            timestamp: new Date().toISOString()
        };

        return {
            success: true,
            message: `👗 Statistiques OOTD de ${displayUsername}`,
            embed,
            stats
        };

    } catch (error) {
        console.error('Erreur lors de la récupération des stats OOTD:', error);
        return {
            success: false,
            message: '❌ Une erreur s\'est produite lors de la récupération des statistiques OOTD.'
        };
    }
} 