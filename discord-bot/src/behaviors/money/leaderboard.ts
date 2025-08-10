import { DatabaseManager } from '../../utils/database';
import { CURRENCY_NAME } from '../../utils/constants';

export interface LeaderboardResult {
    success: boolean;
    message: string;
    leaderboard?: any[];
}

export async function leaderboardBehavior(limit: number = 10): Promise<LeaderboardResult> {
    try {
        const leaderboard = await DatabaseManager.getLeaderboard(limit);
        
        if (leaderboard.length === 0) {
            return {
                success: false,
                message: '📊 Aucun joueur trouvé dans le classement.'
            };
        }
        
        const leaderboardText = leaderboard.map((user: { username: string; token: number }, index: number) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            return `${medal} **${user.username}** - ${user.token} ${CURRENCY_NAME}`;
        }).join('\n');
        
        return {
            success: true,
            message: `🏆 **Classement des joueurs les plus riches :**\n\n${leaderboardText}`,
            leaderboard
        };
    } catch (error) {
        return {
            success: false,
            message: '❌ Erreur lors de la récupération du classement.'
        };
    }
} 