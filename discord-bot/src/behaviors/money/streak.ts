import { DatabaseManager } from '../../utils/database';

export interface StreakResult {
    success: boolean;
    message: string;
    user?: any;
}

export async function streakBehavior(discordId: string, targetDiscordId?: string, targetUsername?: string): Promise<StreakResult> {
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
            message: `🔥 **Streak de ${displayUsername} :** ${user.streak} jours consécutifs`,
            user
        };
    } catch (error) {
        return {
            success: false,
            message: '❌ Erreur lors de la récupération du streak.'
        };
    }
} 